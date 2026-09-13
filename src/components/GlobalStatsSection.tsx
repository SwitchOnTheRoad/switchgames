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
      <div className="p-5 md:p-7 w-full">
        <div className="animate-pulse h-24 w-full bg-white/5 rounded-lg" />
      </div>
    )
  }

  const displayPlayers = stats.livePlayers > 0 ? formatStat(stats.livePlayers) : '—';
  const displayVisits = stats.totalVisits > 0 ? formatStat(stats.totalVisits) : '—';
  const displayRatio = stats.likeRatio > 0 ? `${stats.likeRatio}%` : '—';

  return (
    <SectionReveal>
      <div className="p-6 md:p-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 divide-y md:divide-y-0 md:divide-x divide-white/[0.15]">
          
          {/* Live Players */}
          <div className="flex flex-col items-center justify-center pt-4 md:pt-0 first:pt-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-[0.15em] font-medium">Live Players</span>
            </div>
            <p className="text-4xl md:text-5xl font-medium text-white drop-shadow-md" style={{ letterSpacing: '-0.03em' }}>
              {displayPlayers}
            </p>
          </div>

          {/* Total Visits */}
          <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-[0.15em] font-medium">Total Visits</span>
            </div>
            <p className="text-4xl md:text-5xl font-medium text-white drop-shadow-md" style={{ letterSpacing: '-0.03em' }}>
              {displayVisits}
            </p>
          </div>

          {/* Average Like Ratio */}
          <div className="flex flex-col items-center justify-center pt-8 md:pt-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-400 uppercase tracking-[0.15em] font-medium">Avg Like Ratio</span>
            </div>
            <p className="text-4xl md:text-5xl font-medium text-white drop-shadow-md" style={{ letterSpacing: '-0.03em' }}>
              {displayRatio}
            </p>
          </div>

        </div>
      </div>
    </SectionReveal>
  )
}
