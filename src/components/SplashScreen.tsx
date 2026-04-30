import { useEffect, useState } from 'react'

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 800)
    const t2 = setTimeout(() => setPhase('out'), 1600)
    const t3 = setTimeout(onDone, 2100)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999,
      opacity: phase === 'out' ? 0 : 1,
      transition: phase === 'out' ? 'opacity 500ms ease' : 'none',
    }}>
      {/* ring pulse behind logo */}
      <div style={{
        position: 'absolute',
        width: 120, height: 120,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.15)',
        opacity: phase === 'hold' ? 0 : phase === 'in' ? 0 : 1,
        transform: phase === 'hold' ? 'scale(1)' : 'scale(2.5)',
        transition: 'transform 900ms ease, opacity 900ms ease',
      }} />

      <img
        src="/logo.png"
        alt="Switch"
        style={{
          width: 72, height: 72,
          objectFit: 'contain',
          opacity: phase === 'in' ? 0 : 1,
          filter: phase === 'in' ? 'blur(10px)' : 'blur(0px)',
          transform: phase === 'in' ? 'scale(1.2)' : 'scale(1)',
          transition: 'opacity 700ms ease, filter 700ms ease, transform 700ms cubic-bezier(0.22,1,0.36,1)',
        }}
      />
    </div>
  )
}
