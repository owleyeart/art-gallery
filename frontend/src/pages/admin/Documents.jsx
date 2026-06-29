import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useAuth } from '../../context/AuthContext.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import FormField, { Input, Select } from '../../components/admin/FormField.jsx'
import { format } from 'date-fns'

const CATEGORIES = ['general', 'contracts', 'roster', 'calendar', 'printables', 'financials', 'other']

const ICONS = {
  'application/pdf': '📄',
  'image/': '🖼️',
  'application/vnd': '📊',
  'text/': '📝',
  default: '📁',
}

function fileIcon(type) {
  const t = type || ''
  for (const [key, icon] of Object.entries(ICONS)) {
    if (key !== 'default' && t.startsWith(key)) return icon
  }
  return ICONS.default
}

export default function AdminDocuments() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [category, setCategory] = useState('general')
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState(null)

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false })
    setDocs(data || [])
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    setError(null)

    for (const file of files) {
      const path = `${category}/${Date.now()}-${file.name}`
      const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file)
      if (uploadErr) { setError(uploadErr.message); continue }

      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
      await supabase.from('documents').insert({
        name: file.name,
        category,
        storage_path: path,
        storage_url: urlData.publicUrl,
        file_type: file.type || null,
        uploaded_by: user?.id,
      })
    }

    setUploading(false)
    e.target.value = ''
    loadDocs()
  }

  async function handleDelete() {
    const doc = docs.find(d => d.id === deleteTarget)
    if (doc) await supabase.storage.from('documents').remove([doc.storage_path])
    await supabase.from('documents').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    loadDocs()
  }

  async function openDoc(storagePath) {
    const { data, error } = await supabase.storage
      .from('documents')
      .createSignedUrl(storagePath, 60) // 60-second expiry
    if (error) { alert('Could not open file: ' + error.message); return }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
  }

  const filtered = filter === 'all' ? docs : docs.filter(d => d.category === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold">Documents</h1>
      </div>

      {/* Upload area */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-6 mb-8">
        <div className="flex items-end gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <Select value={category} onChange={e => setCategory(e.target.value)} className="w-40">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Files</label>
            <input
              type="file"
              multiple
              onChange={handleUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:opacity-90 disabled:opacity-50"
            />
          </div>
        </div>
        {uploading && <p className="text-sm text-gray-400 mt-3">Uploading…</p>}
        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['all', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`px-3 py-1 rounded-full text-sm transition-all capitalize ${filter === c ? 'bg-secondary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Doc list */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16 text-sm">No documents in this category.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">File</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Uploaded</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{fileIcon(doc.file_type)}</span>
                      <span className="font-medium truncate max-w-xs">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-500">{doc.category}</td>
                  <td className="px-4 py-3 text-gray-400">{format(new Date(doc.created_at), 'MMM d, yyyy')}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <AdminButton size="sm" variant="ghost" onClick={() => openDoc(doc.storage_path)}>Open</AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => setDeleteTarget(doc.id)}>Delete</AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        message="Permanently delete this document?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
