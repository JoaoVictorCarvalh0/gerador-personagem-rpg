import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS, STAT_COLORS } from '../constants/theme';
import { CLASS_LABELS, RACE_LABELS, DERIVED_LABELS } from '../constants/gameData';
import { StatBar } from '../components/StatBar';
import { DerivedCard } from '../components/DerivedCard';
import { getAvatarUrl } from '../services/api';
import { getByTaskId } from '../storage/history';
import type { Character } from '../services/api';

const STAT_ORDER = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

export default function CharacterScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const [character, setCharacter] = useState<Character | null>(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (!taskId) return;
    getByTaskId(taskId).then((entry) => {
      if (entry) setCharacter(entry.character);
    });
  }, [taskId]);

  if (!character) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.gold} size="large" />
      </View>
    );
  }

  const avatarUrl = getAvatarUrl(taskId ?? character.id);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <LinearGradient colors={['#0d0d1a', '#0a0a14']} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Avatar + header */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#1a1a2e', '#0d0d1a']}
            style={styles.avatarContainer}
          >
            {!avatarError ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                onError={() => setAvatarError(true)}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.avatarFallback}>
                {CLASS_LABELS[character.class]?.[0] ?? '?'}
              </Text>
            )}
          </LinearGradient>

          <Text style={styles.heroName}>{character.name}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{CLASS_LABELS[character.class] ?? character.class}</Text>
            </View>
            <View style={[styles.badge, styles.badgeRace]}>
              <Text style={styles.badgeText}>{RACE_LABELS[character.race] ?? character.race}</Text>
            </View>
          </View>
        </View>

        {/* Base Attributes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️  ATRIBUTOS BASE</Text>
          <View style={styles.cardBody}>
            {STAT_ORDER.map((stat) => (
              <StatBar
                key={stat}
                label={stat}
                value={character.base_attributes[stat] ?? 0}
                max={20}
                color={STAT_COLORS[stat] ?? COLORS.gold}
              />
            ))}
          </View>
        </View>

        {/* Derived Attributes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡  ATRIBUTOS DERIVADOS</Text>
          <View style={styles.derivedGrid}>
            {Object.entries(character.derived_attributes).map(([key, val]) => {
              const meta = DERIVED_LABELS[key];
              return (
                <DerivedCard
                  key={key}
                  icon={meta?.icon ?? '📊'}
                  label={meta?.label ?? key}
                  value={val as number}
                  unit={meta?.unit ?? ''}
                  color={COLORS.gold}
                />
              );
            })}
          </View>
        </View>

        {/* Character ID */}
        <Text style={styles.idText}>ID: {character.id}</Text>

        {/* Actions */}
        <TouchableOpacity style={styles.forgeButton} onPress={() => router.replace('/')} activeOpacity={0.85}>
          <LinearGradient colors={['#c9a84c', '#8a6e28']} style={styles.forgeInner}>
            <Text style={styles.forgeText}>⚒  FORJAR NOVO PERSONAGEM</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.grimoireButton} onPress={() => router.replace('/history')} activeOpacity={0.85}>
          <Text style={styles.grimoireText}>📖  Ver Grimório</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.md },
  heroSection: { alignItems: 'center', paddingVertical: SPACING.lg },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.goldDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  avatar: { width: 156, height: 156, borderRadius: BORDER_RADIUS.lg - 2 },
  avatarFallback: {
    fontSize: 72,
    fontWeight: '700',
    color: COLORS.gold,
  },
  heroName: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  badgeRow: { flexDirection: 'row', gap: SPACING.sm },
  badge: {
    backgroundColor: COLORS.gold + '22',
    borderWidth: 1,
    borderColor: COLORS.goldDark,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  badgeRace: {
    backgroundColor: COLORS.bgCard2,
    borderColor: COLORS.border,
  },
  badgeText: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cardBody: { padding: SPACING.md },
  derivedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    padding: SPACING.md,
  },
  idText: {
    fontSize: 10,
    color: COLORS.textMuted + '60',
    textAlign: 'center',
    marginBottom: SPACING.lg,
    letterSpacing: 0.5,
  },
  forgeButton: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    marginBottom: SPACING.sm,
  },
  forgeInner: {
    paddingVertical: SPACING.md + 2,
    alignItems: 'center',
  },
  forgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.bg,
    letterSpacing: 1.5,
  },
  grimoireButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  grimoireText: { fontSize: 14, color: COLORS.textMuted, fontWeight: '600' },
});
