import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'

const NAV_SECTIONS: { heading: string, items: { path: string, label: string, exact?: boolean }[] }[] = [
  { heading: 'Overview', items: [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/settings', label: 'Settings' },
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
    { path: '/admin/applications', label: 'Applications' },
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
    <div className="min-h-screen text-white flex admin-wrapper" style={{ background: 'linear-gradient(to bottom, #030514 0%, #010103 100%)', backgroundAttachment: 'fixed' }}>
      <aside className="w-56 fixed top-0 left-0 h-full flex flex-col px-3 py-5 overflow-y-auto bg-white/[0.01] backdrop-blur-md" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="flex items-center gap-3 px-3 mb-6">
          <img src="/logo.png" alt="Switch" className="h-8 w-8 object-contain" />
          <div><p className="text-sm font-semibold" style={{ letterSpacing: '-0.02em' }}>Switch</p><p className="text-xs text-gray-500">Admin</p></div>
        </Link>

        <nav className="flex flex-col gap-5 flex-1">
          {NAV_SECTIONS.map(section => (
            <div key={section.heading}>
              <p className="text-[10px] uppercase tracking-[0.15em] text-gray-500 font-bold px-3 mb-1">{section.heading}</p>
              {section.items.map(item => (
                <Link key={item.path} to={item.path}
                  className={`block px-3 py-1.5 text-sm transition-all ${isActive(item.path, item.exact) ? 'text-[#1e60ff] font-semibold' : 'text-gray-400 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="pt-3 mt-3">
          <Link to="/" className="block px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors mb-1">← View Site</Link>
          <button onClick={logout} className="w-full text-left px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 ml-56 p-8 min-h-screen relative overflow-y-auto"><Outlet /></main>
    </div>
  )
}
