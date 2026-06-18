import { useEffect, useState } from 'react'
import { getCaseStudies, createCaseStudy, updateCaseStudy, deleteCaseStudy } from '../../api'
import FileUpload from '../../components/FileUpload'
import type { CaseStudy } from '../../types'

type Form = Omit<CaseStudy, 'id'>
const EMPTY: Form = { slug: '', brand: '', title: '', excerpt: '', challenge: '', solution: '', results: '', coverVideoUrl: '', coverImageUrl: '', tags: [], publishedAt: new Date().toISOString().split('T')[0], published: false }
const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors'
const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AdminCaseStudies() {
  const [items, setItems] = useState<CaseStudy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<CaseStudy | null>(null)
  const [form, setForm] = useState<Form>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  const load = async () => { setLoading(true); try { setItems(await getCaseStudies()) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing(null); setForm(EMPTY); setTagsInput(''); setShowForm(true) }
  const openEdit = (c: CaseStudy) => {
    setEditing(c)
    setForm({ slug: c.slug, brand: c.brand, title: c.title, excerpt: c.excerpt, challenge: c.challenge, solution: c.solution, results: c.results, coverVideoUrl: c.coverVideoUrl || '', coverImageUrl: c.coverImageUrl || '', tags: c.tags, publishedAt: c.publishedAt.split('T')[0], published: c.published })
    setTagsInput(c.tags.join(', '))
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    const data = { ...form, tags, publishedAt: new Date(form.publishedAt).toISOString() }
    try {
      if (editing) await updateCaseStudy(editing.id, data)
      else await createCaseStudy(data)
      await load(); setShowForm(false)
    } finally { setSaving(false) }
  }

  const set = (k: keyof Form, v: string | boolean) => setForm(f => ({ ...f, [k]: v }))
  const handleTitle = (t: string) => setForm(f => ({ ...f, title: t, slug: editing ? f.slug : slugify(t) }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Case Studies</h1>
          <p className="text-sm text-gray-300 mt-0.5">{items.length} total · {items.filter(i => i.published).length} published</p>
        </div>
        <button onClick={openNew} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">+ New Case Study</button>
      </div>

      <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {['Game / Client', 'Title', 'Status', ''].map(h => <th key={h} className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">{h}</th>)}
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-300">Loading...</td></tr> :
              items.length === 0 ? <tr><td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-300">No case studies yet.</td></tr> :
                items.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <td className="px-6 py-4 text-sm text-gray-300">{c.brand}</td>
                    <td className="px-6 py-4 text-sm font-medium">{c.title}</td>
                    <td className="px-6 py-4"><span className={`liquid-glass rounded-lg px-2 py-0.5 text-xs border ${c.published ? 'border-green-400/30 text-green-300' : 'border-white/20 text-gray-300'}`}>{c.published ? 'Published' : 'Draft'}</span></td>
                    <td className="px-6 py-4"><div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(c)} className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">Edit</button>
                      <button onClick={async () => { if (window.confirm('Delete?')) { await deleteCaseStudy(c.id); load() } }} className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-400/20 transition-colors">Delete</button>
                    </div></td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center px-4 py-8 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="liquid-glass rounded-2xl border border-white/20 p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6" style={{ letterSpacing: '-0.02em' }}>{editing ? 'Edit' : 'New'} Case Study</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Game / Client</label><input type="text" value={form.brand} onChange={e => set('brand', e.target.value)} className={INPUT} placeholder="e.g. Obby Creator" autoFocus /></div>
                <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Slug</label><input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} className={INPUT} /></div>
              </div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Title</label><input type="text" value={form.title} onChange={e => handleTitle(e.target.value)} className={INPUT} placeholder="e.g. Nike Air Max World" /></div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Excerpt</label><textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={INPUT + ' resize-none'} rows={2} /></div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">The Challenge</label><textarea value={form.challenge} onChange={e => set('challenge', e.target.value)} className={INPUT + ' resize-none'} rows={3} /></div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">What We Built</label><textarea value={form.solution} onChange={e => set('solution', e.target.value)} className={INPUT + ' resize-none'} rows={3} /></div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Results</label><textarea value={form.results} onChange={e => set('results', e.target.value)} className={INPUT + ' resize-none'} rows={3} /></div>
              <FileUpload label="Cover Video or Image" type="any" value={form.coverVideoUrl || ''} onChange={url => set('coverVideoUrl', url)} />
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Tags (comma separated)</label><input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} className={INPUT} placeholder="Roblox, Brand Activation, Gaming" /></div>
              <div><label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Date</label><input type="date" value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} className={INPUT} /></div>
              <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4" /><span className="text-sm text-gray-300">Published</span></label>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} disabled={saving || !form.title.trim()} className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-40">{saving ? 'Saving...' : editing ? 'Save' : 'Create'}</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
