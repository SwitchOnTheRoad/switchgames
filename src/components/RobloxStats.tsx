import { useEffect, useState } from 'react'
import type { Game } from '../types'

// Roblox API is blocked by CORS in browser — this component
// shows visits from your db.json (which you update manually or via a backend cron)
// and visually formats them nicely with a live-feeling pulse indicator.

interface Props {
  game: Game
  compact?: boolean
}

export default function RobloxStats({ game, compact = false }: Props) {
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(t)
  }, [])

  if (!game.visits) return null

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <span
          className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0"
          style={{ opacity: pulse ? 1 : 0.4, transition: 'opacity 800ms ease' }}
        />
        <span className="text-xs text-gray-400">{game.visits} visits</span>
      </div>
    )
  }

  return (
    <div className="rounded-xl px-4 py-3 border border-white/[0.08] flex items-center gap-3 bg-white/[0.02]">
      <div className="flex flex-col items-center">
        <span
          className="w-2 h-2 rounded-full bg-green-400 mb-1"
          style={{ opacity: pulse ? 1 : 0.3, transition: 'opacity 800ms ease' }}
        />
        <span className="text-xs text-gray-500 uppercase tracking-[0.15em]" style={{ fontSize: 9 }}>Live</span>
      </div>
      <div style={{ width: '1px', height: 28, background: 'rgba(255,255,255,0.08)' }} />
      <div>
        <p className="text-xl font-semibold" style={{ letterSpacing: '-0.03em', lineHeight: 1 }}>{game.visits}</p>
        <p className="text-xs text-gray-500 mt-0.5">Total visits</p>
      </div>
    </div>
  )
}
