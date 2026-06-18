import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import { getCaseStudyBySlug } from '../api'
import type { CaseStudy } from '../types'

export default function CaseStudyDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [cs, setCs] = useState<CaseStudy | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    getCaseStudyBySlug(slug).then(setCs).catch(() => setCs(null)).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="bg-black min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border border-white/20 animate-pulse" /></div>
  if (!cs) return <div className="bg-black text-white min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-gray-300 mb-4">Not found.</p><Link to="/work" className="text-white underline text-sm">← Work</Link></div></div>

  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title={`${cs.brand} × Switch`} description={cs.excerpt} />
      <Nav />

      {/* Cover */}
      <div className="relative h-[55vh] overflow-hidden">
        {cs.coverVideoUrl ? (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={cs.coverVideoUrl} type="video/mp4" />
          </video>
        ) : cs.coverImageUrl ? (
          <img src={cs.coverImageUrl} alt={cs.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : <div className="absolute inset-0 bg-white/3" />}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
      </div>

      <div className="px-6 md:px-12 lg:px-16 pb-24 pt-0 max-w-4xl mx-auto">
        <Link to="/work" className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors uppercase tracking-widest mt-10 mb-8">
          ← Work
        </Link>
        <p className="text-xs uppercase tracking-widest text-gray-300 mb-2">{cs.brand}</p>
        <h1 className="text-4xl md:text-5xl font-normal mb-4" style={{ letterSpacing: '-0.04em', lineHeight: 1.0 }}>{cs.title}</h1>
        <div className="flex flex-wrap gap-2 mb-10 pb-10" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          {cs.tags.map(tag => (
            <span key={tag} className="rounded-full px-3 py-1 text-xs text-gray-400 border border-white/10 bg-white/[0.02]">{tag}</span>
          ))}
        </div>

        <div className="space-y-12">
          {cs.challenge && (
            <div>

              <p className="text-base text-gray-300" style={{ lineHeight: 1.8 }}>{cs.challenge}</p>
            </div>
          )}
          {cs.solution && (
            <div>

              <p className="text-base text-gray-300" style={{ lineHeight: 1.8 }}>{cs.solution}</p>
            </div>
          )}
          {cs.results && (
            <div>

              <p className="text-base text-gray-300" style={{ lineHeight: 1.8 }}>{cs.results}</p>
            </div>
          )}
        </div>

        <div className="mt-16 pt-10" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="text-sm text-gray-300 mb-4">Want results like this for your game?</p>
          <Link to="/contact">
            <button className="btn-pill btn-pill-solid">
              Work With Us
            </button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
