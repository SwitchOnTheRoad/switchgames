import { useEffect, useRef, useState } from 'react'

// ── Data ─────────────────────────────────────────────────────────
const BEFORE = [
  { x: -10, y: 90 },
  { x: 15, y: 60 },
  { x: 30, y: 70 },
  { x: 38, y: 65 },
]

const PIVOT_X = 38  // the "Switch" moment

const AFTER = [
  { x: 38, y: 65 },
  { x: 55, y: 45 },
  { x: 75, y: 60 },
  { x: 110, y: 10 },
]

const ALL = [...BEFORE, ...AFTER.slice(1)]

function buildPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return ''
  let d = `M ${pts[0].x},${pts[0].y}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1]
    
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
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

  const maxX = -10 + (progress * 120)
  const visibleAll = clipToX(ALL, maxX)
  const visibleBefore = clipToX(BEFORE, Math.min(maxX, PIVOT_X))
  const visibleAfter = maxX > PIVOT_X ? clipToX(AFTER, maxX) : []

  const tip = visibleAll[visibleAll.length - 1]
  const showPivot = maxX >= PIVOT_X
  const showEndLabel = progress > 0.95

  return (
    <div ref={wrapRef} className="partner-chart-box">
      <svg
        viewBox="0 -15 100 130"
        preserveAspectRatio="none"
        className="partner-chart-svg"
        aria-hidden="true"
        style={{ overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.4" />
            <stop offset="50%"  stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="1" />
          </linearGradient>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="1.5" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
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
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#neonGlow)"
          />
        )}

      </svg>

    </div>
  )
}
