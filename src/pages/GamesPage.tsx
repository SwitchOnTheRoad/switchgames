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
      .finally(() => setLoading(false))
  }, [])

  const filtered = (filter === 'featured' ? games.filter(g => g.featured) : games)
    .filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()) || g.genre.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta title="Games" description="All Switch games — explore our portfolio of Roblox titles." />

      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>
            <p className="text-xs tracking-widest uppercase text-gray-300 mb-3">Games</p>
          </SectionReveal>
          <SectionReveal delay={60}>
            <h1 className="text-5xl md:text-6xl font-normal mb-6" style={{ letterSpacing: '-0.04em' }}>
              All our games.
            </h1>
          </SectionReveal>
          <SectionReveal delay={120}>
            <div className="flex gap-2 mb-12">
              {(['all', 'featured'] as Filter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f
                      ? 'bg-white text-black'
                      : 'liquid-glass border border-white/20 text-gray-300 hover:text-white'
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
                className="w-full md:w-72 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors pl-9"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm">⌕</span>
            </div>
          </SectionReveal>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="liquid-glass rounded-2xl h-64 animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-gray-300 py-20 text-center">No games found.</p>
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
