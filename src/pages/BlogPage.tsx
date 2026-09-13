import RobuxPattern from '../components/RobuxPattern'
import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import BlogCard from '../components/BlogCard'
import SectionReveal from '../components/SectionReveal'
import { getPosts } from '../api'
import SEOMeta from '../components/SEOMeta'
import type { Post } from '../types'

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPosts()
      .then(data => setPosts(data.filter(p => p.published)))
      .catch(e => console.error('Failed to load posts:', e))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-[#080808] bg-pattern text-white min-h-screen font-sans selection:bg-white/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[120vh] pointer-events-none z-0 overflow-hidden"><RobuxPattern /></div>
      <div className="relative z-50"><Nav /></div>
      <SEOMeta title="Blog" description="News and updates from Switch studio." />

      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-16 relative z-10">
        <div className="max-w-7xl mx-auto">
          <SectionReveal>

          </SectionReveal>
          <SectionReveal delay={60}>
            <h1 className="text-5xl md:text-6xl font-normal mb-12" style={{ letterSpacing: '-0.04em' }}>
              News & Updates
            </h1>
          </SectionReveal>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-2xl h-72 animate-pulse border border-white/[0.06] bg-white/[0.02]" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-300 py-20 text-center">No posts yet. Check back soon.</p>
          ) : (
            <SectionReveal>
              <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:snap-none md:pb-0">
                {posts.map(post => (
                  <div key={post.id} className="flex-shrink-0 w-[80vw] snap-center md:w-auto md:flex-shrink">
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>
            </SectionReveal>
          )}
        </div>
      </div>

      <div className="relative z-10"><Footer /></div>
    </div>
  )
}




