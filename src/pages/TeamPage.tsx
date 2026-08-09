import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'
import HeroBgSlideshow from '../components/HeroBgSlideshow'
import { getGames, getTeam } from '../api'
import type { Game, TeamMember } from '../types'
import { Twitter, Linkedin } from 'lucide-react'

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTeam().then(setTeam).finally(() => setLoading(false))
    getGames().then(setGames).catch(() => {})
  }, [])

  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title="Team" description="Meet the people building Switch." />
      <Nav />

      {/* ── HERO ── */}
      <section className="pt-40 pb-20 px-6 md:px-12 lg:px-16 relative overflow-hidden">
        <HeroBgSlideshow games={games} scaleFactor={1} />
        <div className="absolute inset-0 bg-black/65 z-[1]" />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">

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
                  <div className="rounded-2xl border border-white/[0.06] overflow-hidden group bg-white/[0.02] flex flex-col h-full">
                    {/* Avatar */}
                    <div className="pt-8 px-6 flex justify-center">
                      <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/10 relative z-10 flex-shrink-0 bg-white/5">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-3xl font-semibold text-white/20" style={{ letterSpacing: '-0.04em' }}>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-6 flex-1 flex flex-col items-center text-center">
                      <h3 className="text-lg font-semibold mb-0.5" style={{ letterSpacing: '-0.02em' }}>{member.name}</h3>
                      <p className="text-sm text-gray-400 mb-3">{member.role}</p>
                      
                      <div className="text-sm text-gray-400 mb-6 flex-1" style={{ lineHeight: 1.65 }}>
                        {member.bio}
                      </div>

                      <div className="flex gap-3 mt-auto min-h-[40px] items-center justify-center w-full">
                        {member.twitter && (
                          <a href={member.twitter} target="_blank" rel="noopener noreferrer"
                             className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                             title="Twitter">
                            <Twitter size={18} />
                          </a>
                        )}
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer"
                             className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                             title="LinkedIn">
                            <Linkedin size={18} />
                          </a>
                        )}
                      </div>
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
                      We're building the team. See open roles
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
