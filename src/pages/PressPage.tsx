import Nav from '../components/Nav'
import Footer from '../components/Footer'
import SEOMeta from '../components/SEOMeta'
import SectionReveal from '../components/SectionReveal'

const ASSETS = [
  { label: 'Logo (White PNG)', desc: 'Full logo on transparent background', file: '/logo.png' },
  { label: 'Logo (Black PNG)', desc: 'For use on light backgrounds', file: '/logo.png' },
  { label: 'Brand Guidelines', desc: 'Colours, typography, and usage rules', file: '#' },
]

const FACTS = [
  { label: 'Founded', value: '2026' },
  { label: 'Location', value: 'London, UK' },
  { label: 'Platform', value: 'Roblox' },
  { label: 'Focus', value: 'UGC Game Development & Live-Ops' },
  { label: 'Contact', value: 'press@playswitchgames.com' },
]

export default function PressPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <SEOMeta title="Press" description="Press kit, assets, and media contact for Switch, UGC game development studio." />
      <Nav />

      <div className="pt-40 pb-24 px-6 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <SectionReveal>

          </SectionReveal>
          <SectionReveal delay={60}>
            <h1 className="text-5xl md:text-6xl font-normal mb-6" style={{ letterSpacing: '-0.04em', lineHeight: 0.95 }}>
              Media Kit
            </h1>
          </SectionReveal>
          <SectionReveal delay={120}>
            <p className="text-base md:text-lg text-gray-300 mb-16 max-w-xl" style={{ lineHeight: 1.7 }}>
              Everything you need to write about Switch. For press enquiries, email us directly.
            </p>
          </SectionReveal>

          {/* Boilerplate */}
          <SectionReveal>
            <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] mb-6">

              <p className="text-sm text-gray-300 mb-4" style={{ lineHeight: 1.8 }}>
                Switch is a UGC game development studio specialising in Roblox, the platform with over 80 million daily active users. We build original games and scale immersive experiences, helping developers retain and engage players over the long term through continuous live-ops.
              </p>
              <p className="text-sm text-gray-300" style={{ lineHeight: 1.8 }}>
                Founded in 2026 and based in London, Switch combines deep game design expertise with cultural fluency to create worlds players return to and communities they grow with.
              </p>
              <button
                onClick={() => navigator.clipboard.writeText("Switch is a UGC game development studio specialising in Roblox...")}
                className="mt-4 text-xs text-gray-400 hover:text-white transition-colors uppercase tracking-[0.1em] border border-white/10 bg-white/[0.02] rounded-full px-4 py-2 inline-block"
              >
                Copy Text
              </button>
            </div>
          </SectionReveal>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Fast facts */}
            <SectionReveal>
              <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] h-full">

                <div className="space-y-4">
                  {FACTS.map(fact => (
                    <div key={fact.label} className="flex justify-between items-start gap-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                      <span className="text-xs uppercase tracking-widest text-gray-300 flex-shrink-0">{fact.label}</span>
                      <span className="text-sm text-right">{fact.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionReveal>

            {/* Media contact */}
            <SectionReveal delay={80}>
              <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] h-full flex flex-col justify-between">
                <div>

                  <h3 className="text-2xl font-normal mb-2" style={{ letterSpacing: '-0.03em' }}>Get in touch</h3>
                  <p className="text-sm text-gray-300 mb-6" style={{ lineHeight: 1.65 }}>
                    For interviews, features, and press enquiries, we reply within 24 hours.
                  </p>
                  <a href="mailto:press@playswitchgames.com" className="text-sm font-medium hover:text-gray-300 transition-colors">
                    press@playswitchgames.com ↗
                  </a>
                </div>
                <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <p className="text-xs text-gray-300 uppercase tracking-widest mb-1">Response time</p>
                  <p className="text-sm">Within 24 hours</p>
                </div>
              </div>
            </SectionReveal>
          </div>

          {/* Logo + assets */}
          <SectionReveal>
            <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02] mb-6">

              <div className="grid md:grid-cols-3 gap-4">
                {ASSETS.map(asset => (
                  <div key={asset.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                    <div className="h-28 flex items-center justify-center p-6" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <img src={asset.file} alt={asset.label} className="h-12 w-12 object-contain" />
                    </div>
                    <div className="p-4">
                      <p className="text-sm font-medium mb-0.5">{asset.label}</p>
                      <p className="text-xs text-gray-300 mb-3">{asset.desc}</p>
                      <a
                        href={asset.file}
                        download
                        className="text-xs text-gray-300 hover:text-white transition-colors uppercase tracking-widest"
                      >
                        Download ↓
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionReveal>

          {/* Usage guidelines */}
          <SectionReveal>
            <div className="rounded-2xl p-8 border border-white/[0.06] bg-white/[0.02]">

              <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-300" style={{ lineHeight: 1.7 }}>
                <div>
                  <p className="text-white font-medium mb-2">✓ You may</p>
                  <ul className="space-y-1.5">
                    <li>Use the Switch name and logo in editorial coverage</li>
                    <li>Reference our games and statistics in articles</li>
                    <li>Use approved assets from this media kit</li>
                  </ul>
                </div>
                <div>
                  <p className="text-white font-medium mb-2">✗ Please don't</p>
                  <ul className="space-y-1.5">
                    <li>Modify or recolour our logo</li>
                    <li>Use our brand in a way that implies endorsement</li>
                    <li>Use assets not provided in this kit</li>
                  </ul>
                </div>
              </div>
            </div>
          </SectionReveal>

        </div>
      </div>

      <Footer />
    </div>
  )
}
