import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/gallery', label: 'Member Gallery' },
  { to: '/events', label: 'Events' },
  { to: '/about', label: 'About & Contact' },
]

export default function Navbar() {
  const { config } = useSiteConfig()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-primary text-on-primary shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          {config.logo_url
            ? <img src={config.logo_url} alt={config.site_name} className="h-10 w-auto" />
            : <span className="font-heading text-xl font-bold tracking-wide">{config.site_name}</span>
          }
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex gap-6 text-sm font-medium">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  isActive ? 'border-b-2 border-accent pb-0.5' : 'hover:text-accent transition-colors'
                }
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className="block w-6 h-0.5 bg-current mb-1" />
          <span className="block w-6 h-0.5 bg-current mb-1" />
          <span className="block w-6 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <ul className="md:hidden bg-primary border-t border-white/10 px-4 pb-4 flex flex-col gap-3">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => isActive ? 'text-accent font-semibold' : 'hover:text-accent'}
              >
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </nav>
  )
}
