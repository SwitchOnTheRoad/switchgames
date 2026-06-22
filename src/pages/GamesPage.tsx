import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import GameCard from '../components/GameCard'
import SectionReveal from '../components/SectionReveal'
import { getGames } from '../api'
import SEOMeta from '../components/SEOMeta'
import type { Game } from '../types'

type Filter = 'all' | 'featured'

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch(e => console.error('Failed to load games:', e))
      .finally(() => setLoading(false))
  }, [])

  const filtered = (filter === 'featured' ? games.filter(g => g.featured) : games)
    .filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.genre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta title="Games" description="All Switch games. Explore our portfolio of Roblox titles." />

      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>

          </SectionReveal>
          <SectionReveal delay={60}>
            <h1 className="text-5xl md:text-6xl font-medium mb-6" style={{ letterSpacing: '-0.04em' }}>
              All our games.
            </h1>
          </SectionReveal>
          <SectionReveal delay={120}>
            <div className="flex gap-2 mb-8">
              <p className="text-xs tracking-[0.15em] uppercase text-gray-500 self-center mr-3">Sort by</p>
              {(['all', 'featured'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    filter === f
                      ? 'bg-white text-black border-white'
                      : 'border-white/15 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {f === 'all' ? 'All Games' : 'Featured'}
                </button>
              ))}
            </div>
          </SectionReveal>

          <SectionReveal delay={160}>
            <div className="relative mb-8">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search games..."
                className="w-full md:w-72 bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors pl-10"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">⌕</span>
            </div>
          </SectionReveal>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-2xl h-64 animate-pulse border border-white/5 bg-white/[0.02]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-500 py-20 text-center">No games found.</p>
          ) : (
            <SectionReveal>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filtered.map(game => (
                  <GameCard key={game.id} game={game} size="md" />
                ))}
              </div>
            </SectionReveal>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
