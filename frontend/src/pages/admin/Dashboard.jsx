import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase.js'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'
import { format } from 'date-fns'

function StatCard({ label, value, sub, to, color = 'bg-white' }) {
  const inner = (
    <div className={`${color} rounded-xl border p-5 hover:shadow-md transition-shadow`}>
      <p className="text-3xl font-bold font-heading">{value ?? '—'}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}

export default function AdminDashboard() {
  const { config } = useSiteConfig()
  const [stats, setStats] = useState({})
  const [upcoming, setUpcoming] = useState([])

  useEffect(() => {
    async function load() {
      const [
        { count: artistCount },
        { count: activeArtists },
        { count: artworkCount },
        { count: eventCount },
        { count: subscriberCount },
        { count: docCount },
        { data: events },
      ] = await Promise.all([
        supabase.from('artists').select('*', { count: 'exact', head: true }),
        supabase.from('artists').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('artworks').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).gte('start_date', new Date().toISOString()),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*').gte('start_date', new Date().toISOString()).order('start_date').limit(5),
      ])
      setStats({ artistCount, activeArtists, artworkCount, eventCount, subscriberCount, docCount })
      setUpcoming(events || [])
    }
    load()
  }, [])

  const EVENT_TYPE_LABELS = {
    featured_friday: 'Featured Artist Friday',
    juried_show: 'Juried Art Show',
    farmers_market: "Farmer's Market Saturday",
    art_fair: 'Art Fair',
    other: 'Event',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">{config.site_name}</h1>
        <p className="text-sm text-gray-400 mt-1">Admin Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Active Artists" value={stats.activeArtists} sub={`${stats.artistCount} total`} to="/admin/artists" />
        <StatCard label="Artworks" value={stats.artworkCount} to="/admin/artists" />
        <StatCard label="Upcoming Events" value={stats.eventCount} to="/admin/events" />
        <StatCard label="Newsletter Subscribers" value={stats.subscriberCount} />
      </div>

      {/* Upcoming events */}
      <div className="bg-white rounded-xl border p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold">Upcoming Events</h2>
          <Link to="/admin/events" className="text-sm text-secondary hover:underline">Manage →</Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-400">No upcoming events. <Link to="/admin/events" className="text-secondary hover:underline">Add one.</Link></p>
        ) : (
          <ul className="divide-y">
            {upcoming.map(e => (
              <li key={e.id} className="py-2.5 flex items-center gap-3">
                <span className="text-sm font-mono text-gray-400 w-20 shrink-0">{format(new Date(e.start_date), 'MMM d')}</span>
                <span className="text-sm font-medium">{e.title}</span>
                <span className="text-xs text-gray-400 ml-auto">{EVENT_TYPE_LABELS[e.event_type]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/admin/featured', label: 'Set Featured Artist', icon: '⭐' },
          { to: '/admin/site-config', label: 'Site Settings', icon: '⚙️' },
          { to: '/admin/documents', label: 'Documents', icon: '📁' },
        ].map(({ to, label, icon }) => (
          <Link key={to} to={to} className="bg-white border rounded-xl p-4 flex items-center gap-3 hover:shadow-sm transition-shadow">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
