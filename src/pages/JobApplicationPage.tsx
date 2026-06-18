import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import { getJobById, submitApplication, uploadFile } from '../api'
import type { Job } from '../types'

export default function JobApplicationPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    getJobById(id)
      .then(data => {
        if (!data.open) {
          setNotFound(true)
          return
        }
        setJob(data)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen">
        <Nav />
        <main className="min-h-[70vh] flex items-center justify-center px-6">
          <div className="w-full max-w-3xl space-y-4">
            <div className="h-8 w-44 rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-14 w-full max-w-lg rounded-xl bg-white/[0.04] animate-pulse" />
            <div className="h-96 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="bg-black text-white min-h-screen">
        <Nav />
        <SEOMeta title="Role not found" description="This role is no longer available." />
        <main className="min-h-[70vh] flex items-center justify-center px-6 text-center">
          <div>
            <p className="text-gray-400 mb-4">This role is no longer available.</p>
            <Link to="/careers" className="btn-pill btn-pill-solid">Back to Careers</Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return <ApplicationPageContent job={job} />
}

function ApplicationPageContent({ job }: { job: Job }) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [cvUploading, setCvUploading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    portfolio: '',
    linkedIn: '',
    coverLetter: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleCvChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCvFile(file)
    setCvUploading(true)
    try {
      const url = await uploadFile(file)
      setCvUrl(url)
    } catch {
      setError('CV upload failed. Please try again.')
    } finally {
      setCvUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.coverLetter) {
      setError('Please fill in your name, email, and cover letter.')
      return
    }

    setSubmitting(true)
    try {
      await submitApplication({
        jobId: job.id,
        jobTitle: job.title,
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: form.location,
        portfolio: form.portfolio,
        linkedIn: form.linkedIn,
        coverLetter: form.coverLetter,
        cvUrl: cvUrl || undefined,
        status: 'new',
        createdAt: new Date().toISOString(),
      })
      setStep('success')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta title={`Apply for ${job.title}`} description={`Apply for the ${job.title} role at Switch.`} />

      <main className="pt-32 pb-20 px-6 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <Link to="/careers" className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors uppercase tracking-widest mb-8">
            Back to careers
          </Link>

          <div className="grid lg:grid-cols-[0.75fr_1.25fr] gap-10 lg:gap-14 items-start">
            <aside className="lg:sticky lg:top-28">
              <p className="text-xs tracking-[0.18em] uppercase text-gray-500 mb-3">Apply for</p>
              <h1 className="text-4xl md:text-5xl font-medium mb-5" style={{ letterSpacing: '-0.04em', lineHeight: 1 }}>
                {job.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="rounded-full px-3 py-1 text-xs border border-white/15 text-gray-400">{job.department}</span>
                <span className="rounded-full px-3 py-1 text-xs border border-white/15 text-gray-400">{job.location}</span>
                <span className="rounded-full px-3 py-1 text-xs border border-white/15 text-gray-400">{job.type}</span>
              </div>
              <p className="text-sm text-gray-400" style={{ lineHeight: 1.75 }}>{job.description}</p>
            </aside>

            <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
              {step === 'success' ? (
                <div className="p-8 md:p-12 min-h-[520px] flex flex-col justify-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-2xl"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                  >
                    OK
                  </div>
                  <h2 className="text-3xl font-medium mb-3" style={{ letterSpacing: '-0.03em' }}>Application sent.</h2>
                  <p className="text-gray-400 text-sm max-w-md mb-8" style={{ lineHeight: 1.7 }}>
                    Thanks for applying for <span className="text-white font-medium">{job.title}</span>. We'll review your application and get back to you within a few days.
                  </p>
                  <Link to="/careers" className="btn-pill btn-pill-solid w-fit">Done</Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className="px-6 md:px-8 py-6 border-b border-white/[0.07]">
                    <h2 className="text-2xl font-medium" style={{ letterSpacing: '-0.03em' }}>Your application</h2>
                    <p className="text-sm text-gray-500 mt-1">Tell us who you are and why this role fits.</p>
                  </div>

                  <div className="px-6 md:px-8 py-7 space-y-5">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FieldGroup label="Full name *">
                        <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" required className="app-input" />
                      </FieldGroup>
                      <FieldGroup label="Email *">
                        <input type="email" value={form.email} onChange={set('email')} placeholder="jane@example.com" required className="app-input" />
                      </FieldGroup>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FieldGroup label="Phone">
                        <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+44 7700 900 000" className="app-input" />
                      </FieldGroup>
                      <FieldGroup label="Location">
                        <input type="text" value={form.location} onChange={set('location')} placeholder="London, UK" className="app-input" />
                      </FieldGroup>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FieldGroup label="Portfolio / Website">
                        <input type="url" value={form.portfolio} onChange={set('portfolio')} placeholder="https://yoursite.com" className="app-input" />
                      </FieldGroup>
                      <FieldGroup label="LinkedIn">
                        <input type="url" value={form.linkedIn} onChange={set('linkedIn')} placeholder="https://linkedin.com/in/..." className="app-input" />
                      </FieldGroup>
                    </div>

                    <FieldGroup label="CV / Resume">
                      <div
                        className="relative rounded-xl cursor-pointer transition-colors group"
                        style={{ border: '1px dashed rgba(255,255,255,0.15)', padding: '14px 16px' }}
                        onClick={() => fileRef.current?.click()}
                      >
                        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleCvChange} />
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            {cvUploading ? <span className="animate-spin text-xs">...</span> : cvFile ? <span className="text-xs">OK</span> : <span className="text-xs">Up</span>}
                          </div>
                          <div>
                            {cvUploading ? (
                              <p className="text-sm text-gray-400">Uploading...</p>
                            ) : cvFile ? (
                              <>
                                <p className="text-sm text-white">{cvFile.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">Click to replace</p>
                              </>
                            ) : (
                              <>
                                <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Upload your CV</p>
                                <p className="text-xs text-gray-600 mt-0.5">PDF, DOC, DOCX, max 10MB</p>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </FieldGroup>

                    <FieldGroup label="Cover letter *">
                      <textarea
                        value={form.coverLetter}
                        onChange={set('coverLetter')}
                        placeholder="Tell us about yourself and why you'd be a great fit for this role..."
                        rows={8}
                        required
                        className="app-input resize-none"
                      />
                    </FieldGroup>

                    {error && (
                      <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                        {error}
                      </p>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
                      <p className="text-xs text-gray-600">* Required fields</p>
                      <button
                        type="submit"
                        disabled={submitting || cvUploading}
                        className="btn-pill btn-pill-solid justify-center"
                        style={{ opacity: submitting || cvUploading ? 0.6 : 1 }}
                      >
                        {submitting ? 'Sending...' : 'Submit application'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-[0.12em] text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
