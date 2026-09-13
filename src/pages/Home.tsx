import React, { useState, useEffect, useRef } from 'react'
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
import CCUChart from '../components/CCUChart'
import { getSiteSettings, getGames, getPosts } from '../api'
import type { Game, Post, SiteSettings } from '../types'

export default function Home() {
  const [games, setGames] = useState<Game[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [slideIndex, setSlideIndex] = useState(0)

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

  return (
    <div className="bg-[#080808] bg-pattern text-white min-h-screen relative overflow-x-hidden">
      
      <div className="relative z-10">
        <Nav />
        <SEOMeta />

        {/* ─── HERO ─────────────────────────────────────────── */}
        <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-transparent">

            {/* Game thumbnail slideshow background */}
            <HeroBgSlideshow games={games} scaleFactor={1} />

            {/* Dark overlay — lighter so thumbnails pop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[1]" />
            {/* Vignette edges */}
            <div className="absolute inset-0 z-[1] pointer-events-none" style={{
              background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)'
            }} />

            <div className="relative z-10 w-full mx-auto px-6 md:px-12 lg:px-16 pt-24 pb-16" style={{ maxWidth: '1500px' }}>
              <div className={`flex flex-col ${settings?.youtubeHeroLink ? 'lg:flex-row' : ''} items-center gap-10 lg:gap-14`}>
                <div className={`flex flex-col items-start text-left w-full ${settings?.youtubeHeroLink ? 'lg:w-auto lg:min-w-[340px] lg:max-w-[400px] lg:flex-shrink-0' : 'max-w-3xl'}`}>
                  <AnimatedHeading
                    text="We build&#10;hit games."
                    className="font-bold mb-6 text-white w-full drop-shadow-2xl whitespace-nowrap"
                    style={{ fontSize: settings?.youtubeHeroLink ? 'clamp(2.5rem, 7vw, 5.5rem)' : 'clamp(3.5rem, 11vw, 8.5rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}
                    delay={200}
                    charDelay={30}
                  />

                  <FadeIn delay={1100} className="text-base md:text-lg text-gray-200 mb-10 max-w-md font-medium drop-shadow-md" style={{ lineHeight: 1.65 }}>
                    <p>A full-cycle Roblox studio specializing in development and live-ops.</p>
                  </FadeIn>

                  <FadeIn delay={1500}>
                    <div className="flex flex-wrap gap-4 mb-10">
                      <Link to="/games">
                        <button className="btn-pill btn-pill-solid shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                          See Our Games
                        </button>
                      </Link>
                      <a href="/contact">
                        <button className="btn-pill bg-white/10 backdrop-blur-md">
                          Work With Us <span style={{ fontSize: 12 }}>↗</span>
                        </button>
                      </a>
                    </div>
                  </FadeIn>

                  {/* Slide dot indicators */}
                  {slideGames.length > 1 && (
                    <FadeIn delay={1800}>
                      <div className="hero-slide-dots liquid-glass px-4 py-2 rounded-full inline-flex">
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

                {settings?.youtubeHeroLink && (
                  <FadeIn delay={1500} className="w-full lg:flex-1 lg:min-w-0 relative">
                    <div className="aspect-video w-full rounded-2xl overflow-hidden liquid-glass relative z-10">
                      <iframe
                        src={settings.youtubeHeroLink}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </FadeIn>
                )}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-80 bg-gradient-to-t from-[#080808] to-transparent z-10 pointer-events-none" />
        </section>


        {/* ─── GAMES ────────────────────────────────────────── */}
        <section id="games" className="bg-transparent py-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8 px-6 md:px-12 lg:px-16">
              <div>
                <SectionReveal delay={60}><h2 className="text-4xl md:text-6xl font-bold" style={{ letterSpacing: '-0.03em' }}>Our Games</h2></SectionReveal>
              </div>
              <SectionReveal>
                <Link to="/games">
                  <button className="btn-pill btn-pill-sm liquid-glass !border-white/20 hover:bg-white/20">
                    View All <span style={{ fontSize: 11 }}>↗</span>
                  </button>
                </Link>
              </SectionReveal>
            </div>

            {games.length === 0 ? (
              <div className="flex gap-4 px-6 overflow-hidden justify-center">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="liquid-glass animate-pulse flex-shrink-0" style={{ width: 260, height: 380 }} />
                ))}
              </div>
            ) : (
              <SectionReveal>
                <GameCarousel games={games} />
              </SectionReveal>
            )}
          </div>
        </section>

        {/* ── CCU CHART ────────────────────────────────────── */}
        <section className="bg-transparent w-full relative z-[100]">
          <SectionReveal>
            <CCUChart />
          </SectionReveal>
        </section>

        {/* ─── IMPACT ──────────────────────────────────── */}
        <section id="impact" className="bg-transparent py-16 md:py-28 px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left Text */}
            <div className="flex flex-col justify-center">
              <SectionReveal delay={60}><h2 className="text-4xl md:text-6xl font-bold mb-6" style={{ letterSpacing: '-0.03em', lineHeight: 1.0 }}>The Switch<br />Effect.</h2></SectionReveal>
              <SectionReveal delay={120}>
                <p className="text-base md:text-lg text-gray-200 mb-5" style={{ lineHeight: 1.7 }}>
                  Before us, your game might be struggling to find its footing or growing at a snail's pace. We change the trajectory.
                </p>
              </SectionReveal>
              <SectionReveal delay={180}>
                <p className="text-base text-gray-200 mb-8" style={{ lineHeight: 1.7 }}>
                  When we partner with you, we bring our expertise in game design, community building, and live-ops strategy to ignite exponential growth. 
                </p>
              </SectionReveal>
              <SectionReveal delay={240}>
                <Link to="/contact">
                  <button className="btn-pill btn-pill-solid shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                    Partner With Us
                  </button>
                </Link>
              </SectionReveal>
            </div>

            {/* Right Chart */}
            <SectionReveal>
              <div className="liquid-glass group" style={{ height: 520, padding: '24px 0 48px' }}>
                <GrowthChart />
              </div>
            </SectionReveal>
          </div>
        </section>


        {/* ─── BLOG PREVIEW ─────────────────────────────────── */}
        <section className="bg-transparent py-16 md:py-24 px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto relative">
            {/* Floating standalone Robux */}
            <div 
              className="absolute z-50 pointer-events-none" 
              style={{ top: '-110px', left: '20px', animation: 'robux-float-v2 9s ease-in-out infinite' }}
            >
              <img src="/gold-robux-new.png" alt="" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl" />
            </div>
            <div className="flex items-end justify-between mb-10">
              <div>
                <SectionReveal delay={60}><h2 className="text-4xl md:text-6xl font-bold" style={{ letterSpacing: '-0.03em' }}>News & Updates</h2></SectionReveal>
              </div>
              <SectionReveal>
                <Link to="/blog">
                  <button className="hidden md:flex btn-pill btn-pill-sm liquid-glass !border-white/20 hover:bg-white/20">
                    All Posts <span style={{ fontSize: 11 }}>↗</span>
                  </button>
                </Link>
              </SectionReveal>
            </div>
            <SectionReveal>
              {latestPosts.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {latestPosts.map(post => (
                    <div key={post.id} className="liquid-glass p-2">
                      <BlogCard post={post} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="liquid-glass p-8 text-center">
                  <p className="text-gray-300">No posts yet. Check back soon.</p>
                </div>
              )}
            </SectionReveal>
          </div>
        </section>

        {/* ─── STUDIO ───────────────────────────────────────── */}
        <section id="studio" className="bg-transparent py-16 md:py-32 px-6 md:px-12 lg:px-16 flex justify-center">
          <div className="max-w-7xl w-full relative flex flex-col md:block">
            
            {/* The Video Layer (Large and Cinematic) */}
            <SectionReveal>
              <div className="relative">
                {/* Bloxy Award floating on the left corner of the video */}
                <style>{`
                  @keyframes bloxy-float {
                    0% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-15px) rotate(3deg); }
                    100% { transform: translateY(0px) rotate(0deg); }
                  }
                `}</style>
                <div 
                  className="absolute z-50 pointer-events-none" 
                  style={{ bottom: '-30px', left: '-30px', animation: 'bloxy-float 6s ease-in-out infinite' }}
                >
                  <div className="relative group cursor-pointer pointer-events-auto">
                    <div className="absolute inset-0 bg-[#DAA520] opacity-30 blur-3xl rounded-full group-hover:opacity-70 group-hover:blur-2xl transition-all duration-500" />
                    <img 
                      src="/bloxy.png" 
                      alt="Bloxy Award" 
                      className="w-48 md:w-64 lg:w-72 h-auto object-contain drop-shadow-[0_0_20px_rgba(218,165,32,0.5)] relative z-10 group-hover:scale-110 group-hover:drop-shadow-[0_0_40px_rgba(255,215,0,0.8)] transition-all duration-500 group-hover:-translate-y-4" 
                    />
                  </div>
                </div>
                
                <div className="w-full md:w-9/12 lg:w-8/12 rounded-[2rem] overflow-hidden relative shadow-2xl border border-white/10" style={{ height: 'max(600px, 60vh)' }}>
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
                  <source src="/backgroundvideo.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-black/80 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none md:hidden" />
              </div>
              </div>
            </SectionReveal>

            {/* The Floating Text Glass Panel (Overlapping on Desktop, Stacked on Mobile) */}
            <div className="relative md:absolute md:top-1/2 md:right-0 md:transform md:-translate-y-1/2 w-full md:w-5/12 lg:w-5/12 z-10 -mt-20 md:mt-0 px-4 md:px-0">
              {/* Floating standalone Robux */}
              <div 
                className="absolute z-50 pointer-events-none" 
                style={{ top: '-70px', right: '-40px', animation: 'robux-float-v2 7.5s ease-in-out infinite' }}
              >
                <img src="/gold-robux-new.png" alt="" className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl" />
              </div>
              <SectionReveal delay={150}>
                <div className="liquid-glass liquid-glass-hover p-8 md:p-14 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl bg-[#0a0a0a]/70 border-white/10">
                  <h2 className="text-4xl md:text-6xl font-bold mb-8 text-white" style={{ letterSpacing: '-0.03em', lineHeight: 1.0 }}>
                    We are Switch.
                  </h2>
                  <p className="text-base md:text-lg text-gray-200 mb-6" style={{ lineHeight: 1.7 }}>
                    Roblox reaches over 80 million daily active players. We help brands and creators tap into that audience with high-retention gameplay.
                  </p>
                  <p className="text-base text-gray-400 mb-10" style={{ lineHeight: 1.7 }}>
                    Our studio specializes in full-cycle game development, monetization design, and post-launch live-ops to keep your player base growing.
                  </p>
                  <div className="flex items-center gap-6 pt-6 border-t border-white/10">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white tracking-tight">80M+</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-gray-500 mt-1 font-semibold">Daily Players</span>
                    </div>
                  </div>
                </div>
              </SectionReveal>
            </div>
          </div>
        </section>

        {/* ─── PROCESS ──────────────────────────────────────── */}
        <section className="bg-transparent pt-24 pb-8 px-6 md:px-12 lg:px-16">
          <div className="max-w-7xl mx-auto relative">
            {/* Floating standalone Robux */}
            <div 
              className="absolute z-50 pointer-events-none" 
              style={{ top: '-40px', left: '10px', animation: 'robux-float-v2 8.5s ease-in-out infinite' }}
            >
              <img src="/gold-robux-new.png" alt="" className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-2xl" />
            </div>
            <SectionReveal delay={60}>
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-bold" style={{ letterSpacing: '-0.03em' }}>
                  Execution is everything.
                </h2>
              </div>
            </SectionReveal>
            
            <div className="liquid-glass p-10 md:p-14 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="grid md:grid-cols-4 gap-10 md:gap-8 relative z-10">
                {[
                  { n: '01', title: 'Discovery', desc: 'We learn your game, audience, and goals. We find the live-ops strategy that fits.' },
                  { n: '02', title: 'Design', desc: 'World concept, visual identity, game loop. Every detail designed before a single block is placed.' },
                  { n: '03', title: 'Build', desc: 'Our developers and designers build fast, with weekly playtests and full transparency.' },
                  { n: '04', title: 'Launch', desc: 'We handle publishing, QA, and post-launch analytics. You own the world.' },
                ].map((step, i) => (
                  <SectionReveal key={step.n} delay={i * 120}>
                    <div className="relative group flex flex-col h-full">
                      {/* Connecting Line (hidden on last item and mobile) */}
                      {i !== 3 && (
                        <div className="hidden md:block absolute top-7 left-[40%] w-[120%] h-[1px] bg-gradient-to-r from-white/20 via-white/10 to-transparent pointer-events-none" />
                      )}
                      
                      <div className="w-14 h-14 rounded-full border border-white/20 bg-black/50 backdrop-blur-md flex items-center justify-center text-lg font-bold mb-6 group-hover:scale-110 group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)] group-hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] z-10">
                        {step.n}
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-3 text-white tracking-tight">{step.title}</h3>
                      <p className="text-sm text-gray-400 font-sans" style={{ lineHeight: 1.7 }}>{step.desc}</p>
                    </div>
                  </SectionReveal>
                ))}
              </div>
            </div>

            {/* OVERSIZED CONVEYOR BELT */}
            <SectionReveal delay={100}>
              <h2 className="text-4xl md:text-5xl font-bold text-center mt-32 mb-8 text-white drop-shadow-lg" style={{ letterSpacing: '-0.03em' }}>
                What we do
              </h2>
            </SectionReveal>
            <SectionReveal delay={200}>
              <div className="relative w-[100vw] left-1/2 -translate-x-1/2 overflow-hidden">
                <style>{`
                  @keyframes conveyor-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                  }
                `}</style>
                <div 
                  className="flex whitespace-nowrap will-change-transform w-max"
                  style={{ animation: 'conveyor-scroll 48s linear infinite' }}
                >
                  {[0, 1].map((loopIdx) => (
                    <React.Fragment key={loopIdx}>
                      {/* Segment A */}
                      <div className="relative w-[240vw] md:w-[120vw] lg:w-[80vw] shrink-0">
                        <img src="/conveyor-seamless-v6.png" alt="" className="w-full h-auto object-cover pointer-events-none drop-shadow-2xl" />
                        {[
                          { left: '0%', text: 'Game Design' },
                          { left: '33.333%', text: 'Full-Cycle Dev' },
                          { left: '66.666%', text: 'Live-Ops' }
                        ].map((box, boxIdx) => (
                          <div 
                            key={boxIdx}
                            className="absolute drop-shadow-2xl flex flex-col items-center justify-center pointer-events-none w-[22%]" 
                            style={{ top: '35%', left: box.left, transform: 'translate(-50%, -50%)' }}
                          >
                            <img src="/gold-box.png" alt="" className="w-full h-auto object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center pt-[12%]">
                              <span className="text-white font-black text-[clamp(0.5rem,2.5vw,1rem)] lg:text-base text-center px-4 leading-tight uppercase tracking-[0.15em]" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.5)' }}>
                                {box.text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Segment B */}
                      <div className="relative w-[240vw] md:w-[120vw] lg:w-[80vw] shrink-0">
                        <img src="/conveyor-seamless-v6.png" alt="" className="w-full h-auto object-cover pointer-events-none drop-shadow-2xl" />
                        {[
                          { left: '0%', text: 'Monetization' },
                          { left: '33.333%', text: 'Partnerships' },
                          { left: '66.666%', text: 'Acquisitions' }
                        ].map((box, boxIdx) => (
                          <div 
                            key={boxIdx}
                            className="absolute drop-shadow-2xl flex flex-col items-center justify-center pointer-events-none w-[22%]" 
                            style={{ top: '35%', left: box.left, transform: 'translate(-50%, -50%)' }}
                          >
                            <img src="/gold-box.png" alt="" className="w-full h-auto object-contain" />
                            <div className="absolute inset-0 flex items-center justify-center pt-[12%]">
                              <span className="text-white font-black text-[clamp(0.5rem,2.5vw,1rem)] lg:text-base text-center px-4 leading-tight uppercase tracking-[0.15em]" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.5)' }}>
                                {box.text}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </SectionReveal>
          </div>
        </section>

        {/* ─── CTA ──────────────────────────────────────────── */}
        <section id="contact" className="pt-12 pb-40 px-6 md:px-12 lg:px-16 relative overflow-hidden w-full">
          <div className="absolute inset-0 z-0" style={{ opacity: 0.15 }}>
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260421_102157_ad7d8fd0-1039-4516-8d40-db76927cc9c5.mp4" type="video/mp4" />
            </video>
          </div>
          {/* Top fade (grey to match the background) and Bottom fade to black */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#080808] from-[10%] via-black/60 via-[50%] to-black to-[95%] z-[1]" />

          <div className="max-w-4xl mx-auto text-center relative z-10 py-16">
            <SectionReveal delay={60}>
              <h2 className="font-bold mb-6 text-white drop-shadow-lg" style={{ fontSize: 'clamp(2.8rem, 7vw, 5.5rem)', letterSpacing: '-0.04em', lineHeight: 0.95 }}>
                Ready to Switch?
              </h2>
            </SectionReveal>
            <SectionReveal delay={120}>
              <p className="text-base md:text-lg text-gray-200 mb-10 max-w-lg mx-auto drop-shadow-md" style={{ lineHeight: 1.7 }}>
                Whether you're launching a new title or looking to scale an existing game through live-ops, we'd love to talk.
              </p>
            </SectionReveal>
            <SectionReveal delay={180}>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="btn-pill btn-pill-solid shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                  Start a Project
                </button>
                <a href="mailto:hello@playswitchgames.com">
                  <button className="btn-pill bg-white/10 backdrop-blur-md border-white/30">
                    hello@playswitchgames.com
                  </button>
                </a>
              </div>
            </SectionReveal>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
