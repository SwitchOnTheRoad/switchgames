import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'
import HeroBgSlideshow from '../components/HeroBgSlideshow'
import RobuxPattern from '../components/RobuxPattern'
import { getGames, getTeam } from '../api'
import type { Game, TeamMember } from '../types'

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeam().then(setTeam).finally(() => setLoading(false))
    getGames().then(setGames).catch(() => {})
  }, [])

  return (
    <div className="bg-[#080808] bg-pattern text-white min-h-screen font-sans selection:bg-white/20 relative overflow-hidden">
      <SEOMeta title="Team" description="Meet the people building Switch." />
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[120vh]">
          <RobuxPattern />
        </div>
      </div>
      <div className="relative z-20"><Nav /></div>

      {/* ── HERO ── */}
      <section className="pt-40 pb-20 px-6 md:px-12 lg:px-16 relative overflow-hidden z-10">
        <HeroBgSlideshow games={games} scaleFactor={1} />
        <div className="absolute inset-0 bg-black/65 z-[1]" />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionReveal delay={60}>
            <h1 className="text-5xl md:text-7xl font-bold mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              The people<br />behind Switch
            </h1>
          </SectionReveal>

        </div>
      </section>

      {/* ── TEAM GRID ── */}
      <section className="pb-24 pt-16 px-6 md:px-12 lg:px-16 relative z-10">
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
                  <div className="liquid-glass liquid-glass-hover overflow-hidden group">
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
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold mb-0.5" style={{ letterSpacing: '-0.02em' }}>{member.name}</h3>
                          <p className="text-sm text-gray-400">{member.role}</p>
                        </div>
                        {(member.twitter || member.linkedin) && (
                          <div className="flex gap-2 mt-1">
                            {member.twitter && (
                              <a href={member.twitter} target="_blank" rel="noopener noreferrer"
                                className="text-gray-500 hover:text-white transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                              </a>
                            )}
                            {member.linkedin && (
                              <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                                className="text-gray-500 hover:text-white transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {member.bio && (
                        <p className="text-sm text-gray-400 mt-3" style={{ lineHeight: 1.65 }}>{member.bio}</p>
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
                    <h3 className="text-lg font-bold mb-2" style={{ letterSpacing: '-0.02em' }}>Join Switch</h3>
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

      <div className="relative z-10"><Footer /></div>
    </div>
  )
}
