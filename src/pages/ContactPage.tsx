import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SectionReveal from '../components/SectionReveal'
import { submitContact } from '../api'

const ENQUIRY_TYPES = [
  'Live-Ops Partnership',
  'Game Development',
  'Licensing & UGC',
  'Press & Media',
  'Careers',
  'General Enquiry',
]

const INPUT = 'w-full bg-white/[0.04] border border-white/[0.08] rounded-full px-5 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors'

export default function ContactPage() {
  const [searchParams] = useSearchParams()
  const isCareers = searchParams.get('topic') === 'careers'
  const formRef = useRef<HTMLFormElement>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    enquiryType: isCareers ? 'Careers' : '',
    message: isCareers ? "Hi Switch team, I'd like to send my CV for future roles." : '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  useEffect(() => {
    if (!isCareers || !formRef.current) return
    const top = formRef.current.getBoundingClientRect().top + window.scrollY - 120
    window.scrollTo({ top: Math.max(top, 0), left: 0 })
  }, [isCareers])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    try {
      await submitContact({ ...form, createdAt: new Date().toISOString() })
      // Also trigger email notification (non-blocking)
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }).catch(() => {})
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-black text-white min-h-screen flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-8 border border-white/10 bg-white/[0.03]">
              <span style={{ fontSize: 28 }}>✓</span>
            </div>
            <h1 className="text-3xl font-medium mb-4" style={{ letterSpacing: '-0.03em' }}>Message sent.</h1>
            <p className="text-gray-400 mb-8" style={{ lineHeight: 1.7 }}>
              Thanks for reaching out. We read every message and will get back to you within 48 hours.
            </p>
            <Link to="/">
              <button className="btn-pill btn-pill-solid">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />

      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-20 items-start">

            {/* Left */}
            <div className="md:sticky" style={{ top: 120 }}>
              <SectionReveal>

              </SectionReveal>
              <SectionReveal delay={60}>
                <h1 className="text-5xl md:text-6xl font-medium mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
                  Let's build<br />something.
                </h1>
              </SectionReveal>
              <SectionReveal delay={120}>
                <p className="text-base text-gray-400 mb-10" style={{ lineHeight: 1.7 }}>
                  Whether you're a developer, a studio, or just want to talk games, we'd love to hear from you. We reply to every message.
                </p>
              </SectionReveal>

              <SectionReveal delay={180}>
                <div className="space-y-4">
                  {[
                    { label: 'Email', value: 'hello@playswitchgames.com', href: 'mailto:hello@playswitchgames.com' },
                    { label: 'Careers', value: 'See open roles', href: '/careers' },
                  ].map(item => (
                    <div key={item.label} className="rounded-xl px-5 py-4 border border-white/[0.06] bg-white/[0.02]">
                      <p className="text-xs uppercase tracking-[0.15em] text-gray-500 mb-1">{item.label}</p>
                      <a href={item.href} className="text-sm text-white hover:text-gray-400 transition-colors">
                        {item.value}
                      </a>
                    </div>
                  ))}
                </div>
              </SectionReveal>
            </div>

            {/* Right: Form */}
            <SectionReveal>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Name *</label>
                    <input
                      type="text" value={form.name}
                      onChange={e => set('name', e.target.value)}
                      className={INPUT} placeholder="Your name" required
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Email *</label>
                    <input
                      type="email" value={form.email}
                      onChange={e => set('email', e.target.value)}
                      className={INPUT} placeholder="you@company.com" required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Studio / Game</label>
                  <input
                    type="text" value={form.company}
                    onChange={e => set('company', e.target.value)}
                    className={INPUT} placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">What's this about?</label>
                  <div className="flex flex-wrap gap-2">
                    {ENQUIRY_TYPES.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => set('enquiryType', type)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors border ${
                          form.enquiryType === type
                            ? 'bg-white text-black border-white'
                            : 'border-white/15 text-gray-400 hover:text-white hover:border-white/30'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.15em] text-gray-500 mb-2">Message *</label>
                  <textarea
                    value={form.message}
                    onChange={e => set('message', e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-2xl px-5 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-white/20 transition-colors resize-none" rows={6}
                    placeholder="Tell us what you're working on, what you need, or just say hi."
                    required
                  />
                </div>

                {status === 'error' && (
                  <p className="text-sm text-red-400">Something went wrong. Try emailing us directly at hello@playswitchgames.com</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending' || !form.name || !form.email || !form.message}
                  className="w-full btn-pill btn-pill-solid py-4 text-sm disabled:opacity-40"
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </SectionReveal>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
