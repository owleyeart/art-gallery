import { Link } from 'react-router-dom'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'

export default function Footer() {
  const { config } = useSiteConfig()
  const socials = config.social_links || {}

  return (
    <footer className="bg-primary text-on-primary mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-heading text-lg font-bold mb-2">{config.site_name}</h3>
          <p className="text-sm opacity-80">{config.tagline}</p>
        </div>
        <div className="text-sm opacity-80 space-y-1">
          <p>{config.address}</p>
          {config.phone && <p>{config.phone}</p>}
          {config.email && <a href={`mailto:${config.email}`} className="hover:text-accent">{config.email}</a>}
          {config.hours && <p>{config.hours}</p>}
        </div>
        <div>
          <h4 className="font-semibold mb-2 text-sm uppercase tracking-wide">Follow Us</h4>
          <div className="flex gap-3 flex-wrap">
            {Object.entries(socials).map(([platform, url]) => url && (
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                className="text-sm hover:text-accent capitalize transition-colors">
                {platform}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center text-xs opacity-50 py-3">
        © {new Date().getFullYear()} {config.site_name}. All rights reserved.
        <span className="mx-2">·</span>
        <Link to="/admin" className="hover:opacity-100">Admin</Link>
      </div>
    </footer>
  )
}
