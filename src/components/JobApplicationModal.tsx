import { useState, useRef, useEffect } from 'react'
import { submitApplication } from '../api'
import { uploadFile } from '../api'
import type { Job } from '../types'

interface Props {
  job: Job
  onClose: () => void
}

export default function JobApplicationModal({ job, onClose }: Props) {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [cvUploading, setCvUploading] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvUrl, setCvUrl] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const backdropRef = useRef<HTMLDivElement>(null)

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    portfolio: '',
    linkedIn: '',
    coverLetter: '',
  })

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

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
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[999] flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={e => { if (e.target === backdropRef.current) onClose() }}
    >
      <div
        className="relative w-full md:max-w-2xl max-h-[94vh] overflow-y-auto rounded-t-3xl md:rounded-3xl text-white"
        style={{
          background: 'linear-gradient(135deg, rgba(18,18,18,0.98) 0%, rgba(10,10,10,0.99) 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 120px rgba(0,0,0,0.8)',
        }}
      >
        {/* Close btn */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)' }}
          aria-label="Close"
        >
          ✕
        </button>

        {step === 'success' ? (
          <div className="p-10 flex flex-col items-center text-center min-h-[360px] justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6 text-2xl"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              ✓
            </div>
            <h2 className="text-2xl font-semibold mb-3" style={{ letterSpacing: '-0.03em' }}>Application sent!</h2>
            <p className="text-gray-400 text-sm max-w-sm" style={{ lineHeight: 1.7 }}>
              Thanks for applying for <span className="text-white font-medium">{job.title}</span>. We'll review your application and get back to you within a few days.
            </p>
            <button
              onClick={onClose}
              className="mt-8 btn-pill btn-pill-solid"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {/* Header */}
            <div className="px-7 pt-7 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs tracking-[0.18em] uppercase text-gray-500 mb-2">Apply for</p>
              <h2 className="text-xl font-semibold" style={{ letterSpacing: '-0.025em' }}>{job.title}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-gray-500">{job.department}</span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-xs text-gray-500">{job.location}</span>
                <span className="text-white/20 text-xs">·</span>
                <span className="text-xs text-gray-500">{job.type}</span>
              </div>
            </div>

            <div className="px-7 py-6 space-y-5">
              {/* Row 1 */}
              <div className="grid md:grid-cols-2 gap-4">
                <FieldGroup label="Full name *">
                  <input
                    id="apply-name"
                    type="text"
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Jane Smith"
                    required
                    className="app-input"
                  />
                </FieldGroup>
                <FieldGroup label="Email *">
                  <input
                    id="apply-email"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="jane@example.com"
                    required
                    className="app-input"
                  />
                </FieldGroup>
              </div>

              {/* Row 2 */}
              <div className="grid md:grid-cols-2 gap-4">
                <FieldGroup label="Phone">
                  <input
                    id="apply-phone"
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+44 7700 900 000"
                    className="app-input"
                  />
                </FieldGroup>
                <FieldGroup label="Location">
                  <input
                    id="apply-location"
                    type="text"
                    value={form.location}
                    onChange={set('location')}
                    placeholder="London, UK"
                    className="app-input"
                  />
                </FieldGroup>
              </div>

              {/* Row 3 */}
              <div className="grid md:grid-cols-2 gap-4">
                <FieldGroup label="Portfolio / Website">
                  <input
                    id="apply-portfolio"
                    type="url"
                    value={form.portfolio}
                    onChange={set('portfolio')}
                    placeholder="https://yoursite.com"
                    className="app-input"
                  />
                </FieldGroup>
                <FieldGroup label="LinkedIn">
                  <input
                    id="apply-linkedin"
                    type="url"
                    value={form.linkedIn}
                    onChange={set('linkedIn')}
                    placeholder="https://linkedin.com/in/..."
                    className="app-input"
                  />
                </FieldGroup>
              </div>

              {/* CV upload */}
              <FieldGroup label="CV / Résumé">
                <div
                  className="relative rounded-xl cursor-pointer transition-colors group"
                  style={{ border: '1px dashed rgba(255,255,255,0.15)', padding: '14px 16px' }}
                  onClick={() => fileRef.current?.click()}
                >
                  <input
                    ref={fileRef}
                    id="apply-cv"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={handleCvChange}
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-gray-400" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      {cvUploading ? (
                        <span className="animate-spin text-xs">⟳</span>
                      ) : cvFile ? (
                        <span className="text-xs">✓</span>
                      ) : (
                        <span className="text-xs">↑</span>
                      )}
                    </div>
                    <div>
                      {cvUploading ? (
                        <p className="text-sm text-gray-400">Uploading…</p>
                      ) : cvFile ? (
                        <>
                          <p className="text-sm text-white">{cvFile.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">Click to replace</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-gray-400 group-hover:text-white transition-colors">Upload your CV</p>
                          <p className="text-xs text-gray-600 mt-0.5">PDF, DOC, DOCX — max 10MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </FieldGroup>

              {/* Cover letter */}
              <FieldGroup label="Cover letter *">
                <textarea
                  id="apply-cover"
                  value={form.coverLetter}
                  onChange={set('coverLetter')}
                  placeholder="Tell us about yourself and why you'd be a great fit for this role…"
                  rows={6}
                  required
                  className="app-input resize-none"
                />
              </FieldGroup>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </p>
              )}

              {/* Submit */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <p className="text-xs text-gray-600">* Required fields</p>
                <button
                  type="submit"
                  disabled={submitting || cvUploading}
                  className="btn-pill btn-pill-solid"
                  style={{ opacity: submitting || cvUploading ? 0.6 : 1 }}
                >
                  {submitting ? 'Sending…' : 'Submit application'}
                  {!submitting && <span style={{ fontSize: 11 }}> ↗</span>}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
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
