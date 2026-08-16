import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SectionReveal from './SectionReveal'
import HeroBgSlideshow from './HeroBgSlideshow'
import { getGames } from '../api'
import type { Game } from '../types'

export default function ContactBanner() {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    getGames().then(setGames).catch(() => {})
  }, [])

  return (
    <section className="bg-black pb-24 px-6 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionReveal delay={200}>
          <div className="rounded-2xl overflow-hidden relative border border-white/[0.06] group flex items-center justify-center min-h-[160px] md:min-h-[200px]">
            {/* Background Slideshow Overlay */}
            {games.length > 0 && (
              <div className="absolute inset-0 z-0 pointer-events-none opacity-40 mix-blend-luminosity group-hover:opacity-60 group-hover:mix-blend-normal transition-all duration-700">
                <HeroBgSlideshow games={games} />
              </div>
            )}
            
            {/* Dark Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-black/60 z-[1] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 p-8 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Looking to work with us?
              </h3>
              <Link to="/contact">
                <button className="bg-[#1e60ff] hover:bg-[#004ce6] text-white font-medium py-3 px-8 rounded-full transition-colors flex items-center gap-2 border-none">
                  Get In Touch
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
