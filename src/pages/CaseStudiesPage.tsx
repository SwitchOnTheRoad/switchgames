import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'
import { getCaseStudies } from '../api'
import type { CaseStudy } from '../types'

export default function CaseStudiesPage() {
  const [cases, setCases] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCaseStudies()
      .then(data => setCases(data.filter(c => c.published)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title="Case Studies" description="How Switch builds live-ops driven experiences inside Roblox that players actually love." />
      <Nav />

      <div className="pt-40 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>

          </SectionReveal>
          <SectionReveal delay={60}>
            <h1 className="text-5xl md:text-6xl font-normal mb-4" style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              Case Studies
            </h1>
          </SectionReveal>
          <SectionReveal delay={120}>
            <p className="text-base md:text-lg text-gray-300 mb-16 max-w-xl" style={{ lineHeight: 1.7 }}>
              Real games. Real worlds. Real results.
            </p>
          </SectionReveal>

          {loading ? (
            <div className="grid md:grid-cols-2 gap-5">
              {[...Array(2)].map((_, i) => <div key={i} className="rounded-2xl h-80 animate-pulse border border-white/[0.06] bg-white/[0.02]" />)}
            </div>
          ) : cases.length === 0 ? (
            <SectionReveal>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-16 text-center max-w-xl mx-auto">
                <p className="text-3xl mb-4" style={{ letterSpacing: '-0.03em' }}>Coming soon.</p>
                <p className="text-sm text-gray-300 mb-8" style={{ lineHeight: 1.7 }}>
                  We're scaling our next live-ops hit. Want to partner with us?
                </p>
                <Link to="/contact">
                  <button className="btn-pill btn-pill-solid">
                    Get in Touch
                  </button>
                </Link>
              </div>
            </SectionReveal>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {cases.map((c, i) => (
                <SectionReveal key={c.id} delay={i * 80}>
                  <Link to={`/work/${c.slug}`} className="block group">
                    <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-white/[0.02] h-full">
                      <div className="relative h-64 overflow-hidden">
                        {c.coverVideoUrl ? (
                          <video autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
                            <source src={c.coverVideoUrl} type="video/mp4" />
                          </video>
                        ) : c.coverImageUrl ? (
                          <img src={c.coverImageUrl} alt={c.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full" style={{ background: 'rgba(255,255,255,0.03)' }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                          {c.tags.map(tag => (
                            <span key={tag} className="rounded-full px-3 py-1 text-xs text-gray-400 border border-white/10 bg-white/[0.02]">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-6">
                        <p className="text-xs uppercase tracking-widest text-gray-300 mb-2">{c.brand}</p>
                        <h3 className="text-xl font-semibold mb-2" style={{ letterSpacing: '-0.02em' }}>{c.title}</h3>
                        <p className="text-sm text-gray-300" style={{ lineHeight: 1.65 }}>{c.excerpt}</p>
                        <p className="text-xs text-white/40 mt-4 uppercase tracking-widest group-hover:text-white transition-colors">Read case study →</p>
                      </div>
                    </div>
                  </Link>
                </SectionReveal>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
