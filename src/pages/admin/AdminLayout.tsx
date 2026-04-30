import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

const NAV_SECTIONS = [
  { heading: 'Overview', items: [
    { path: '/admin', label: 'Dashboard', exact: true },
  ]},
  { heading: 'Content', items: [
    { path: '/admin/games', label: 'Games' },
    { path: '/admin/blog', label: 'Blog Posts' },
    { path: '/admin/case-studies', label: 'Case Studies' },
  ]},
  { heading: 'People', items: [
    { path: '/admin/team', label: 'Team' },
    { path: '/admin/careers', label: 'Careers' },
  ]},
  { heading: 'Inbox', items: [
    { path: '/admin/contacts', label: 'Enquiries' },
    { path: '/admin/newsletter', label: 'Newsletter' },
  ]},
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const logout = () => { sessionStorage.removeItem('switch_admin'); navigate('/admin/login') }

  const isActive = (path: string, exact?: boolean) =>
    exact ? pathname === path : pathname === path || pathname.startsWith(path + '/')

  return (
    <div className="min-h-screen bg-black text-white flex">
      <aside className="w-56 fixed top-0 left-0 h-full flex flex-col px-3 py-5 overflow-y-auto" style={{ borderRight: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.95)' }}>
        <Link to="/" className="flex items-center gap-3 px-3 mb-6">
          <img src="/logo.png" alt="Switch" className="h-8 w-8 object-contain" />
          <div><p className="text-sm font-semibold" style={{ letterSpacing: '-0.02em' }}>Switch</p><p className="text-xs text-gray-300">Admin</p></div>
        </Link>

        <nav className="flex flex-col gap-5 flex-1">
          {NAV_SECTIONS.map(section => (
            <div key={section.heading}>
              <p className="text-xs uppercase tracking-widest text-gray-300 px-3 mb-1">{section.heading}</p>
              {section.items.map(item => (
                <Link key={item.path} to={item.path}
                  className={`block px-3 py-2 rounded-xl text-sm transition-colors ${isActive(item.path, item.exact) ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="pt-3 mt-3">
          <Link to="/" className="block px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors mb-1">← View Site</Link>
          <button onClick={logout} className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-8 min-h-screen"><Outlet /></main>
    </div>
  )
}
