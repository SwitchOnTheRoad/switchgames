import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import AnimatedHeading from '../components/AnimatedHeading'
import { FadeIn } from '../components/FadeIn'
import SectionReveal from '../components/SectionReveal'
import GameCarousel from '../components/GameCarousel'
import HeroBgSlideshow from '../components/HeroBgSlideshow'
import GrowthChart from '../components/GrowthChart'
import BlogCard from '../components/BlogCard'
import { getGames, getPosts } from '../api'
import SEOMeta from '../components/SEOMeta'
import GlobalStatsSection from '../components/GlobalStatsSection'
import type { Game, Post } from '../types'


export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [slideIndex, setSlideIndex] = useState(0)

  useEffect(() => {
    getGames().then(setGames).catch(() => {})
    getPosts()
      .then(data => setPosts(data.filter(p => p.published)))
      .catch(() => {})
  }, [])

  // Keep dot indicator in sync with slideshow (4.5s per slide)
  const slideGames = games.filter(g => g.imageUrl || g.videoUrl)
  useEffect(() => {
    if (slideGames.length < 2) return
    const id = setInterval(() => {
      setSlideIndex(prev => (prev + 1) % slideGames.length)
    }, 4500)
    return () => clearInterval(id)
  }, [slideGames.length])

  const latestPosts = posts.slice(0, 3)

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="relative h-screen w-full flex items-center overflow-hidden bg-black">

          {/* Game thumbnail slideshow background */}
          <HeroBgSlideshow games={games} scaleFactor={1} />

          {/* Dark overlay — lighter so thumbnails pop */}
          <div className="absolute inset-0 bg-black/55 z-[1]" />
          {/* Vignette edges */}
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)'
          }} />

          <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-16 pt-24 pb-16" style={{ maxWidth: '1500px' }}>
            <div className="flex flex-col items-start text-left max-w-3xl">
              <AnimatedHeading
                text="We build&#10;worlds."
                className="font-medium mb-6 text-white w-full"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 8.5rem)', letterSpacing: '-0.04em', lineHeight: 0.92 }}
                delay={200}
                charDelay={32}
              />

              <FadeIn delay={1100} className="text-base md:text-lg text-gray-400 mb-10 max-w-lg" style={{ lineHeight: 1.65 }}>
                <p>We build living worlds on Roblox and scale them through continuous live-ops.</p>
              </FadeIn>

              <FadeIn delay={1500}>
                <div className="flex flex-wrap gap-4 mb-10">
                  <Link to="/games">
                    <button className="btn-pill btn-pill-solid">
                      See Our Games
                    </button>
                  </Link>
                  <a href="/contact">
                    <button className="btn-pill">
                      Work With Us <span style={{ fontSize: 12 }}>↗</span>
                    </button>
                  </a>
                </div>
              </FadeIn>

              {/* Slide dot indicators */}
              {slideGames.length > 1 && (
                <FadeIn delay={1800}>
                  <div className="hero-slide-dots">
                    {slideGames.map((_, i) => (
                      <div
                        key={i}
                        className={`hero-slide-dot${i === slideIndex ? ' active' : ''}`}
                      />
                    ))}
                  </div>
                </FadeIn>
              )}
            </div>
          </div>



          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
      </section>


      {/* ─── GAMES ────────────────────────────────────────── */}
      <section id="games" className="bg-black py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 px-6 md:px-12 lg:px-16">
            <div>

              <SectionReveal delay={60}><h2 className="text-4xl md:text-5xl font-medium" style={{ letterSpacing: '-0.03em' }}>Our Games</h2></SectionReveal>
            </div>
            <SectionReveal>
              <Link to="/games">
                <button className="btn-pill btn-pill-sm">
                  View All <span style={{ fontSize: 11 }}>↗</span>
                </button>
              </Link>
            </SectionReveal>
          </div>

          {games.length === 0 ? (
            <div className="flex gap-4 px-6 overflow-hidden justify-center">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/5 animate-pulse flex-shrink-0 bg-white/[0.02]" style={{ width: 260, height: 380 }} />
              ))}
            </div>
          ) : (
            <SectionReveal>
              <GameCarousel games={games} />
            </SectionReveal>
          )}
        </div>
      </section>

      {/* ─── GLOBAL STATS ──────────────────────────────────── */}
      <GlobalStatsSection />

      {/* ─── IMPACT ──────────────────────────────────── */}
      <section id="impact" className="bg-black py-28 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <div>

            <SectionReveal delay={60}><h2 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.0 }}>The Switch<br />Effect.</h2></SectionReveal>
            <SectionReveal delay={120}>
              <p className="text-base md:text-lg text-gray-400 mb-5" style={{ lineHeight: 1.7 }}>
                Before us, your game might be struggling to find its footing or growing at a snail's pace. We change the trajectory.
              </p>
            </SectionReveal>
            <SectionReveal delay={180}>
              <p className="text-base text-gray-400 mb-8" style={{ lineHeight: 1.7 }}>
                When we partner with you, we bring our expertise in game design, community building, and live-ops strategy to ignite exponential growth. 
              </p>
            </SectionReveal>
            <SectionReveal delay={240}>
              <Link to="/contact">
                <button className="btn-pill btn-pill-solid">
                  Partner With Us
                </button>
              </Link>
            </SectionReveal>
          </div>

          {/* Right Chart */}
          <SectionReveal>
            <div className="rounded-2xl overflow-hidden relative group border border-white/[0.06] bg-white/[0.015]" style={{ height: 520, padding: '24px 24px 48px' }}>
              <GrowthChart />
            </div>
          </SectionReveal>
        </div>
      </section>


      {/* ─── BLOG PREVIEW ─────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="bg-black py-24 px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>

                <SectionReveal delay={60}><h2 className="text-4xl md:text-5xl font-medium" style={{ letterSpacing: '-0.03em' }}>News & Updates</h2></SectionReveal>
              </div>
              <SectionReveal>
                <Link to="/blog">
                  <button className="hidden md:flex btn-pill btn-pill-sm">
                    All Posts <span style={{ fontSize: 11 }}>↗</span>
                  </button>
                </Link>
              </SectionReveal>
            </div>
            <SectionReveal>
              <div className="grid md:grid-cols-3 gap-5">
                {latestPosts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </SectionReveal>
          </div>
        </section>
      )}

      {/* ─── STUDIO ───────────────────────────────────────── */}
      <section id="studio" className="bg-black py-28 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <SectionReveal>
            <div className="rounded-2xl overflow-hidden relative group border border-white/[0.06]" style={{ height: 520 }}>
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                <source src="/backgroundvideo.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </SectionReveal>

          <div>

            <SectionReveal delay={60}><h2 className="text-4xl md:text-5xl font-medium mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.0 }}>We are Switch.</h2></SectionReveal>
            <SectionReveal delay={120}>
              <p className="text-base md:text-lg text-gray-400 mb-5" style={{ lineHeight: 1.7 }}>
                Switch is a UGC game development studio born from one belief: games are the most powerful cultural medium of our time. We build inside Roblox, the platform where 80M daily players come to play, create, and belong.
              </p>
            </SectionReveal>
            <SectionReveal delay={180}>
              <p className="text-base text-gray-400 mb-8" style={{ lineHeight: 1.7 }}>
                Our team combines deep game design expertise with cultural fluency. We don't just build games. We build worlds players return to.
              </p>
            </SectionReveal>

          </div>
        </div>
      </section>

      {/* ─── PROCESS ──────────────────────────────────────── */}
      <section className="bg-black py-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">

          <SectionReveal delay={60}>
            <h2 className="text-4xl md:text-5xl font-medium mb-12" style={{ letterSpacing: '-0.03em' }}>
              From brief to<br />live in weeks.
            </h2>
          </SectionReveal>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { n: '01', title: 'Discovery', desc: 'We learn your game, audience, and goals. We find the live-ops strategy that fits.' },
              { n: '02', title: 'Design', desc: 'World concept, visual identity, game loop. Every detail designed before a single block is placed.' },
              { n: '03', title: 'Build', desc: 'Our developers and designers build fast, with weekly playtests and full transparency.' },
              { n: '04', title: 'Launch', desc: 'We handle publishing, QA, and post-launch analytics. You own the world.' },
            ].map((step, i) => (
              <SectionReveal key={step.n} delay={i * 80}>
                <div className="rounded-2xl p-6 border border-white/[0.06] h-full bg-white/[0.02]">
                  <p className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-4">{step.n}</p>
                  <h3 className="text-lg font-medium mb-2" style={{ letterSpacing: '-0.02em' }}>{step.title}</h3>
                  <p className="text-sm text-gray-400" style={{ lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section id="contact" className="bg-black py-32 px-6 md:px-12 lg:px-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ opacity: 0.18 }}>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260421_102157_ad7d8fd0-1039-4516-8d40-db76927cc9c5.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black/55 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-[2] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">

          <SectionReveal delay={60}>
            <h2 className="font-medium mb-6" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              Ready to Switch?
            </h2>
          </SectionReveal>
          <SectionReveal delay={120}>
            <p className="text-base md:text-lg text-gray-400 mb-10 max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
              Whether you're launching a new title or looking to scale an existing game through live-ops, we'd love to talk.
            </p>
          </SectionReveal>
          <SectionReveal delay={180}>
            <div className="flex flex-wrap gap-4 justify-center">
              <button className="btn-pill btn-pill-solid">
                Start a Project
              </button>
              <a href="mailto:hello@playswitchgames.com">
                <button className="btn-pill">
                  hello@playswitchgames.com
                </button>
              </a>
            </div>
          </SectionReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
