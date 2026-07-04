import { useEffect, useState } from 'react'
import { getApplications, deleteApplication, updateApplication } from '../../api'
import type { JobApplication } from '../../types'

const STATUS_OPTIONS: JobApplication['status'][] = ['new', 'reviewing', 'shortlisted', 'rejected']

const STATUS_STYLES: Record<JobApplication['status'], { dot: string; label: string; badge: string }> = {
  new:        { dot: 'bg-blue-400',   label: 'New',         badge: 'border-blue-400/30 text-blue-300 bg-blue-400/8' },
  reviewing:  { dot: 'bg-yellow-400', label: 'Reviewing',   badge: 'border-yellow-400/30 text-yellow-300 bg-yellow-400/8' },
  shortlisted:{ dot: 'bg-green-400',  label: 'Shortlisted', badge: 'border-green-400/30 text-green-300 bg-green-400/8' },
  rejected:   { dot: 'bg-red-400',    label: 'Rejected',    badge: 'border-red-400/30 text-red-400 bg-red-400/8' },
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | JobApplication['status']>('all')
  const [updating, setUpdating] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getApplications()
      setApplications(data.reverse())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (a: JobApplication) => {
    if (!window.confirm(`Delete application from ${a.name}?`)) return
    try {
      await deleteApplication(a.id)
      await load()
    } catch (e) {
      alert('Failed to delete application: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    }
  }

  const handleStatus = async (a: JobApplication, status: JobApplication['status']) => {
    setUpdating(a.id)
    try {
      const updated = await updateApplication(a.id, { status })
      setApplications(prev => prev.map(x => x.id === a.id ? { ...x, ...updated, status } : x))
    } catch (e) {
      alert('Failed to update status: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    } finally {
      setUpdating(null)
    }
  }

  const filtered = statusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === statusFilter)

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = applications.filter(a => a.status === s).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Applications</h1>
          <p className="text-sm text-gray-400 mt-0.5">{applications.length} total submission{applications.length !== 1 ? 's' : ''}</p>
        </div>
        {/* Status summary pills */}
        <div className="flex flex-wrap gap-2">
          {(['all', ...STATUS_OPTIONS] as const).map(s => {
            const count = s === 'all' ? applications.length : counts[s]
            const active = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-white text-black border-white'
                    : 'border-white/15 text-gray-400 hover:text-white hover:border-white/30'
                }`}
              >
                {s !== 'all' && (
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[s].dot}`} />
                )}
                {s === 'all' ? 'All' : STATUS_STYLES[s].label}
                <span className={`ml-0.5 ${active ? 'text-black/50' : 'text-gray-600'}`}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="liquid-glass rounded-xl h-16 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="liquid-glass rounded-2xl border border-white/10 p-16 text-center">
          <p className="text-gray-400">No applications{statusFilter !== 'all' ? ` with status "${STATUS_STYLES[statusFilter as JobApplication['status']].label}"` : ''} yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => {
            const style = STATUS_STYLES[a.status]
            const isExpanded = expanded === a.id
            return (
              <div key={a.id} className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
                {/* Row */}
                <button
                  className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : a.id)}
                >
                  {/* Status dot */}
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />

                  {/* Info grid */}
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 items-center min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    <p className="text-sm text-gray-400 truncate">{a.email}</p>
                    <p className="text-sm text-gray-400 truncate hidden md:block">{a.jobTitle}</p>
                    <p className="text-xs text-gray-500 hidden md:block">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`hidden sm:inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs border flex-shrink-0 ${style.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>

                  {/* Chevron */}
                  <span
                    className="text-gray-500 text-xs flex-shrink-0 transition-transform duration-300"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', display: 'inline-block' }}
                  >
                    ↓
                  </span>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-5 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    {/* Meta grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5 text-sm">
                      <MetaCell label="Role">{a.jobTitle}</MetaCell>
                      <MetaCell label="Email">
                        <a href={`mailto:${a.email}`} className="hover:text-white transition-colors truncate block">{a.email}</a>
                      </MetaCell>
                      {a.phone && <MetaCell label="Phone">{a.phone}</MetaCell>}
                      {a.location && <MetaCell label="Location">{a.location}</MetaCell>}
                      <MetaCell label="Applied">
                        {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </MetaCell>
                      {a.portfolio && (
                        <MetaCell label="Portfolio">
                          <a href={a.portfolio} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors truncate block">
                            {a.portfolio.replace(/^https?:\/\//, '')}
                          </a>
                        </MetaCell>
                      )}
                      {a.linkedIn && (
                        <MetaCell label="LinkedIn">
                          <a href={a.linkedIn} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors truncate block">
                            {a.linkedIn.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
                          </a>
                        </MetaCell>
                      )}
                      {a.cvUrl && (
                        <MetaCell label="CV">
                          <a href={a.cvUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                            Download
                          </a>
                        </MetaCell>
                      )}
                    </div>

                    {/* Cover letter */}
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Cover Letter</p>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap" style={{ lineHeight: 1.75 }}>{a.coverLetter}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {/* Status changer */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs uppercase tracking-widest text-gray-500">Status:</p>
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            disabled={updating === a.id}
                            onClick={() => handleStatus(a, s)}
                            className={`px-3 py-1 rounded-full text-xs border transition-all ${
                              a.status === s
                                ? `${STATUS_STYLES[s].badge} font-medium`
                                : 'border-white/10 text-gray-500 hover:text-white hover:border-white/25'
                            }`}
                          >
                            {STATUS_STYLES[s].label}
                          </button>
                        ))}
                      </div>

                      {/* CTA buttons */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${a.email}?subject=Your application for ${encodeURIComponent(a.jobTitle)} at Switch`}
                          className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                        >
                          Reply via Email
                        </a>
                        <button
                          onClick={() => handleDelete(a)}
                          className="text-sm text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg border border-red-400/20 hover:border-red-400/40"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MetaCell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">{label}</p>
      <div className="text-sm text-gray-300">{children}</div>
    </div>
  )
}
