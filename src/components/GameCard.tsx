import { useNavigate } from 'react-router-dom'
import type { Game } from '../types'
import { Star, ArrowRight } from 'lucide-react'
import React from 'react'

interface Props {
  game: Game
  size?: 'sm' | 'md' | 'lg'
}

interface GameWithStats extends Game {
  livePlayers?: number
}

const heights = { sm: '200px', md: '260px', lg: '100%' }

export default function GameCard({ game, size = 'md' }: Props) {
  const navigate = useNavigate()
  const extendedGame = game as GameWithStats

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
        <div className="absolute inset-0 bg-black/55 z-[5] flex items-center justify-center">
          <div className="rounded-full px-4 py-2 border border-white/20 bg-black/40">
            <span className="text-sm font-medium tracking-[0.1em] uppercase">Coming Soon</span>
          </div>
        </div>
      )}

      {/* Top Left - Featured Star */}
      <div className="absolute top-4 left-4 z-10 flex gap-2" style={{ zIndex: game.comingSoon ? 6 : 10 }}>
        {game.featured && (
          <Star size={18} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_8px_rgba(250,204,21,0.4)]" />
        )}
      </div>

      {/* Top Right - View Pill Button */}
      {!game.comingSoon && (
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
            className="btn-pill btn-pill-solid btn-pill-sm flex items-center gap-1.5 transform transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            View
            <ArrowRight size={10} className="ml-0.5" />
          </button>
        </div>
      )}

      {/* Bottom Text Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
        <h3 className={`font-semibold ${size === 'lg' ? 'text-2xl' : 'text-base'}`} style={{ letterSpacing: '-0.02em' }}>{game.title}</h3>
        
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          {game.visits && <span>{game.visits} visits</span>}
          {game.visits && extendedGame.livePlayers !== undefined && <span className="text-white/20">•</span>}
          {extendedGame.livePlayers !== undefined && (
            <span className="text-emerald-400 font-medium">
              {extendedGame.livePlayers.toLocaleString()} playing
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
