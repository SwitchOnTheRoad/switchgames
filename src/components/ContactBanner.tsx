import { Link } from 'react-router-dom'
import SectionReveal from './SectionReveal'

export default function ContactBanner() {
  return (
    <section className="bg-black pb-24 px-6 md:px-12 lg:px-16">
      <div className="max-w-7xl mx-auto">
        <SectionReveal delay={200}>
          <div className="rounded-2xl overflow-hidden relative border border-white/[0.06] group flex items-center justify-center min-h-[160px] md:min-h-[200px]">
            {/* Background Images Overlay */}
            <div className="absolute inset-0 z-0 flex pointer-events-none opacity-40 mix-blend-luminosity group-hover:opacity-60 group-hover:mix-blend-normal transition-all duration-700">
              <div className="w-1/2 h-full relative">
                <img src="/contact.webp" alt="Roblox Game background" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
              <div className="w-1/2 h-full relative">
                <img src="/hero.webp" alt="Roblox Game background" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
              </div>
            </div>
            
            {/* Dark Gradient Overlay for readability */}
            <div className="absolute inset-0 bg-black/60 z-[1] pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 p-8 text-center md:text-left">
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Looking to work with us?
              </h3>
              <Link to="/contact">
                <button className="bg-primary hover:bg-orange-500 text-white font-medium py-3 px-8 rounded-full transition-colors flex items-center gap-2 border-none">
                  Get In Touch
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  )
}
