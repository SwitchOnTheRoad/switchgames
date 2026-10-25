import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

interface Props {
  studioName?: string
  headline?: string
  buttonText?: string
  buttonLink?: string
}

export default function YourGameBanner({
  studioName = 'THE BLOCK',
  headline = 'About Us',
  buttonText = 'Learn More',
  buttonLink = '/about',
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rx = (0.5 - y) * 10
    const ry = (x - 0.5) * 12
    setTilt({ rx, ry })
  }

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 })
  }

  return (
    <section className="bg-transparent py-10 md:py-16 px-4 sm:px-6 md:px-12 lg:px-16 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden border border-amber-500/20 hover:border-amber-400/40 transition-all duration-500 shadow-[0_20px_60px_rgba(0,0,0,0.85)] px-8 py-10 sm:px-12 sm:py-12 lg:px-16 lg:py-14 flex flex-col lg:flex-row items-center justify-between gap-8 group"
          style={{
            background: 'linear-gradient(90deg, #0e0b06 0%, #140f08 35%, #1c150b 70%, #281d0c 100%)',
          }}
        >
          {/* Smooth Warm Ambient Light Fade across the card */}
          <div
            className="absolute top-0 right-0 bottom-0 w-3/4 pointer-events-none opacity-95 transition-opacity duration-500"
            style={{
              background: 'radial-gradient(circle at 82% 42%, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.18) 40%, rgba(180, 83, 9, 0.06) 65%, transparent 85%)',
            }}
          />

          {/* Left Text Content */}
          <div className="relative z-10 flex-1 max-w-xl text-left pr-0 lg:pr-8">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight drop-shadow-md mb-5"
              style={{ letterSpacing: '-0.035em' }}
            >
              {headline}
            </h2>

            <p className="text-sm sm:text-base text-gray-200 font-sans leading-relaxed mb-4 max-w-xl">
              {studioName} is a Roblox game development and investment studio dedicated to creating, acquiring, and scaling exceptional gaming experiences.
            </p>

            <p className="text-sm sm:text-base text-gray-400 font-sans leading-relaxed mb-8 max-w-xl">
              We partner directly with ambitious developers and creators to unlock the full potential of their games through strategic capital, expert co-development, and dedicated live-ops to build lasting success together.
            </p>

            <Link to={buttonLink}>
              <button className="btn-primary !bg-white !text-black hover:!bg-neutral-200">
                {buttonText}
              </button>
            </Link>
          </div>

          {/* Right Side: Gold Robux Coin tucked into right edge with natural depth shadow */}
          <div
            className="absolute -right-16 sm:-right-24 md:-right-32 lg:-right-44 xl:-right-52 top-1/2 -translate-y-1/2 w-[240px] sm:w-[320px] md:w-[400px] lg:w-[480px] xl:w-[540px] pointer-events-none select-none transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(-50%) rotate(${tilt.ry * 0.5}deg) scale(${1 + Math.abs(tilt.rx) * 0.004})`,
            }}
          >
            <img
              src="/gold-robux-new.png"
              alt="Gold Robux Coin"
              className="w-full h-auto object-contain relative z-10"
              style={{
                filter: 'drop-shadow(-32px 22px 40px rgba(0, 0, 0, 0.95)) drop-shadow(-10px 10px 18px rgba(0, 0, 0, 0.8))',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
