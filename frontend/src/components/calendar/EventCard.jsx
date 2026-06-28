import { format } from 'date-fns'

const EVENT_TYPE_COLORS = {
  featured_friday: 'bg-secondary text-white',
  juried_show: 'bg-accent text-primary',
  farmers_market: 'bg-green-600 text-white',
  art_fair: 'bg-purple-600 text-white',
  other: 'bg-gray-400 text-white',
}

const EVENT_TYPE_LABELS = {
  featured_friday: 'Featured Artist Friday',
  juried_show: 'Juried Art Show',
  farmers_market: "Farmer's Market Saturday",
  art_fair: 'Art Fair',
  other: 'Event',
}

export default function EventCard({ event }) {
  const start = new Date(event.start_date)
  const colorClass = EVENT_TYPE_COLORS[event.event_type] || EVENT_TYPE_COLORS.other

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`px-4 py-2 text-xs font-semibold uppercase tracking-wide ${colorClass}`}>
        {EVENT_TYPE_LABELS[event.event_type] || event.event_type}
      </div>
      <div className="p-4">
        <div className="text-2xl font-bold font-heading">{format(start, 'd')}</div>
        <div className="text-sm text-secondary font-medium">{format(start, 'MMMM yyyy')}</div>
        <h3 className="font-semibold mt-2 text-sm leading-tight">{event.title}</h3>
        {event.description && (
          <p className="text-xs opacity-60 mt-1 line-clamp-2">{event.description}</p>
        )}
      </div>
    </div>
  )
}
