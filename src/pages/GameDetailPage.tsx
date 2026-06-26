import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import RobloxStats from '../components/RobloxStats'
import ShareButtons from '../components/ShareButtons'
import SectionReveal from '../components/SectionReveal'
import { getGames } from '../api'
import type { Game } from '../types'

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<Game | null>(null)
  const [related, setRelated] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getGames()
      .then(games => {
        const found = games.find(g => g.id === id)
        setGame(found || null)
        setRelated(games.filter(g => g.id !== id).slice(0, 3))
      })
      .catch(e => {
        console.error('Failed to load games:', e)
        setGame(null)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="bg-black min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border border-white/20 animate-pulse" />
    </div>
  )

  if (!game) return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-300 mb-4">Game not found.</p>
        <Link to="/games" className="text-white underline text-sm">← Back to Games</Link>
      </div>
    </div>
  )

  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title={game.title} description={game.description} image={game.imageUrl} />
      <Nav />

      {/* ── HERO ── */}
      <div className="relative min-h-[70vh] flex items-end overflow-hidden">
        {game.imageUrl ? (
          <img src={game.imageUrl} alt={game.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={game.videoUrl} type="video/mp4" />
          </video>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

        <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-16 pt-32 w-full max-w-7xl mx-auto">
          <Link to="/games" className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors uppercase tracking-widest mb-8">
            ← Games
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="rounded-full px-3 py-1 inline-block mb-3 border border-white/10 bg-white/[0.02]">
                <span className="text-xs text-gray-300 uppercase tracking-wider">{game.genre}</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-normal" style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
                {game.title}
              </h1>
            </div>
            {game.robloxUrl && (
              <a href={game.robloxUrl} target="_blank" rel="noopener noreferrer">
                <button className="btn-pill btn-pill-solid">
                  Play on Roblox ↗
                </button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── DETAILS ── */}
      <div className="px-6 md:px-12 lg:px-16 py-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <SectionReveal>

              <p className="text-lg text-gray-300 mb-8" style={{ lineHeight: 1.75 }}>{game.description}</p>
            </SectionReveal>
          </div>

          <div className="space-y-4">
            <SectionReveal>
              <RobloxStats game={game} />
            </SectionReveal>
            <SectionReveal delay={80}>
              <div className="rounded-2xl p-6 border border-white/[0.06] bg-white/[0.02] space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-300 mb-1">Genre</p>
                  <p className="text-sm font-medium">{game.genre}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-300 mb-1">Platform</p>
                  <p className="text-sm font-medium">Roblox</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-300 mb-1">Studio</p>
                  <p className="text-sm font-medium">Switch</p>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>

        {/* Related games */}
        {related.length > 0 && (
          <div className="mt-20">
            <SectionReveal>
              <h2 className="text-2xl font-normal mb-8" style={{ letterSpacing: '-0.03em' }}>More games</h2>
            </SectionReveal>
            <SectionReveal delay={60}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {related.map(g => (
                  <Link key={g.id} to={`/games/${g.id}`}>
                    <div className="rounded-2xl overflow-hidden relative group border border-white/[0.06]" style={{ height: 200 }}>
                      {g.imageUrl ? (
                        <img src={g.imageUrl} alt={g.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                          <source src={g.videoUrl} type="video/mp4" />
                        </video>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 p-4 z-10">
                        <p className="text-sm font-medium">{g.title}</p>
                        <p className="text-xs text-gray-300">{g.genre}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionReveal>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
