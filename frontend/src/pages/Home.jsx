import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase.js'
import { useSiteConfig } from '../context/SiteConfigContext.jsx'
import ArtworkGrid from '../components/gallery/ArtworkGrid.jsx'
import EventCard from '../components/calendar/EventCard.jsx'

export default function Home() {
  const { config } = useSiteConfig()
  const [featured, setFeatured] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])

  useEffect(() => {
    async function load() {
      // Featured artist
      const { data: artist } = await supabase
        .from('artists')
        .select('*, artworks(*)')
        .eq('is_featured', true)
        .single()
      if (artist) {
        setFeatured(artist)
        setArtworks(artist.artworks || [])
      }

      // Upcoming events (next 4)
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(4)
      setUpcomingEvents(events || [])
    }
    load()
  }, [])

  return (
    <>
      <Helmet>
        <title>{config.site_name} — {config.tagline}</title>
      </Helmet>

      {/* Hero */}
      <section className="bg-primary text-on-primary py-20 px-4 text-center">
        <h1 className="font-heading text-4xl md:text-6xl font-bold mb-4">{config.site_name}</h1>
        <p className="text-lg md:text-xl opacity-80 max-w-xl mx-auto">{config.tagline}</p>
        <div className="mt-8 flex gap-4 justify-center flex-wrap">
          <Link to="/gallery" className="bg-accent text-primary font-semibold px-6 py-3 rounded-full hover:opacity-90 transition">
            Member Gallery
          </Link>
          <Link to="/events" className="border border-on-primary text-on-primary px-6 py-3 rounded-full hover:bg-white/10 transition">
            Upcoming Events
          </Link>
        </div>
      </section>

      {/* Featured Artist */}
      {featured && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-center gap-3 mb-8">
            <span className="w-10 h-0.5 bg-accent" />
            <h2 className="font-heading text-2xl font-bold">Featured Artist</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 mb-10">
            <div>
              <h3 className="font-heading text-3xl font-bold mb-1">{featured.name}</h3>
              {featured.exhibit_title && (
                <p className="text-secondary font-medium mb-4 italic">"{featured.exhibit_title}"</p>
              )}
              {featured.statement && (
                <p className="text-sm leading-relaxed opacity-80 mb-4">{featured.statement}</p>
              )}
              {featured.bio && (
                <p className="text-sm leading-relaxed opacity-70">{featured.bio}</p>
              )}
              <Link
                to={`/gallery/${featured.slug}`}
                className="inline-block mt-6 bg-secondary text-white px-5 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
              >
                View Full Portfolio →
              </Link>
            </div>
            <div>
              {featured.headshot_url && (
                <img
                  src={featured.headshot_url}
                  alt={featured.name}
                  className="w-full rounded-xl object-cover max-h-80"
                />
              )}
            </div>
          </div>
          <ArtworkGrid artworks={artworks.slice(0, 8)} />
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-0.5 bg-accent" />
              <h2 className="font-heading text-2xl font-bold">Upcoming Events</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/events" className="text-secondary font-medium hover:underline">
                View Full Calendar →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Info bar */}
      <section className="max-w-6xl mx-auto px-4 py-12 grid sm:grid-cols-3 gap-8 text-center">
        {config.address && (
          <div>
            <h4 className="font-heading font-bold mb-1">Visit Us</h4>
            <p className="text-sm opacity-70">{config.address}</p>
          </div>
        )}
        {config.hours && (
          <div>
            <h4 className="font-heading font-bold mb-1">Hours</h4>
            <p className="text-sm opacity-70">{config.hours}</p>
          </div>
        )}
        {config.phone && (
          <div>
            <h4 className="font-heading font-bold mb-1">Contact</h4>
            <p className="text-sm opacity-70">{config.phone}</p>
            {config.email && (
              <a href={`mailto:${config.email}`} className="text-sm text-secondary hover:underline block">{config.email}</a>
            )}
          </div>
        )}
      </section>
    </>
  )
}
