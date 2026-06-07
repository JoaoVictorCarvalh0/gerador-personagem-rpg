import { useState, FormEvent } from 'react'
import { CharacterPayload } from '../services/api'

const CLASSES = ['guerreiro', 'mago', 'arqueiro', 'ladino', 'clérigo'] as const
const RACES   = ['humano', 'elfo', 'anão', 'halfling', 'tiefling'] as const

const CLASS_META: Record<string, { icon: string; req: string }> = {
  guerreiro: { icon: '⚔️', req: 'FOR ≥ 13' },
  mago:      { icon: '🔮', req: 'INT ≥ 13' },
  arqueiro:  { icon: '🏹', req: 'DES ≥ 13' },
  ladino:    { icon: '🗡️', req: 'DES ≥ 12, INT ≥ 11' },
  'clérigo': { icon: '✝️', req: 'SAB ≥ 13' },
}

const RACE_META: Record<string, { icon: string; desc: string }> = {
  humano:   { icon: '👤', desc: 'Versátil' },
  elfo:     { icon: '🧝', desc: 'Ágil e sábio' },
  anão:     { icon: '⛏️', desc: 'Robusto' },
  halfling: { icon: '🍀', desc: 'Sortudo' },
  tiefling: { icon: '😈', desc: 'Infernal' },
}

const RANDOM_NAMES = [
  'Thordak', 'Lyria', 'Grimstone', 'Aelindra', 'Korvas',
  'Seraphine', 'Bram', 'Zephyra', 'Dune', 'Valdris',
  'Isolde', 'Ragnar', 'Nyxara', 'Flint', 'Cassia',
]

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface Props {
  onGenerate: (payload: CharacterPayload) => void
  onDemo: () => void
}

export function CharacterForm({ onGenerate, onDemo }: Props) {
  const [name, setName]               = useState('')
  const [charClass, setCharClass]     = useState('aleatorio')
  const [race, setRace]               = useState('aleatorio')
  const [mainColor, setMainColor]     = useState('#8B0000')
  const [secondColor, setSecondColor] = useState('#FFD700')
  const [submitting, setSubmitting]   = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    onGenerate({
      name:            name.trim() || pickRandom(RANDOM_NAMES),
      class:           charClass === 'aleatorio' ? pickRandom(CLASSES) : charClass,
      race:            race === 'aleatorio'      ? pickRandom(RACES)   : race,
      main_color:      mainColor,
      secondary_color: secondColor,
    })
  }

  return (
    <form className="card form-card" onSubmit={handleSubmit}>
      <div className="form-head">
        <h2>Criar Personagem</h2>
        <p>Escolha as opções ou deixe em aleatório para surpresas</p>
      </div>

      {/* Name */}
      <div className="field">
        <label className="field-label">Nome</label>
        <input
          className="field-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Deixe vazio para nome aleatório..."
          maxLength={60}
        />
      </div>

      {/* Class */}
      <div className="field">
        <label className="field-label">Classe</label>
        <div className="pick-group">
          <button
            type="button"
            className={`pick-btn ${charClass === 'aleatorio' ? 'active' : ''}`}
            onClick={() => setCharClass('aleatorio')}
          >
            🎲 Aleatório
          </button>
          {CLASSES.map(c => (
            <button
              key={c}
              type="button"
              className={`pick-btn ${charClass === c ? 'active' : ''}`}
              onClick={() => setCharClass(c)}
              title={CLASS_META[c].req}
            >
              {CLASS_META[c].icon} {cap(c)}
            </button>
          ))}
        </div>
        {charClass !== 'aleatorio' && (
          <span className="field-hint">Requisito: {CLASS_META[charClass]?.req}</span>
        )}
      </div>

      {/* Race */}
      <div className="field">
        <label className="field-label">Raça</label>
        <div className="pick-group">
          <button
            type="button"
            className={`pick-btn ${race === 'aleatorio' ? 'active' : ''}`}
            onClick={() => setRace('aleatorio')}
          >
            🎲 Aleatório
          </button>
          {RACES.map(r => (
            <button
              key={r}
              type="button"
              className={`pick-btn ${race === r ? 'active' : ''}`}
              onClick={() => setRace(r)}
              title={RACE_META[r].desc}
            >
              {RACE_META[r].icon} {cap(r)}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="field">
        <label className="field-label">Cores</label>
        <div className="color-row">
          <div className="color-item">
            <input type="color" value={mainColor} onChange={e => setMainColor(e.target.value)} />
            <span>Principal</span>
            <code>{mainColor}</code>
          </div>
          <div className="color-item">
            <input type="color" value={secondColor} onChange={e => setSecondColor(e.target.value)} />
            <span>Secundária</span>
            <code>{secondColor}</code>
          </div>
        </div>
      </div>

      <button type="submit" className="btn-invoke" disabled={submitting}>
        ⚔&nbsp; Invocar Personagem &nbsp;⚔
      </button>

      <button type="button" className="btn-demo" onClick={onDemo}>
        🎭 Ver Demo (sem backend)
      </button>
    </form>
  )
}
