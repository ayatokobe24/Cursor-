'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

function translateAuthError(message) {
  if (message.includes('Email not confirmed')) {
    return 'このアカウントは未確認のためログインできません。Supabase の Authentication → Providers → Email で Confirm email をオフにし、SQL Editor で supabase/migrations/20260903_auto_confirm_emails.sql を実行してください。'
  }
  if (message.includes('Invalid login credentials')) {
    return 'メールアドレスまたはパスワードが正しくありません。'
  }
  if (message.includes('Password should be at least')) {
    return 'パスワードは6文字以上にしてください。'
  }
  if (message.includes('already registered') || message.includes('User already registered')) {
    return 'このメールアドレスは登録済みです。ログインしてください。'
  }
  return message
}

export default function AuthForm({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const finishIfSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      onSuccess?.()
      return true
    }
    return false
  }

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setErrorMsg(translateAuthError(error.message))
      return false
    }
    await finishIfSession()
    return true
  }

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      if (
        error.message.includes('already registered') ||
        error.message.includes('User already registered')
      ) {
        await handleSignIn()
        return
      }
      setErrorMsg(translateAuthError(error.message))
      return
    }

    if (data.session) {
      await finishIfSession()
      return
    }

    await handleSignIn()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setErrorMsg('')

    const action = event.nativeEvent.submitter?.name === 'signup' ? 'signup' : 'signin'
    if (action === 'signup') {
      await handleSignUp()
    } else {
      await handleSignIn()
    }

    setLoading(false)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={email}
        required
        autoComplete="email"
        onChange={(event) => setEmail(event.target.value)}
        aria-label="Email"
      />
      <input
        type="password"
        name="password"
        placeholder="Password（6文字以上）"
        value={password}
        required
        minLength={6}
        autoComplete="current-password"
        onChange={(event) => setPassword(event.target.value)}
        aria-label="Password"
      />
      <button type="submit" name="signin" disabled={loading}>
        {loading ? '処理中…' : 'ログイン'}
      </button>
      <button type="submit" name="signup" disabled={loading}>
        {loading ? '処理中…' : '登録'}
      </button>
      {errorMsg ? <p className="auth-error">{errorMsg}</p> : null}
    </form>
  )
}
