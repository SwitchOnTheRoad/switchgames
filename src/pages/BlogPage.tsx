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
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="bg-black text-white min-h-screen">
      <Nav />
      <SEOMeta title="Blog" description="News and updates from Switch studio." />

      <div className="pt-32 pb-24 px-6 md:px-12 lg:px-16">
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
              <div className="grid md:grid-cols-3 gap-5">
                {posts.map(post => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </SectionReveal>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
