import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_PW = (import.meta as any).env.VITE_ADMIN_PASSWORD || 'switch2026'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PW) {
      sessionStorage.setItem('switch_admin', 'true')
      navigate('/admin/games')
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="liquid-glass rounded-2xl p-8 w-full max-w-sm border border-white/20">
        <img src="/logo.png" alt="Switch" className="h-10 w-10 object-contain mb-6" />
        <h1 className="text-2xl font-semibold mb-1" style={{ letterSpacing: '-0.03em' }}>Admin</h1>
        <p className="text-sm text-gray-300 mb-8">Sign in to manage Switch content.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
              placeholder="••••••••••••"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="submit"
            className="w-full bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
