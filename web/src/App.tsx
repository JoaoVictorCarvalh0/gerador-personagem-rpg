import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { CharacterForm } from './components/CharacterForm'
import { CharacterSheet } from './components/CharacterSheet'
import { CharacterList, PendingTask } from './components/CharacterList'
import { createCharacter, getStatus, clearToken, Character, CharacterPayload } from './services/api'

type View = 'form' | 'character'

const DEMO_CHARACTER: Character = {
  id: 'demo-0000-0000-0000',
  name: 'Thordak, o Implacável',
  class: 'guerreiro',
  race: 'anão',
  base_attributes: { FOR: 18, DES: 12, INT: 9, CON: 16, SAB: 11, CAR: 8 },
  derived_attributes: { dano: 11.4, defesa: 16.2, critico: 14.0, velocidade_ataque: 1.42 },
  avatar_path: '',
}

export default function App() {
  const navigate = useNavigate()
  const [view, setView]            = useState<View>('form')
  const [character, setChar]       = useState<Character | null>(null)
  const [activeTaskId, setActiveId] = useState<string | null>(null)
  const [error, setError]          = useState<string | null>(null)
  const [listRefresh, setRefresh]  = useState(0)
  const [pending, setPending]      = useState<PendingTask[]>([])
  const pendingRef                 = useRef<PendingTask[]>([])

  useEffect(() => { pendingRef.current = pending }, [pending])

  // Single polling loop for all pending tasks
  useEffect(() => {
    const timer = setInterval(async () => {
      const tasks = pendingRef.current
      if (tasks.length === 0) return

      for (const task of [...tasks]) {
        try {
          const data = await getStatus(task.taskId)
          if (data.status === 'done') {
            setPending(prev => prev.filter(t => t.taskId !== task.taskId))
            setRefresh(n => n + 1)
          } else if (data.status === 'error') {
            setPending(prev => prev.filter(t => t.taskId !== task.taskId))
            setError(`Erro ao gerar "${task.name}". Tente novamente.`)
          }
        } catch { /* ignora falha de rede, tenta no próximo tick */ }
      }
    }, 2000)

    return () => clearInterval(timer)
  }, [])

  const handleLogout = () => {
    clearToken()
    navigate({ to: '/login' })
  }

  const handleGenerate = async (payload: CharacterPayload) => {
    try {
      setError(null)
      const id = await createCharacter(payload)
      setPending(prev => [...prev, {
        taskId: id,
        name: payload.name || 'Aventureiro',
        charClass: payload.class,
        race: payload.race,
      }])
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao conectar com o servidor.'
      setError(msg)
    }
  }

  const handleBatch = async (payloads: CharacterPayload[]) => {
    setError(null)
    const results = await Promise.allSettled(payloads.map(p => createCharacter(p)))
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        setPending(prev => [...prev, {
          taskId: result.value,
          name: payloads[i].name || 'Aventureiro',
          charClass: payloads[i].class,
          race: payloads[i].race,
        }])
      } else {
        setError('Falha ao enfileirar uma ou mais fichas.')
      }
    })
  }

  const handleReset = () => {
    setView('form')
    setActiveId(null)
    setChar(null)
    setError(null)
  }

  const handleSelectFromList = (c: Character) => {
    setChar(c)
    setActiveId(c.id)
    setView('character')
  }

  return (
    <>
      <div className="fc-bg" />
      <div className="fc-grain" />
      <div className="fc-layout">
        <div className="fc-main">
          {error && (
            <div className="fc-error">
              <span>⚠ {error}</span>
              <button onClick={() => setError(null)} aria-label="Fechar">×</button>
            </div>
          )}
          {view === 'form' && (
            <CharacterForm onGenerate={handleGenerate} onBatch={handleBatch} onLogout={handleLogout} />
          )}
          {view === 'character' && character && (
            <CharacterSheet
              character={character}
              taskId={activeTaskId ?? ''}
              onReset={handleReset}
              isDemo={false}
            />
          )}
        </div>
        <CharacterList
          refreshTrigger={listRefresh}
          pendingTasks={pending}
          onSelect={handleSelectFromList}
          activeId={activeTaskId}
        />
      </div>
    </>
  )
}
