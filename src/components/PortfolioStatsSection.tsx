import { useEffect, useState } from 'react'
import SectionReveal from './SectionReveal'

function formatStat(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B+';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return num.toString();
}

export default function PortfolioStatsSection() {
  const [stats, setStats] = useState({ livePlayers: 0, totalVisits: 0, favorites: 5900000, likes: 546400, community: 1300000 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/roblox-stats')
      .then(r => r.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          livePlayers: data.livePlayers || 6400,
          totalVisits: data.totalVisits || 1000000000,
        }))
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load Roblox stats', err)
        setStats(prev => ({
          ...prev,
          livePlayers: 6423,
          totalVisits: 1000000000
        }))
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="bg-black pb-10 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-7 animate-pulse h-96" />
        </div>
      </section>
    )
  }

  const displayPlayers = formatStat(stats.livePlayers);
  const displayVisits = formatStat(stats.totalVisits);
  const displayFavorites = formatStat(stats.favorites);
  const displayLikes = formatStat(stats.likes);
  const displayCommunity = formatStat(stats.community);

  return (
    <section className="bg-black pb-10 px-6 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
            
            {/* Card 1: Visits (Spans 2 rows) */}
            <div className="lg:row-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 lg:p-8 flex flex-col relative overflow-hidden h-[300px] lg:h-[400px]">
              <div className="relative z-10">
                <span className="text-primary text-xs font-bold uppercase tracking-widest mb-4 block">01 / VISITS</span>
                <h3 className="text-6xl md:text-8xl font-bold mb-4" style={{ letterSpacing: '-0.04em' }}>
                  {displayVisits}
                </h3>
                <p className="text-sm text-gray-400 max-w-[250px] leading-relaxed">
                  Total combined visits across all published experiences.
                </p>
              </div>
              {/* Curved SVG Chart Background */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none">
                <svg viewBox="0 0 400 200" preserveAspectRatio="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="gradientLine" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF5C00" />
                      <stop offset="100%" stopColor="#FF5C00" stopOpacity="0.5" />
                    </linearGradient>
                    <linearGradient id="gradientFill" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF5C00" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FF5C00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0 190 Q 200 190, 400 50 L 400 200 L 0 200 Z" fill="url(#gradientFill)" />
                  <path d="M0 190 Q 200 190, 400 50" fill="none" stroke="url(#gradientLine)" strokeWidth="3" />
                  <circle cx="150" cy="165" r="4" fill="#FF5C00" className="drop-shadow-[0_0_8px_rgba(255,92,0,0.8)]" />
                </svg>
              </div>
            </div>

            {/* Card 2: Live */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-between relative overflow-hidden h-[180px] lg:h-auto">
              <div className="relative z-10">
                <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary inline-block animate-pulse"></span> 02 / LIVE
                </span>
                <h3 className="text-5xl font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>
                  {displayPlayers}
                </h3>
                <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                  Concurrent players across our portfolio right now.
                </p>
              </div>
              {/* Jagged Line SVG Chart Background */}
              <div className="absolute bottom-0 right-0 w-3/4 h-1/2 pointer-events-none flex items-end justify-end">
                <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="w-full h-full opacity-80">
                  <path d="M0 90 L 30 70 L 60 90 L 100 50 L 130 70 L 160 40 L 200 20" fill="none" stroke="#FF5C00" strokeWidth="2.5" />
                  <circle cx="100" cy="50" r="3" fill="#FF5C00" className="drop-shadow-[0_0_6px_rgba(255,92,0,0.8)]" />
                </svg>
              </div>
            </div>

            {/* Card 3: Favorites */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-between h-[180px] lg:h-auto">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 block">03 / FAVORITES</span>
                <h3 className="text-5xl font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>
                  {displayFavorites}
                </h3>
                <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                  Total favorites across all of our experiences.
                </p>
              </div>
            </div>

            {/* Card 4: Likes */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-between h-[180px] lg:h-auto">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 block">04 / LIKES</span>
                <h3 className="text-5xl font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>
                  {displayLikes}
                </h3>
                <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                  Combined likes earned across the portfolio.
                </p>
              </div>
            </div>

            {/* Card 5: Community */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col justify-between h-[180px] lg:h-auto">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest mb-3 block">05 / COMMUNITY</span>
                <h3 className="text-5xl font-bold mb-2" style={{ letterSpacing: '-0.03em' }}>
                  {displayCommunity}
                </h3>
                <p className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                  Members across our connected Roblox groups.
                </p>
              </div>
            </div>

          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
