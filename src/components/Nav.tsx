import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { path: '/', label: 'HOME' },
  { path: '/games', label: 'GAMES' },
  { path: '/team', label: 'TEAM' },
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
      <nav className="fixed top-4 md:top-8 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="flex items-center justify-between w-full max-w-5xl liquid-glass rounded-full px-6 md:px-10 py-3 md:py-4 pointer-events-auto shadow-2xl shadow-black/50">
          <Link to="/" className="flex items-center group">
            <img src="/logo.png" alt="Switch" className="h-8 w-8 md:h-10 md:w-10 object-contain group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-12">
            {LINKS.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`text-[12px] xl:text-[13px] font-semibold tracking-[0.12em] transition-all hover:-translate-y-0.5 ${
                  isActive(l.path) ? 'text-white drop-shadow-md' : 'text-gray-400 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link to="/contact">
              <button className="btn-pill btn-pill-sm !border-white/20 hover:!border-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                Get in Touch
              </button>
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2 rounded-full hover:bg-white/10 transition-colors border border-transparent hover:border-white/20"
            onClick={() => setOpen(o => !o)}
            aria-label="Menu"
          >
            <span className="block w-5 h-px bg-white transition-all duration-300" style={{ transform: open ? 'translateY(7px) rotate(45deg)' : 'none' }} />
            <span className="block w-5 h-px bg-white transition-all duration-300" style={{ opacity: open ? 0 : 1 }} />
            <span className="block w-5 h-px bg-white transition-all duration-300" style={{ transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="fixed inset-0 z-40 lg:hidden"
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
