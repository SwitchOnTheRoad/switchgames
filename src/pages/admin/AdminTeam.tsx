import { useEffect, useState } from 'react'
import { getTeam, createTeamMember, updateTeamMember, deleteTeamMember } from '../../api'
import FileUpload from '../../components/FileUpload'
import type { TeamMember } from '../../types'

type Form = Omit<TeamMember, 'id'>
const EMPTY: Form = { name: '', role: '', bio: '', imageUrl: '', twitter: '', linkedin: '', order: 99 }
const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors'

export default function AdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = async () => { setLoading(true); try { setTeam(await getTeam()) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }
  const openEdit = (m: TeamMember) => { setEditing(m); setForm({ name: m.name, role: m.role, bio: m.bio, imageUrl: m.imageUrl || '', twitter: m.twitter || '', linkedin: m.linkedin || '', order: m.order }); setShowForm(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (editing) await updateTeamMember(editing.id, form)
      else await createTeamMember(form)
      await load()
      setShowForm(false)
    } catch (e) {
      alert('Failed to save team member: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const set = (k: keyof Form, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Team</h1>
          <p className="text-sm text-gray-300 mt-0.5">{team.length} member{team.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">+ Add Member</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="liquid-glass rounded-2xl h-48 animate-pulse border border-white/5" />) :
          team.map(m => (
            <div key={m.id} className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="h-28 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                {m.imageUrl ? <img src={m.imageUrl} className="w-full h-full object-cover" alt={m.name} /> :
                  <span className="text-3xl font-semibold text-white/20">{m.name.split(' ').map(n => n[0]).join('')}</span>}
              </div>
              <div className="p-5">
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-gray-300 mb-3">{m.role}</p>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(m)} className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">Edit</button>
                  <button onClick={async () => { if (window.confirm('Delete?')) { try { await deleteTeamMember(m.id); await load() } catch (e) { alert('Failed to delete member: ' + (e instanceof Error ? e.message : 'Unknown error')); console.error(e) } } }} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-400/20 transition-colors">Remove</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-8 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="liquid-glass rounded-2xl border border-white/20 p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6" style={{ letterSpacing: '-0.02em' }}>{editing ? 'Edit Member' : 'Add Member'}</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Name</label><input type="text" value={form.name} onChange={e => set('name', e.target.value)} className={INPUT} placeholder="Full name" autoFocus /></div>
                <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Role</label><input type="text" value={form.role} onChange={e => set('role', e.target.value)} className={INPUT} placeholder="e.g. Founder & CEO" /></div>
              </div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Bio</label><textarea value={form.bio} onChange={e => set('bio', e.target.value)} className={INPUT + ' resize-none'} rows={3} placeholder="Short bio..." /></div>
              <FileUpload label="Photo" type="image" value={form.imageUrl || ''} onChange={url => set('imageUrl', url)} />
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Twitter URL</label><input type="url" value={form.twitter} onChange={e => set('twitter', e.target.value)} className={INPUT} placeholder="https://x.com/..." /></div>
                <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">LinkedIn URL</label><input type="url" value={form.linkedin} onChange={e => set('linkedin', e.target.value)} className={INPUT} placeholder="https://linkedin.com/in/..." /></div>
              </div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Order (1 = first)</label><input type="number" value={form.order} onChange={e => set('order', parseInt(e.target.value))} className={INPUT} /></div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-40">{saving ? 'Saving...' : editing ? 'Save' : 'Add'}</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
