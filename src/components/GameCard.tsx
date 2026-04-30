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
    if (game.robloxUrl) {
      window.open(game.robloxUrl, '_blank', 'noopener')
    } else {
      navigate(`/games/${game.id}`)
    }
  }

  return (
    <div
      className="liquid-glass rounded-2xl overflow-hidden relative group cursor-pointer"
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
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] z-[5] flex items-center justify-center">
          <div className="liquid-glass rounded-xl px-4 py-2 border border-white/30">
            <span className="text-sm font-medium tracking-wider uppercase">Coming Soon</span>
          </div>
        </div>
      )}

      <div className="absolute top-4 left-4 z-10 flex gap-2" style={{ zIndex: game.comingSoon ? 6 : 10 }}>
        {game.featured && (
          <div className="liquid-glass rounded-lg px-3 py-1 border border-white/20">
            <span className="text-xs text-gray-300 uppercase tracking-wider">Featured</span>
          </div>
        )}
        {game.robloxUrl && (
          <div className="liquid-glass rounded-lg px-3 py-1 border border-white/20">
            <span className="text-xs text-gray-300 uppercase tracking-wider">Play ↗</span>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="liquid-glass rounded-lg px-2 py-1 inline-block mb-2 border border-white/20">
          <span className="text-xs text-gray-300 uppercase tracking-wider">{game.genre}</span>
        </div>
        <h3 className={`font-semibold ${size === 'lg' ? 'text-2xl' : 'text-base'}`} style={{ letterSpacing: '-0.02em' }}>{game.title}</h3>
        {game.visits && <p className="text-xs text-gray-300 mt-0.5">{game.visits} visits</p>}
      </div>
    </div>
  )
}
