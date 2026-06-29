import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import Modal from '../../components/admin/Modal.jsx'
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx'
import FormField, { Input, Textarea, Select } from '../../components/admin/FormField.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'
import ImageUpload from '../../components/admin/ImageUpload.jsx'

const EMPTY_ARTIST = {
  name: '', slug: '', bio: '', statement: '', medium: '', email: '', phone: '',
  headshot_url: '', exhibit_title: '', is_active: true, is_featured: false, sort_order: 0,
  social_links: { instagram: '', facebook: '', website: '', youtube: '', etsy: '' },
  external_links: [], youtube_urls: [],
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminArtists() {
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [artworksModalOpen, setArtworksModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_ARTIST)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [saving, setSaving] = useState(false)
  const [activeArtistId, setActiveArtistId] = useState(null)

  useEffect(() => { loadArtists() }, [])

  async function loadArtists() {
    const { data } = await supabase.from('artists').select('*').order('sort_order').order('name')
    setArtists(data || [])
    setLoading(false)
  }

  function openCreate() {
    setEditing(null)
    setForm(EMPTY_ARTIST)
    setModalOpen(true)
  }

  function openEdit(artist) {
    setEditing(artist)
    setForm({
      ...EMPTY_ARTIST,
      ...artist,
      social_links: { ...EMPTY_ARTIST.social_links, ...(artist.social_links || {}) },
    })
    setModalOpen(true)
  }

  function openArtworks(artistId) {
    setActiveArtistId(artistId)
    setArtworksModalOpen(true)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleSocial(platform, value) {
    setForm(f => ({ ...f, social_links: { ...f.social_links, [platform]: value } }))
  }

  function handleNameBlur() {
    if (!editing && form.name && !form.slug) {
      setForm(f => ({ ...f, slug: slugify(f.name) }))
    }
  }

  function handleExternalLinkChange(i, field, value) {
    setForm(f => {
      const links = [...(f.external_links || [])]
      links[i] = { ...links[i], [field]: value }
      return { ...f, external_links: links }
    })
  }

  function addExternalLink() {
    setForm(f => ({ ...f, external_links: [...(f.external_links || []), { label: '', url: '' }] }))
  }

  function removeExternalLink(i) {
    setForm(f => ({ ...f, external_links: f.external_links.filter((_, idx) => idx !== i) }))
  }

  function handleYouTubeChange(i, value) {
    setForm(f => {
      const urls = [...(f.youtube_urls || [])]
      urls[i] = value
      return { ...f, youtube_urls: urls }
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form }
    if (editing) {
      await supabase.from('artists').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('artists').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    loadArtists()
  }

  async function handleDelete() {
    await supabase.from('artists').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    loadArtists()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold">Artists</h1>
        <AdminButton onClick={openCreate}>+ Add Artist</AdminButton>
      </div>

      {loading ? (
        <div className="animate-pulse text-sm text-gray-400">Loading…</div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="text-left px-4 py-3">Artist</th>
                <th className="text-left px-4 py-3">Medium</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {artists.map(artist => (
                <tr key={artist.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {artist.headshot_url
                        ? <img src={artist.headshot_url} className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">?</div>
                      }
                      <div>
                        <p className="font-medium">{artist.name}</p>
                        <p className="text-gray-400 text-xs">/{artist.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{artist.medium || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {artist.is_featured && <span className="bg-accent/20 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">Featured</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${artist.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {artist.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <AdminButton size="sm" variant="ghost" onClick={() => openArtworks(artist.id)}>Artworks</AdminButton>
                      <AdminButton size="sm" variant="ghost" onClick={() => openEdit(artist)}>Edit</AdminButton>
                      <AdminButton size="sm" variant="danger" onClick={() => setDeleteTarget(artist.id)}>Delete</AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {artists.length === 0 && (
            <p className="text-center text-gray-400 py-12 text-sm">No artists yet. Add your first one!</p>
          )}
        </div>
      )}

      {/* Artist form modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? `Edit: ${editing.name}` : 'New Artist'} size="lg">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Full Name *">
              <Input name="name" value={form.name} onChange={handleChange} onBlur={handleNameBlur} required />
            </FormField>
            <FormField label="URL Slug *" hint="e.g. jane-doe → /gallery/jane-doe">
              <Input name="slug" value={form.slug} onChange={handleChange} required />
            </FormField>
            <FormField label="Primary Medium">
              <Input name="medium" value={form.medium} onChange={handleChange} placeholder="Oil on Canvas, Watercolor, Sculpture…" />
            </FormField>
            <FormField label="Sort Order" hint="Lower numbers appear first">
              <Input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} />
            </FormField>
          </div>

          {/* Photo */}
          <FormField label="Headshot / Profile Photo">
            <ImageUpload
              bucket="artists"
              currentUrl={form.headshot_url}
              onUpload={url => setForm(f => ({ ...f, headshot_url: url }))}
            />
          </FormField>

          {/* Bio & Statement */}
          <FormField label="Artist Statement">
            <Textarea name="statement" value={form.statement} onChange={handleChange} rows={4} />
          </FormField>
          <FormField label="Biography">
            <Textarea name="bio" value={form.bio} onChange={handleChange} rows={4} />
          </FormField>

          {/* Contact */}
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Email">
              <Input name="email" type="email" value={form.email} onChange={handleChange} />
            </FormField>
            <FormField label="Phone">
              <Input name="phone" value={form.phone} onChange={handleChange} />
            </FormField>
          </div>

          {/* Social links */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Social Media</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.keys(form.social_links).map(platform => (
                <FormField key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                  <Input
                    value={form.social_links[platform] || ''}
                    onChange={e => handleSocial(platform, e.target.value)}
                    placeholder={`https://${platform}.com/…`}
                  />
                </FormField>
              ))}
            </div>
          </div>

          {/* External links */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">External Links</p>
              <AdminButton type="button" size="sm" variant="ghost" onClick={addExternalLink}>+ Add Link</AdminButton>
            </div>
            <div className="space-y-2">
              {(form.external_links || []).map((link, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Label (e.g. Press Article)" value={link.label} onChange={e => handleExternalLinkChange(i, 'label', e.target.value)} />
                  <Input placeholder="https://…" value={link.url} onChange={e => handleExternalLinkChange(i, 'url', e.target.value)} />
                  <button type="button" onClick={() => removeExternalLink(i)} className="text-red-400 hover:text-red-600 px-1">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* YouTube */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">YouTube Videos</p>
              <AdminButton type="button" size="sm" variant="ghost"
                onClick={() => setForm(f => ({ ...f, youtube_urls: [...(f.youtube_urls || []), ''] }))}>
                + Add Video
              </AdminButton>
            </div>
            <div className="space-y-2">
              {(form.youtube_urls || []).map((url, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="https://youtube.com/watch?v=…" value={url} onChange={e => handleYouTubeChange(i, e.target.value)} />
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, youtube_urls: f.youtube_urls.filter((_, idx) => idx !== i) }))}
                    className="text-red-400 hover:text-red-600 px-1">×</button>
                </div>
              ))}
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} className="rounded" />
              Active (visible on site)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="is_featured" checked={form.is_featured} onChange={handleChange} className="rounded" />
              Featured Artist
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <AdminButton type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancel</AdminButton>
            <AdminButton type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Artist'}</AdminButton>
          </div>
        </form>
      </Modal>

      {/* Artworks modal */}
      {activeArtistId && (
        <ArtworksModal
          open={artworksModalOpen}
          onClose={() => setArtworksModalOpen(false)}
          artistId={activeArtistId}
          artistName={artists.find(a => a.id === activeArtistId)?.name}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        message="Delete this artist? Their artworks will also be deleted. This cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

// ── Artworks sub-manager ─────────────────────────────────────────────────────
const EMPTY_ARTWORK = { title: '', medium: '', dimensions: '', price: '', description: '', image_url: '', is_sold: false, sort_order: 0 }

function ArtworksModal({ open, onClose, artistId, artistName }) {
  const [artworks, setArtworks] = useState([])
  const [form, setForm] = useState(EMPTY_ARTWORK)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    if (open) loadArtworks()
  }, [open, artistId])

  async function loadArtworks() {
    const { data } = await supabase.from('artworks').select('*').eq('artist_id', artistId).order('sort_order').order('created_at')
    setArtworks(data || [])
  }

  function startEdit(artwork) {
    setEditingId(artwork.id)
    setForm({ ...EMPTY_ARTWORK, ...artwork })
  }

  function cancelEdit() {
    setEditingId(null)
    setForm(EMPTY_ARTWORK)
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, artist_id: artistId, price: form.price ? parseFloat(form.price) : null }
    if (editingId) {
      await supabase.from('artworks').update(payload).eq('id', editingId)
    } else {
      await supabase.from('artworks').insert(payload)
    }
    setSaving(false)
    setEditingId(null)
    setForm(EMPTY_ARTWORK)
    loadArtworks()
  }

  async function handleDelete() {
    await supabase.from('artworks').delete().eq('id', deleteTarget)
    setDeleteTarget(null)
    loadArtworks()
  }

  return (
    <Modal open={open} onClose={onClose} title={`Artworks — ${artistName}`} size="xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* List */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-600 uppercase tracking-wide">Portfolio ({artworks.length})</h3>
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {artworks.map(aw => (
              <div key={aw.id} className="flex items-center gap-3 p-2 rounded-lg border hover:bg-gray-50 group">
                {aw.image_url
                  ? <img src={aw.image_url} className="w-12 h-12 object-cover rounded" />
                  : <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No img</div>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{aw.title}</p>
                  <p className="text-xs text-gray-400">{[aw.medium, aw.dimensions, aw.price ? `$${aw.price}` : null].filter(Boolean).join(' · ')}</p>
                  {aw.is_sold && <span className="text-xs text-red-500 font-medium">Sold</span>}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AdminButton size="sm" variant="ghost" onClick={() => startEdit(aw)}>Edit</AdminButton>
                  <AdminButton size="sm" variant="danger" onClick={() => setDeleteTarget(aw.id)}>×</AdminButton>
                </div>
              </div>
            ))}
            {artworks.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No artworks yet.</p>}
          </div>
        </div>

        {/* Form */}
        <div>
          <h3 className="font-semibold text-sm mb-3 text-gray-600 uppercase tracking-wide">
            {editingId ? 'Edit Artwork' : 'Add Artwork'}
          </h3>
          <form onSubmit={handleSave} className="space-y-3">
            <FormField label="Title *">
              <Input name="title" value={form.title} onChange={handleChange} required />
            </FormField>
            <FormField label="Image">
              <ImageUpload bucket="artworks" currentUrl={form.image_url} onUpload={url => setForm(f => ({ ...f, image_url: url }))} />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Medium">
                <Input name="medium" value={form.medium} onChange={handleChange} />
              </FormField>
              <FormField label="Dimensions">
                <Input name="dimensions" value={form.dimensions} onChange={handleChange} placeholder='24" × 36"' />
              </FormField>
              <FormField label="Price ($)">
                <Input name="price" type="number" step="0.01" value={form.price} onChange={handleChange} />
              </FormField>
              <FormField label="Sort Order">
                <Input name="sort_order" type="number" value={form.sort_order} onChange={handleChange} />
              </FormField>
            </div>
            <FormField label="Description">
              <Textarea name="description" value={form.description} onChange={handleChange} rows={2} />
            </FormField>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" name="is_sold" checked={form.is_sold} onChange={handleChange} className="rounded" />
              Mark as Sold
            </label>
            <div className="flex gap-2 pt-1">
              {editingId && <AdminButton type="button" variant="ghost" onClick={cancelEdit} size="sm">Cancel</AdminButton>}
              <AdminButton type="submit" disabled={saving} size="sm">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Artwork'}
              </AdminButton>
            </div>
          </form>
        </div>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        message="Delete this artwork?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Modal>
  )
}
