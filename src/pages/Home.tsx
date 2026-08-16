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
import SEOMeta from '../components/SEOMeta'
import PortfolioStatsSection from '../components/PortfolioStatsSection'
import ContactBanner from '../components/ContactBanner'
import { getSiteSettings, getGames, getPosts } from '../api'
import type { Game, Post, SiteSettings } from '../types'

function getYouTubeVideoId(url: URL) {
  if (url.hostname.includes('youtu.be')) {
    return url.pathname.split('/').filter(Boolean)[0] || ''
  }

  if (url.searchParams.get('v')) {
    return url.searchParams.get('v') || ''
  }

  const pathParts = url.pathname.split('/').filter(Boolean)
  const marker = pathParts.findIndex(part => ['embed', 'shorts', 'live'].includes(part))
  return marker >= 0 ? pathParts[marker + 1] || '' : ''
}

function getHeroYouTubeEmbedUrl(rawUrl?: string) {
  if (!rawUrl) return ''

  try {
    const input = new URL(rawUrl)
    const videoId = getYouTubeVideoId(input)
    if (!videoId) return rawUrl

    const params = new URLSearchParams({
      autoplay: '1',
      mute: '1',
      playsinline: '1',
      loop: '1',
      playlist: videoId,
    })

    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`
  } catch {
    return rawUrl
  }
}


export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)
  const [heroVideoReady, setHeroVideoReady] = useState(false)

  useEffect(() => {
    getGames().then(setGames).catch(() => {})
    getPosts()
      .then(data => setPosts(data.filter(p => p.published && p.title && p.slug)))
      .catch(() => {})
    getSiteSettings().then(setSettings).catch(() => {})
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
  const heroYouTubeEmbedUrl = getHeroYouTubeEmbedUrl(settings?.youtubeHeroLink)

  useEffect(() => {
    setHeroVideoReady(false)
    if (!heroYouTubeEmbedUrl) return
    const id = window.setTimeout(() => setHeroVideoReady(true), 2400)
    return () => window.clearTimeout(id)
  }, [heroYouTubeEmbedUrl])

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta />

      {/* â”€â”€â”€ HERO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-black">

          {/* Game thumbnail slideshow background */}
          <HeroBgSlideshow games={games} scaleFactor={1} />

          {/* Dark overlay â€” lighter so thumbnails pop */}
          <div className="absolute inset-0 bg-black/55 z-[1]" />
          {/* Vignette edges */}
          <div className="absolute inset-0 z-[1] pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(11,15,25,0.65) 100%)'
          }} />

          <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-16 pt-24 pb-16" style={{ maxWidth: '1500px' }}>
            <div className={`flex flex-col ${heroYouTubeEmbedUrl ? 'lg:flex-row' : ''} items-center gap-10 lg:gap-14`}>
              <div className={`flex flex-col items-start text-left w-full ${heroYouTubeEmbedUrl ? 'lg:w-auto lg:min-w-[340px] lg:max-w-[400px] lg:flex-shrink-0' : 'max-w-3xl'}`}>
                <AnimatedHeading
                  text="We build&#10;worlds."
                  className="font-medium mb-6 text-white w-full"
                  style={{ fontSize: heroYouTubeEmbedUrl ? 'clamp(2.8rem, 6vw, 5.5rem)' : 'clamp(3.5rem, 10vw, 8.5rem)', letterSpacing: '-0.04em', lineHeight: 0.92 }}
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
                        Work With Us
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

              {heroYouTubeEmbedUrl && (
                <FadeIn delay={1500} className="w-full lg:flex-1 lg:min-w-0">
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-black/50 relative">
                    <iframe
                      src={heroYouTubeEmbedUrl}
                      title="Hero video"
                      frameBorder="0"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                      loading="eager"
                      className={`w-full h-full transition-opacity duration-700 ${heroVideoReady ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </div>
                </FadeIn>
              )}
            </div>
          </div>



          <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
      </section>


      {/* ─── GAMES ──────────────────────────────────────────────────────── */}
      <section id="games" className="bg-black py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 px-6">
            <SectionReveal delay={60}>
              <h2 className="text-4xl md:text-5xl font-medium text-white" style={{ letterSpacing: '-0.03em' }}>
                Our Top Hits
              </h2>
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

          <div className="flex justify-center mt-10 px-6">
            <SectionReveal delay={200}>
              <Link to="/games">
                <button className="btn-pill btn-pill-sm">
                  View Full Games Catalog
                </button>
              </Link>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── PORTFOLIO STATS ─────────────────────────────────── */}
      <PortfolioStatsSection />
      <ContactBanner />

      {/* ───────────────────────────────────────────────────────────────────────────── */}
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


      {/* â”€â”€â”€ BLOG PREVIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-black py-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>

              <SectionReveal delay={60}><h2 className="text-4xl md:text-5xl font-medium" style={{ letterSpacing: '-0.03em' }}>News & Updates</h2></SectionReveal>
            </div>
            <SectionReveal>
              <Link to="/blog">
                <button className="hidden md:flex btn-pill btn-pill-sm">
                  All Posts
                </button>
              </Link>
            </SectionReveal>
          </div>
          <SectionReveal>
            {latestPosts.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-5">
                {latestPosts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-gray-400 py-8">No posts yet. Check back soon.</p>
            )}
          </SectionReveal>
        </div>
      </section>

      {/* â”€â”€â”€ STUDIO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="studio" className="bg-black py-28 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto grid md:grid-cols-[1.3fr_0.7fr] gap-12 lg:gap-16 items-center">
          <SectionReveal>
            <div className="rounded-2xl overflow-hidden relative group border border-white/[0.06] aspect-video w-full">
              <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                <source src="/backgroundvideo.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </SectionReveal>

          <div className="max-w-md">

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

      {/* â”€â”€â”€ PROCESS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                  <h3 className="text-lg font-medium mb-2" style={{ letterSpacing: '-0.02em' }}>{step.title}</h3>
                  <p className="text-sm text-gray-400" style={{ lineHeight: 1.6 }}>{step.desc}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€â”€ CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section id="contact" className="bg-black py-32 px-6 md:px-12 lg:px-16 relative z-20 overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ opacity: 0.12 }}>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260421_102157_ad7d8fd0-1039-4516-8d40-db76927cc9c5.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="absolute inset-0 bg-black/55 z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black z-[2] pointer-events-none" />

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
              <Link to="/contact">
                <button className="btn-pill btn-pill-solid">
                  Start a Project
                </button>
              </Link>
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
