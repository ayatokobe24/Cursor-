import AuthGate from '@/components/AuthGate'
import './App.css'

export default function Home() {
  return (
    <main className="app" style={{ padding: '2rem' }}>
      <h2>TODO アプリ</h2>
      <AuthGate />
    </main>
  )
}
