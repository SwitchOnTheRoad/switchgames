import { useMemo } from 'react'

export default function RobuxPattern({ type = 'ccu', count }: { type?: 'ccu' | 'visits', count?: number }) {
  const isCCU = type === 'ccu'
  const actualCount = isCCU ? 4 : (count !== undefined ? count : 10)

  const icons = useMemo(() => {
    return Array.from({length: actualCount}).map((_, i) => {
      // 7 distinct horizontal lanes
      let baseX = isCCU ? (10 + (i * 25)) : (Math.random() * 100)
      
      // Keep strictly between 25% and 75% so they NEVER drift outside the parent during their massive hover
      let baseY = isCCU ? (i % 2 === 0 ? 30 : 70) : (Math.random() * 50 + 25)
      
      const wanderX = (Math.random() - 0.5) * 15
      const wanderY = (Math.random() - 0.5) * 5 // Reduced Y wander so they don't break the safe zone
      
      const finalX = isCCU ? Math.max(2, Math.min(98, baseX + wanderX)) : baseX

      return {
        id: i,
        x: finalX,
        y: baseY + wanderY,
        size: isCCU ? (Math.random() * 60 + 130) : (Math.random() * 60 + 50),
        opacity: isCCU ? 0.15 : Math.random() * 0.3 + 0.1,
        animDelay: Math.random() * -5 + 's',
        animDuration: Math.random() * 5 + 5 + 's', // 5s to 10s
      }
    })
  }, [actualCount, isCCU])

  const grad = 'linear-gradient(to bottom, #4ade80, #166534)'

  return (
    <>
      <style>{`
        @keyframes robux-float-v2 {
          0% { transform: translateY(0px) rotate(0deg) scale(1); filter: brightness(1); }
          33% { transform: translateY(-40px) rotate(15deg) scale(1.05); filter: brightness(1.25); }
          66% { transform: translateY(30px) rotate(-10deg) scale(0.95); filter: brightness(0.85); }
          100% { transform: translateY(0px) rotate(0deg) scale(1); filter: brightness(1); }
        }
      `}</style>
      <div className="absolute inset-0 pointer-events-none">
        {icons.map((icon) => (
          <div
            key={icon.id}
            className="absolute"
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              width: icon.size,
              height: icon.size,
              opacity: icon.opacity,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div 
              className="w-full h-full"
              style={{
                animation: `robux-float-v2 ${icon.animDuration} ease-in-out ${icon.animDelay} infinite`,
              }}
            >
              <img 
                src={isCCU ? "/gold-robux-new.png" : "/custom-robux.png"} 
                alt="" 
                className="absolute inset-0 w-full h-full object-contain drop-shadow-2xl" 
              />
              
              {!isCCU && (
                <div 
                  className="absolute inset-0 w-full h-full mix-blend-color"
                  style={{
                    background: grad,
                    WebkitMaskImage: 'url(/custom-robux.png)',
                    WebkitMaskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
