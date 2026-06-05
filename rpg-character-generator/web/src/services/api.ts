const API_BASE: string = import.meta.env.VITE_API_URL ?? ''

export interface CharacterPayload {
  name: string
  class: string
  race: string
  main_color: string
  secondary_color: string
}

export interface Character {
  id: string
  name: string
  class: string
  race: string
  base_attributes: Record<string, number>
  derived_attributes: Record<string, number>
  avatar_path: string
}

export interface StatusResponse {
  status: 'pending' | 'processing' | 'done' | 'error'
  character: Character | null
  error?: string
}

export async function createCharacter(payload: CharacterPayload): Promise<string> {
  const res = await fetch(`${API_BASE}/gerar-personagem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error((err as { error: string }).error ?? 'Falha ao criar personagem')
  }
  const data = await res.json() as { task_id: string }
  return data.task_id
}

export async function getStatus(taskId: string): Promise<StatusResponse> {
  const res = await fetch(`${API_BASE}/status/${taskId}`)
  if (!res.ok) throw new Error('Falha ao consultar status')
  return res.json() as Promise<StatusResponse>
}

export function getAvatarUrl(taskId: string): string {
  return `${API_BASE}/avatar/${taskId}`
}
