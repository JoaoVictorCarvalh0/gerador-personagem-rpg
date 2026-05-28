import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { getStatus } from '../services/api';
import { saveToHistory } from '../storage/history';
import type { TaskStatus, Character } from '../services/api';

const STATUS_COPY: Record<TaskStatus, { emoji: string; text: string; sub: string }> = {
  pending:    { emoji: '⏳', text: 'Na fila...', sub: 'Seu pedido foi recebido' },
  processing: { emoji: '⚒️', text: 'Forjando...', sub: 'Calculando atributos e criando avatar' },
  done:       { emoji: '✅', text: 'Concluído!', sub: 'Personagem pronto' },
  error:      { emoji: '💀', text: 'Falha', sub: 'Ocorreu um erro na forja' },
};

export default function StatusScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const [status, setStatus] = useState<TaskStatus>('pending');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Rotate animation for the outer ring
  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(rotateAnim, { toValue: 1, duration: 3000, useNativeDriver: true })
    );
    spin.start();
    return () => spin.stop();
  }, []);

  // Polling
  useEffect(() => {
    if (!taskId) return;

    const poll = async () => {
      try {
        const res = await getStatus(taskId);
        setStatus(res.status);

        if (res.status === 'done' && res.character) {
          clearInterval(intervalRef.current!);
          await saveToHistory(taskId, res.character as Character);
          setTimeout(() => router.replace({ pathname: '/character', params: { taskId } }), 800);
        } else if (res.status === 'error') {
          clearInterval(intervalRef.current!);
        }
      } catch {
        // network hiccup — keep polling
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 2000);
    return () => clearInterval(intervalRef.current!);
  }, [taskId]);

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const copy = STATUS_COPY[status];
  const isActive = status === 'pending' || status === 'processing';

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <LinearGradient colors={['#0d0d1a', '#0a0a14']} style={StyleSheet.absoluteFill} />

      <View style={styles.center}>
        {/* Animated ring */}
        <Animated.View style={[styles.ring, { transform: [{ rotate }], opacity: isActive ? 1 : 0 }]} />

        {/* Pulsing orb */}
        <Animated.View
          style={[
            styles.orb,
            { transform: [{ scale: pulseAnim }] },
            status === 'done' && styles.orbDone,
            status === 'error' && styles.orbError,
          ]}
        >
          <Text style={styles.emoji}>{copy.emoji}</Text>
        </Animated.View>

        <Text style={styles.statusText}>{copy.text}</Text>
        <Text style={styles.subText}>{copy.sub}</Text>

        {taskId && (
          <Text style={styles.taskId} numberOfLines={1}>
            ID: {taskId.slice(0, 18)}…
          </Text>
        )}

        {status === 'error' && (
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryText}>← Tentar Novamente</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Steps */}
      <View style={styles.steps}>
        {(['pending', 'processing', 'done'] as const).map((s, i) => {
          const active = s === status;
          const done = (
            (s === 'pending' && (status === 'processing' || status === 'done')) ||
            (s === 'processing' && status === 'done')
          );
          return (
            <View key={s} style={styles.step}>
              <View style={[styles.stepDot, active && styles.stepDotActive, done && styles.stepDotDone]} />
              <Text style={[styles.stepLabel, (active || done) && styles.stepLabelActive]}>
                {['Na fila', 'Processando', 'Concluído'][i]}
              </Text>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: COLORS.gold + '40',
    borderTopColor: COLORS.gold,
  },
  orb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  orbDone: { borderColor: COLORS.success },
  orbError: { borderColor: COLORS.error },
  emoji: { fontSize: 48 },
  statusText: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.lg },
  taskId: { fontSize: 11, color: COLORS.textMuted + '80', marginTop: SPACING.sm, letterSpacing: 0.5 },
  retryButton: {
    marginTop: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  retryText: { color: COLORS.gold, fontWeight: '700' },
  steps: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: SPACING.xl,
    gap: SPACING.xl,
  },
  step: { alignItems: 'center', gap: SPACING.xs },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.border },
  stepDotActive: { backgroundColor: COLORS.gold, width: 14, height: 14, borderRadius: 7 },
  stepDotDone: { backgroundColor: COLORS.success },
  stepLabel: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 0.5 },
  stepLabelActive: { color: COLORS.text },
});
