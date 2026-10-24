import React, { useRef, useState, useEffect, useMemo } from 'react'

interface ScrollTextHighlightProps {
  companyName?: string
  text?: string
  accentWords?: string[]
  className?: string
}

export default function ScrollTextHighlight({
  companyName = 'The Block',
  text,
  accentWords = ['build', 'and', 'scale'],
  className = '',
}: ScrollTextHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  // Full statement text: defaults to the signature statement
  const fullText = useMemo(() => {
    if (text) return text
    return `We build and scale category-defining Roblox games that millions of players return to every day.`
  }, [text])

  // Split into tokens while identifying accent keywords
  const words = useMemo(() => {
    const rawTokens = fullText.trim().split(/\s+/)
    const lowerAccents = new Set(accentWords.map(w => w.toLowerCase()))

    return rawTokens.map(token => {
      const cleanToken = token.toLowerCase().replace(/[^a-z0-9]/g, '')
      const isAccent = lowerAccents.has(cleanToken)
      return {
        text: token,
        isAccent,
      }
    })
  }, [fullText, accentWords])

  useEffect(() => {
    const updateProgress = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalScrollable = rect.height - window.innerHeight
      if (totalScrollable <= 0) return

      // When rect.top is 0, container has reached the top of viewport and sticky locks
      // As user scrolls through the container height, rect.top goes from 0 to -totalScrollable
      const currentScroll = -rect.top
      const rawProgress = currentScroll / totalScrollable
      const clamped = Math.max(0, Math.min(1, rawProgress))
      setProgress(clamped)
    }

    window.addEventListener('scroll', updateProgress, { passive: true })
    window.addEventListener('resize', updateProgress, { passive: true })
    document.addEventListener('scroll', updateProgress, { passive: true })
    updateProgress()

    return () => {
      window.removeEventListener('scroll', updateProgress)
      window.removeEventListener('resize', updateProgress)
      document.removeEventListener('scroll', updateProgress)
    }
  }, [])

  // Spread the word reveal over 5% -> 85% of the pinned scroll track
  // Leaving 85% -> 100% for the user to comfortably see the fully illuminated statement before unpinning
  const revealStart = 0.05
  const revealEnd = 0.85
  const totalRange = revealEnd - revealStart
  const step = totalRange / words.length

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        height: '185vh',
        backgroundColor: '#000000',
      }}
      className={`z-20 ${className}`}
    >
      {/* Subtle top & bottom dark fades to blend seamlessly */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#080808] to-transparent pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#080808] to-transparent pointer-events-none z-10" />

      {/* Sticky viewport container: explicitly fixed in place while scrolling container height */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
        className="w-full px-6 md:px-12 lg:px-20"
      >
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <p
            className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-[4.2rem] tracking-tight leading-[1.2] sm:leading-[1.18] md:leading-[1.15] select-none text-white"
            style={{ letterSpacing: '-0.035em' }}
          >
            {words.map((item, index) => {
              const wordStart = revealStart + index * step
              const wordEnd = wordStart + step * 2.0

              let wordProgress = 0
              if (progress >= wordEnd) {
                wordProgress = 1
              } else if (progress > wordStart) {
                wordProgress = (progress - wordStart) / (wordEnd - wordStart)
              }

              // Normal words: interpolate opacity from 0.2 (dim gray) to 1.0 (pure white)
              // Accent words ("build and scale"): flat vibrant electric blue
              const baseOpacity = item.isAccent ? 0.28 : 0.20
              const currentOpacity = baseOpacity + wordProgress * (1 - baseOpacity)

              return (
                <span
                  key={index}
                  className="inline-block mr-[0.28em]"
                  style={{
                    color: item.isAccent ? '#3B82F6' : '#FFFFFF',
                    opacity: currentOpacity,
                    transition: 'opacity 0.05s ease-out',
                  }}
                >
                  {item.text}
                </span>
              )
            })}
          </p>
        </div>
      </div>
    </section>
  )
}
