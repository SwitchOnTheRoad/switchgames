import { Link } from 'react-router-dom'
import type { Post } from '../types'

export default function BlogCard({ post }: { post: Post }) {
  return (
    <Link to={`/blog/${post.slug}`} className="block group">
      <div className="liquid-glass rounded-2xl overflow-hidden border border-white/10 h-full">
        {post.coverVideoUrl && (
          <div className="relative h-44 overflow-hidden">
            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            >
              <source src={post.coverVideoUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
        <div className="p-5">
          <p className="text-xs text-gray-300 mb-2 uppercase tracking-widest">
            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
          <h3 className="text-base font-medium mb-2" style={{ letterSpacing: '-0.02em' }}>
            {post.title}
          </h3>
          <p className="text-sm text-gray-300 line-clamp-2" style={{ lineHeight: 1.6 }}>
            {post.excerpt}
          </p>
        </div>
      </div>
    </Link>
  )
}
