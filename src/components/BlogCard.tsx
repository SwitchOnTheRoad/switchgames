import { Link } from 'react-router-dom'
import type { Post } from '../types'

export default function BlogCard({ post }: { post: Post }) {
  const isVideo = (url?: string) => Boolean(url && /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(url))
  const videoSrc = isVideo(post.coverVideoUrl) ? post.coverVideoUrl : (isVideo(post.imageUrl) ? post.imageUrl : undefined)
  const imageSrc = post.imageUrl && !isVideo(post.imageUrl)
    ? post.imageUrl
    : (post.coverVideoUrl && !isVideo(post.coverVideoUrl) ? post.coverVideoUrl : undefined)

  return (
    <Link to={`/blog/${post.slug}`} className="block group h-full">
      <div className="rounded-2xl overflow-hidden border border-white/[0.06] h-full bg-white/[0.02]">
        {imageSrc ? (
          <div className="relative aspect-video md:aspect-auto md:h-44 overflow-hidden bg-black/40">
            <img 
              src={imageSrc} 
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : videoSrc ? (
          <div className="relative aspect-video md:aspect-auto md:h-44 overflow-hidden bg-black/40">
            <video
              autoPlay loop muted playsInline
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        ) : null}
        <div className="p-5">
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-[0.15em]">
            {new Date(post.publishedAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
          <h3 className="text-base font-medium mb-2" style={{ letterSpacing: '-0.02em' }}>
            {post.title}
          </h3>
          <p className="text-sm text-gray-400 line-clamp-2" style={{ lineHeight: 1.6 }}>
            {post.excerpt}
          </p>
        </div>
      </div>
    </Link>
  )
}
