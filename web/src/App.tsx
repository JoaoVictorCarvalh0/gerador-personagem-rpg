import { useState, useEffect } from 'react'
import { CharacterForm } from './components/CharacterForm'
import { LoadingScreen } from './components/LoadingScreen'
import { CharacterSheet } from './components/CharacterSheet'
import { createCharacter, getStatus, Character, CharacterPayload } from './services/api'

type View = 'form' | 'loading' | 'character'

const STATUS_MESSAGES = [
  'Rolando dados...',
  'Calculando atributos base...',
  'Verificando requisitos de classe...',
  'Processando atributos derivados em paralelo...',
  'Gerando avatar místico...',
  'Salvando no grimório...',
]

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
  const [statusMsg, setMsg]  = useState(STATUS_MESSAGES[0])
  const [isDemo, setIsDemo]  = useState(false)

  const handleGenerate = async (payload: CharacterPayload) => {
    try {
      setError(null)
      setIsDemo(false)
      setView('loading')
      setMsg('Enviando requisição...')
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
    setMsg(STATUS_MESSAGES[0])
  }

  const handleReset = () => {
    setView('form')
    setTaskId(null)
    setChar(null)
    setError(null)
    setIsDemo(false)
  }

  // Polling real
  useEffect(() => {
    if (!taskId || view !== 'loading' || isDemo) return

    let msgIdx = 0
    const msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % STATUS_MESSAGES.length
      setMsg(STATUS_MESSAGES[msgIdx])
    }, 1800)

    const pollTimer = setInterval(async () => {
      try {
        const data = await getStatus(taskId)
        if (data.status === 'done' && data.character) {
          clearInterval(pollTimer)
          clearInterval(msgTimer)
          setChar(data.character)
          setView('character')
        } else if (data.status === 'error') {
          clearInterval(pollTimer)
          clearInterval(msgTimer)
          setError('Erro ao gerar personagem. Tente novamente.')
          setView('form')
        }
      } catch { /* mantém polling */ }
    }, 2000)

    return () => { clearInterval(pollTimer); clearInterval(msgTimer) }
  }, [taskId, view, isDemo])

  // Demo: simula o loading por 4s e exibe ficha fictícia
  useEffect(() => {
    if (!isDemo || view !== 'loading') return

    let msgIdx = 0
    const msgTimer = setInterval(() => {
      msgIdx = (msgIdx + 1) % STATUS_MESSAGES.length
      setMsg(STATUS_MESSAGES[msgIdx])
    }, 1800)

    const doneTimer = setTimeout(() => {
      clearInterval(msgTimer)
      setChar(DEMO_CHARACTER)
      setTaskId('demo')
      setView('character')
    }, 4000)

    return () => { clearInterval(msgTimer); clearTimeout(doneTimer) }
  }, [isDemo, view])

  return (
    <div className="app">
      <header className="app-header">
        <span className="header-orn">✦ ✦ ✦</span>
        <div className="header-center">
          <h1 className="header-title">Gerador de Personagens</h1>
          <p className="header-sub">RPG · D&amp;D 5e · Sistemas Paralelos</p>
        </div>
        <span className="header-orn">✦ ✦ ✦</span>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-banner" role="alert">
            <span>⚠ {error}</span>
            <button onClick={() => setError(null)} aria-label="Fechar">×</button>
          </div>
        )}

        {view === 'form' && (
          <CharacterForm onGenerate={handleGenerate} onDemo={handleDemo} />
        )}
        {view === 'loading' && (
          <LoadingScreen statusMsg={statusMsg} isDemo={isDemo} />
        )}
        {view === 'character' && character && taskId && (
          <CharacterSheet character={character} taskId={taskId} onReset={handleReset} isDemo={isDemo} />
        )}
      </main>

      <footer className="app-footer">
        SPD · Producer-Consumer · Flask → Redis → Celery → PostgreSQL
      </footer>
    </div>
  )
}
