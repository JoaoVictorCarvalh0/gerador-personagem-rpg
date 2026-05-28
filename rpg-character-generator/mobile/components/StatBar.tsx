import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';

interface Props {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

export function StatBar({ label, value, max = 20, color = COLORS.gold }: Props) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.min(value / max, 1),
      duration: 900,
      delay: 100,
      useNativeDriver: false,
    }).start();
  }, [value, max]);

  const widthInterp = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const quality =
    value >= 18 ? 'LENDÁRIO' :
    value >= 15 ? 'EXCELENTE' :
    value >= 12 ? 'BOM' :
    value >= 9  ? 'MÉDIO' : 'FRACO';

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: widthInterp, backgroundColor: color }]} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.quality}>{quality}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  label: {
    width: 36,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.bgCard2,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.full,
  },
  value: {
    width: 28,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  quality: {
    width: 68,
    fontSize: 9,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    textAlign: 'right',
  },
});
