import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { path: '/', label: 'Home' },
  { path: '/about', label: 'About' },
  { path: '/games', label: 'Games' },
  { path: '/careers', label: 'Careers' },
  { path: '/blog', label: 'Blog' },
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
      <nav className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
        <div className="flex items-center justify-between w-full px-6 md:px-12 lg:px-16 py-4 lg:py-5 pointer-events-auto bg-[#080808]/80 backdrop-blur-xl border-b border-white/[0.05] shadow-xl shadow-black/50">
          <Link to="/" className="flex items-center group">
            <img src="/logo.png" alt="The Block" className="h-8 md:h-9 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-7 xl:gap-11">
            {LINKS.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`text-[14px] xl:text-[15px] font-heading font-semibold tracking-[-0.01em] transition-all hover:-translate-y-0.5 ${
                  isActive(l.path) ? 'text-white drop-shadow-md' : 'text-white/70 hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link to="/contact">
              <button className="btn-nav">
                Contact
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
        className="fixed inset-0 z-[9998] lg:hidden"
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
                className="text-4xl font-heading font-semibold text-white hover:text-gray-400 transition-colors py-2 tracking-tight"
                style={{
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
              <button className="btn-primary w-full py-4 text-base mb-4">
                Contact
              </button>
            </Link>
            <p className="text-xs text-gray-500 text-center">hello@playswitchgames.com</p>
          </div>
        </div>
      </div>
    </>
  )
}
