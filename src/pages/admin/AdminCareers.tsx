import { useEffect, useState } from 'react'
import { getJobs, createJob, updateJob, deleteJob } from '../../api'
import type { Job } from '../../types'

const DEPARTMENTS = ['Engineering', 'Design', 'Production', 'Marketing', 'Other']
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship']
const LOCATIONS = ['Remote', 'London', 'Hybrid', 'On-site']

type JobForm = Omit<Job, 'id' | 'createdAt'>

const EMPTY: JobForm = {
  title: '', department: 'Engineering', type: 'Full-time',
  location: 'Remote', description: '', requirements: '', open: true,
}

const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors'

export default function AdminCareers() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
  const [form, setForm] = useState<JobForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setJobs(await getJobs()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (j: Job) => {
    setEditing(j)
    setForm({ title: j.title, department: j.department, type: j.type, location: j.location, description: j.description, requirements: j.requirements, open: j.open })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editing) await updateJob(editing.id, form)
      else await createJob({ ...form, createdAt: new Date().toISOString() })
      await load(); setShowForm(false)
    } finally { setSaving(false) }
  }

  const handleDelete = async (j: Job) => {
    if (!window.confirm(`Delete "${j.title}"?`)) return
    await deleteJob(j.id); await load()
  }

  const set = (k: keyof JobForm, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Careers</h1>
          <p className="text-sm text-gray-300 mt-0.5">{jobs.length} role{jobs.length !== 1 ? 's' : ''} · {jobs.filter(j => j.open).length} open</p>
        </div>
        <button onClick={openNew} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          + Add Role
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="liquid-glass rounded-xl h-14 animate-pulse border border-white/5" />)}</div>
      ) : (
        <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {['Role', 'Department', 'Type', 'Location', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, i) => (
                <tr key={job.id} style={{ borderBottom: i < jobs.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td className="px-6 py-4 text-sm font-medium">{job.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{job.department}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{job.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{job.location}</td>
                  <td className="px-6 py-4">
                    <span className={`liquid-glass rounded-lg px-2 py-0.5 text-xs border ${job.open ? 'border-green-400/30 text-green-300' : 'border-white/20 text-gray-300'}`}>
                      {job.open ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(job)} className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">Edit</button>
                      <button onClick={() => handleDelete(job)} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-400/20 hover:border-red-400/40 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-300">No roles yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-8 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="liquid-glass rounded-2xl border border-white/20 p-8 w-full max-w-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6" style={{ letterSpacing: '-0.02em' }}>{editing ? 'Edit Role' : 'New Role'}</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Job Title</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={INPUT} placeholder="e.g. Senior Roblox Developer" autoFocus />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Department</label>
                  <select value={form.department} onChange={e => set('department', e.target.value)} className={INPUT}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Type</label>
                  <select value={form.type} onChange={e => set('type', e.target.value)} className={INPUT}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Location</label>
                  <select value={form.location} onChange={e => set('location', e.target.value)} className={INPUT}>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Description</label>
                <textarea value={form.description} onChange={e => set('description', e.target.value)} className={INPUT + ' resize-none'} rows={3} placeholder="What this role involves..." />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Requirements (one per line)</label>
                <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} className={INPUT + ' resize-none font-mono text-xs'} rows={5} placeholder={"3+ years Lua experience\nStrong game systems knowledge\n..."} />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.open} onChange={e => set('open', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-300">Accepting applications</span>
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-40">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Role'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
