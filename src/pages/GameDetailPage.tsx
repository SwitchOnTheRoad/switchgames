import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'
import { getGames } from '../api'
import type { Game } from '../types'
import { Play, Users, CheckCircle, Info, Calendar, Monitor, Maximize2 } from 'lucide-react'

interface GameWithStats extends Game {
  livePlayers?: number
}

export default function GameDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [game, setGame] = useState<GameWithStats | null>(null)
  const [related, setRelated] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null)

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
      <div className="w-8 h-8 rounded-full border border-white/20 animate-pulse animate-spin" />
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

  const featuresList = game.features
    ? game.features.split(',').map(f => f.trim()).filter(Boolean)
    : []

  const galleryImages = game.gallery
    ? game.gallery.split('\n').map(img => img.trim()).filter(Boolean)
    : []

  const handlePlayGame = () => {
    if (game.robloxUrl) {
      window.open(game.robloxUrl, '_blank', 'noopener')
    }
  }

  return (
    <div className="bg-black text-white min-h-screen admin-wrapper" style={{ background: 'linear-gradient(to bottom, #030514 0%, #010103 100%)', backgroundAttachment: 'fixed' }}>
      <SEOMeta title={game.title} description={game.description} image={game.imageUrl} />
      <Nav />

      {/* ─── CINEMATIC HERO SECTION ─── */}
      <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/[0.06] pt-24 px-6 md:px-12 lg:px-16">
        {/* Blurry Backdrop Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[40vh] bg-[#1e60ff] opacity-10 rounded-full blur-[120px] pointer-events-none z-0" />
        
        {/* Cinematic Backdrop Image or Video */}
        <div className="absolute inset-0 z-0">
          {game.imageUrl ? (
            <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover opacity-30 blur-[2px]" />
          ) : (
            <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-25 blur-[2px]">
              <source src={game.videoUrl} type="video/mp4" />
            </video>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/85" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Glassmorphic Details Card */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <Link to="/games" className="inline-flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-[0.15em] font-semibold mb-2">
              ← Back to Games
            </Link>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-white leading-[1.05]" style={{ letterSpacing: '-0.04em' }}>
              {game.title}
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
              {game.description}
            </p>

            {/* Live Metrics Overlay */}
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-300 mt-2">
              {game.visits && (
                <span className="flex items-center gap-2 bg-white/5 border border-white/15 py-2 px-4 rounded-full backdrop-blur-md">
                  <Users size={14} className="text-[#1e60ff]" />
                  <span className="font-semibold">{game.visits}</span> Visits
                </span>
              )}
              <span className="flex items-center gap-2 bg-white/5 border border-white/15 py-2 px-4 rounded-full backdrop-blur-md">
                <span className="font-semibold text-emerald-400">{game.livePlayers !== undefined ? game.livePlayers.toLocaleString() : '0'}</span> Live Players
              </span>
            </div>

            {game.robloxUrl && !game.comingSoon && (
              <button 
                onClick={handlePlayGame}
                className="btn-pill btn-pill-solid flex items-center gap-2 px-8 py-4 text-base transform hover:scale-[1.03] transition-all duration-300 mt-4 cursor-pointer"
              >
                Play on Roblox
                <Play size={14} className="fill-current ml-0.5" />
              </button>
            )}
            
            {game.comingSoon && (
              <div className="rounded-full px-6 py-3 border border-white/10 bg-black/40 mt-4 backdrop-blur-md">
                <span className="text-sm font-semibold tracking-[0.1em] uppercase text-gray-400">Coming Soon</span>
              </div>
            )}
          </div>

          {/* Right Column: Widescreen Media Preview Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl relative aspect-[16/9] bg-black group/preview">
              {game.imageUrl ? (
                <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-[1.02]" />
              ) : (
                <video autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-[1.02]">
                  <source src={game.videoUrl} type="video/mp4" />
                </video>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTENT GRID SECTION ─── */}
      <div className="px-6 md:px-12 lg:px-16 py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* Gallery Section */}
            {galleryImages.length > 0 && (
              <div className="space-y-6">
                <SectionReveal>
                  <h2 className="text-2xl font-semibold tracking-tight">Screenshots & Media</h2>
                </SectionReveal>
                <SectionReveal delay={60}>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                    {galleryImages.map((img, i) => (
                      <div 
                        key={i} 
                        onClick={() => setActiveLightboxImage(img)}
                        className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] h-40 md:h-48 aspect-[16/10] cursor-pointer group flex-shrink-0"
                      >
                        <img src={img} alt={`${game.title} screenshot ${i+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1px]">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20">
                            <Maximize2 size={14} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionReveal>
              </div>
            )}

            {/* Highlights Grid */}
            {featuresList.length > 0 && (
              <div className="space-y-6">
                <SectionReveal>
                  <h2 className="text-2xl font-semibold tracking-tight">Key Highlights</h2>
                </SectionReveal>
                <SectionReveal delay={60}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {featuresList.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3.5 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 hover:border-[#1e60ff]/30 transition-all duration-300 hover:scale-[1.01] hover:bg-[#1e60ff]/[0.02]">
                        <CheckCircle className="text-[#1e60ff] flex-shrink-0" size={18} />
                        <span className="text-sm font-medium text-gray-200">{feature}</span>
                      </div>
                    ))}
                  </div>
                </SectionReveal>
              </div>
            )}

            {/* Detailed Story (Long Description) */}
            <div className="space-y-6">
              <SectionReveal>
                <h2 className="text-2xl font-semibold tracking-tight">About the Game</h2>
              </SectionReveal>
              <SectionReveal delay={60}>
                <div className="text-gray-300 text-base md:text-lg leading-relaxed space-y-6 max-w-4xl">
                  {game.longDescription ? (
                    game.longDescription.split('\n\n').map((para, i) => (
                      <p key={i}>{para}</p>
                    ))
                  ) : (
                    <p>{game.description}</p>
                  )}
                </div>
              </SectionReveal>
            </div>

          </div>

          {/* Sidebar Specifications Column */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Telemetry / Stats Dashboard Widget */}
            <SectionReveal>
              <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-8 space-y-6 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#1e60ff]/10 rounded-full blur-2xl pointer-events-none" />
                
                <h3 className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#1e60ff] font-extrabold border-b border-white/5 pb-3">GAME ANALYTICS</h3>

                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Total Visits</p>
                      <p className="text-3xl font-medium tracking-tight mt-0.5 font-Outfit">{game.visits || '0'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-[#1e60ff]/10 border border-[#1e60ff]/20 flex items-center justify-center">
                      <Users size={16} className="text-[#1e60ff]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Concurrent Players</p>
                      <p className="text-3xl font-medium text-emerald-400 tracking-tight mt-0.5 font-Outfit">
                        {game.livePlayers !== undefined ? game.livePlayers.toLocaleString() : '0'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Play size={14} className="text-emerald-400 fill-current ml-0.5" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-300">Approval Rating</p>
                      <p className="text-3xl font-medium text-yellow-400 tracking-tight mt-0.5 font-Outfit">94% Likes</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <span className="text-yellow-400 text-sm">★</span>
                    </div>
                  </div>
                </div>
              </div>
            </SectionReveal>

            {/* Game specifications panel */}
            <SectionReveal delay={80}>
              <div className="rounded-3xl p-8 border border-white/[0.06] bg-white/[0.01] space-y-5">
                <h3 className="text-xs md:text-sm uppercase tracking-[0.15em] text-[#1e60ff] font-extrabold border-b border-white/5 pb-3">Product Information</h3>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Platform</p>
                    <p className="text-base font-semibold text-gray-200">Roblox</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Publisher</p>
                    <p className="text-base font-semibold text-gray-200">Switch</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Genre</p>
                    <p className="text-base font-semibold text-gray-200 truncate">{game.genre}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Multiplayer</p>
                    <p className="text-base font-semibold text-gray-200">Yes</p>
                  </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-3">
                  <div className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Monitor size={14} className="text-[#1e60ff]" />
                    <span>PC, Mobile, Tablet, Console</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Calendar size={14} className="text-[#1e60ff]" />
                    <span>Released in 2026</span>
                  </div>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>

        {/* RELATED GAMES */}
        {related.length > 0 && (
          <div className="mt-24 border-t border-white/5 pt-16">
            <SectionReveal>
              <h2 className="text-3xl font-semibold tracking-tight mb-10">More top hits by Switch</h2>
            </SectionReveal>
            <SectionReveal delay={60}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {related.map(g => (
                  <Link key={g.id} to={`/games/${g.id}`}>
                    <div className="rounded-2xl overflow-hidden relative group border border-white/[0.06] bg-white/[0.02]" style={{ height: 220 }}>
                      {g.imageUrl ? (
                        <img src={g.imageUrl} alt={g.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                          <source src={g.videoUrl} type="video/mp4" />
                        </video>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                      <div className="absolute bottom-0 p-5 z-10">
                        <p className="text-sm font-semibold tracking-tight text-white group-hover:text-[#1e60ff] transition-colors">{g.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{g.genre}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionReveal>
          </div>
        )}
      </div>

      {/* ─── LIGHTBOX MODAL SCREEN ─── */}
      {activeLightboxImage && (
        <div 
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4 cursor-pointer"
        >
          <button 
            onClick={() => setActiveLightboxImage(null)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg border border-white/20 transition-all cursor-pointer"
          >
            ✕
          </button>
          <img 
            src={activeLightboxImage} 
            alt="Expanded screenshot view" 
            className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/10 shadow-2xl cursor-default" 
            onClick={e => e.stopPropagation()} 
          />
        </div>
      )}

      <Footer />
    </div>
  )
}
