import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const accepted = localStorage.getItem('switch_cookies')
    if (!accepted) setTimeout(() => setVisible(true), 2500)
  }, [])

  const accept = () => { localStorage.setItem('switch_cookies', 'accepted'); setVisible(false) }
  const decline = () => { localStorage.setItem('switch_cookies', 'declined'); setVisible(false) }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-5 left-1/2 z-50 px-4 w-full max-w-lg"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-gray-300 flex-1" style={{ lineHeight: 1.6 }}>
          We use cookies to improve your experience and analyse site traffic.{' '}
          <a href="/privacy" className="text-white underline hover:no-underline">Privacy policy</a>
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={decline}
            className="px-4 py-2 rounded-full text-sm text-gray-400 border border-white/10 hover:text-white transition-colors"
          >
            Decline
          </button>
          <button
            onClick={accept}
            className="btn-pill btn-pill-solid"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
