import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, BORDER_RADIUS } from '../../constants/theme';
import { CLASS_ICONS, CLASS_LABELS, RACE_LABELS } from '../../constants/gameData';
import { getHistory, removeFromHistory } from '../../storage/history';
import type { HistoryEntry } from '../../storage/history';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function HistoryItem({ item, onPress, onDelete }: {
  item: HistoryEntry;
  onPress: () => void;
  onDelete: () => void;
}) {
  const c = item.character;
  const attrs = c.base_attributes;
  const top = Math.max(...Object.values(attrs));

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={onPress}
      onLongPress={onDelete}
      activeOpacity={0.8}
    >
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{CLASS_ICONS[c.class] ?? '⚔️'}</Text>
      </View>
      <View style={styles.itemCenter}>
        <Text style={styles.itemName} numberOfLines={1}>{c.name}</Text>
        <Text style={styles.itemSub}>
          {CLASS_LABELS[c.class]} · {RACE_LABELS[c.race]}
        </Text>
        <Text style={styles.itemDate}>{formatDate(item.createdAt)}</Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemStat}>{top}</Text>
        <Text style={styles.itemStatLabel}>MELHOR</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getHistory().then(setEntries);
    }, [])
  );

  const handleDelete = (taskId: string, name: string) => {
    Alert.alert(
      'Remover do Grimório',
      `Remover ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            await removeFromHistory(taskId);
            setEntries((prev) => prev.filter((e) => e.taskId !== taskId));
          },
        },
      ]
    );
  };

  if (entries.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <LinearGradient colors={['#0d0d1a', '#0d1428']} style={StyleSheet.absoluteFill} />
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📖</Text>
          <Text style={styles.emptyTitle}>Grimório Vazio</Text>
          <Text style={styles.emptyText}>
            Seus personagens aparecem aqui após serem forjados.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/')}>
            <Text style={styles.emptyButtonText}>Criar Primeiro Personagem</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <LinearGradient colors={['#0d0d1a', '#0d1428']} style={StyleSheet.absoluteFill} />
      <Text style={styles.hint}>Toque para ver · segure para remover</Text>
      <FlatList
        data={entries}
        keyExtractor={(e) => e.taskId}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <HistoryItem
            item={item}
            onPress={() => router.push({ pathname: '/character', params: { taskId: item.taskId } })}
            onDelete={() => handleDelete(item.taskId, item.character.name)}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  hint: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingVertical: SPACING.sm,
    letterSpacing: 0.5,
  },
  list: { padding: SPACING.md, paddingTop: SPACING.xs },
  separator: { height: SPACING.sm },
  item: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    alignItems: 'center',
  },
  itemLeft: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.bgCard2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  itemIcon: { fontSize: 24 },
  itemCenter: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  itemSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  itemDate: { fontSize: 10, color: COLORS.textMuted + '99', marginTop: 4 },
  itemRight: { alignItems: 'center', marginLeft: SPACING.md },
  itemStat: { fontSize: 22, fontWeight: '700', color: COLORS.gold },
  itemStatLabel: { fontSize: 8, color: COLORS.textMuted, letterSpacing: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xl },
  emptyIcon: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.xl },
  emptyButton: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.gold,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  emptyButtonText: { color: COLORS.gold, fontWeight: '700', fontSize: 14 },
});
