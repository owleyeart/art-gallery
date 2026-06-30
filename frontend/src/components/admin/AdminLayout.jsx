import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/artists', label: 'Artists' },
  { to: '/admin/roster', label: 'Member Roster' },
  { to: '/admin/events', label: 'Events' },
  { to: '/admin/featured', label: 'Featured Artist' },
  { to: '/admin/newsletter', label: 'Newsletter' },
  { to: '/admin/documents', label: 'Documents' },
  { to: '/admin/site-config', label: 'Site Settings' },
]

const SYSTEM_NAV = [
  { to: '/admin/users', label: 'Admin Users' },
]

export default function AdminLayout() {
  const { signOut, role, isSystem } = useAuth()
  const { config } = useSiteConfig()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-primary text-on-primary flex flex-col shadow-xl">
        <div className="p-5 border-b border-white/10">
          <p className="font-heading font-bold text-sm">{config.site_name}</p>
          <p className="text-xs opacity-50 mt-0.5 uppercase tracking-wide">{role} panel</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-white/15 font-semibold' : 'hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
          {isSystem && (
            <>
              <div className="my-2 border-t border-white/10" />
              {SYSTEM_NAV.map(({ to, label }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-white/15 font-semibold' : 'hover:bg-white/10'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="p-3 border-t border-white/10">
          <NavLink to="/" target="_blank" className="block px-3 py-2 text-xs opacity-60 hover:opacity-100">
            ↗ View Site
          </NavLink>
          <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 text-xs opacity-60 hover:opacity-100">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  )
}
