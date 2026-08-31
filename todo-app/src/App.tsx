import { useEffect, useMemo, useState, type DragEvent, type FormEvent } from 'react'
import './App.css'

type Filter = 'all' | 'active' | 'completed'

type Subquest = {
  id: string
  title: string
  done: boolean
}

type Quest = {
  id: string
  title: string
  done: boolean
  due: string
  subquests: Subquest[]
}

type Stats = {
  xp: number
}

const QUEST_KEY = 'todo-app.items'
const STATS_KEY = 'todo-app.stats'
const XP_PER_QUEST = 15
const XP_PER_SUB = 4
const XP_PER_LEVEL = 50
const RANKS = ['見習い', '冒険者', '斥候', '騎士', '英雄', '伝説'] as const

function todayISO() {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

function normalizeQuest(raw: Partial<Quest> & { id: string; title: string }): Quest {
  return {
    id: raw.id,
    title: raw.title,
    done: Boolean(raw.done),
    due: typeof raw.due === 'string' ? raw.due : '',
    subquests: Array.isArray(raw.subquests) ? raw.subquests : [],
  }
}

function loadQuests(): Quest[] {
  try {
    const raw = localStorage.getItem(QUEST_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Partial<Quest> & { id: string; title: string }>
    return Array.isArray(parsed) ? parsed.map(normalizeQuest) : []
  } catch {
    return []
  }
}

function loadStats(quests: Quest[]): Stats {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Stats
      if (typeof parsed.xp === 'number') return parsed
    }
  } catch {
    /* ignore */
  }
  const fromQuests = quests.filter((quest) => quest.done).length * XP_PER_QUEST
  const fromSubs = quests.flatMap((quest) => quest.subquests).filter((sub) => sub.done).length * XP_PER_SUB
  return { xp: fromQuests + fromSubs }
}

function rankFor(level: number) {
  return RANKS[Math.min(level - 1, RANKS.length - 1)]
}

function dueMeta(due: string) {
  if (!due) return null
  const today = todayISO()
  if (due < today) return { label: '期限切れ', kind: 'overdue' as const }
  if (due === today) return { label: '本日期限', kind: 'today' as const }
  return { label: `納期 ${due}`, kind: 'later' as const }
}

function App() {
  const [quests, setQuests] = useState<Quest[]>(loadQuests)
  const [stats, setStats] = useState<Stats>(() => loadStats(loadQuests()))
  const [draft, setDraft] = useState('')
  const [dueDraft, setDueDraft] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [subDrafts, setSubDrafts] = useState<Record<string, string>>({})
  const [dragId, setDragId] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(QUEST_KEY, JSON.stringify(quests))
  }, [quests])

  useEffect(() => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  }, [stats])

  const visible = useMemo(() => {
    if (filter === 'active') return quests.filter((quest) => !quest.done)
    if (filter === 'completed') return quests.filter((quest) => quest.done)
    return quests
  }, [quests, filter])

  const remaining = quests.filter((quest) => !quest.done).length
  const clearedCount = quests.length - remaining
  const level = Math.floor(stats.xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = stats.xp % XP_PER_LEVEL
  const progress = `${(xpIntoLevel / XP_PER_LEVEL) * 100}%`

  function gainXp(amount: number) {
    setStats((current) => ({ xp: Math.max(0, current.xp + amount) }))
  }

  function addQuest(event: FormEvent) {
    event.preventDefault()
    const title = draft.trim()
    if (!title) return
    setQuests((current) => [
      {
        id: crypto.randomUUID(),
        title,
        done: false,
        due: dueDraft,
        subquests: [],
      },
      ...current,
    ])
    setDraft('')
    setDueDraft('')
  }

  function toggleQuest(id: string) {
    const target = quests.find((quest) => quest.id === id)
    if (!target) return
    const nextDone = !target.done
    setQuests((current) =>
      current.map((quest) =>
        quest.id === id ? { ...quest, done: nextDone } : quest,
      ),
    )
    gainXp(nextDone ? XP_PER_QUEST : -XP_PER_QUEST)
  }

  function abandonQuest(id: string) {
    setQuests((current) => current.filter((quest) => quest.id !== id))
  }

  function setDue(id: string, due: string) {
    setQuests((current) =>
      current.map((quest) => (quest.id === id ? { ...quest, due } : quest)),
    )
  }

  function startEdit(quest: Quest) {
    setEditingId(quest.id)
    setEditingTitle(quest.title)
  }

  function commitEdit() {
    if (!editingId) return
    const title = editingTitle.trim()
    if (!title) {
      abandonQuest(editingId)
    } else {
      setQuests((current) =>
        current.map((quest) =>
          quest.id === editingId ? { ...quest, title } : quest,
        ),
      )
    }
    setEditingId(null)
    setEditingTitle('')
  }

  function archiveCleared() {
    setQuests((current) => current.filter((quest) => !quest.done))
  }

  function addSubquest(questId: string) {
    const title = (subDrafts[questId] ?? '').trim()
    if (!title) return
    setQuests((current) =>
      current.map((quest) =>
        quest.id === questId
          ? {
              ...quest,
              subquests: [
                ...quest.subquests,
                { id: crypto.randomUUID(), title, done: false },
              ],
            }
          : quest,
      ),
    )
    setSubDrafts((current) => ({ ...current, [questId]: '' }))
  }

  function toggleSubquest(questId: string, subId: string) {
    const quest = quests.find((item) => item.id === questId)
    const sub = quest?.subquests.find((item) => item.id === subId)
    if (!sub) return
    const nextDone = !sub.done
    setQuests((current) =>
      current.map((item) =>
        item.id === questId
          ? {
              ...item,
              subquests: item.subquests.map((entry) =>
                entry.id === subId ? { ...entry, done: nextDone } : entry,
              ),
            }
          : item,
      ),
    )
    gainXp(nextDone ? XP_PER_SUB : -XP_PER_SUB)
  }

  function removeSubquest(questId: string, subId: string) {
    setQuests((current) =>
      current.map((quest) =>
        quest.id === questId
          ? {
              ...quest,
              subquests: quest.subquests.filter((sub) => sub.id !== subId),
            }
          : quest,
      ),
    )
  }

  function moveQuest(id: string, direction: -1 | 1) {
    setQuests((current) => {
      const index = current.findIndex((quest) => quest.id === id)
      const next = index + direction
      if (index < 0 || next < 0 || next >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(next, 0, item)
      return copy
    })
  }

  function onDragStart(id: string) {
    setDragId(id)
  }

  function onDragOver(event: DragEvent, targetId: string) {
    event.preventDefault()
    if (!dragId || dragId === targetId) return
    setQuests((current) => {
      const from = current.findIndex((quest) => quest.id === dragId)
      const to = current.findIndex((quest) => quest.id === targetId)
      if (from < 0 || to < 0 || from === to) return current
      const copy = [...current]
      const [item] = copy.splice(from, 1)
      copy.splice(to, 0, item)
      return copy
    })
  }

  function onDragEnd() {
    setDragId(null)
  }

  return (
    <main className="app">
      <header className="hud">
        <div>
          <p className="hud-kicker">Guild Board</p>
          <h1>クエストボード</h1>
        </div>
        <div className="rank">
          <span className="rank-label">Lv.{level}</span>
          <span className="rank-name">{rankFor(level)}</span>
        </div>
        <div className="xp">
          <div className="xp-meta">
            <span>経験値 {stats.xp} XP</span>
            <span>次のレベルまで {XP_PER_LEVEL - xpIntoLevel} XP</span>
          </div>
          <div className="xp-track" aria-hidden="true">
            <div className="xp-fill" style={{ '--progress': progress } as never} />
          </div>
        </div>
      </header>

      <form className="composer" onSubmit={addQuest}>
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="新しいクエストを掲示"
          aria-label="新しいクエスト"
        />
        <input
          type="date"
          value={dueDraft}
          onChange={(event) => setDueDraft(event.target.value)}
          aria-label="納期"
        />
        <button type="submit">受注</button>
      </form>

      <div className="toolbar">
        <span>進行中 {remaining}</span>
        <div className="filters">
          {(
            [
              ['all', '掲示中'],
              ['active', '未達成'],
              ['completed', '達成'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={filter === value ? 'is-active' : ''}
              onClick={() => setFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {clearedCount > 0 ? (
          <button type="button" className="clear" onClick={archiveCleared}>
            達成をしまう
          </button>
        ) : (
          <span />
        )}
      </div>

      <ul className="list">
        {visible.length === 0 ? (
          <li className="empty">ToDoはありません。</li>
        ) : (
          visible.map((quest, indexInView) => {
            const due = dueMeta(quest.due)
            const doneSubs = quest.subquests.filter((sub) => sub.done).length
            const fullIndex = quests.findIndex((item) => item.id === quest.id)
            return (
              <li
                key={quest.id}
                className={[
                  'quest',
                  quest.done ? 'is-cleared' : '',
                  due?.kind === 'overdue' && !quest.done ? 'is-overdue' : '',
                  dragId === quest.id ? 'is-dragging' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                draggable
                onDragStart={() => onDragStart(quest.id)}
                onDragOver={(event) => onDragOver(event, quest.id)}
                onDragEnd={onDragEnd}
              >
                <div className="quest-tools">
                  <button
                    type="button"
                    className="nudge"
                    aria-label="上へ"
                    disabled={fullIndex === 0}
                    onClick={() => moveQuest(quest.id, -1)}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    className="nudge"
                    aria-label="下へ"
                    disabled={fullIndex === quests.length - 1}
                    onClick={() => moveQuest(quest.id, 1)}
                  >
                    ▼
                  </button>
                </div>
                <button
                  type="button"
                  className="seal"
                  aria-label={quest.done ? '未達成に戻す' : 'クエストを達成する'}
                  onClick={() => toggleQuest(quest.id)}
                >
                  {quest.done ? '済' : ''}
                </button>
                <div className="quest-body">
                  <div className="quest-meta">
                    <span className="reward">報酬 {XP_PER_QUEST} XP</span>
                    {due ? (
                      <span className={`due due-${due.kind}`}>{due.label}</span>
                    ) : null}
                    {quest.subquests.length > 0 ? (
                      <span className="sub-count">
                        サブ {doneSubs}/{quest.subquests.length}
                      </span>
                    ) : null}
                  </div>
                  {editingId === quest.id ? (
                    <input
                      className="title-edit"
                      value={editingTitle}
                      autoFocus
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onBlur={commitEdit}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') commitEdit()
                        if (event.key === 'Escape') {
                          setEditingId(null)
                          setEditingTitle('')
                        }
                      }}
                    />
                  ) : (
                    <button
                      type="button"
                      className="title"
                      onDoubleClick={() => startEdit(quest)}
                    >
                      {quest.title}
                    </button>
                  )}
                  <label className="due-edit">
                    納期
                    <input
                      type="date"
                      value={quest.due}
                      onChange={(event) => setDue(quest.id, event.target.value)}
                    />
                  </label>
                  <ul className="subs">
                    {quest.subquests.map((sub) => (
                      <li key={sub.id} className={sub.done ? 'is-done' : ''}>
                        <button
                          type="button"
                          className="sub-seal"
                          aria-label={sub.done ? '未達成に戻す' : 'サブクエストを達成する'}
                          onClick={() => toggleSubquest(quest.id, sub.id)}
                        >
                          {sub.done ? '済' : ''}
                        </button>
                        <span>{sub.title}</span>
                        <span className="sub-xp">+{XP_PER_SUB} XP</span>
                        <button
                          type="button"
                          className="abandon"
                          onClick={() => removeSubquest(quest.id, sub.id)}
                        >
                          破棄
                        </button>
                      </li>
                    ))}
                  </ul>
                  <form
                    className="sub-form"
                    onSubmit={(event) => {
                      event.preventDefault()
                      addSubquest(quest.id)
                    }}
                  >
                    <input
                      value={subDrafts[quest.id] ?? ''}
                      onChange={(event) =>
                        setSubDrafts((current) => ({
                          ...current,
                          [quest.id]: event.target.value,
                        }))
                      }
                      placeholder="サブクエストを追加"
                      aria-label={`${quest.title}のサブクエスト`}
                    />
                    <button type="submit">追加</button>
                  </form>
                </div>
                <button
                  type="button"
                  className="abandon"
                  onClick={() => abandonQuest(quest.id)}
                >
                  破棄
                </button>
                <span className="sr-only">掲示順 {indexInView + 1}</span>
              </li>
            )
          })
        )}
      </ul>
    </main>
  )
}

export default App
