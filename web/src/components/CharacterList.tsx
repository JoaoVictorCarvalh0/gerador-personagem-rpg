import { useEffect, useRef, useState, useCallback } from 'react'
import { Character, getPersonagens, getAvatarUrl } from '../services/api'
import { Icon } from './Icons'

export interface PendingTask {
  taskId: string
  name: string
  charClass: string
  race: string
}

const CLASS_ICONS: Record<string, string> = {
  guerreiro: 'sword', mago: 'wand', arqueiro: 'bow',
  ladino: 'dagger', 'clérigo': 'chalice',
}
const RACE_ICONS: Record<string, string> = {
  humano: 'human', elfo: 'elf', anão: 'dwarf',
  halfling: 'halfling', tiefling: 'tiefling',
}

const PAGE_SIZE = 15

interface CharacterListProps {
  refreshTrigger: number
  pendingTasks: PendingTask[]
  onSelect: (character: Character) => void
  activeId: string | null
}

export function CharacterList({ refreshTrigger, pendingTasks, onSelect, activeId }: CharacterListProps) {
  const [characters, setCharacters] = useState<Character[]>([])
  const [hasMore, setHasMore]       = useState(true)
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const offsetRef = useRef(0)

  const fetchPage = useCallback(async (offset: number, replace: boolean) => {
    replace ? setLoading(true) : setLoadingMore(true)
    try {
      const data = await getPersonagens(PAGE_SIZE, offset)
      setCharacters(prev => replace ? data.items : [...prev, ...data.items])
      setHasMore(data.has_more)
      setTotal(data.total)
      offsetRef.current = offset + data.items.length
    } catch {
      // mantém lista atual em caso de erro de rede
    } finally {
      replace ? setLoading(false) : setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    offsetRef.current = 0
    fetchPage(0, true)
  }, [refreshTrigger, fetchPage])

  const totalCount = pendingTasks.length + total

  return (
    <aside className="cl-aside">
    <div className="cl-aside__inner">
      <div className="cl-header">
        <span className="cl-header__ic"><Icon name="scroll" size={14} variant="line" /></span>
        Arquivos da Guilda
        <span className="cl-header__count">{totalCount}</span>
      </div>

      {loading ? (
        <div className="cl-empty">
          <span className="cl-empty__label">Consultando arquivos...</span>
        </div>
      ) : totalCount === 0 ? (
        <div className="cl-empty">
          <Icon name="d20" size={28} variant="line" />
          <span className="cl-empty__label">Nenhum personagem<br />registrado ainda</span>
        </div>
      ) : (
        <>
          <ul className="cl-list">
            {pendingTasks.map((task) => (
              <li key={task.taskId} className="cl-item cl-item--pending">
                <div className="cl-item__avatar cl-item__avatar--pulse">
                  <span className="cl-item__avatar-fallback">
                    <Icon name={CLASS_ICONS[task.charClass] ?? 'sword'} size={18} variant="line" />
                  </span>
                </div>
                <div className="cl-item__info">
                  <span className="cl-item__name">{task.name || 'Aventureiro'}</span>
                  <span className="cl-item__meta">
                    <Icon name={CLASS_ICONS[task.charClass] ?? 'sword'} size={11} variant="line" />
                    {task.charClass}
                    <span className="cl-item__sep">·</span>
                    <Icon name={RACE_ICONS[task.race] ?? 'human'} size={11} variant="line" />
                    {task.race}
                  </span>
                </div>
                <span className="cl-item__spinner">
                  <Icon name="refresh" size={13} variant="line" />
                </span>
              </li>
            ))}

            {characters.map((c) => (
              <li
                key={c.id}
                className={`cl-item${c.id === activeId ? ' cl-item--active' : ''}`}
                onClick={() => onSelect(c)}
              >
                <div className="cl-item__avatar">
                  <img
                    src={getAvatarUrl(c.id)}
                    alt={c.name}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <span className="cl-item__avatar-fallback">
                    <Icon name={CLASS_ICONS[c.class] ?? 'sword'} size={18} variant="line" />
                  </span>
                </div>
                <div className="cl-item__info">
                  <span className="cl-item__name">{c.name}</span>
                  <span className="cl-item__meta">
                    <Icon name={CLASS_ICONS[c.class] ?? 'sword'} size={11} variant="line" />
                    {c.class}
                    <span className="cl-item__sep">·</span>
                    <Icon name={RACE_ICONS[c.race] ?? 'human'} size={11} variant="line" />
                    {c.race}
                  </span>
                </div>
                {c.id === activeId && (
                  <span className="cl-item__active-mark">
                    <Icon name="chevronLeft" size={12} variant="forjado" style={{ transform: 'rotate(180deg)' }} />
                  </span>
                )}
              </li>
            ))}
          </ul>

          {hasMore && (
            <button
              className="cl-load-more"
              onClick={() => fetchPage(offsetRef.current, false)}
              disabled={loadingMore}
            >
              {loadingMore
                ? <><span className="cl-item__spinner"><Icon name="refresh" size={13} variant="line" /></span> Carregando...</>
                : <>Carregar mais <span className="cl-load-more__hint">({total - characters.length} restantes)</span></>
              }
            </button>
          )}
        </>
      )}
    </div>
    </aside>
  )
}
