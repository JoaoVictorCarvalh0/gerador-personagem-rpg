import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Character } from '../services/api';

const HISTORY_KEY = '@rpg_history_v1';
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  taskId: string;
  character: Character;
  createdAt: string;
}

export async function saveToHistory(taskId: string, character: Character): Promise<void> {
  const existing = await getHistory();
  const entry: HistoryEntry = { taskId, character, createdAt: new Date().toISOString() };
  const updated = [entry, ...existing.filter((e) => e.taskId !== taskId)].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

export async function getHistory(): Promise<HistoryEntry[]> {
  const raw = await AsyncStorage.getItem(HISTORY_KEY);
  return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
}

export async function getByTaskId(taskId: string): Promise<HistoryEntry | null> {
  const history = await getHistory();
  return history.find((e) => e.taskId === taskId) ?? null;
}

export async function removeFromHistory(taskId: string): Promise<void> {
  const existing = await getHistory();
  await AsyncStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(existing.filter((e) => e.taskId !== taskId))
  );
}
