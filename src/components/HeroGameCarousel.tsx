import { useEffect, useState, useRef } from 'react'
import type { Game } from '../types'

interface HeroGameCarouselProps {
  games: Game[]
}

export default function HeroGameCarousel({ games }: HeroGameCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const count = games.length

  useEffect(() => {
    if (count < 2) return
    intervalRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % count)
    }, 3500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [count])

  if (!games.length) return null

  return (
    <div className="hero-stack">
      {games.map((game, i) => {
        // Calculate how far this card is from the active one (wrapping)
        let depth = (i - activeIndex + count) % count

        // Only show 3 cards (depth 0, 1, 2), hide the rest
        const visible = depth <= 2
        const y = depth * -24
        const s = 1 - depth * 0.05
        const o = depth === 0 ? 1 : depth === 1 ? 0.65 : 0.35
        const bright = 1 - depth * 0.12
        const z = 20 - depth

        return (
          <div
            key={game.id}
            className="hero-stack-card"
            style={{
              transform: visible ? `translateY(${y}px) scale(${s})` : `translateY(-80px) scale(0.85)`,
              opacity: visible ? o : 0,
              zIndex: visible ? z : 0,
              filter: `brightness(${visible ? bright : 0.7})`,
              pointerEvents: depth === 0 ? 'auto' : 'none',
            }}
          >
            {game.imageUrl ? (
              <img src={game.imageUrl} alt={game.title} draggable={false} />
            ) : game.videoUrl ? (
              <video autoPlay loop muted playsInline>
                <source src={game.videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="hero-stack-placeholder" />
            )}
          </div>
        )
      })}
    </div>
  )
}
