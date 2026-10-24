import { useEffect, useState } from 'react'
import { getValues, createValue, updateValue, deleteValue } from '../../api'
import FileUpload from '../../components/FileUpload'
import type { ValueCard } from '../../types'

type ValueForm = Omit<ValueCard, 'id'>

const EMPTY_FORM: ValueForm = {
  title: '',
  image: '',
  paragraphs: ['', ''],
  order: 1,
}

const INPUT = 'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors'

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-gray-400 font-medium block mb-2">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}

export default function AdminValues() {
  const [values, setValues] = useState<ValueCard[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ValueCard | null>(null)
  const [form, setForm] = useState<ValueForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await getValues()
      const sorted = [...(data || [])].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
      setValues(sorted)
    } catch (err) {
      console.error('Failed to load values:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setEditing(null)
    setForm({
      ...EMPTY_FORM,
      order: values.length + 1,
      paragraphs: ['', ''],
    })
    setShowForm(true)
  }

  const openEdit = (val: ValueCard) => {
    setEditing(val)
    const paras = Array.isArray(val.paragraphs)
      ? val.paragraphs
      : val.paragraphs
      ? [val.paragraphs]
      : ['']
    setForm({
      title: val.title || '',
      image: val.image || '',
      paragraphs: paras.length > 0 ? paras : [''],
      order: val.order ?? 1,
    })
    setShowForm(true)
  }

  const handleParagraphChange = (index: number, text: string) => {
    setForm(prev => {
      const next = [...prev.paragraphs]
      next[index] = text
      return { ...prev, paragraphs: next }
    })
  }

  const addParagraph = () => {
    setForm(prev => ({
      ...prev,
      paragraphs: [...prev.paragraphs, ''],
    }))
  }

  const removeParagraph = (index: number) => {
    setForm(prev => ({
      ...prev,
      paragraphs: prev.paragraphs.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert('Please enter a title for the card.')
      return
    }
    if (!form.image.trim()) {
      alert('Please upload or enter an image URL for the card.')
      return
    }

    // Clean up empty paragraphs
    const cleanParagraphs = form.paragraphs
      .map(p => p.trim())
      .filter(Boolean)

    if (cleanParagraphs.length === 0) {
      alert('Please add at least one paragraph of text.')
      return
    }

    setSaving(true)
    try {
      const payload: ValueForm = {
        title: form.title.trim(),
        image: form.image.trim(),
        paragraphs: cleanParagraphs,
        order: Number(form.order) || 1,
      }

      if (editing) {
        await updateValue(editing.id, payload)
      } else {
        await createValue({ ...payload, createdAt: new Date().toISOString() })
      }
      await load()
      setShowForm(false)
    } catch (e) {
      alert('Failed to save value card: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (val: ValueCard) => {
    if (!window.confirm(`Delete "${val.title}" from the values carousel?`)) return
    try {
      await deleteValue(val.id)
      await load()
    } catch (e) {
      alert('Failed to delete value card: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    }
  }

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= values.length) return

    const currentItem = values[index]
    const targetItem = values[targetIndex]

    const newCurrentOrder = targetItem.order ?? targetIndex + 1
    const newTargetOrder = currentItem.order ?? index + 1

    try {
      await updateValue(currentItem.id, { order: newCurrentOrder })
      await updateValue(targetItem.id, { order: newTargetOrder })
      await load()
    } catch (err) {
      console.error('Failed to update order:', err)
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>
            Values Carousel
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {values.length} card{values.length !== 1 ? 's' : ''} · Controls the 3D rotating carousel in the &quot;Our Values&quot; section on the About page
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-white text-black px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors shadow-sm"
        >
          + Add Value Card
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="liquid-glass rounded-2xl h-80 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : values.length === 0 ? (
        <div className="liquid-glass rounded-2xl border border-white/10 p-12 text-center">
          <p className="text-gray-400 text-sm">No value cards found.</p>
          <button
            onClick={openNew}
            className="mt-4 bg-white text-black px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-100"
          >
            Create First Card
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {values.map((val, idx) => (
            <div
              key={val.id}
              className="liquid-glass rounded-2xl border border-white/10 overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all shadow-lg"
            >
              <div>
                {/* Image Banner */}
                <div className="relative w-full h-44 bg-black/60 overflow-hidden">
                  <img
                    src={val.image}
                    alt={val.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => {
                      // Fallback placeholder image if URL broken
                      ;(e.target as HTMLImageElement).src = '/values/value-1.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10 text-xs font-semibold text-gray-300">
                    Order #{val.order ?? idx + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-base font-bold font-heading tracking-wide uppercase text-white">
                    {val.title}
                  </h3>
                  <div className="w-12 h-[2px] bg-[#3B82F6] my-2.5" />
                  <div className="space-y-2 mt-3">
                    {(Array.isArray(val.paragraphs) ? val.paragraphs : [val.paragraphs]).map((p, pIdx) => (
                      <p key={pIdx} className="text-xs text-gray-300 leading-relaxed line-clamp-3">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div
                className="p-4 flex items-center justify-between gap-2"
                style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveOrder(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move earlier in carousel"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveOrder(idx, 'down')}
                    disabled={idx === values.length - 1}
                    className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move later in carousel"
                  >
                    ↓
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(val)}
                    className="text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(val)}
                    className="text-xs text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-400/20 hover:border-red-400/40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal for Add / Edit ── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121318] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-heading uppercase text-white">
                {editing ? 'Edit Value Card' : 'New Value Card'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Title Input */}
              <Field label="Card Title" hint="Typically in uppercase (e.g. PLAYERS COME FIRST)">
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={INPUT}
                  placeholder="e.g. PLAYERS COME FIRST"
                />
              </Field>

              {/* Image Uploader */}
              <FileUpload
                label="Card Image"
                type="image"
                value={form.image}
                onChange={url => setForm(f => ({ ...f, image: url }))}
                placeholder="Upload an image or paste URL"
              />

              {/* Order input */}
              <Field label="Display Sequence (Order)" hint="Cards are ordered from lowest number to highest">
                <input
                  type="number"
                  value={form.order}
                  onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 1 }))}
                  className={INPUT}
                  min={1}
                />
              </Field>

              {/* Dynamic Paragraphs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-medium">
                    Card Paragraphs ({form.paragraphs.length})
                  </label>
                  <button
                    type="button"
                    onClick={addParagraph}
                    className="text-xs text-[#3B82F6] hover:text-blue-400 font-semibold"
                  >
                    + Add Paragraph
                  </button>
                </div>
                <div className="space-y-3">
                  {form.paragraphs.map((p, idx) => (
                    <div key={idx} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <textarea
                          value={p}
                          onChange={e => handleParagraphChange(idx, e.target.value)}
                          rows={2}
                          className={INPUT + ' resize-none'}
                          placeholder={`Paragraph ${idx + 1}`}
                        />
                      </div>
                      {form.paragraphs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParagraph(idx)}
                          className="text-gray-500 hover:text-red-400 p-2 mt-1 text-sm transition-colors"
                          title="Remove paragraph"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-medium block mb-2">
                  Live Card Preview
                </label>
                <div className="w-[300px] mx-auto rounded-2xl overflow-hidden border border-white/20 bg-[#121318] shadow-2xl">
                  <div className="relative w-full h-40 bg-black/60 overflow-hidden">
                    {form.image ? (
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        No image selected
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121318] via-transparent to-transparent opacity-80" />
                  </div>
                  <div className="p-5">
                    <h3 className="text-sm font-extrabold font-heading tracking-wide uppercase text-white">
                      {form.title || 'CARD TITLE'}
                    </h3>
                    <div className="w-full h-[2px] bg-[#3B82F6] my-3" />
                    <div className="space-y-2">
                      {form.paragraphs.filter(Boolean).length > 0 ? (
                        form.paragraphs.filter(Boolean).map((p, i) => (
                          <p key={i} className="text-xs text-gray-300 font-sans leading-relaxed">
                            {p}
                          </p>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">Paragraphs will appear here...</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.image.trim()}
                className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-40"
              >
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Card'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
