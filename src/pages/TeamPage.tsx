import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'
import { getTeam } from '../api'
import type { TeamMember } from '../types'

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeam().then(setTeam).finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title="Team" description="Meet the people building Switch." />
      <Nav />

      {/* ── HERO ── */}
      <section className="pt-40 pb-20 px-6 md:px-12 lg:px-16 relative overflow-hidden">
        <div className="absolute inset-0 z-0" style={{ opacity: 0.07 }}>
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260418_094631_d30ab262-45ee-4b7d-99f3-5d5848c8ef13.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionReveal>
            <p className="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">Team</p>
          </SectionReveal>
          <SectionReveal delay={60}>
            <h1 className="text-5xl md:text-7xl font-medium mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              The people<br />behind Switch.
            </h1>
          </SectionReveal>
          <SectionReveal delay={120}>
            <p className="text-base md:text-lg text-gray-400 max-w-xl" style={{ lineHeight: 1.7 }}>
              Small team. Big output. Every person here shapes what we build and how we build it.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* ── TEAM GRID ── */}
      <section className="pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl h-80 animate-pulse border border-white/5 bg-white/[0.02]" />
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {team.map((member, i) => (
                <SectionReveal key={member.id} delay={i * 80}>
                  <div className="rounded-2xl border border-white/[0.06] overflow-hidden group bg-white/[0.02]">
                    {/* Avatar */}
                    <div className="relative h-64 flex items-center justify-center overflow-hidden">
                      {member.imageUrl ? (
                        <img
                          src={member.imageUrl}
                          alt={member.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
                          <span className="text-5xl font-semibold text-white/10" style={{ letterSpacing: '-0.04em' }}>
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-0.5" style={{ letterSpacing: '-0.02em' }}>{member.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{member.role}</p>
                      {member.bio && (
                        <p className="text-sm text-gray-400" style={{ lineHeight: 1.65 }}>{member.bio}</p>
                      )}
                      {(member.twitter || member.linkedin) && (
                        <div className="flex gap-3 mt-4">
                          {member.twitter && (
                            <a href={member.twitter} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-[0.12em]">
                              Twitter ↗
                            </a>
                          )}
                          {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-gray-500 hover:text-white transition-colors uppercase tracking-[0.12em]">
                              LinkedIn ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </SectionReveal>
              ))}

              {/* Join us card */}
              <SectionReveal delay={team.length * 80}>
                <a href="/careers" className="block h-full">
                  <div className="rounded-2xl border border-white/[0.06] h-full flex flex-col items-center justify-center p-8 text-center group cursor-pointer hover:border-white/15 transition-colors bg-white/[0.02]" style={{ minHeight: 340 }}>
                    <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-5 group-hover:border-white/25 transition-colors">
                      <span className="text-2xl text-gray-400">+</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2" style={{ letterSpacing: '-0.02em' }}>Join Switch</h3>
                    <p className="text-sm text-gray-400" style={{ lineHeight: 1.65 }}>
                      We're building the team. See open roles →
                    </p>
                  </div>
                </a>
              </SectionReveal>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
