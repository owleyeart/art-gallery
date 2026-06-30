import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'
import Modal from '../../components/admin/Modal.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import FormField, { Input } from '../../components/admin/FormField.jsx'
import { format } from 'date-fns'

async function callManageAdmins(session, body) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-admins`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(body),
    }
  )
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || 'Request failed')
  return json
}

export default function AdminUsers() {
  const { isSystem } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { users } = await callManageAdmins(session, { action: 'list' })
      setUsers(users)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUsers() }, [loadUsers])

  async function handleRevoke() {
    setActionLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await callManageAdmins(session, { action: 'revoke', userId: revokeTarget.user_id })
      showToast(`${revokeTarget.email} access revoked.`)
      setRevokeTarget(null)
      loadUsers()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Guard: only system can see this page
  if (!isSystem) {
    return (
      <div className="text-center py-20 text-sm text-gray-400">
        Only System administrators can manage user accounts.
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Admin Users</h1>
          <p className="text-sm text-gray-400 mt-1">Invite and manage gallery staff accounts</p>
        </div>
        <AdminButton onClick={() => setInviteOpen(true)}>+ Invite Admin</AdminButton>
      </div>

      {toast && (
        <div className={`mb-6 p-4 rounded-lg text-sm ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.type === 'success' ? '✓ ' : '✗ '}{toast.msg}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-lg text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Last Sign-in</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => (
                <tr key={u.user_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      u.role === 'system'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u.confirmed ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Active</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Invite pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {u.last_sign_in ? format(new Date(u.last_sign_in), 'MMM d, yyyy') : 'Never'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'system' && (
                      <AdminButton
                        size="sm"
                        variant="danger"
                        onClick={() => setRevokeTarget(u)}
                      >
                        Revoke Access
                      </AdminButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">No users found.</p>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-400 border">
        <strong className="text-gray-600">Roles:</strong> System users have full control and cannot be revoked here.
        Admin users can manage artists, events, newsletter, and documents.
        Revoked users are immediately banned from signing in.
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvited={(email) => {
          showToast(`Invite sent to ${email}.`)
          setInviteOpen(false)
          loadUsers()
        }}
        onError={(msg) => showToast(msg, 'error')}
      />

      <ConfirmDialog
        open={!!revokeTarget}
        message={`Revoke access for ${revokeTarget?.email}? They will be immediately signed out and banned.`}
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        onCancel={() => setRevokeTarget(null)}
      />
    </div>
  )
}

function InviteModal({ open, onClose, onInvited, onError }) {
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await callManageAdmins(session, { action: 'invite', email })
      onInvited(email)
      setEmail('')
    } catch (err) {
      onError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite Admin User">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email Address" hint="They'll receive an invite link to set their password.">
          <Input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="staff@galleryname.com"
            required
            autoFocus
          />
        </FormField>
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
          Invited users get the <strong>Admin</strong> role — they can manage all gallery content
          but cannot invite or revoke other users.
        </div>
        <div className="flex justify-end gap-3">
          <AdminButton type="button" variant="ghost" onClick={onClose}>Cancel</AdminButton>
          <AdminButton type="submit" disabled={sending || !email}>
            {sending ? 'Sending…' : 'Send Invite'}
          </AdminButton>
        </div>
      </form>
    </Modal>
  )
}
