import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase.js'
import { useSiteConfig } from '../context/SiteConfigContext.jsx'
import EventCard from '../components/calendar/EventCard.jsx'

export default function Events() {
  const { config } = useSiteConfig()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .then(({ data }) => {
        setEvents(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Helmet><title>Events — {config.site_name}</title></Helmet>
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-10 h-0.5 bg-accent" />
          <h1 className="font-heading text-3xl font-bold">Events & Calendar</h1>
        </div>

        {config.google_calendar_id && (
          <div className="mb-10 rounded-xl overflow-hidden shadow">
            <iframe
              src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(config.google_calendar_id)}&ctz=America%2FChicago&showTitle=0&showNav=1&showPrint=0&showCalendars=0`}
              className="w-full"
              height="500"
              frameBorder="0"
              title="Gallery Calendar"
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
          </div>
        ) : events.length === 0 ? (
          <p className="text-center opacity-50 py-12">No upcoming events at this time.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(event => <EventCard key={event.id} event={event} />)}
          </div>
        )}
      </section>
    </>
  )
}
