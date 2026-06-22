import { useEffect, useState } from 'react'
import SectionReveal from './SectionReveal'

function formatStat(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B+';
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
  return num.toString();
}

export default function GlobalStatsSection() {
  const [stats, setStats] = useState({ livePlayers: 0, totalVisits: 0, likeRatio: 0 })
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    fetch('/api/roblox-stats')
      .then(r => r.json())
      .then(data => {
        setStats({
          livePlayers: data.livePlayers || 0,
          totalVisits: data.totalVisits || 0,
          likeRatio: data.likeRatio || 0
        })
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load Roblox stats', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <section className="bg-black pb-10 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-7 animate-pulse h-28" />
        </div>
      </section>
    )
  }

  const displayPlayers = stats.livePlayers > 0 ? formatStat(stats.livePlayers) : '—';
  const displayVisits = stats.totalVisits > 0 ? formatStat(stats.totalVisits) : '—';
  const displayRatio = stats.likeRatio > 0 ? `${stats.likeRatio}%` : '—';

  return (
    <section className="bg-black pb-10 px-6 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionReveal>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-7 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
              
              {/* Live Players */}
              <div className="flex flex-col items-center justify-center pt-4 md:pt-0 first:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-[0.15em] font-medium">Live Players</span>
                </div>
                <p className="text-4xl md:text-5xl font-medium text-white" style={{ letterSpacing: '-0.03em' }}>
                  {displayPlayers}
                </p>
              </div>

              {/* Total Visits */}
              <div className="flex flex-col items-center justify-center pt-5 md:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-[0.15em] font-medium">Total Visits</span>
                </div>
                <p className="text-4xl md:text-5xl font-medium text-white" style={{ letterSpacing: '-0.03em' }}>
                  {displayVisits}
                </p>
              </div>

              {/* Average Like Ratio */}
              <div className="flex flex-col items-center justify-center pt-5 md:pt-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-gray-400 uppercase tracking-[0.15em] font-medium">Avg Like Ratio</span>
                </div>
                <p className="text-4xl md:text-5xl font-medium text-white" style={{ letterSpacing: '-0.03em' }}>
                  {displayRatio}
                </p>
              </div>

            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
