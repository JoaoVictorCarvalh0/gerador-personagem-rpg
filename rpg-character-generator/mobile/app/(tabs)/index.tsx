import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CLASSES, RACES, FANTASY_COLORS } from '../../constants/gameData';
import { ClassCard } from '../../components/ClassCard';
import { RaceCard } from '../../components/RaceCard';
import { ColorDot } from '../../components/ColorDot';
import { createCharacter } from '../../services/api';
import type { CharClass, Race } from '../../services/api';

export default function CreateScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [charClass, setCharClass] = useState<CharClass>('guerreiro');
  const [race, setRace] = useState<Race>('humano');
  const [mainColor, setMainColor] = useState('#8B0000');
  const [secondaryColor, setSecondaryColor] = useState('#FFD700');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Digite o nome do personagem');
      return;
    }
    setSubmitting(true);
    try {
      const taskId = await createCharacter({
        name: name.trim(),
        class: charClass,
        race,
        main_color: mainColor,
        secondary_color: secondaryColor,
      });
      router.push({ pathname: '/status', params: { taskId } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao conectar com o servidor';
      Alert.alert('Erro', message);
    } finally {
      setSubmitting(false);
    }
  };

  const classData = CLASSES.find((c) => c.id === charClass)!;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <LinearGradient colors={['#0d0d1a', '#0d1428']} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Divider */}
          <View style={styles.divider} />

          {/* Name */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>NOME DO HERÓI</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Thordak, Aelindra, Grimfang..."
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
              maxLength={50}
              autoCapitalize="words"
            />
          </View>

          {/* Class */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CLASSE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {CLASSES.map((cls) => (
                <ClassCard
                  key={cls.id}
                  data={cls}
                  selected={charClass === cls.id}
                  onPress={() => setCharClass(cls.id as CharClass)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Race */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>RAÇA</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {RACES.map((r) => (
                <RaceCard
                  key={r.id}
                  data={r}
                  selected={race === r.id}
                  onPress={() => setRace(r.id as Race)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Main Color */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COR PRINCIPAL</Text>
            <View style={styles.colorGrid}>
              {FANTASY_COLORS.map((c) => (
                <ColorDot
                  key={c.hex}
                  color={c}
                  selected={mainColor === c.hex}
                  onPress={() => setMainColor(c.hex)}
                />
              ))}
            </View>
          </View>

          {/* Secondary Color */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>COR SECUNDÁRIA</Text>
            <View style={styles.colorGrid}>
              {FANTASY_COLORS.map((c) => (
                <ColorDot
                  key={c.hex}
                  color={c}
                  selected={secondaryColor === c.hex}
                  onPress={() => setSecondaryColor(c.hex)}
                />
              ))}
            </View>
          </View>

          {/* Preview */}
          <View style={[styles.preview, { borderColor: mainColor + '80' }]}>
            <View style={[styles.colorSwatch, { backgroundColor: mainColor }]} />
            <View style={[styles.colorSwatch, { backgroundColor: secondaryColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewName} numberOfLines={1}>
                {name || 'Herói sem nome'}
              </Text>
              <Text style={styles.previewSub}>
                {classData.icon} {charClass} · {race}
              </Text>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={submitting ? ['#5a4a1a', '#3a2a0a'] : ['#c9a84c', '#8a6e28']}
              style={styles.buttonInner}
            >
              {submitting ? (
                <>
                  <ActivityIndicator color={COLORS.bg} size="small" />
                  <Text style={styles.buttonText}>ENVIANDO...</Text>
                </>
              ) : (
                <Text style={styles.buttonText}>⚒  FORJAR PERSONAGEM</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: SPACING.xl }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: SPACING.md },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  section: { marginBottom: SPACING.lg },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 2,
    marginBottom: SPACING.sm,
  },
  input: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: 16,
  },
  hScroll: { overflow: 'visible' },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  colorSwatch: {
    width: 22,
    height: 22,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  previewName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  previewSub: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  button: {
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md + 2,
    gap: SPACING.sm,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.bg,
    letterSpacing: 1.5,
  },
});
