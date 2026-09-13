import RobuxPattern from '../components/RobuxPattern'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import HeroBgSlideshow from '../components/HeroBgSlideshow'
import { getGames, getJobs } from '../api'
import SEOMeta from '../components/SEOMeta'
import type { Game, Job } from '../types'

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Production', 'Marketing', 'Other']

const BENEFITS = [
  { n: '01', title: 'Remote First', desc: 'Work from anywhere. We collaborate async and meet when it matters.' },
  { n: '02', title: 'Competitive Pay', desc: 'Fair compensation that reflects your skills and experience.' },
  { n: '03', title: 'Game Access', desc: 'Free access to everything in our portfolio, including early builds.' },
  { n: '04', title: 'Learning Budget', desc: 'Annual allowance for courses, books, or tools that help you grow.' },
  { n: '05', title: 'Flexible Hours', desc: 'Core hours keep the team aligned, with flexibility around them.' },
  { n: '06', title: 'Small Team', desc: 'Your work has real impact. No bureaucracy, just building.' },
]

const TYPE_COLORS: Record<string, string> = {
  'Full-time': 'border-white/15 text-gray-400',
  'Part-time': 'border-white/15 text-gray-400',
  'Contract': 'border-yellow-400/25 text-yellow-300',
  'Internship': 'border-blue-400/25 text-blue-300',
}

import VisitsChart from '../components/VisitsChart'

export default function CareersPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [dept, setDept] = useState('All')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getJobs()
      .then(data => setJobs(data.filter(j => j.open)))
      .finally(() => setLoading(false))
    getGames().then(setGames).catch(() => {})
  }, [])

  const filtered = dept === 'All' ? jobs : jobs.filter(j => j.department === dept)

  return (
    <div className="bg-[#080808] bg-pattern text-white min-h-screen font-sans selection:bg-white/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[120vh] pointer-events-none z-0 overflow-hidden"><RobuxPattern /></div>
      <div className="relative z-50"><Nav /></div>
      <SEOMeta title="Careers" description="Join Switch. Build the future of gaming." />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="min-h-[70vh] bg-transparent relative flex items-center overflow-hidden">
        <HeroBgSlideshow games={games} scaleFactor={1} />
        <div className="absolute inset-0 bg-black/65 z-[1]" />
        <div
          className="absolute inset-0 z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent z-[2] pointer-events-none" />

        <div className="relative z-10 px-6 md:px-12 lg:px-16 pt-32 pb-16 max-w-5xl">

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white" style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
            Build the future<br />of gaming.
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-lg" style={{ lineHeight: 1.7 }}>
            We're a small team doing big things. If you want your work to be played by millions, Switch is the place.
          </p>
        </div>
      </section>

      {/* ── VISITS CHART ─────────────────────────────────── */}
      <section className="bg-transparent w-full relative z-[100]">
        <SectionReveal>
          <VisitsChart />
        </SectionReveal>
      </section>

      {/* ── OPEN POSITIONS ───────────────────────────────── */}
      <section className="bg-transparent py-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">

          <SectionReveal delay={60}>
            <h2 className="text-4xl md:text-5xl font-bold mb-8" style={{ letterSpacing: '-0.03em' }}>
              {jobs.length > 0 ? `${jobs.length} open position${jobs.length !== 1 ? 's' : ''}.` : 'Open positions.'}
            </h2>
          </SectionReveal>

          {/* Department filter */}
          <SectionReveal delay={120}>
            <div className="flex flex-wrap gap-2 mb-10">
              {DEPARTMENTS.map(d => (
                <button
                  key={d}
                  onClick={() => setDept(d)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                    dept === d ? 'bg-white text-black border-white' : 'border-white/15 text-gray-400 hover:text-white hover:border-white/30'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </SectionReveal>

          {/* Job list */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl h-20 animate-pulse border border-white/5 bg-white/[0.02]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <SectionReveal>
              <div className="liquid-glass text-center p-10">
                <p className="text-gray-400 mb-4">No open roles in this department right now.</p>
                <Link to="/contact?topic=careers" className="btn-pill btn-pill-sm">
                  <span>
                    Send us your CV anyway <span style={{ fontSize: 11 }}>↗</span>
                  </span>
                </Link>
              </div>
            </SectionReveal>
          ) : (
            <div className="space-y-3">
              {filtered.map((job, i) => (
                <SectionReveal key={job.id} delay={i * 50}>
                  <div className="liquid-glass overflow-hidden">
                    {/* Header row */}
                    <button
                      className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setExpanded(expanded === job.id ? null : job.id)}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div>
                          <h3 className="font-bold text-base" style={{ letterSpacing: '-0.01em' }}>{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-xs text-gray-500">{job.department}</span>
                            <span className="text-white/15 text-xs">·</span>
                            <span className="text-xs text-gray-500">{job.location}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`rounded-full px-3 py-0.5 text-xs border ${TYPE_COLORS[job.type] || 'border-white/15 text-gray-400'}`}>
                          {job.type}
                        </span>
                        <span
                          className="text-gray-500 transition-transform duration-300"
                          style={{ transform: expanded === job.id ? 'rotate(180deg)' : 'none', display: 'inline-block' }}
                        >
                          ↓
                        </span>
                      </div>
                    </button>

                    {/* Expanded detail */}
                    {expanded === job.id && (
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="px-6 py-6">
                        <p className="text-sm text-gray-400 mb-5" style={{ lineHeight: 1.7 }}>{job.description}</p>
                        {job.requirements && (
                          <div className="mb-6">
                            <p className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-3">What we're looking for</p>
                            <ul className="space-y-2">
                              {job.requirements.split('\n').filter(Boolean).map((req, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-gray-400">
                                  <span className="text-white/20 mt-0.5">—</span>
                                  <span>{req}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Link
                          to={`/careers/${job.id}/apply`}
                          className="btn-pill btn-pill-solid"
                        >
                          Apply for this role <span style={{ fontSize: 11 }}>↗</span>
                        </Link>
                      </div>
                    )}
                  </div>
                </SectionReveal>
              ))}
            </div>
          )}

          {/* Bottom CTA */}
          {jobs.length > 0 && (
            <SectionReveal>
              <div className="mt-8 liquid-glass p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="font-medium mb-1">Don't see your role?</p>
                  <p className="text-sm text-gray-400">We're always open to exceptional people. Send us your CV and tell us what you'd bring.</p>
                </div>
                <a href="mailto:hello@playswitchgames.com" className="flex-shrink-0 btn-pill">
                  Get in Touch <span style={{ fontSize: 11 }}>↗</span>
                </a>
              </div>
            </SectionReveal>
          )}
        </div>
      </section>

      <div className="relative z-10"><Footer /></div>
    </div>
  )
}




