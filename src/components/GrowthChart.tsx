import { useEffect, useRef, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────
const BEFORE = [
  { x: 0,  y: 92 },
  { x: 8,  y: 90 },
  { x: 16, y: 89 },
  { x: 24, y: 87 },
  { x: 32, y: 85 },
  { x: 38, y: 83 },
]

const PIVOT_X = 38  // the "Switch" moment

const AFTER = [
  { x: 38, y: 83 },
  { x: 46, y: 72 },
  { x: 54, y: 57 },
  { x: 62, y: 40 },
  { x: 70, y: 26 },
  { x: 78, y: 16 },
  { x: 86, y: 10 },
  { x: 93, y: 6  },
  { x: 100,y: 4  },
]

const ALL = [...BEFORE, ...AFTER.slice(1)]

function buildPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  const [first, ...rest] = pts
  return `M ${first.x},${first.y} ` + rest.map(p => `L ${p.x},${p.y}`).join(' ')
}

function buildFill(pts: { x: number; y: number }[], bot = 100) {
  const p = buildPath(pts)
  if (!p) return ''
  return p + ` L ${pts[pts.length - 1].x},${bot} L ${pts[0].x},${bot} Z`
}

function clipToX(pts: { x: number; y: number }[], maxX: number) {
  const result: { x: number; y: number }[] = []
  for (let i = 0; i < pts.length; i++) {
    if (pts[i].x <= maxX) {
      result.push(pts[i])
    } else {
      const a = pts[i - 1]
      const b = pts[i]
      const t = (maxX - a.x) / (b.x - a.x)
      result.push({ x: maxX, y: a.y + (b.y - a.y) * t })
      break
    }
  }
  return result
}

const DURATION = 2000

export default function GrowthChart() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0) // 0..1 → x: 0..100
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          startRef.current = null
          const animate = (ts: number) => {
            if (!startRef.current) startRef.current = ts
            const t = Math.min((ts - startRef.current) / DURATION, 1)
            const eased = 1 - Math.pow(1 - t, 3)
            setProgress(eased)
            if (t < 1) rafRef.current = requestAnimationFrame(animate)
          }
          rafRef.current = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.25 }
    )
    if (wrapRef.current) observer.observe(wrapRef.current)
    return () => {
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const maxX = progress * 100
  const visibleAll = clipToX(ALL, maxX)
  const visibleBefore = clipToX(BEFORE, Math.min(maxX, PIVOT_X))
  const visibleAfter = maxX > PIVOT_X ? clipToX(AFTER, maxX) : []

  const tip = visibleAll[visibleAll.length - 1]
  const showPivot = maxX >= PIVOT_X
  const showEndLabel = progress > 0.95

  return (
    <div ref={wrapRef} className="partner-chart-box">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="partner-chart-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.4)" />
            <stop offset="38%"  stopColor="rgba(255,255,255,1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,1)" />
          </linearGradient>
        </defs>

        {/* Subtle grid */}
        {[25, 50, 75].map(v => (
          <g key={v}>
            <line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            <line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
          </g>
        ))}

        {/* The line */}
        {visibleAll.length >= 2 && (
          <path
            d={buildPath(visibleAll)}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.0"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Moving tip */}
        {tip && progress > 0.02 && (
          <circle cx={tip.x} cy={tip.y} r="1.5" fill="#fff" />
        )}
      </svg>

      {/* Partnership Arrow & Text */}
      <div 
        className="absolute flex flex-col items-end transition-opacity duration-1000"
        style={{
          left: `38%`,
          top: `83%`,
          transform: 'translate(-100%, -100%)',
          opacity: showPivot ? 1 : 0,
          zIndex: 50
        }}
      >
        <div className="text-white text-[10px] uppercase tracking-[0.1em] font-medium whitespace-nowrap bg-black/80 backdrop-blur-sm px-2 py-1 rounded border border-white/10 mb-1">
          Our Partnership
        </div>
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-white opacity-70" style={{ overflow: 'visible' }}>
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M 1 1 L 7 4 L 1 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          <path 
            d="M 5 0 Q 36 0 36 36" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        </svg>
      </div>

      {/* Axis labels */}
      <div className="partner-chart-x-labels">
        <span className="partner-chart-label-dim">BEFORE</span>
        <span
          className="partner-chart-label-bright"
          style={{ opacity: showPivot ? 1 : 0, transition: 'opacity 600ms ease' }}
        >
          AFTER
        </span>
      </div>

      {/* Growth Metric */}
      <div
        className="absolute top-0 left-0 bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 px-3 py-1.5 rounded-lg text-sm font-bold tracking-wider z-50 tabular-nums w-[80px] text-center"
        style={{
          opacity: progress > 0.01 ? 1 : 0,
          transform: progress > 0.01 ? 'translateY(0)' : 'translateY(4px)',
          transition: 'opacity 300ms ease, transform 300ms ease',
        }}
      >
        +{Math.floor(progress * 999)}%
      </div>
    </div>
  )
}
