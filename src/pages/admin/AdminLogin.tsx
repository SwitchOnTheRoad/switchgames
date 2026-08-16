import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ADMIN_PW = import.meta.env.VITE_ADMIN_PASSWORD || 'switch2026'

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
    <div className="min-h-screen flex items-center justify-center px-6 admin-wrapper" style={{ background: 'linear-gradient(to bottom, #030514 0%, #010103 100%)' }}>
      <div className="relative w-full max-w-md">
        {/* Glow backdrop aura */}
        <div className="absolute inset-0 bg-[#1e60ff] opacity-10 rounded-full blur-[80px] pointer-events-none" />

        <div className="liquid-glass rounded-3xl p-10 border border-white/[0.08] bg-white/[0.02] backdrop-blur-xl shadow-2xl relative">
          <img src="/logo.png" alt="Switch" className="h-12 w-12 object-contain mb-8 mx-auto" />
          <h1 className="text-3xl font-semibold text-center mb-2" style={{ letterSpacing: '-0.03em' }}>Admin Portal</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Sign in to manage the Switch studio ecosystem.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#1e60ff]/50 transition-all"
                placeholder="Enter password"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 text-center font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#1e60ff] text-white py-3.5 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#004ce6] transition-all duration-300 shadow-[0_4px_16px_rgba(30,96,255,0.25)] hover:shadow-[0_4px_20px_rgba(30,96,255,0.4)] hover:scale-[1.01]"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
