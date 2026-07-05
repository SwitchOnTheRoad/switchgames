import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Game } from '../types'

export default function GameCarousel({ games }: { games: Game[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const navigate = useNavigate()

  const checkScroll = () => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }

  const scrollDir = useRef<1 | -1>(1)
  const isInteracting = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || games.length === 0) return

    const t = setInterval(() => {
      if (isInteracting.current) return

      const maxScroll = el.scrollWidth - el.clientWidth
      
      if (scrollDir.current === 1 && el.scrollLeft >= maxScroll - 10) {
        scrollDir.current = -1
      } else if (scrollDir.current === -1 && el.scrollLeft <= 10) {
        scrollDir.current = 1
      }

      const cardWidth = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 16 : 400
      el.scrollBy({ left: scrollDir.current * cardWidth, behavior: 'smooth' })
    }, 3000)

    return () => clearInterval(t)
  }, [games.length])

  const scroll = (dir: number) => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir * 400, behavior: 'smooth' })
  }

  const handleClick = (game: Game) => {
    if (game.robloxUrl) window.open(game.robloxUrl, '_blank', 'noopener')
    else navigate(`/games/${game.id}`)
  }

  if (!games.length) return null

  return (
    <div 
      className="game-carousel-wrap"
      onMouseEnter={() => isInteracting.current = true}
      onMouseLeave={() => isInteracting.current = false}
      onTouchStart={() => isInteracting.current = true}
      onTouchEnd={() => isInteracting.current = false}
    >
      {/* Scroll track */}
      <div
        ref={scrollRef}
        className="game-carousel-track"
        onScroll={checkScroll}
      >
        {games.map(game => (
          <div
            key={game.id}
            className="game-carousel-card"
            onClick={() => handleClick(game)}
          >
            <div className="game-carousel-media">
              {game.imageUrl ? (
                <img src={game.imageUrl} alt={game.title} draggable={false} />
              ) : (
                <video autoPlay loop muted playsInline>
                  <source src={game.videoUrl} type="video/mp4" />
                </video>
              )}
              <div className="game-carousel-card-gradient" />

              {/* Genre badge */}
              <div className="game-carousel-badge">
                <span>{game.genre}</span>
              </div>

              {/* Bottom info */}
              <div className="game-carousel-info">
                <h3>{game.title}</h3>
                {game.visits && (
                  <div className="game-carousel-visits">
                    <span className="game-carousel-visits-dot" />
                    <span>{game.visits} visits</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow buttons — inline, below track on mobile, overlaid on desktop */}
      <button
        className={`game-carousel-arrow game-carousel-arrow-left ${!canScrollLeft ? 'disabled' : ''}`}
        onClick={() => scroll(-1)}
        aria-label="Previous"
      >
        ←
      </button>
      <button
        className={`game-carousel-arrow game-carousel-arrow-right ${!canScrollRight ? 'disabled' : ''}`}
        onClick={() => scroll(1)}
        aria-label="Next"
      >
        →
      </button>
    </div>
  )
}
