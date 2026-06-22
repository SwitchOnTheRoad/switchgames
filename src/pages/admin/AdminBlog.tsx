import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'
import { getPosts, createPost, updatePost, deletePost } from '../../api'
import FileUpload from '../../components/FileUpload'
import type { Post } from '../../types'

type PostForm = Omit<Post, 'id'>

const EMPTY_FORM: PostForm = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverVideoUrl: '',
  publishedAt: new Date().toISOString().split('T')[0],
  published: false,
  author: 'Switch Team',
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const INPUT = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-white/30 transition-colors'

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  )
}

export default function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Post | null>(null)
  const [form, setForm] = useState<PostForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'write' | 'preview'>('write')

  const load = async () => {
    setLoading(true)
    try { setPosts(await getPosts()) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const openNew = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM, publishedAt: new Date().toISOString().split('T')[0] })
    setTab('write')
    setShowForm(true)
  }

  const openEdit = (post: Post) => {
    setEditing(post)
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverVideoUrl: post.coverVideoUrl,
      publishedAt: post.publishedAt.split('T')[0],
      published: post.published,
      author: post.author,
    })
    setTab('write')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) return
    setSaving(true)
    try {
      const data = { ...form, publishedAt: new Date(form.publishedAt).toISOString() }
      if (editing) {
        await updatePost(editing.id, data)
      } else {
        await createPost(data)
      }
      await load()
      setShowForm(false)
    } catch (e) {
      alert('Failed to save post: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Delete "${post.title}"?`)) return
    try {
      await deletePost(post.id)
      await load()
    } catch (e) {
      alert('Failed to delete post: ' + (e instanceof Error ? e.message : 'Unknown error'))
      console.error(e)
    }
  }

  const set = (key: keyof PostForm, val: string | boolean) =>
    setForm(f => ({ ...f, [key]: val }))

  const handleTitleChange = (title: string) => {
    setForm(f => ({ ...f, title, slug: editing ? f.slug : slugify(title) }))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold" style={{ letterSpacing: '-0.03em' }}>Blog Posts</h1>
          <p className="text-sm text-gray-300 mt-0.5">{posts.length} post{posts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          + New Post
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="liquid-glass rounded-xl h-14 animate-pulse border border-white/5" />
          ))}
        </div>
      ) : (
        <div className="liquid-glass rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Title</th>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Author</th>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Date</th>
                <th className="text-left text-xs uppercase tracking-widest text-gray-300 px-6 py-4 font-normal">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post, i) => (
                <tr key={post.id} style={{ borderBottom: i < posts.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td className="px-6 py-4 text-sm font-medium">{post.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{post.author}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {new Date(post.publishedAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`liquid-glass rounded-lg px-2 py-0.5 text-xs border ${post.published ? 'border-green-400/30 text-green-300' : 'border-white/20 text-gray-300'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(post)} className="text-xs text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">Edit</button>
                      <button onClick={() => handleDelete(post)} className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-400/20 hover:border-red-400/40">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-300">No posts yet. Write your first one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="min-h-full flex items-start justify-center px-4 py-8">
            <div className="liquid-glass rounded-2xl border border-white/20 p-8 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-xl font-semibold mb-6" style={{ letterSpacing: '-0.02em' }}>
                {editing ? 'Edit Post' : 'New Post'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Title" className="col-span-2">
                    <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} className={INPUT} placeholder="Post title" autoFocus />
                  </Field>
                  <Field label="Slug">
                    <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} className={INPUT} placeholder="url-friendly-slug" />
                  </Field>
                  <Field label="Author">
                    <input type="text" value={form.author} onChange={e => set('author', e.target.value)} className={INPUT} />
                  </Field>
                </div>

                <Field label="Excerpt">
                  <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className={INPUT + ' resize-none'} rows={2} placeholder="Short summary shown on the blog listing page" />
                </Field>

                <div>
                  <div className="flex gap-1 mb-2">
                    {(['write', 'preview'] as const).map(t => (
                      <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white'}`}>
                        {t === 'write' ? 'Write (HTML)' : 'Preview'}
                      </button>
                    ))}
                  </div>
                  <label className="block text-xs uppercase tracking-widest text-gray-300 mb-2">Content</label>
                  {tab === 'write' ? (
                    <textarea value={form.content} onChange={e => set('content', e.target.value)} className={INPUT + ' resize-none font-mono text-xs'} rows={10} placeholder="<p>Write your post content here using HTML tags.</p>" />
                  ) : (
                    <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-[240px] post-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.content || '<p class="text-gray-500">Nothing to preview yet.</p>') }} />
                  )}
                </div>

                <FileUpload
                  label="Cover Video or Image (optional)"
                  type="any"
                  value={form.coverVideoUrl}
                  onChange={url => set('coverVideoUrl', url)}
                />

                <Field label="Publish Date">
                  <input type="date" value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} className={INPUT} />
                </Field>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.published} onChange={e => set('published', e.target.checked)} className="w-4 h-4 rounded" />
                  <span className="text-sm text-gray-300">Published (visible on site)</span>
                </label>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.slug.trim()} className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-40">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Post'}
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-3 rounded-lg border border-white/20 text-sm text-gray-300 hover:text-white transition-colors">
                 Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}