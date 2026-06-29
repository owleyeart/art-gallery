import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { supabase } from '../../lib/supabase.js'
import Modal from '../../components/admin/Modal.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import FormField, { Input, Textarea, Select } from '../../components/admin/FormField.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'

const EVENT_TYPES = [
  { value: 'featured_friday', label: 'Featured Artist Friday' },
  { value: 'juried_show', label: 'Juried Art Show' },
  { value: 'farmers_market', label: "Farmer's Market Saturday" },
  { value: 'art_fair', label: 'Art Fair' },
  { value: 'other', label: 'Other' },
]

const TYPE_COLORS = {
  featured_friday: 'bg-purple-100 text-purple-700',
  juried_show: 'bg-amber-100 text-amber-700',
  farmers_market: 'bg-green-100 text-green-700',
  art_fair: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-600',
}

const EMPTY_EVENT = {
  title: '', description: '', start_date: '', end_date: '',
  event_type: 'other', location: '', image_url: '', is_recurring: false,
}

function toDatetimeLocal(iso) {
  if (!iso) return ''
  return iso.slice(0, 16) // "YYYY-MM-DDTHH:mm"
}

export default function AdminEventsAdmin() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_EVENT)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState('upcoming') // 'upcoming' | 'all'

  useEffect(() => { loadEvents() }, [filter])

  async function loadEvents() {
    let q = supabase.from('events').select('*').order('start_date', { ascending: true })
    if (filter === 'upcoming') q = q.gte('start_date', new Date().toISOString())
    const { data } = await q
    setEvents(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_EVENT)
    setModalOpen(true)
  }

  function openEdit(event) {
    setEditing(event)
    setForm({
      ...EMPTY_EVENT, ...event,
      start_date: toDatetimeLocal(event.start_date),
      end_date: toDatetimeLocal(event.end_date),
    })
    setModalOpen(true)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
      end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
    }
    if (editing) {
      await supabase.from('events').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('events').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    loadEvents()
  }

  async function handleDelete() {
    await supabase.from('events').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    loadEvents()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold">Events</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1 text-sm">
            {['upcoming', 'all'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md transition-all capitalize ${filter === f ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
                {f}
              </button>
            ))}
          </div>
          <AdminButton onClick={openCreate}>+ Add Event</AdminButton>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="space-y-2">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl border p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
              {/* Date block */}
              <div className="text-center min-w-[52px]">
                <div className="text-2xl font-bold font-heading leading-none">{format(new Date(event.start_date), 'd')}</div>
                <div className="text-xs text-gray-400">{format(new Date(event.start_date), 'MMM yy')}</div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="font-semibold text-sm">{event.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[event.event_type]}`}>
                    {EVENT_TYPES.find(t => t.value === event.event_type)?.label}
                  </span>
                  {event.is_recurring && <span className="text-xs text-gray-400">↻ Recurring</span>}
                </div>
                {event.location && <p className="text-xs text-gray-400">📍 {event.location}</p>}
                {event.description && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</p>}
              </div>
              <div className="flex gap-2">
                <AdminButton size="sm" variant="ghost" onClick={() => openEdit(event)}>Edit</AdminButton>
                <AdminButton size="sm" variant="danger" onClick={() => setDeleteTarget(event.id)}>Delete</AdminButton>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="text-center text-gray-400 py-16 text-sm">
              {filter === 'upcoming' ? 'No upcoming events. Add one!' : 'No events yet.'}
            </p>
          )}
        </div>
      )}

      {/* Event form modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Event' : 'New Event'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Event Title *">
            <Input name="title" value={form.title} onChange={handleChange} required />
          </FormField>

          <FormField label="Event Type">
            <Select name="event_type" value={form.event_type} onChange={handleChange}>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Start Date & Time *">
              <Input type="datetime-local" name="start_date" value={form.start_date} onChange={handleChange} required />
            </FormField>
            <FormField label="End Date & Time">
              <Input type="datetime-local" name="end_date" value={form.end_date} onChange={handleChange} />
            </FormField>
          </div>

          <FormField label="Location">
            <Input name="location" value={form.location} onChange={handleChange} placeholder="Gallery, Downtown OP, etc." />
          </FormField>

          <FormField label="Description">
            <Textarea name="description" value={form.description} onChange={handleChange} rows={3} />
          </FormField>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" name="is_recurring" checked={form.is_recurring} onChange={handleChange} className="rounded" />
            Recurring event (3rd Friday, monthly, etc.)
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <AdminButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Event'}</AdminButton>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        message="Delete this event?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
