import { useEffect, useRef, useState } from 'react'
import RobuxPattern from './RobuxPattern'

export default function VisitsChart() {
  const [progress, setProgress] = useState(0)
  const [targetVisits, setTargetVisits] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/roblox-stats')
      .then(res => res.json())
      .then(data => {
        if (data.totalVisits) setTargetVisits(data.totalVisits)
      })
      .catch(() => {})

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start: number | null = null
        const animate = (ts: number) => {
          if (!start) start = ts
          const t = Math.min((ts - start) / 2500, 1)
          const eased = 1 - Math.pow(1 - t, 4) // cubic ease out
          setProgress(eased)
          if (t < 1) requestAnimationFrame(animate)
        }
        requestAnimationFrame(animate)
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    if (wrapRef.current) observer.observe(wrapRef.current)
  }, [])

  const currentVisits = Math.floor(progress * targetVisits)
  const formattedVisits = currentVisits.toLocaleString('en-US')

  return (
    <div ref={wrapRef} className="relative w-full h-[350px] md:h-[450px] bg-transparent group">
      
      {/* SVG Container (Clipped) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[2.5rem] md:rounded-none">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 400" preserveAspectRatio="none">
        <defs>
          <filter id="visitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComponentTransfer in="blur" result="glow">
              <feFuncA type="linear" slope="2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          
          <linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.15" />
            <stop offset="85%" stopColor="#fbbf24" stopOpacity="0" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Faint filled area under the curve */}
        <path 
          d="M -50 250 C 300 270, 600 180, 1050 40 L 1050 450 L -50 450 Z"
          fill="url(#visitFill)"
          style={{
            clipPath: `inset(0 ${100 - progress * 100}% 0 0)`
          }}
        />

        {/* The neon gold glowing line */}
        <path 
          d="M -50 250 C 300 270, 600 180, 1050 40"
          fill="none"
          stroke="#fbbf24"
          strokeWidth="6"
          strokeLinecap="round"
          filter="url(#visitGlow)"
            style={{
              strokeDasharray: 1200,
              strokeDashoffset: 1200 - (progress * 1200)
            }}
          />
      </svg>
      </div>

      {/* Floating Text aligned to the curve */}
      <div 
        className="absolute z-10 transition-opacity duration-700 pointer-events-none"
        style={{ 
          left: '20%', 
          bottom: '39%', 
          transform: 'rotate(-5deg)',
          opacity: progress > 0.05 ? 1 : 0 
        }}
      >
        <p className="text-[10px] md:text-sm font-bold tracking-[0.2em] text-white/80 uppercase mb-0.5" style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>
          Visits
        </p>
        <h2 
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter" 
          style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8), 0 0 40px rgba(251, 191, 36, 0.2)' }}
        >
          {formattedVisits}
        </h2>
      </div>

      {/* Bottom fade into the page background */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none z-20" />
      {/* Foreground Robux Pattern */}
      <RobuxPattern type="ccu" count={7} />
    </div>
  )
}
