import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'
import HeroBgSlideshow from '../components/HeroBgSlideshow'
import RobuxPattern from '../components/RobuxPattern'
import ValuesCarousel from '../components/ValuesCarousel'
import WhyUsSection from '../components/WhyUsSection'
import { getGames } from '../api'
import type { Game } from '../types'

export default function AboutPage() {
  const [games, setGames] = useState<Game[]>([])

  useEffect(() => {
    getGames().then(setGames).catch(() => {})
  }, [])

  return (
    <div className="bg-[#080808] bg-pattern text-white min-h-screen font-sans selection:bg-white/20 relative [overflow-x:clip]">
      <SEOMeta
        title="About Us"
        description="Learn about The Block — a next-generation Roblox studio and live-ops publisher."
      />

      {/* Floating subtle background pattern */}
      <div className="absolute top-0 left-0 w-full h-[120vh] pointer-events-none z-0 overflow-hidden">
        <RobuxPattern />
      </div>

      <div className="relative z-50">
        <Nav />
      </div>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="min-h-[75vh] bg-transparent relative flex items-center overflow-hidden pt-28 pb-16">
        <HeroBgSlideshow games={games} scaleFactor={1} />
        <div className="absolute inset-0 bg-black/70 z-[1]" />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)',
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#080808] to-transparent z-[2] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 relative z-10 w-full py-12">
          <SectionReveal delay={60}>
            <h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold font-heading mb-6 tracking-tight"
              style={{ lineHeight: 0.98, letterSpacing: '-0.035em' }}
            >
              Building the<br />future of play.
            </h1>
          </SectionReveal>

          <SectionReveal delay={180}>
            <p
              className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl font-normal leading-relaxed mb-10"
              style={{ lineHeight: 1.7 }}
            >
              We are a next-generation Roblox studio and live-ops publisher. We partner with visionary creators and global brands to engineer category-defining experiences with industry-leading retention.
            </p>
          </SectionReveal>

          <SectionReveal delay={240}>
            <div className="flex flex-wrap gap-4">
              <Link to="/contact">
                <button className="btn-primary">
                  Partner With Us
                </button>
              </Link>
              <Link to="/games">
                <button className="btn-secondary">
                  Explore Our Games <span style={{ fontSize: 13 }}>↗</span>
                </button>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* ── WHY THE BLOCK (2x2 Metrics & Value Prop) ──── */}
      <WhyUsSection companyName="The Block" />

      {/* ── 3D VALUES ROTATING CAROUSEL ──────────────────── */}
      <section id="values" className="bg-[#000000] py-16 md:py-28 relative z-10">
        <ValuesCarousel />
      </section>

      {/* ── PILLARS / HOW WE OPERATE ─────────────────────── */}
      <section className="py-20 md:py-32 px-6 md:px-12 lg:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <SectionReveal delay={60}>
              <h2
                className="text-3xl sm:text-4xl md:text-6xl font-extrabold font-heading text-white"
                style={{ letterSpacing: '-0.035em', lineHeight: 1.05 }}
              >
                Engineered for longevity.
              </h2>
            </SectionReveal>
          </div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                title: 'Platform-Native Mastery',
                desc: 'We build exclusively for the speed, social architecture, and virality of the Roblox ecosystem. Our mechanics resonate with the community from day one.',
              },
              {
                title: 'Data-Driven Live-Ops',
                desc: 'Launch day is just the start. We utilize granular telemetry and rapid weekly release pipelines to optimize monetization, retention, and player happiness.',
              },
              {
                title: 'Creator Co-Founders',
                desc: 'We treat our creator partners as equity co-founders. We invest our capital, design team, and engineering power to turn your creative vision into an enduring enterprise.',
              },
              {
                title: 'Uncompromised Polish',
                desc: 'From custom UI and audio design to seamless netcode and zero-lag rendering, we uphold the highest bar of technical quality on the platform.',
              },
            ].map((pillar, idx) => (
              <SectionReveal key={pillar.title} delay={100 * (idx + 1)}>
                <div className="liquid-glass p-8 md:p-10 rounded-2xl h-full border border-white/10 flex flex-col justify-between group hover:border-[#3B82F6]/50 transition-colors">
                  <div>
                    <h3 className="text-2xl font-extrabold font-heading text-white mb-4">
                      {pillar.title}
                    </h3>
                    <p className="text-sm md:text-base text-gray-300 font-sans leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── READY TO BUILD CTA ───────────────────────────── */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-16 border-t border-white/10 bg-black/60 relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <SectionReveal delay={60}>
            <h2
              className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-heading mb-6 text-white"
              style={{ letterSpacing: '-0.035em', lineHeight: 1.0 }}
            >
              Ready to Build?
            </h2>
          </SectionReveal>

          <SectionReveal delay={120}>
            <p className="text-base sm:text-lg text-gray-300 mb-10 max-w-xl mx-auto leading-relaxed">
              Whether you are developing a new title, seeking publisher funding, or looking to supercharge live-ops, we would love to connect.
            </p>
          </SectionReveal>

          <SectionReveal delay={180}>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <button className="btn-primary">
                  Start a Project
                </button>
              </Link>
              <Link to="/careers">
                <button className="btn-secondary">
                  Join Our Team <span style={{ fontSize: 13 }}>↗</span>
                </button>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
