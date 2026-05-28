import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import type { ClassData } from '../constants/gameData';

interface Props {
  data: ClassData;
  selected: boolean;
  onPress: () => void;
}

export function ClassCard({ data, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, selected && styles.cardSelected, selected && { borderColor: data.color }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected && <View style={[styles.glow, { backgroundColor: data.color }]} />}
      <Text style={styles.icon}>{data.icon}</Text>
      <Text style={[styles.name, selected && { color: data.color }]}>{data.label}</Text>
      <Text style={styles.desc}>{data.description}</Text>
      <View style={[styles.badge, { backgroundColor: selected ? data.color + '33' : COLORS.bgCard2 }]}>
        <Text style={[styles.badgeText, { color: selected ? data.color : COLORS.textMuted }]}>
          {data.requirement}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 110,
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
    marginRight: SPACING.sm,
    overflow: 'hidden',
  },
  cardSelected: {
    backgroundColor: COLORS.bgCardSelected,
    borderWidth: 2,
  },
  glow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.8,
  },
  icon: { fontSize: 28, marginBottom: SPACING.xs },
  name: { fontSize: 13, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  desc: { fontSize: 10, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.sm },
  badge: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
});
