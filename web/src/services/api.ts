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

const TOKEN_KEY = 'rpg_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

function authHeaders(): Record<string, string> {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function login(username: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error((err as { error: string }).error ?? 'Falha ao autenticar')
  }
  const data = await res.json() as { token: string }
  return data.token
}

export async function register(username: string, password: string): Promise<void> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erro desconhecido' }))
    throw new Error((err as { error: string }).error ?? 'Falha ao registrar')
  }
}

export async function createCharacter(payload: CharacterPayload): Promise<string> {
  const res = await fetch(`${API_BASE}/gerar-personagem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
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
  const res = await fetch(`${API_BASE}/status/${taskId}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Falha ao consultar status')
  return res.json() as Promise<StatusResponse>
}

export function getAvatarUrl(taskId: string): string {
  return `${API_BASE}/avatar/${taskId}`
}

export interface PersonagensPage {
  items: Character[]
  total: number
  has_more: boolean
}

export async function getPersonagens(limit = 15, offset = 0): Promise<PersonagensPage> {
  const res = await fetch(`${API_BASE}/personagens?limit=${limit}&offset=${offset}`, {
    headers: authHeaders(),
  })
  if (!res.ok) throw new Error('Falha ao buscar personagens')
  return res.json() as Promise<PersonagensPage>
}
