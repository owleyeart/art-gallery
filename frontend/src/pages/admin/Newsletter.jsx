import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminButton from '../../components/admin/AdminButton.jsx'
import Modal from '../../components/admin/Modal.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import FormField, { Input, Textarea } from '../../components/admin/FormField.jsx'
import { format } from 'date-fns'

const TABS = ['Compose', 'Campaigns', 'Subscribers']

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    draft:   'bg-gray-100 text-gray-600',
    sending: 'bg-blue-100 text-blue-700',
    sent:    'bg-green-100 text-green-700',
    failed:  'bg-red-100 text-red-600',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || map.draft}`}>
      {status}
    </span>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AdminNewsletter() {
  const [tab, setTab] = useState('Compose')

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">Newsletter</h1>
        <p className="text-sm text-gray-400 mt-1">Compose and send campaigns to subscribers</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-8">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              tab === t ? 'border-secondary text-secondary' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Compose'     && <ComposeTab />}
      {tab === 'Campaigns'   && <CampaignsTab />}
      {tab === 'Subscribers' && <SubscribersTab />}
    </div>
  )
}

// ── Compose Tab ───────────────────────────────────────────────────────────────

function ComposeTab() {
  const [subject, setSubject] = useState('')
  const [bodyHtml, setBodyHtml] = useState('')
  const [preview, setPreview] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [result, setResult] = useState(null)
  const [subCount, setSubCount] = useState(null)

  useEffect(() => {
    supabase
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .then(({ count }) => setSubCount(count))
  }, [])

  async function handleSend() {
    setSending(true)
    setResult(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-newsletter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ subject, bodyHtml, bodyText: stripHtml(bodyHtml) }),
        }
      )
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Send failed')
      setResult({ type: 'success', sent: json.sent, total: json.total })
    } catch (err) {
      setResult({ type: 'error', message: err.message })
    } finally {
      setSending(false)
      setConfirm(false)
    }
  }

  function stripHtml(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\n\n+/g, '\n\n').trim()
  }

  const canSend = subject.trim() && bodyHtml.trim()

  return (
    <div className="max-w-3xl">
      {result && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${result.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {result.type === 'success'
            ? `✓ Campaign sent to ${result.sent} of ${result.total} subscribers.`
            : `✗ ${result.message}`}
        </div>
      )}

      <div className="bg-white rounded-xl border p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm text-gray-700 uppercase tracking-wide">New Campaign</h2>
          {subCount !== null && (
            <span className="text-xs text-gray-400">{subCount} active subscriber{subCount !== 1 ? 's' : ''}</span>
          )}
        </div>

        <FormField label="Subject Line">
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="June Newsletter — Summer Show Opening"
          />
        </FormField>

        <FormField label="Email Body" hint="Supports HTML: <p>, <b>, <a>, <h2>, etc. An unsubscribe footer is appended automatically.">
          <Textarea
            value={bodyHtml}
            onChange={e => setBodyHtml(e.target.value)}
            rows={14}
            placeholder="<p>Dear friends,</p>&#10;<p>We're excited to announce...</p>"
            className="font-mono text-xs"
          />
        </FormField>

        <div className="flex items-center gap-3 pt-2">
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => setPreview(true)}
            disabled={!bodyHtml}
          >
            Preview
          </AdminButton>
          <AdminButton
            type="button"
            onClick={() => setConfirm(true)}
            disabled={!canSend || sending}
          >
            {sending ? 'Sending…' : `Send to ${subCount ?? '…'} subscribers`}
          </AdminButton>
        </div>
      </div>

      {/* Preview modal */}
      <Modal open={preview} onClose={() => setPreview(false)} title="Email Preview" size="lg">
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 text-sm border-b">
            <span className="text-gray-400">Subject: </span>
            <span className="font-medium">{subject || '(no subject)'}</span>
          </div>
          <div
            className="p-6 prose max-w-none text-sm"
            dangerouslySetInnerHTML={{ __html: bodyHtml || '<p class="text-gray-400">Nothing to preview yet.</p>' }}
          />
          <div className="px-6 py-4 border-t bg-gray-50 text-xs text-gray-400 text-center">
            You're receiving this because you subscribed. <span className="underline">Unsubscribe</span>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirm}
        message={`Send "${subject}" to ${subCount ?? '…'} active subscribers? This cannot be undone.`}
        onConfirm={handleSend}
        onCancel={() => setConfirm(false)}
      />
    </div>
  )
}

// ── Campaigns Tab ─────────────────────────────────────────────────────────────

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewCampaign, setViewCampaign] = useState(null)

  useEffect(() => {
    supabase
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => { setCampaigns(data || []); setLoading(false) })
  }, [])

  if (loading) return <div className="text-sm text-gray-400 animate-pulse">Loading…</div>

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-gray-400">
        No campaigns sent yet. Go to Compose to send your first one.
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="text-left px-4 py-3">Subject</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Recipients</th>
              <th className="text-left px-4 py-3">Sent</th>
              <th className="text-right px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {campaigns.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium max-w-xs truncate">{c.subject}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-gray-500">{c.recipient_count ?? '—'}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {c.sent_at ? format(new Date(c.sent_at), 'MMM d, yyyy h:mm a') : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminButton size="sm" variant="ghost" onClick={() => setViewCampaign(c)}>View</AdminButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewCampaign && (
        <Modal open onClose={() => setViewCampaign(null)} title={viewCampaign.subject} size="lg">
          <div className="space-y-4">
            <div className="flex gap-4 text-sm text-gray-500">
              <span><StatusBadge status={viewCampaign.status} /></span>
              <span>{viewCampaign.recipient_count ?? 0} recipients</span>
              {viewCampaign.sent_at && <span>{format(new Date(viewCampaign.sent_at), 'PPpp')}</span>}
            </div>
            {viewCampaign.error_message && (
              <p className="text-sm text-red-600 bg-red-50 rounded p-3">{viewCampaign.error_message}</p>
            )}
            <div className="border rounded-lg overflow-hidden">
              <div
                className="p-6 prose max-w-none text-sm"
                dangerouslySetInnerHTML={{ __html: viewCampaign.body_html || viewCampaign.body_text || '' }}
              />
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ── Subscribers Tab ───────────────────────────────────────────────────────────

function SubscribersTab() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterActive, setFilterActive] = useState('all')
  const [toggling, setToggling] = useState(null)

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
    setSubscribers(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggleActive(sub) {
    setToggling(sub.id)
    await supabase
      .from('newsletter_subscribers')
      .update({ is_active: !sub.is_active })
      .eq('id', sub.id)
    setSubscribers(prev => prev.map(s => s.id === sub.id ? { ...s, is_active: !s.is_active } : s))
    setToggling(null)
  }

  const filtered = subscribers.filter(s => {
    const matchSearch = s.email.toLowerCase().includes(search.toLowerCase())
    const matchActive = filterActive === 'all' || (filterActive === 'active' ? s.is_active : !s.is_active)
    return matchSearch && matchActive
  })

  const activeCount = subscribers.filter(s => s.is_active).length

  if (loading) return <div className="text-sm text-gray-400 animate-pulse">Loading…</div>

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-6 mb-6 text-sm text-gray-500">
        <span><strong className="text-gray-900">{activeCount}</strong> active</span>
        <span><strong className="text-gray-900">{subscribers.length - activeCount}</strong> unsubscribed</span>
        <span><strong className="text-gray-900">{subscribers.length}</strong> total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5">
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search email…"
          className="max-w-xs"
        />
        <select
          value={filterActive}
          onChange={e => setFilterActive(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="all">All</option>
          <option value="active">Active only</option>
          <option value="inactive">Unsubscribed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Subscribed</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(sub => (
              <tr key={sub.id} className={`hover:bg-gray-50 transition-colors ${!sub.is_active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 font-mono text-xs">{sub.email}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {format(new Date(sub.subscribed_at), 'MMM d, yyyy')}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sub.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {sub.is_active ? 'Active' : 'Unsubscribed'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <AdminButton
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(sub)}
                    disabled={toggling === sub.id}
                  >
                    {toggling === sub.id ? '…' : sub.is_active ? 'Unsubscribe' : 'Re-subscribe'}
                  </AdminButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-12 text-sm">
            {subscribers.length === 0 ? 'No subscribers yet.' : 'No results match your filter.'}
          </p>
        )}
      </div>
    </div>
  )
}
