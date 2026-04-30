import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { path: '/games', label: 'Games' },
  { path: '/work', label: 'Work' },
  { path: '/team', label: 'Team' },
  { path: '/blog', label: 'Blog' },
  { path: '/careers', label: 'Careers' },
]

export default function Nav() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const lc = (path: string) =>
    pathname === path || pathname.startsWith(path + '/') ? 'text-white' : 'text-gray-300'

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 md:px-10 pt-4">
        <div className="liquid-glass rounded-2xl px-5 py-3 flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/"><img src="/logo.png" alt="Switch" className="h-9 w-9 object-contain" /></Link>

          {/* Desktop links */}
          <div className="hidden md:flex gap-8 text-sm">
            {LINKS.map(l => (
              <Link key={l.path} to={l.path} className={`hover:text-white transition-colors ${lc(l.path)}`}>{l.label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link to="/contact" className="hidden md:block">
              <button className="bg-white text-black px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                Get in Touch
              </button>
            </Link>

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col gap-1.5 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setOpen(o => !o)}
              aria-label="Menu"
            >
              <span className="block w-5 h-px bg-white transition-all duration-300" style={{ transform: open ? 'translateY(5px) rotate(45deg)' : 'none' }} />
              <span className="block w-5 h-px bg-white transition-all duration-300" style={{ opacity: open ? 0 : 1 }} />
              <span className="block w-5 h-px bg-white transition-all duration-300" style={{ transform: open ? 'translateY(-5px) rotate(-45deg)' : 'none' }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          background: 'rgba(0,0,0,0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 300ms ease',
        }}
      >
        <div className="flex flex-col h-full pt-28 pb-12 px-8 justify-between">
          <div className="flex flex-col gap-2">
            {LINKS.map((l, i) => (
              <Link
                key={l.path}
                to={l.path}
                className="text-5xl font-normal text-white hover:text-gray-300 transition-colors py-2"
                style={{
                  letterSpacing: '-0.03em',
                  opacity: open ? 1 : 0,
                  transform: open ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 400ms ease ${i * 60}ms, transform 400ms cubic-bezier(0.22,1,0.36,1) ${i * 60}ms`,
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div
            style={{
              opacity: open ? 1 : 0,
              transform: open ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 400ms ease 320ms, transform 400ms ease 320ms',
            }}
          >
            <Link to="/contact">
              <button className="w-full bg-white text-black py-4 rounded-xl font-medium text-base hover:bg-gray-100 transition-colors mb-4">
                Get in Touch
              </button>
            </Link>
            <p className="text-xs text-gray-300 text-center">hello@playswitchgames.com</p>
          </div>
        </div>
      </div>
    </>
  )
}
