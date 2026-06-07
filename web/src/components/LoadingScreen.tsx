import { useState, useEffect } from 'react'
import { Icon } from './Icons'

interface Props {
  isDemo: boolean
  onDemoComplete: () => void
}

const STEPS = [
  { id: 'dados',     line: 'Rolando 4d6, descartando o menor…' },
  { id: 'atributos', line: 'Calculando atributos base…' },
  { id: 'avatar',    line: 'Conjurando a ilustração…' },
  { id: 'salvar',    line: 'Selando no grimório…' },
]

const RING = '◆ PROCESSANDO ◆ SELANDO ◆ '.split('')

export function LoadingScreen({ isDemo, onDemoComplete }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    let i = 0
    const id = setInterval(() => {
      i++
      if (i < STEPS.length) {
        setStep(i)
      } else {
        clearInterval(id)
        if (isDemo) onDemoComplete()
        // em modo real o App.tsx faz a transição via polling
      }
    }, 950)
    return () => clearInterval(id)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const pct = Math.round(((step + 1) / STEPS.length) * 100)

  return (
    <div className="fc-sheet fade-in">
      <span className="fc-margin" />
      <span className="fc-crop tl" /><span className="fc-crop tr" />
      <span className="fc-crop bl" /><span className="fc-crop br" />

      <div className="fc-masthead">
        <div className="fc-mh-l">
          <div className="kicker">Gerador de Personagens</div>
          <div className="ttl">Ficha de Personagem</div>
        </div>
        <div className="fc-mh-r">
          <div className="reg">D&amp;D 5e · SPD</div>
          <div>PROCESSO <b>{pct}%</b></div>
          <div>AGUARDE A EMISSÃO</div>
        </div>
      </div>

      <div className="fc-load">
        <div className="fc-seal">
          <div className="ringtxt">
            {RING.map((c, i) => {
              const a = (i / RING.length) * Math.PI * 2
              const R = 66
              return (
                <span key={i} style={{ transform: `translate(${Math.cos(a) * R}px,${Math.sin(a) * R}px) rotate(${a + Math.PI / 2}rad)` }}>
                  {c}
                </span>
              )
            })}
          </div>
          <div className="core fc-stamp-thump">
            <Icon name="d20" size={44} variant="forjado" />
          </div>
        </div>

        <h2>Emitindo Personagem</h2>
        {isDemo && <span className="fc-stamp rot">Demo</span>}

        <div className="fc-progress">
          <div className="fc-bar"><i style={{ width: pct + '%' }} /></div>
        </div>

        <div className="fc-checklist">
          {STEPS.map((s, i) => (
            <div key={s.id} className={'fc-check' + (i === step ? ' active' : '') + (i < step ? ' done' : '')}>
              <span className="mk">
                {i < step && <Icon name="check" size={12} variant="forjado" strokeWidth={3} />}
              </span>
              {s.line}
              <span className="st">{i < step ? 'OK' : i === step ? '···' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
