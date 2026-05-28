import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  value: number;
  unit?: string;
  color?: string;
}

export function DerivedCard({ icon, label, value, unit = '', color = COLORS.gold }: Props) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>
        {typeof value === 'number' ? value.toFixed(1) : value}
        <Text style={styles.unit}>{unit}</Text>
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.md,
    borderTopWidth: 3,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 80,
  },
  icon: { fontSize: 22, marginBottom: SPACING.xs },
  value: { fontSize: 20, fontWeight: '700' },
  unit: { fontSize: 12, fontWeight: '400' },
  label: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.5 },
});
