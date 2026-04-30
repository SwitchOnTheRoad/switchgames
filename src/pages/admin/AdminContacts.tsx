import { useEffect, useState } from 'react'
import { getContacts, deleteContact } from '../../api'
import type { Contact } from '../../types'

export default function AdminContacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try { setContacts((await getContacts()).reverse()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (c: Contact) => {
    if (!window.confirm('Delete this message?')) return
    await deleteContact(c.id); await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Enquiries</h1>
          <p className="text-sm text-gray-300 mt-0.5">{contacts.length} submission{contacts.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="liquid-glass rounded-xl h-14 animate-pulse border border-white/5" />)}</div>
      ) : contacts.length === 0 ? (
        <div className="liquid-glass rounded-2xl border border-white/10 p-16 text-center">
          <p className="text-gray-300">No enquiries yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.map(c => (
            <div key={c.id} className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
              <button
                className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-white/3 transition-colors"
                onClick={() => setExpanded(expanded === c.id ? null : c.id)}
              >
                <div className="flex-1 grid grid-cols-4 gap-4 items-center">
                  <p className="text-sm font-medium truncate">{c.name}</p>
                  <p className="text-sm text-gray-300 truncate">{c.email}</p>
                  <p className="text-sm text-gray-300">{c.enquiryType || '—'}</p>
                  <p className="text-xs text-gray-300">{new Date(c.createdAt).toLocaleDateString('en-GB')}</p>
                </div>
                <span className="text-gray-300 text-xs" style={{ transform: expanded === c.id ? 'rotate(180deg)' : 'none', display: 'inline-block', transition: 'transform 300ms' }}>↓</span>
              </button>

              {expanded === c.id && (
                <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="grid md:grid-cols-3 gap-4 mb-5 text-sm">
                    {c.company && <div><p className="text-xs uppercase tracking-widest text-gray-300 mb-1">Company</p><p>{c.company}</p></div>}
                    <div><p className="text-xs uppercase tracking-widest text-gray-300 mb-1">Email</p><a href={`mailto:${c.email}`} className="hover:text-gray-300 transition-colors">{c.email}</a></div>
                    <div><p className="text-xs uppercase tracking-widest text-gray-300 mb-1">Type</p><p>{c.enquiryType || '—'}</p></div>
                  </div>
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-widest text-gray-300 mb-2">Message</p>
                    <p className="text-sm text-gray-300" style={{ lineHeight: 1.7 }}>{c.message}</p>
                  </div>
                  <div className="flex gap-3">
                    <a href={`mailto:${c.email}`} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">Reply via Email</a>
                    <button onClick={() => handleDelete(c)} className="text-sm text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg border border-red-400/20 hover:border-red-400/40">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
