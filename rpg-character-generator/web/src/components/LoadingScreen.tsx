const RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ']

const STEPS = ['Dados', 'Atributos', 'Avatar', 'Salvar']

interface Props {
  statusMsg: string
  isDemo?: boolean
}

export function LoadingScreen({ statusMsg, isDemo }: Props) {
  return (
    <div className="loading-wrap">
      <div className="arcane-ring">
        <div className="ring r1" />
        <div className="ring r2" />
        <div className="ring r3" />
        <div className="ring-runes">
          {RUNES.map((r, i) => (
            <span
              key={i}
              className="rune"
              style={{ '--ri': i } as React.CSSProperties}
            >
              {r}
            </span>
          ))}
        </div>
        <div className="ring-core">🎲</div>
      </div>

      <h2 className="loading-h2">Invocando Personagem</h2>
      {isDemo && <span className="demo-badge">DEMO</span>}
      <p className="loading-msg">{statusMsg}</p>

      <div className="pipeline">
        {STEPS.map((s, i) => (
          <div key={s} className="pipeline-step">
            <div
              className="pipeline-dot"
              style={{ animationDelay: `${i * 0.5}s` } as React.CSSProperties}
            />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
