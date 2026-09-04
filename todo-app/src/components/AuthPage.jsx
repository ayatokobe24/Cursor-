'use client'

import AuthForm from '@/components/AuthForm'
import UserMenu from '@/components/UserMenu'
import { useSupabaseUser } from '@/hooks/useSupabaseUser'

/**
 * ログイン済みならユーザー情報を表示する。
 */
export default function AuthPage() {
  const { user, loading } = useSupabaseUser()

  if (loading) {
    return (
      <main className="app auth-page">
        <p className="empty">読み込み中…</p>
      </main>
    )
  }

  return (
    <main className="app auth-page">
      <h2>認証デモ</h2>
      {user ? <UserMenu userEmail={user.email} /> : <AuthForm />}
    </main>
  )
}
