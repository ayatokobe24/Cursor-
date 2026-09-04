'use client'

import { useState } from 'react'
import AuthForm from '@/components/AuthForm'
import TodoForm from '@/components/TodoForm'
import TodoList from '@/components/TodoList'
import UserMenu from '@/components/UserMenu'
import { useSupabaseUser } from '@/lib/useSupabaseUser'

const STATS_KEY = 'todo-app.stats'
const XP_PER_LEVEL = 50
const RANKS = ['見習い', '冒険者', '斥候', '騎士', '英雄', '伝説']

function loadStats() {
  try {
    const raw = localStorage.getItem(STATS_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (typeof parsed.xp === 'number') return parsed
    }
  } catch {
    /* ignore */
  }
  return { xp: 0 }
}

function rankFor(level) {
  return RANKS[Math.min(level - 1, RANKS.length - 1)]
}

export default function AuthGate() {
  const { user, loading } = useSupabaseUser()
  const [stats] = useState(loadStats)
  const [refreshKey, setRefreshKey] = useState(0)

  if (loading) return <p className="empty">読み込み中…</p>

  if (!user) {
    return (
      <div className="auth-page">
        <h2>認証デモ</h2>
        <AuthForm />
      </div>
    )
  }

  const level = Math.floor(stats.xp / XP_PER_LEVEL) + 1
  const xpIntoLevel = stats.xp % XP_PER_LEVEL
  const progress = `${(xpIntoLevel / XP_PER_LEVEL) * 100}%`

  return (
    <>
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
            <div className="xp-fill" style={{ '--progress': progress }} />
          </div>
        </div>
        <UserMenu userEmail={user.email} />
      </header>
      <TodoForm onAdd={() => setRefreshKey((current) => current + 1)} />
      <TodoList key={refreshKey} />
    </>
  )
}
