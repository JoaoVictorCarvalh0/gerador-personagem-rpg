// Change to your machine's local IP when testing on a real device
// Android emulator: 10.0.2.2 | iOS simulator: localhost | Real device: 192.168.x.x
const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:5000';

export type CharClass = 'guerreiro' | 'mago' | 'arqueiro' | 'ladino' | 'clérigo';
export type Race = 'humano' | 'elfo' | 'anão' | 'halfling' | 'tiefling';
export type TaskStatus = 'pending' | 'processing' | 'done' | 'error';

export interface CreateCharacterPayload {
  name: string;
  class: CharClass;
  race: Race;
  main_color: string;
  secondary_color: string;
}

export interface Character {
  id: string;
  name: string;
  class: CharClass;
  race: Race;
  base_attributes: Record<string, number>;
  derived_attributes: Record<string, number>;
  avatar_path: string;
}

export interface StatusResponse {
  status: TaskStatus;
  character: Character | null;
}

export async function createCharacter(payload: CreateCharacterPayload): Promise<string> {
  const res = await fetch(`${API_BASE}/gerar-personagem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.task_id as string;
}

export async function getStatus(taskId: string): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status/${taskId}`);
  if (!res.ok) throw new Error('Task não encontrada');
  return res.json() as Promise<StatusResponse>;
}

export function getAvatarUrl(taskId: string): string {
  return `${API_BASE}/avatar/${taskId}`;
}
