import { useState, useEffect } from 'react'
import type { Game } from '../types'
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Users,
  Star,
} from 'lucide-react'

export default function GameCarousel({ games: apiGames }: { games: Game[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const gamesList = apiGames

  // Auto slideshow (rotates every 5 seconds)
  useEffect(() => {
    if (gamesList.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % gamesList.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [gamesList.length])

  const nextSlide = () => {
    if (gamesList.length === 0) return
    setActiveIndex(prev => (prev + 1) % gamesList.length)
  }

  const prevSlide = () => {
    if (gamesList.length === 0) return
    setActiveIndex(prev => (prev - 1 + gamesList.length) % gamesList.length)
  }

  const activeGame = gamesList[activeIndex]

  const handlePlayGame = (game: Game) => {
    if (game.robloxUrl) {
      window.open(game.robloxUrl, '_blank', 'noopener')
    }
  }

  if (gamesList.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No games available.
      </div>
    )
  }

  return (
    <div className="w-full relative">
      {/* ─── Showcase Widescreen Thumbnail Card ─── */}
      <div className="relative group/showcase px-4">
        <div 
          onClick={() => handlePlayGame(activeGame)}
          className="max-w-4xl mx-auto rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative aspect-[16/9] bg-black cursor-pointer group/card"
        >
          {/* Game Thumbnail Image Background */}
          <div className="absolute inset-0 z-0">
            <img
              src={activeGame.imageUrl || '/hero.webp'}
              alt={activeGame.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-[1.02]"
            />
            {/* Dark overlay for high text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/25 transition-opacity duration-300 group-hover/card:opacity-95" />
          </div>

          {/* Bottom Right 'Play on Roblox' Pill Button */}
          <div className="absolute bottom-8 right-8 sm:bottom-12 sm:right-12 z-10">
            <button className="btn-pill btn-pill-solid flex items-center gap-2 transform transition-transform duration-300 group-hover/card:scale-105 pointer-events-none">
              Play on Roblox
              <Play size={12} className="fill-current ml-0.5" />
            </button>
          </div>

          {/* Bottom Left Game Details Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 z-10 flex flex-col gap-3 pointer-events-none">
            {/* Genre Badge */}
            <span className="text-[10px] text-[#1e60ff] font-medium uppercase tracking-[0.15em] bg-[#1e60ff]/15 border border-[#1e60ff]/20 py-1.5 px-3 rounded-full w-fit">
              {activeGame.genre}
            </span>

            {/* Game Name */}
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-medium text-white leading-tight tracking-tight">
              {activeGame.title}
            </h3>

            {/* Metrics Row */}
            <div className="flex flex-wrap items-center gap-3.5 text-xs sm:text-sm text-gray-300 mt-1">
              {activeGame.visits && (
                <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 py-1.5 px-4 rounded-full backdrop-blur-md">
                  <Users size={13} className="text-[#1e60ff]" />
                  {activeGame.visits} Visits
                </span>
              )}
              <span className="flex items-center gap-1.5 bg-white/5 border border-white/5 py-1.5 px-4 rounded-full backdrop-blur-md">
                <Star size={13} className="text-[#1e60ff]" fill="currentColor" />
                94% Likes
              </span>
            </div>
          </div>
        </div>

        {/* ─── Floating Outer Navigation Arrows ─── */}
        {gamesList.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-[#1e60ff] hover:border-[#1e60ff] hover:scale-105 active:scale-95 transition-all duration-300 z-20 cursor-pointer shadow-lg"
              aria-label="Previous game"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 border border-white/10 text-white flex items-center justify-center hover:bg-[#1e60ff] hover:border-[#1e60ff] hover:scale-105 active:scale-95 transition-all duration-300 z-20 cursor-pointer shadow-lg"
              aria-label="Next game"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* ─── Indicator Pagination Dots ─── */}
      {gamesList.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          {gamesList.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'w-6 bg-[#1e60ff]' : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
