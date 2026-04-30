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
    <div className="liquid-glass rounded-2xl border border-white/10 px-8 py-8 max-w-xl mx-auto text-center">
      <p className="text-xs uppercase tracking-widest text-gray-300 mb-3">Newsletter</p>
      <h3 className="text-2xl font-normal mb-2" style={{ letterSpacing: '-0.03em' }}>Stay in the loop.</h3>
      <p className="text-sm text-gray-300 mb-6" style={{ lineHeight: 1.6 }}>
        New games, brand collabs, and studio updates — straight to your inbox.
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
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-white text-black px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {status === 'sending' ? '...' : 'Subscribe'}
          </button>
        </form>
      )}
      {status === 'error' && <p className="text-xs text-red-400 mt-2">Something went wrong. Try again.</p>}
    </div>
  )
}
