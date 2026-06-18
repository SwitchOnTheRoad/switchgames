import { useState } from 'react'
import { subscribeNewsletter } from '../api'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    try {
      await subscribeNewsletter(email)
      setStatus('done')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] px-8 py-8 max-w-xl mx-auto text-center bg-white/[0.02]">

      <h3 className="text-2xl font-medium mb-2" style={{ letterSpacing: '-0.03em' }}>Stay in the loop.</h3>
      <p className="text-sm text-gray-400 mb-6" style={{ lineHeight: 1.6 }}>
        New games, live-ops insights, and studio updates, straight to your inbox.
      </p>

      {status === 'done' ? (
        <p className="text-sm text-white py-3">You're in. ✓</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="btn-pill btn-pill-solid flex-shrink-0 disabled:opacity-40"
          >
            {status === 'sending' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-xs text-red-400 mt-2">Something went wrong. Try again.</p>}
    </div>
  )
}
