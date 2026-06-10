import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Icon } from './Icons'
import { login, register, setToken } from '../services/api'

interface AuthPageProps {
  mode: 'login' | 'register'
}

const SERIAL = 'AVT-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-7741'
const RING = '★ GUILDA DOS AVENTUREIROS ★ '.split('')
const BARS = Array.from({ length: 28 }, () => 2 + Math.round(Math.random() * 8))

function Stub() {
  return (
    <div className="au-stub">
      <span className="au-perf" />
      <span className="au-notch au-notch--t" />
      <span className="au-notch au-notch--b" />
      <div className="au-vert"><span>Credencial · {SERIAL}</span></div>
      <div className="au-seal">
        <div className="au-seal__ring">
          {RING.map((c, i) => {
            const a = (i / RING.length) * Math.PI * 2
            const R = 42
            return (
              <span
                key={i}
                style={{ transform: `translate(${Math.cos(a) * R}px,${Math.sin(a) * R}px) rotate(${a + Math.PI / 2}rad)` }}
              >
                {c}
              </span>
            )
          })}
        </div>
        <Icon name="d20" size={40} variant="forjado" />
      </div>
      <div className="au-org">Guilda dos<br />Aventureiros</div>
      <div className="au-guild">Registro Oficial</div>
      <div className="au-rule" />
      <div className="au-since">Membro desde<br /><b>MMXXVI</b></div>
      <div className="au-barcode">
        {BARS.map((h, i) => <i key={i} style={{ height: h * 3.4 + 'px' }} />)}
      </div>
    </div>
  )
}

interface FieldProps {
  legend: string
  num: string
  type?: string
  icon: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  error?: string
  canReveal?: boolean
}

function Field({ legend, num, type = 'text', icon, value, onChange, placeholder, error, canReveal }: FieldProps) {
  const [show, setShow] = useState(false)
  const inputType = canReveal ? (show ? 'text' : 'password') : type
  return (
    <div className="au-field">
      <span className="au-legend">
        {legend} <span className="au-legend__num">/ {num}</span>
      </span>
      <div className="au-inwrap">
        <span className="au-inwrap__lead">
          <Icon name={icon} size={17} variant="line" />
        </span>
        <input
          className="au-write"
          type={inputType}
          value={value}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value)}
        />
        {canReveal && (
          <button
            type="button"
            className="au-eye"
            onClick={() => setShow(s => !s)}
            aria-label="mostrar senha"
          >
            <Icon name={show ? 'eyeOff' : 'eye'} size={18} variant="line" />
          </button>
        )}
      </div>
      {error && (
        <div className="au-err">
          <Icon name="chevronLeft" size={11} variant="forjado" style={{ transform: 'rotate(-90deg)' }} />
          {error}
        </div>
      )}
    </div>
  )
}

export function AuthPage({ mode: initialMode }: AuthPageProps) {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>(initialMode)
  const [granted, setGranted] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [f, setF] = useState({ usuario: '', senha: '', confirma: '' })
  const [err, setErr] = useState<Record<string, string>>({})
  const [apiErr, setApiErr] = useState<string | null>(null)

  const set = (k: keyof typeof f) => (v: string) => setF(s => ({ ...s, [k]: v }))

  const switchMode = (m: 'login' | 'register') => {
    setMode(m)
    setErr({})
    setApiErr(null)
    navigate({ to: m === 'login' ? '/login' : '/register' })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (f.usuario.trim().length < 2) e.usuario = 'mínimo de 2 caracteres'
    if (f.senha.length < 6) e.senha = 'mínimo de 6 caracteres'
    if (mode === 'register' && f.confirma !== f.senha) e.confirma = 'as senhas não coincidem'
    setErr(e)
    return Object.keys(e).length === 0
  }

  const submit = async () => {
    if (!validate()) return
    setLoading(true)
    setApiErr(null)
    try {
      if (mode === 'register') {
        await register(f.usuario.trim(), f.senha)
      }
      const token = await login(f.usuario.trim(), f.senha)
      setToken(token)
      setGranted(f.usuario.trim())
    } catch (e: unknown) {
      setApiErr(e instanceof Error ? e.message : 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <>
      <div className="fc-bg" />
      <div className="fc-grain" />
      <div className="au-wrap">
        <div className="au-card fade-in">
          <span className="fc-crop tl" /><span className="fc-crop tr" />
          <span className="fc-crop bl" /><span className="fc-crop br" />
          <Stub />

          <div className="au-body">
            <div className="au-mh">
              <div>
                <div className="au-mh__kick">Gerador de Personagens</div>
                <div className="au-mh__ttl">{granted ? 'Credencial' : 'Acesso à Guilda'}</div>
              </div>
              <div className="au-mh__rt">
                <div>FORM. <b>{mode === 'register' ? 'R-02' : 'A-01'}</b></div>
                <div>{granted ? 'VALIDADA' : 'AUTENTICAR'}</div>
              </div>
            </div>

            {granted ? (
              <div className="au-grant">
                <div className="au-grant__seal pop-seal">
                  <Icon name="check" size={48} variant="forjado" strokeWidth={2.6} />
                </div>
                <span className="au-stamp au-stamp--rot pop-stamp">Acesso Concedido</span>
                <h2 className="au-grant__h2">Bem-vindo, {granted}</h2>
                <p className="au-grant__p">
                  {mode === 'register'
                    ? 'Sua credencial foi emitida e selada.'
                    : 'Identidade confirmada nos arquivos da guilda.'}
                </p>
                <div className="au-grant__who">Registro {SERIAL}</div>
                <button className="au-btn" onClick={() => navigate({ to: '/' })}>
                  Entrar no Gerador
                  <span className="au-btn__ic"><Icon name="arrowRight" size={16} variant="line" /></span>
                </button>
              </div>
            ) : (
              <>
                <div className="au-tabs">
                  <div
                    className={`au-tab${mode === 'login' ? ' au-tab--on' : ''}`}
                    onClick={() => switchMode('login')}
                  >
                    <Icon name="key" size={15} variant="line" /> Entrar
                  </div>
                  <div
                    className={`au-tab${mode === 'register' ? ' au-tab--on' : ''}`}
                    onClick={() => switchMode('register')}
                  >
                    <Icon name="quill" size={15} variant="line" /> Criar Conta
                  </div>
                </div>

                <div onKeyDown={handleKeyDown}>
                  <Field
                    legend="Usuário"
                    num="01"
                    icon="user"
                    value={f.usuario}
                    onChange={set('usuario')}
                    placeholder="nome de aventureiro"
                    error={err.usuario}
                  />
                  <Field
                    legend="Senha"
                    num="02"
                    icon="lock"
                    canReveal
                    value={f.senha}
                    onChange={set('senha')}
                    placeholder="palavra-passe secreta"
                    error={err.senha}
                  />
                  {mode === 'register' && (
                    <Field
                      legend="Confirmar Senha"
                      num="03"
                      icon="lock"
                      canReveal
                      value={f.confirma}
                      onChange={set('confirma')}
                      placeholder="repita a palavra-passe"
                      error={err.confirma}
                    />
                  )}
                </div>

                {apiErr && (
                  <div className="au-err au-err--api">
                    <Icon name="chevronLeft" size={11} variant="forjado" style={{ transform: 'rotate(-90deg)' }} />
                    {apiErr}
                  </div>
                )}

                <button className="au-btn" onClick={submit} disabled={loading}>
                  {loading
                    ? 'Aguarde...'
                    : mode === 'login' ? 'Entrar na Guilda' : 'Emitir Credencial'}
                  {!loading && (
                    <span className="au-btn__ic"><Icon name="arrowRight" size={16} variant="line" /></span>
                  )}
                </button>

                <div className="au-alt">
                  {mode === 'login'
                    ? <>Ainda não tem registro? <a onClick={() => switchMode('register')}>Criar conta</a></>
                    : <>Já é membro? <a onClick={() => switchMode('login')}>Entrar</a></>}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="au-foot">
          SPD · Producer-Consumer · <b>Flask</b> → <b>Redis</b> → <b>MongoDB</b>
        </div>
      </div>
    </>
  )
}
