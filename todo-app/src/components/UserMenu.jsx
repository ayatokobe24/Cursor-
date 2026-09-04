'use client'

import { supabase } from '@/lib/supabaseClient'

export default function UserMenu({ userEmail, onLogout }) {
  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout?.()
  }

  return (
    <div className="user-menu">
      <span>{userEmail}</span>
      <button type="button" onClick={handleLogout}>
        ログアウト
      </button>
    </div>
  )
}
