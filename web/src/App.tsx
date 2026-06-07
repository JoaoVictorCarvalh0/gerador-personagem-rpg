import { useState, useEffect } from 'react'
import { CharacterForm } from './components/CharacterForm'
import { LoadingScreen } from './components/LoadingScreen'
import { CharacterSheet } from './components/CharacterSheet'
import { createCharacter, getStatus, Character, CharacterPayload } from './services/api'

type View = 'form' | 'loading' | 'character'

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
  const [view, setView]      = useState<View>('form')
  const [taskId, setTaskId]  = useState<string | null>(null)
  const [character, setChar] = useState<Character | null>(null)
  const [error, setError]    = useState<string | null>(null)
  const [isDemo, setIsDemo]  = useState(false)

  const handleGenerate = async (payload: CharacterPayload) => {
    try {
      setError(null)
      setIsDemo(false)
      setView('loading')
      const id = await createCharacter(payload)
      setTaskId(id)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Falha ao conectar com o servidor.'
      setError(msg)
      setView('form')
    }
  }

  const handleDemo = () => {
    setError(null)
    setIsDemo(true)
    setView('loading')
  }

  const handleDemoComplete = () => {
    setChar(DEMO_CHARACTER)
    setTaskId('demo')
    setView('character')
  }

  const handleReset = () => {
    setView('form')
    setTaskId(null)
    setChar(null)
    setError(null)
    setIsDemo(false)
  }

  useEffect(() => {
    if (!taskId || view !== 'loading' || isDemo) return

    const pollTimer = setInterval(async () => {
      try {
        const data = await getStatus(taskId)
        if (data.status === 'done' && data.character) {
          clearInterval(pollTimer)
          setChar(data.character)
          setView('character')
        } else if (data.status === 'error') {
          clearInterval(pollTimer)
          setError('Erro ao gerar personagem. Tente novamente.')
          setView('form')
        }
      } catch { /* mantém polling */ }
    }, 2000)

    return () => clearInterval(pollTimer)
  }, [taskId, view, isDemo])

  return (
    <>
      <div className="fc-bg" />
      <div className="fc-grain" />
      <div className="fc-shell">
        {error && (
          <div className="fc-error">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} aria-label="Fechar">×</button>
          </div>
        )}
        {view === 'form' && (
          <CharacterForm onGenerate={handleGenerate} onDemo={handleDemo} />
        )}
        {view === 'loading' && (
          <LoadingScreen isDemo={isDemo} onDemoComplete={handleDemoComplete} />
        )}
        {view === 'character' && character && taskId && (
          <CharacterSheet character={character} taskId={taskId} onReset={handleReset} isDemo={isDemo} />
        )}
      </div>
    </>
  )
}
