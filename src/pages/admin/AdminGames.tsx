import { useEffect, useState } from 'react'
import { getGames, createGame, updateGame, deleteGame } from '../../api'
import FileUpload from '../../components/FileUpload'
import type { Game } from '../../types'

type GameForm = Omit<Game, 'id' | 'createdAt'>

const EMPTY_FORM: GameForm = {
  title: '',
  genre: '',
  description: '',
  videoUrl: '',
  imageUrl: '',
  robloxUrl: '',
  visits: '',
  featured: false,
  comingSoon: false,
  longDescription: '',
  features: '',
  gallery: '',
}

export default function AdminGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Game | null>(null)
  const [form, setForm] = useState<GameForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try { setGames(await getGames()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowForm(true)
  }

  const openEdit = (game: Game) => {
    setEditing(game)
    setForm({
      title: game.title || '',
      genre: game.genre || '',
      description: game.description || '',
      videoUrl: game.videoUrl || '',
      imageUrl: game.imageUrl || '',
      robloxUrl: game.robloxUrl || '',
      visits: game.visits || '',
      featured: game.featured || false,
      comingSoon: game.comingSoon || false,
      longDescription: game.longDescription || '',
      features: game.features || '',
      gallery: game.gallery || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!(form.title || '').trim()) return
    setSaving(true)
    try {
      if (editing) {
        await updateGame(editing.id, form)
      } else {
        await createGame({ ...form, createdAt: new Date().toISOString() })
      }
      await load()
      setShowForm(false)
    } catch (e) {
      alert('Failed to save game: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (game: Game) => {
    if (!window.confirm(`Delete "${game.title}"?`)) return
    try {
      await deleteGame(game.id)
      await load()
    } catch (e) {
      alert('Failed to delete game: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    }
  }

  const set = (key: keyof GameForm, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }))

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Games</h1>
          <p className="text-sm text-gray-300 mt-0.5">{games.length} game{games.length !== 1 ? 's' : ''} · Edit featured to control what shows on the homepage</p>
        </div>
        <button onClick={openNew} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          + Add Game
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="liquid-glass rounded-xl h-14 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Title</th>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Genre</th>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Visits</th>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Featured</th>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {games.map((game, i) => (
                <tr key={game.id} style={{ borderBottom: i < games.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td className="px-6 py-4 text-sm font-medium">{game.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{game.genre}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{game.visits || '—'}</td>
                  <td className="px-6 py-4">
                    {game.featured && (
                      <span className="liquid-glass rounded-lg px-2 py-0.5 text-xs border border-white/20 text-gray-300">Featured</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {game.comingSoon && (
                      <span className="liquid-glass rounded-lg px-2 py-0.5 text-xs border border-yellow-400/30 text-yellow-300">Coming Soon</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(game)} className="text-xs text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">Edit</button>
                      <button onClick={() => handleDelete(game)} className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-400/20 hover:border-red-400/40">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {games.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-300">No games yet. Add your first one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] overflow-y-auto px-4 py-8 flex items-start justify-center" onClick={() => setShowForm(false)}>
          <div className="rounded-2xl border border-white/20 p-8 w-full max-w-lg mt-8" style={{ background: 'rgba(20,20,20,0.98)' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-6" style={{ letterSpacing: '-0.02em' }}>
              {editing ? 'Edit Game' : 'New Game'}
            </h2>

            <div className="space-y-4">
              <Field label="Title">
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={INPUT} placeholder="e.g. Apex Realms" autoFocus />
              </Field>

              <Field label="Genre">
                <input type="text" value={form.genre} onChange={e => set('genre', e.target.value)} className={INPUT} placeholder="e.g. Action · RPG" />
              </Field>

              <Field label="Description">
                <textarea value={form.description} onChange={e => set('description', e.target.value)} className={INPUT + ' resize-none'} rows={3} placeholder="Short description of the game" />
              </Field>

              <FileUpload
                label="Game Video"
                type="video"
                value={form.videoUrl}
                onChange={url => set('videoUrl', url)}
              />

              <FileUpload
                label="Game Image (optional — overrides video on card)"
                type="image"
                value={form.imageUrl || ''}
                onChange={url => set('imageUrl', url)}
              />

              <Field label="Roblox Game URL (optional)">
                <input type="url" value={form.robloxUrl || ''} onChange={e => set('robloxUrl', e.target.value)} className={INPUT} placeholder="https://www.roblox.com/games/..." />
                <p className="text-xs text-gray-300 mt-1">If set, clicking the game card will open this link.</p>
              </Field>

              <Field label="Visits (optional)">
                <input type="text" value={form.visits} onChange={e => set('visits', e.target.value)} className={INPUT} placeholder="e.g. 150M+" />
              </Field>

              <Field label="Detailed Description (Long Description)">
                <textarea 
                  value={form.longDescription || ''} 
                  onChange={e => set('longDescription', e.target.value)} 
                  className={INPUT + ' resize-none'} 
                  rows={4} 
                  placeholder="Detailed description of gameplay, mechanics, and design. Supports markdown or plain text." 
                />
              </Field>

              <Field label="Key Highlights & Features (comma-separated)">
                <input 
                  type="text" 
                  value={form.features || ''} 
                  onChange={e => set('features', e.target.value)} 
                  className={INPUT} 
                  placeholder="e.g. Co-op Mode, Live Rankings, Weekly Events" 
                />
              </Field>

              <FileUpload
                label="Add Image to Gallery"
                type="image"
                value=""
                onChange={url => {
                  if (url) {
                    const current = form.gallery ? form.gallery.trim() + '\n' + url : url
                    set('gallery', current)
                  }
                }}
              />

              <Field label="Gallery Image URLs (one per line)">
                <textarea 
                  value={form.gallery || ''} 
                  onChange={e => set('gallery', e.target.value)} 
                  className={INPUT + ' resize-none'} 
                  rows={3} 
                  placeholder="Paste image URLs or upload them above (one per line)" 
                />
              </Field>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-300">Show on homepage (featured)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.comingSoon || false} onChange={e => set('comingSoon', e.target.checked)} className="w-4 h-4 rounded" />
                <span className="text-sm text-gray-300">Mark as Coming Soon (blurs card, disables click)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={handleSave} disabled={saving || !(form.title || '').trim()} className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-40">
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Game'}
              </button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  )
}