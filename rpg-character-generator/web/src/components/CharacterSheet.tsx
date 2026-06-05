import { useState } from 'react'
import { Character, getAvatarUrl } from '../services/api'

interface Props {
  character: Character
  taskId: string
  onReset: () => void
  isDemo?: boolean
}

const STAT_FULL: Record<string, string> = {
  FOR: 'Força',
  DES: 'Destreza',
  INT: 'Inteligência',
  CON: 'Constituição',
  SAB: 'Sabedoria',
  CAR: 'Carisma',
}

const DERIVED_META: Record<string, { label: string; icon: string; unit?: string }> = {
  dano:              { label: 'Dano',           icon: '⚔️' },
  defesa:            { label: 'Defesa',         icon: '🛡️' },
  critico:           { label: 'Chance Crítica', icon: '💥', unit: '%' },
  velocidade_ataque: { label: 'Vel. de Ataque', icon: '⚡', unit: 'x' },
}

function modifier(val: number): string {
  const m = Math.floor((val - 10) / 2)
  return m >= 0 ? `+${m}` : `${m}`
}

function statColor(val: number): string {
  if (val >= 17) return '#4caf50'
  if (val >= 14) return '#8bc34a'
  if (val >= 11) return '#ffc107'
  if (val >= 8)  return '#ff9800'
  return '#f44336'
}

export function CharacterSheet({ character, taskId, onReset, isDemo }: Props) {
  const [imgErr, setImgErr] = useState(false)

  return (
    <div className="card sheet-card">
      {/* ── Top ── */}
      <div className="sheet-top">
        <div className="sheet-avatar">
          {imgErr ? (
            <div className="avatar-fallback">
              {character.name[0]?.toUpperCase() ?? '?'}
            </div>
          ) : (
            <img
              src={getAvatarUrl(taskId)}
              alt={character.name}
              className="avatar-img"
              onError={() => setImgErr(true)}
            />
          )}
        </div>
        <div className="sheet-identity">
          <h2 className="char-name">{character.name}</h2>
          <div className="char-tags">
            <span className="tag tag-class">{character.class}</span>
            <span className="tag tag-race">{character.race}</span>
          </div>
          <p className="char-id">#{character.id.slice(0, 8)}</p>
          {isDemo && <span className="demo-badge">DEMO</span>}
        </div>
      </div>

      <div className="sheet-divider">✦ Ficha do Personagem ✦</div>

      {/* ── Placeholder: ilustração do personagem ── */}
      <div className="wip-banner">
        <div className="wip-frame">
          <span className="wip-icon">🚧</span>
          <p className="wip-title">Ilustração do Personagem</p>
          <p className="wip-msg">Em construção</p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="sheet-cols">
        {/* Base attributes */}
        <section className="sheet-section">
          <h3 className="section-label">⚔ Atributos Base</h3>
          <div className="stats-grid">
            {Object.entries(character.base_attributes).map(([stat, val]) => (
              <div
                key={stat}
                className="stat-box"
                style={{ '--c': statColor(val) } as React.CSSProperties}
              >
                <span className="stat-abbr">{stat}</span>
                <span className="stat-val">{val}</span>
                <span className="stat-mod">{modifier(val)}</span>
                <span className="stat-full">{STAT_FULL[stat] ?? stat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Derived attributes */}
        <section className="sheet-section">
          <h3 className="section-label">📊 Atributos Derivados</h3>
          <div className="derived-list">
            {Object.entries(character.derived_attributes).map(([key, val]) => {
              const meta = DERIVED_META[key]
              return (
                <div key={key} className="derived-row">
                  <span className="derived-icon">{meta?.icon ?? '•'}</span>
                  <span className="derived-label">{meta?.label ?? key}</span>
                  <span className="derived-val">
                    {typeof val === 'number' ? val.toFixed(1) : String(val)}
                    {meta?.unit ?? ''}
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ── Actions ── */}
      <div className="sheet-footer">
        <button className="btn-new" onClick={onReset}>
          🎲 Gerar Novo Personagem
        </button>
      </div>
    </div>
  )
}
