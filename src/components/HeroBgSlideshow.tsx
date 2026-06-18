import { useEffect, useState, useRef } from 'react'
import type { Game } from '../types'

interface HeroBgSlideshowProps {
  games: Game[]
  scaleFactor?: number
}

// Each transition variant picks a slightly different animation feel
const VARIANTS = [
  // zoom-in
  { from: 'scale(1.08) translateX(0px)',   to: 'scale(1.0) translateX(0px)' },
  // pan right to left
  { from: 'scale(1.06) translateX(2%)',    to: 'scale(1.0) translateX(-2%)' },
  // pan left to right
  { from: 'scale(1.06) translateX(-2%)',   to: 'scale(1.0) translateX(2%)' },
  // zoom out
  { from: 'scale(1.0) translateX(0px)',    to: 'scale(1.06) translateX(0px)' },
]

const DURATION = 4500  // ms each slide stays on screen
const CROSSFADE = 900  // ms crossfade overlap

export default function HeroBgSlideshow({ games, scaleFactor = 1 }: HeroBgSlideshowProps) {
  const [slides, setSlides] = useState<Game[]>([])
  const [curr, setCurr] = useState(0)
  const [next, setNext] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const variantRef = useRef(0)

  // Build slide list: only games with imageUrl or videoUrl
  useEffect(() => {
    const valid = games.filter(g => g.imageUrl || g.videoUrl)
    setSlides(valid)
    setCurr(0)
    setNext(null)
    setTransitioning(false)
  }, [games])

  useEffect(() => {
    if (slides.length < 2) return

    const advance = () => {
      const nextIdx = (curr + 1) % slides.length
      variantRef.current = (variantRef.current + 1) % VARIANTS.length
      setNext(nextIdx)
      setTransitioning(true)

      timerRef.current = setTimeout(() => {
        setCurr(nextIdx)
        setNext(null)
        setTransitioning(false)
      }, CROSSFADE)
    }

    const id = setTimeout(advance, DURATION)
    return () => {
      clearTimeout(id)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [curr, slides.length])

  if (!slides.length) return null

  const currGame = slides[curr]
  const nextGame = next !== null ? slides[next] : null
  const variant = VARIANTS[variantRef.current]

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'center center',
      }}
    >
      {/* Current slide */}
      <SlideBg
        game={currGame}
        variant={variant}
        opacity={1}
        duration={DURATION + CROSSFADE}
        key={`curr-${curr}`}
      />

      {/* Next slide — fades in over current */}
      {transitioning && nextGame && (
        <SlideBg
          game={nextGame}
          variant={VARIANTS[(variantRef.current + 1) % VARIANTS.length]}
          opacity={0}
          fadeTo={1}
          fadeDuration={CROSSFADE}
          duration={DURATION + CROSSFADE}
          key={`next-${next}`}
        />
      )}
    </div>
  )
}

// ─── Individual slide ────────────────────────────────────────────
interface SlideBgProps {
  game: Game
  variant: { from: string; to: string }
  opacity: number
  fadeTo?: number
  fadeDuration?: number
  duration: number
}

function SlideBg({ game, variant, opacity, fadeTo, fadeDuration = 900, duration }: SlideBgProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (fadeTo === undefined) return
    // Trigger fade-in on next frame
    const id = requestAnimationFrame(() => {
      if (ref.current) ref.current.style.opacity = String(fadeTo)
    })
    return () => cancelAnimationFrame(id)
  }, [fadeTo])

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        inset: 0,
        opacity,
        transition: fadeTo !== undefined ? `opacity ${fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1)` : 'none',
      }}
    >
      {/* Media */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          animation: `heroPan ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          // pass CSS vars for keyframe
          // @ts-expect-error css vars
          '--from': variant.from,
          '--to': variant.to,
        }}
      >
        {game.imageUrl ? (
          <img
            src={game.imageUrl}
            alt={game.title}
            draggable={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : game.videoUrl ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          >
            <source src={game.videoUrl} type="video/mp4" />
          </video>
        ) : null}
      </div>
    </div>
  )
}
