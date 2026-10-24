import React, { useState, useEffect, useRef } from 'react'
import { getValues } from '../api'
import type { ValueCard } from '../types'

export type { ValueCard }

const DEFAULT_VALUES: ValueCard[] = [
  {
    id: 'players-first',
    title: 'PLAYERS COME FIRST',
    image: '/values/value-1.jpg',
    paragraphs: [
      'We build for players because we understand what keeps communities engaged.',
      'Every update is shaped around stronger experiences, lasting trust and long-term growth.',
    ],
    order: 1,
  },
  {
    id: 'ownership',
    title: 'WE TAKE OWNERSHIP',
    image: '/values/value-2.jpg',
    paragraphs: [
      'We take responsibility for every game and partnership we support.',
      'When something can be improved, we step in, solve it and keep pushing the experience forward.',
    ],
    order: 2,
  },
  {
    id: 'focused',
    title: 'WE STAY FOCUSED',
    image: '/values/value-3.jpg',
    paragraphs: [
      'We focus on the ideas that can make the greatest difference.',
      'Every decision is deliberate, allowing us to put our time, energy and expertise where they create the most value.',
    ],
    order: 3,
  },
  {
    id: 'execution',
    title: 'EXECUTION IS EVERYTHING',
    image: '/values/value-4.jpg',
    paragraphs: [
      'Ambitious visions require relentless craftsmanship and technical precision.',
      'From frictionless core loops to high-fidelity visual design, we obsess over the details that turn good games into legends.',
    ],
    order: 4,
  },
  {
    id: 'long-term',
    title: 'BUILT TO LAST',
    image: '/values/value-5.jpg',
    paragraphs: [
      "We don't chase quick spikes or fleeting hype cycles.",
      'We engineer sustainable in-game economies and multi-year live-ops designed to keep player communities thriving for the long run.',
    ],
    order: 5,
  },
]

export default function ValuesCarousel() {
  const [items, setItems] = useState<ValueCard[]>(DEFAULT_VALUES)
  const [activeIndex, setActiveIndex] = useState(1) // Start with 2nd card centered
  const [isPaused, setIsPaused] = useState(false)
  const dragStartX = useRef<number | null>(null)
  const [dragOffset, setDragOffset] = useState(0)

  // Fetch values from API
  useEffect(() => {
    let mounted = true
    getValues()
      .then(res => {
        if (!mounted) return
        if (Array.isArray(res) && res.length > 0) {
          const sorted = [...res].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
          setItems(sorted)
        }
      })
      .catch(err => {
        console.warn('Could not load dynamic values, using defaults:', err)
      })
    return () => {
      mounted = false
    }
  }, [])

  const n = items.length

  // Auto-rotate every 5 seconds when not hovered/dragging
  useEffect(() => {
    if (isPaused || n === 0) return
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % n)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPaused, n])

  const nextCard = () => {
    if (n === 0) return
    setActiveIndex(prev => (prev + 1) % n)
  }

  const prevCard = () => {
    if (n === 0) return
    setActiveIndex(prev => (prev - 1 + n) % n)
  }

  // Pointer drag gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX
    setDragOffset(0)
    setIsPaused(true)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return
    setDragOffset(e.clientX - dragStartX.current)
  }

  const handlePointerUp = () => {
    if (dragStartX.current !== null) {
      if (dragOffset > 50) {
        prevCard()
      } else if (dragOffset < -50) {
        nextCard()
      }
    }
    dragStartX.current = null
    setDragOffset(0)
    setIsPaused(false)
  }

  return (
    <div className="w-full py-12 md:py-20 select-none overflow-hidden">
      {/* ── Heading with Divider Lines ── */}
      <div className="flex items-center justify-center gap-4 md:gap-8 mb-12 md:mb-16 px-6">
        <div className="w-12 sm:w-20 md:w-36 h-[1px] bg-white/20" />
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold font-heading tracking-wider uppercase text-white whitespace-nowrap">
          OUR VALUES
        </h2>
        <div className="w-12 sm:w-20 md:w-36 h-[1px] bg-white/20" />
      </div>

      {/* ── 3D Rotating Carousel Stage ── */}
      <div
        className="relative w-full max-w-[1300px] mx-auto h-[530px] md:h-[580px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => {
          if (dragStartX.current === null) setIsPaused(false)
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          perspective: '1300px',
        }}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {items.map((card, i) => {
            // Calculate shortest angular offset around the ring
            let diff = i - activeIndex
            while (diff > n / 2) diff -= n
            while (diff < -n / 2) diff += n

            const isCenter = diff === 0
            const absDiff = Math.abs(diff)

            // Cylindrical curve math
            // angleStep: ~26 degrees gives a panoramic curved view of all cards
            const angleStep = Math.min(32, Math.max(20, 130 / Math.max(items.length, 1)))
            const angle = diff * angleStep
            const rad = (angle * Math.PI) / 180

            // Radius of cylinder
            const radius = 700

            // Coordinates on cylinder
            const x = Math.sin(rad) * radius
            const z = Math.cos(rad) * radius - radius

            // Rotate cards slightly toward camera
            const rotateY = -angle

            // Opacity and scale based on distance from center
            const opacity = absDiff === 0 ? 1 : absDiff === 1 ? 0.85 : 0.45
            const scale = absDiff === 0 ? 1 : absDiff === 1 ? 0.94 : 0.86

            const paragraphs = Array.isArray(card.paragraphs)
              ? card.paragraphs
              : (card.paragraphs ? [card.paragraphs] : [])

            return (
              <div
                key={card.id || i}
                onClick={() => {
                  if (!isCenter) setActiveIndex(i)
                }}
                className={`absolute w-[290px] sm:w-[320px] md:w-[340px] h-[480px] md:h-[520px] rounded-2xl overflow-hidden border transition-all duration-700 ease-out ${
                  isCenter
                    ? 'border-white/25 shadow-[0_20px_60px_rgba(0,0,0,0.9)] z-30'
                    : 'border-white/10 shadow-2xl z-10 cursor-pointer hover:border-white/20'
                }`}
                style={{
                  backgroundColor: '#121318',
                  transform: `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity,
                  transformStyle: 'preserve-3d',
                }}
              >
                {/* Card Top Image */}
                <div className="relative w-full h-44 sm:h-48 md:h-52 overflow-hidden bg-black/60">
                  <img
                    src={card.image}
                    alt={card.title}
                    draggable={false}
                    className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                  {/* Subtle bottom gradient on image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121318] via-transparent to-transparent opacity-80" />
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 md:p-7 flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold font-heading tracking-wide uppercase text-white">
                      {card.title}
                    </h3>

                    {/* Signature Blue Accent Line */}
                    <div className="w-full h-[2px] bg-[#3B82F6] my-3.5 sm:my-4" />

                    <div className="space-y-2 sm:space-y-3">
                      {paragraphs.map((p, pIdx) => (
                        <p
                          key={pIdx}
                          className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Carousel Navigation Controls ── */}
      <div className="flex items-center justify-center gap-6 mt-6 md:mt-10">
        <button
          onClick={prevCard}
          className="w-11 h-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-all hover:scale-105"
          aria-label="Previous value"
        >
          <span className="text-lg">←</span>
        </button>

        {/* Dot Indicators */}
        <div className="flex items-center gap-2.5">
          {items.map((_, dotIdx) => (
            <button
              key={dotIdx}
              onClick={() => setActiveIndex(dotIdx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                dotIdx === activeIndex
                  ? 'w-8 bg-[#3B82F6]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Go to slide ${dotIdx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextCard}
          className="w-11 h-11 rounded-full border border-white/20 bg-white/5 hover:bg-white/15 flex items-center justify-center text-white transition-all hover:scale-105"
          aria-label="Next value"
        >
          <span className="text-lg">→</span>
        </button>
      </div>
    </div>
  )
}
