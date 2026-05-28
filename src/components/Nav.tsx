import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { path: '/', label: 'HOME' },
  { path: '/games', label: 'GAMES' },
  { path: '/team', label: 'ABOUT' },
  { path: '/careers', label: 'CAREERS' },
  { path: '/contact', label: 'CONTACT' },
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

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 lg:px-16">
        <div className="flex items-center justify-between max-w-7xl mx-auto py-6">
          <Link to="/" className="flex items-center">
            <img src="/logo.png" alt="Switch" className="h-9 w-9 object-contain" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-10">
            {LINKS.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`text-[13px] font-medium tracking-[0.12em] transition-colors ${
                  isActive(l.path) ? 'text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

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
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-40 md:hidden"
        style={{
          background: 'rgba(0,0,0,0.97)',
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
                className="text-4xl font-normal text-white hover:text-gray-400 transition-colors py-2"
                style={{
                  letterSpacing: '-0.02em',
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
              <button className="btn-pill btn-pill-solid w-full py-4 text-base mb-4">
                Get in Touch
              </button>
            </Link>
            <p className="text-xs text-gray-500 text-center">hello@playswitchgames.com</p>
          </div>
        </div>
      </div>
    </>
  )
}
