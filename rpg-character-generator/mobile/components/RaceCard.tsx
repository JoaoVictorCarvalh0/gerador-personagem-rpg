import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import type { RaceData } from '../constants/gameData';

interface Props {
  data: RaceData;
  selected: boolean;
  onPress: () => void;
}

export function RaceCard({ data, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected && <View style={styles.topBar} />}
      <Text style={styles.icon}>{data.icon}</Text>
      <Text style={[styles.name, selected && styles.nameSelected]}>{data.label}</Text>
      <Text style={styles.desc}>{data.description}</Text>
      <Text style={[styles.bonus, selected && styles.bonusSelected]}>{data.bonus}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 100,
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm + 4,
    alignItems: 'center',
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: COLORS.bgCardSelected,
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.gold,
  },
  icon: { fontSize: 26, marginBottom: SPACING.xs },
  name: { fontSize: 12, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  nameSelected: { color: COLORS.gold },
  desc: { fontSize: 9, color: COLORS.textMuted, textAlign: 'center', marginBottom: 4 },
  bonus: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },
  bonusSelected: { color: COLORS.goldLight },
});
