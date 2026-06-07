import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import AnimatedHeading from '../components/AnimatedHeading'
import { FadeIn } from '../components/FadeIn'
import SectionReveal from '../components/SectionReveal'
import GameCard from '../components/GameCard'
import GameCarousel from '../components/GameCarousel'
import HeroGameCarousel from '../components/HeroGameCarousel'
import BlogCard from '../components/BlogCard'
import { getGames, getPosts } from '../api'
import SEOMeta from '../components/SEOMeta'
import type { Game, Post } from '../types'


export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [posts, setPosts] = useState<Post[]>([])

  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    getGames().then(setGames).catch(() => {})
    getPosts()
      .then(data => setPosts(data.filter(p => p.published)))
      .catch(() => {})
  }, [])

  const featured = games.filter(g => g.featured)
  const [hero, ...restGames] = featured.length >= 1 ? featured : games
  const gridGames = restGames.slice(0, 4)
  const latestPosts = posts.slice(0, 3)

  const bgScale = 1 + scrollY * 0.0015

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta />

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section className="h-[200vh] bg-black relative">
        <div className="sticky top-0 h-screen w-full flex items-center overflow-hidden">
        <video 
          autoPlay loop muted playsInline 
          src="/earth.mp4" 
          className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-75 ease-out" 
          style={{ transform: `scale(${bgScale})`, transformOrigin: 'center center' }}
        />
        <div className="absolute inset-0 bg-black/50 z-[1]" />

        <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-16 pt-24 pb-16" style={{ maxWidth: '1500px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-[4fr_7fr] gap-8 items-center">
            {/* Left side — text & buttons */}
            <div className="flex flex-col items-start text-left">
              <AnimatedHeading
                text="We build&#10;worlds."
                className="font-medium mb-6 text-white w-full"
                style={{ fontSize: 'clamp(3.5rem, 10vw, 7.5rem)', letterSpacing: '-0.04em', lineHeight: 0.92 }}
                delay={200}
                charDelay={32}
              />

              <FadeIn delay={1100} className="text-base md:text-lg text-gray-400 mb-10 max-w-md" style={{ lineHeight: 1.65 }}>
                <p>We build games for culture — and for the brands that want to live inside it.</p>
              </FadeIn>

              <FadeIn delay={1500}>
                <div className="flex flex-wrap gap-4">
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
            </div>

            {/* Right side — game icon carousel */}
            <FadeIn delay={1200} className="flex justify-center lg:justify-end">
              <HeroGameCarousel games={games} />
            </FadeIn>
          </div>
        </div>

        <FadeIn delay={2000} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="rounded-full px-4 py-2 border border-white/15">
            <span className="text-xs text-gray-400 tracking-[0.15em] uppercase">Scroll</span>
          </div>
        </FadeIn>

        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
        </div>
      </section>


      {/* ─── GAMES ────────────────────────────────────────── */}
      <section id="games" className="bg-black py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 px-6 md:px-12 lg:px-16">
            <div>
              <SectionReveal><p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Games</p></SectionReveal>
              <SectionReveal delay={60}><h2 className="text-4xl md:text-5xl font-medium" style={{ letterSpacing: '-0.03em' }}>Made to be played.</h2></SectionReveal>
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

      {/* ─── STATS ────────────────────────────────────────── */}
      <section className="bg-black py-6 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: '300M+', label: 'Total Plays' },
            { value: '50+', label: 'Games Built' },
            { value: '40+', label: 'Brand Partners' },
            { value: '#1', label: 'UGC Studio' },
          ].map((stat, i) => (
            <SectionReveal key={stat.label} delay={i * 80}>
              <div className="rounded-2xl px-6 py-8 text-center border border-white/[0.06] bg-white/[0.02]">
                <p className="text-4xl md:text-5xl font-medium mb-2" style={{ letterSpacing: '-0.04em' }}>{stat.value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-[0.15em]">{stat.label}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </section>

      {/* ─── BRANDS ───────────────────────────────────────── */}
      <section id="brands" className="bg-black py-28 px-6 md:px-12 lg:px-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ opacity: 0.07 }}>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260421_102157_ad7d8fd0-1039-4516-8d40-db76927cc9c5.mp4" type="video/mp4" />
          </video>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <SectionReveal><p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">For Brands</p></SectionReveal>
              <SectionReveal delay={60}>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.0 }}>
                  Your brand,<br />in the game.
                </h2>
              </SectionReveal>
              <SectionReveal delay={120}>
                <p className="text-base md:text-lg text-gray-400 mb-8" style={{ lineHeight: 1.7 }}>
                  We create immersive branded experiences inside Roblox — worlds where your audience doesn't just see your brand, they live inside it.
                </p>
              </SectionReveal>
              <SectionReveal delay={180}>
                <div className="space-y-5 mb-8">
                  {[
                    { n: '01', title: 'Branded World Builds', desc: 'Full custom Roblox experiences built around your brand identity.' },
                    { n: '02', title: 'In-Game Events', desc: 'Limited-time activations inside games with built-in audiences.' },
                    { n: '03', title: 'Virtual Items & UGC', desc: 'Branded avatar items players actually want to wear.' },
                  ].map(item => (
                    <div key={item.n} className="flex items-start gap-4">
                      <div className="rounded-xl w-9 h-9 flex-shrink-0 flex items-center justify-center border border-white/10 text-xs font-light bg-white/[0.03]" style={{ marginTop: 2 }}>
                        {item.n}
                      </div>
                      <div>
                        <p className="font-medium mb-0.5">{item.title}</p>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionReveal>
              <SectionReveal delay={240}>
                <a href="/contact">
                  <button className="btn-pill btn-pill-solid">
                    Partner With Us
                  </button>
                </a>
              </SectionReveal>
            </div>

            <SectionReveal>
              <div className="rounded-2xl overflow-hidden relative group border border-white/[0.06]" style={{ height: 480 }}>
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                  <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                <div className="absolute top-5 left-5 z-10">
                  <div className="rounded-full px-3 py-1 border border-white/15 bg-black/40">
                    <span className="text-xs text-gray-400 uppercase tracking-[0.12em]">Brand Activation</span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <h3 className="text-2xl font-semibold mb-1" style={{ letterSpacing: '-0.02em' }}>This could be you.</h3>
                  <p className="text-sm text-gray-400">Your brand, built into the world players love.</p>
                </div>
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── BLOG PREVIEW ─────────────────────────────────── */}
      {latestPosts.length > 0 && (
        <section className="bg-black py-24 px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <SectionReveal><p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Blog</p></SectionReveal>
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
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260325_132944_a0d124bb-eaa1-4082-aa30-2310efb42b4b.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>
          </SectionReveal>

          <div>
            <SectionReveal><p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">Studio</p></SectionReveal>
            <SectionReveal delay={60}><h2 className="text-4xl md:text-5xl font-medium mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.0 }}>We are Switch.</h2></SectionReveal>
            <SectionReveal delay={120}>
              <p className="text-base md:text-lg text-gray-400 mb-5" style={{ lineHeight: 1.7 }}>
                Switch is a UGC game development studio born from one belief: games are the most powerful cultural medium of our time. We build inside Roblox — the platform where 80M daily players come to play, create, and belong.
              </p>
            </SectionReveal>
            <SectionReveal delay={180}>
              <p className="text-base text-gray-400 mb-8" style={{ lineHeight: 1.7 }}>
                Our team combines deep game design expertise with cultural fluency. We don't just build games — we build worlds players return to.
              </p>
            </SectionReveal>
            <SectionReveal delay={240}>
              <div className="flex flex-wrap gap-2">
                {['Game Design', 'World Building', 'Lua Scripting', 'Brand Strategy', 'Community', 'Monetisation'].map(tag => (
                  <div key={tag} className="rounded-full px-4 py-2 border border-white/10 bg-white/[0.02]">
                    <span className="text-sm text-gray-400">{tag}</span>
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* ─── PROCESS ──────────────────────────────────────── */}
      <section className="bg-black py-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <SectionReveal><p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">How We Work</p></SectionReveal>
          <SectionReveal delay={60}>
            <h2 className="text-4xl md:text-5xl font-medium mb-12" style={{ letterSpacing: '-0.03em' }}>
              From brief to<br />live in weeks.
            </h2>
          </SectionReveal>
          <div className="grid md:grid-cols-4 gap-3">
            {[
              { n: '01', title: 'Discovery', desc: 'We learn your brand, audience, and goals. We find the game mechanic that fits.' },
              { n: '02', title: 'Design', desc: 'World concept, visual identity, game loop. Every detail designed before a single block is placed.' },
              { n: '03', title: 'Build', desc: 'Our developers and designers build fast — with weekly playtests and full transparency.' },
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
          <SectionReveal><p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-4">Let's Build</p></SectionReveal>
          <SectionReveal delay={60}>
            <h2 className="font-medium mb-6" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              Ready to Switch?
            </h2>
          </SectionReveal>
          <SectionReveal delay={120}>
            <p className="text-base md:text-lg text-gray-400 mb-10 max-w-lg mx-auto" style={{ lineHeight: 1.7 }}>
              Whether you're a brand reaching the next generation or a studio looking to go bigger — we'd love to talk.
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
