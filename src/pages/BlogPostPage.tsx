import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import DOMPurify from 'dompurify'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { getPostBySlug } from '../api'
import ShareButtons from '../components/ShareButtons'
import type { Post } from '../types'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug) return
    getPostBySlug(slug)
      .then(setPost)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <p className="text-gray-300 text-sm">Loading...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Post not found.</p>
          <Link to="/blog" className="text-white underline text-sm">← Back to blog</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />

      {post.coverVideoUrl && (
        <div className="relative h-[55vh] overflow-hidden">
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
            <source src={post.coverVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black" />
        </div>
      )}

      <div className={`px-6 md:px-12 lg:px-16 pb-24 ${post.coverVideoUrl ? 'pt-0' : 'pt-32'}`}>
        <div className="max-w-3xl mx-auto">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors uppercase tracking-widest mt-10 mb-8"
          >
            ← Blog
          </Link>

          <p className="text-xs text-gray-300 mb-3 uppercase tracking-widest">
            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
            {' · '}
            {post.author}
          </p>

          <h1 className="text-4xl md:text-5xl font-normal mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 1.0 }}>
            {post.title}
          </h1>

          <p className="text-base md:text-lg text-gray-300 mb-10 pb-10" style={{ lineHeight: 1.7, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            {post.excerpt}
          </p>

          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />
          <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <ShareButtons title={post.title} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
