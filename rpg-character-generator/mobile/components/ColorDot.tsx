import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { COLORS, BORDER_RADIUS } from '../constants/theme';
import type { FantasyColor } from '../constants/gameData';

interface Props {
  color: FantasyColor;
  selected: boolean;
  onPress: () => void;
}

export function ColorDot({ color, selected, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.wrapper} onPress={onPress} activeOpacity={0.8}>
      <View
        style={[
          styles.dot,
          { backgroundColor: color.hex },
          selected && styles.dotSelected,
        ]}
      >
        {selected && <Text style={styles.check}>✓</Text>}
      </View>
      <Text style={[styles.name, selected && { color: color.hex }]}>{color.name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: 52, marginBottom: 4 },
  dot: {
    width: 38,
    height: 38,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSelected: {
    borderColor: COLORS.white,
    borderWidth: 3,
  },
  check: { fontSize: 16, color: COLORS.white, fontWeight: '700' },
  name: { fontSize: 9, color: COLORS.textMuted, marginTop: 3, textAlign: 'center' },
});
