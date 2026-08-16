import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPageViews, getEvents, getContacts, getGames, getPosts, getJobs, getNewsletterSubscribers, getApplications } from '../../api'
import type { PageView } from '../../api'

// ─── Mini SVG line chart ──────────────────────────────────────────────────────
function LineChart({ data, color = '#1e60ff', height = 60 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div style={{ height }} className="flex items-center justify-center"><p className="text-xs text-gray-300">Not enough data</p></div>
  const max = Math.max(...data, 1)
  const w = 100 / (data.length - 1)
  const points = data.map((v, i) => `${i * w},${height - (v / max) * (height - 8)}`).join(' ')
  const area = `0,${height} ${points} ${(data.length - 1) * w},${height}`
  return (
    <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace('#','')})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {data.map((v, i) => (
        <circle key={i} cx={i * w} cy={height - (v / max) * (height - 8)} r="2" fill={color} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  )
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
function BarChart({ data, labels, height = 100 }: { data: number[]; labels: string[]; height?: number }) {
  const max = Math.max(...data, 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${(v / max) * (height - 20)}px`,
              background: 'linear-gradient(to top, rgba(30, 96, 255, 0.45), rgba(30, 96, 255, 0.85))',
              boxShadow: '0 0 10px rgba(30, 96, 255, 0.1)',
              minHeight: v > 0 ? 2 : 0,
            }}
            title={`${labels[i]}: ${v}`}
          />
          <span className="text-gray-400 font-medium" style={{ fontSize: 9, textAlign: 'center' }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Donut chart ──────────────────────────────────────────────────────────────
function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, v) => s + v.value, 0) || 1
  let cumulative = 0
  const r = 30, cx = 40, cy = 40, strokeW = 12

  return (
    <div className="flex items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80">
        {slices.map((slice, i) => {
          const pct = slice.value / total
          const startAngle = cumulative * 2 * Math.PI - Math.PI / 2
          cumulative += pct
          const endAngle = cumulative * 2 * Math.PI - Math.PI / 2
          const x1 = cx + r * Math.cos(startAngle)
          const y1 = cy + r * Math.sin(startAngle)
          const x2 = cx + r * Math.cos(endAngle)
          const y2 = cy + r * Math.sin(endAngle)
          const large = pct > 0.5 ? 1 : 0
          if (pct === 0) return null
          return (
            <path
              key={i}
              d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
              fill={slice.color}
              opacity={0.8}
            />
          )
        })}
        <circle cx={cx} cy={cy} r={r - strokeW} fill="#020308" />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="500">{total}</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {slices.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-gray-300">{s.label}</span>
            <span className="text-xs text-white ml-auto pl-3">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, trend }: { label: string; value: string | number; sub?: string; trend?: number }) {
  return (
    <div className="liquid-glass rounded-2xl p-6 border border-white/10 hover:border-[#1e60ff]/30 hover:bg-[#1e60ff]/5 transition-all duration-300">
      <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-3">{label}</p>
      <p className="text-4xl font-normal mb-1" style={{ letterSpacing: '-0.04em' }}>{value}</p>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span className={`text-xs ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [pageviews, setPageviews] = useState<PageView[]>([])
  const [counts, setCounts] = useState({ games: 0, posts: 0, jobs: 0, contacts: 0, subscribers: 0, applications: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPageViews(),
      getGames(),
      getPosts(),
      getJobs(),
      getContacts(),
      getNewsletterSubscribers(),
      getApplications(),
    ]).then(([pv, games, posts, jobs, contacts, subs, apps]) => {
      setPageviews(pv)
      setCounts({ games: games.length, posts: posts.filter(p => p.published).length, jobs: jobs.filter(j => j.open).length, contacts: contacts.length, subscribers: subs.length, applications: apps.length })
    }).finally(() => setLoading(false))
  }, [])

  // Views per day (last 14 days)
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    return d.toISOString().split('T')[0]
  })
  const viewsByDay = last14.map(date => pageviews.filter(p => p.date === date).length)
  const dayLabels = last14.map(d => {
    const parts = d.split('-'); return `${parts[2]}/${parts[1]}`
  })

  // Top pages
  const pageCounts: Record<string, number> = {}
  pageviews.forEach(p => { pageCounts[p.path] = (pageCounts[p.path] || 0) + 1 })
  const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Devices
  const devices = ['mobile', 'tablet', 'desktop'].map(d => ({
    label: d.charAt(0).toUpperCase() + d.slice(1),
    value: pageviews.filter(p => p.device === d).length,
    color: d === 'mobile' ? '#1e60ff' : d === 'tablet' ? 'rgba(30, 96, 255, 0.65)' : 'rgba(30, 96, 255, 0.3)',
  }))

  // Browsers
  const browserCounts: Record<string, number> = {}
  pageviews.forEach(p => { browserCounts[p.browser] = (browserCounts[p.browser] || 0) + 1 })
  const browsers = Object.entries(browserCounts).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([label, value], i) => ({
    label, value, color: ['#1e60ff', 'rgba(30, 96, 255, 0.7)', 'rgba(30, 96, 255, 0.45)', 'rgba(30, 96, 255, 0.2)'][i],
  }))

  const today = pageviews.filter(p => p.date === new Date().toISOString().split('T')[0]).length
  const yesterday = pageviews.filter(p => {
    const d = new Date(); d.setDate(d.getDate() - 1); return p.date === d.toISOString().split('T')[0]
  }).length
  const trend = yesterday > 0 ? Math.round(((today - yesterday) / yesterday) * 100) : 0

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border border-white/20 animate-pulse" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Dashboard</h1>
          <p className="text-sm text-gray-300 mt-0.5">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
      </div>

      {/* ── Content stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: 'Games', value: counts.games, path: '/admin/games' },
          { label: 'Blog Posts', value: counts.posts, path: '/admin/blog' },
          { label: 'Open Roles', value: counts.jobs, path: '/admin/careers' },
          { label: 'Applications', value: counts.applications, path: '/admin/applications' },
          { label: 'Enquiries', value: counts.contacts, path: '/admin/contacts' },
          { label: 'Subscribers', value: counts.subscribers, path: '/admin/newsletter' },
        ].map(s => (
          <Link key={s.label} to={s.path}>
            <div className="liquid-glass rounded-2xl px-5 py-5 border border-white/10 hover:border-[#1e60ff]/30 hover:bg-[#1e60ff]/5 transition-all duration-300 cursor-pointer h-full">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-2">{s.label}</p>
              <p className="text-3xl font-normal" style={{ letterSpacing: '-0.04em' }}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Analytics stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total Views" value={pageviews.length} sub="all time" />
        <StatCard label="Today" value={today} trend={trend} sub="vs yesterday" />
        <StatCard label="This Week" value={viewsByDay.slice(-7).reduce((a, b) => a + b, 0)} sub="last 7 days" />
        <StatCard label="This Month" value={viewsByDay.reduce((a, b) => a + b, 0)} sub="last 14 days" />
      </div>

      {/* ── Charts row ── */}
      <div className="grid md:grid-cols-3 gap-3 mb-6">

        {/* Views over time */}
        <div className="md:col-span-2 liquid-glass rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold">Page Views — Last 14 Days</p>
            <p className="text-sm font-medium">{viewsByDay.reduce((a, b) => a + b, 0)} total</p>
          </div>
          {pageviews.length === 0 ? (
            <div className="flex items-center justify-center h-16">
              <p className="text-xs text-gray-400">No data yet — views appear once people visit your site</p>
            </div>
          ) : (
            <LineChart data={viewsByDay} height={80} />
          )}
          <div className="flex justify-between mt-2">
            <span className="text-gray-400" style={{ fontSize: 9 }}>{dayLabels[0]}</span>
            <span className="text-gray-400" style={{ fontSize: 9 }}>{dayLabels[dayLabels.length - 1]}</span>
          </div>
        </div>

        {/* Devices */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/10">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-4">Devices</p>
          {pageviews.length === 0 ? (
            <p className="text-xs text-gray-400">No data yet</p>
          ) : (
            <DonutChart slices={devices} />
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3 mb-6">

        {/* Top pages */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/10">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-4">Top Pages</p>
          {topPages.length === 0 ? (
            <p className="text-xs text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topPages.map(([path, count]) => {
                const pct = (count / pageviews.length) * 100
                return (
                  <div key={path}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300 truncate flex-1 mr-4">{path || '/'}</span>
                      <span className="flex-shrink-0 font-medium">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-[#1e60ff] transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Daily bar chart */}
        <div className="liquid-glass rounded-2xl p-6 border border-white/10">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-4">Views by Day (Last 7)</p>
          {pageviews.length === 0 ? (
            <p className="text-xs text-gray-400">No data yet</p>
          ) : (
            <BarChart data={viewsByDay.slice(-7)} labels={dayLabels.slice(-7)} height={100} />
          )}
        </div>
      </div>

      {/* Browsers + referrers */}
      <div className="grid md:grid-cols-2 gap-3">
        <div className="liquid-glass rounded-2xl p-6 border border-white/10">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-4">Browsers</p>
          {browsers.length === 0 ? <p className="text-xs text-gray-400">No data yet</p> : <DonutChart slices={browsers} />}
        </div>

        <div className="liquid-glass rounded-2xl p-6 border border-white/10">
          <p className="text-[10px] uppercase tracking-[0.15em] text-[#1e60ff] font-bold mb-4">Recent Enquiries</p>
          {counts.contacts === 0 ? (
            <p className="text-xs text-gray-400">No enquiries yet</p>
          ) : (
            <Link to="/admin/contacts" className="text-sm text-white hover:text-[#1e60ff] transition-colors flex items-center justify-between">
              <span>{counts.contacts} total enquiries</span>
              <span className="text-[#1e60ff] font-semibold hover:underline">View all →</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
