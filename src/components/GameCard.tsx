import { useNavigate } from 'react-router-dom'
import type { Game } from '../types'

interface Props {
  game: Game
  size?: 'sm' | 'md' | 'lg'
}

const heights = { sm: '200px', md: '260px', lg: '100%' }

export default function GameCard({ game, size = 'md' }: Props) {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/games/${game.id}`)
  }

  return (
    <div
      className="rounded-2xl overflow-hidden relative group cursor-pointer border border-white/[0.06] bg-white/[0.02]"
      style={{ height: size === 'lg' ? '100%' : heights[size], minHeight: size === 'lg' ? '480px' : undefined }}
      onClick={handleClick}
    >
      {game.imageUrl ? (
        <img src={game.imageUrl} alt={game.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
      ) : (
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
          <source src={game.videoUrl} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      {game.comingSoon && (
        <div className="absolute inset-0 bg-black/50 z-[5] flex items-center justify-center">
          <div className="rounded-full px-4 py-2 border border-white/20 bg-black/40">
            <span className="text-sm font-medium tracking-[0.1em] uppercase">Coming Soon</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10" style={{ zIndex: game.comingSoon ? 6 : 10 }}>
        {game.featured && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#FFD700" className="drop-shadow-[0_0_6px_rgba(255,215,0,0.5)]">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10 flex items-end justify-between">
        <div>
          <h3 className={`font-semibold ${size === 'lg' ? 'text-2xl' : 'text-base'}`} style={{ letterSpacing: '-0.02em' }}>{game.title}</h3>
          {game.visits && <p className="text-xs text-gray-500 mt-0.5">{game.visits} visits</p>}
        </div>
        <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 group-hover:bg-white/25 transition-colors">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
