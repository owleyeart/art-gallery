import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import FormField, { Input, Textarea } from '../../components/admin/FormField.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'

export default function AdminFeaturedArtist() {
  const [artists, setArtists] = useState([])
  const [featured, setFeatured] = useState(null)
  const [exhibitTitle, setExhibitTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from('artists').select('*').eq('is_active', true).order('name')
      .then(({ data }) => {
        setArtists(data || [])
        const f = data?.find(a => a.is_featured)
        if (f) { setFeatured(f.id); setExhibitTitle(f.exhibit_title || '') }
      })
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    // Clear all featured flags, then set the selected one
    await supabase.from('artists').update({ is_featured: false, exhibit_title: null }).neq('id', 'none')
    if (featured) {
      await supabase.from('artists').update({ is_featured: true, exhibit_title: exhibitTitle || null }).eq('id', featured)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const featuredArtist = artists.find(a => a.id === featured)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold">Featured Artist</h1>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <FormField label="Select Featured Artist" hint="This artist will appear front-and-center on the home page">
          <select
            value={featured || ''}
            onChange={e => { setFeatured(e.target.value); setExhibitTitle('') }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
          >
            <option value="">— No featured artist —</option>
            {artists.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </FormField>

        {featured && (
          <FormField label="Exhibit Title" hint='Optional — e.g. "Conversations in Light" — shown in italics on the home page'>
            <Input
              value={exhibitTitle}
              onChange={e => setExhibitTitle(e.target.value)}
              placeholder="Enter exhibit title…"
            />
          </FormField>
        )}

        {/* Preview card */}
        {featuredArtist && (
          <div className="bg-gray-50 rounded-xl p-5 border">
            <p className="text-xs uppercase tracking-wide text-gray-400 font-medium mb-3">Preview</p>
            <div className="flex items-start gap-4">
              {featuredArtist.headshot_url
                ? <img src={featuredArtist.headshot_url} className="w-20 h-20 rounded-xl object-cover" />
                : <div className="w-20 h-20 rounded-xl bg-gray-200 flex items-center justify-center text-2xl">🎨</div>
              }
              <div>
                <h3 className="font-heading font-bold text-lg">{featuredArtist.name}</h3>
                {exhibitTitle && <p className="text-sm italic text-purple-700 mb-1">"{exhibitTitle}"</p>}
                {featuredArtist.medium && <p className="text-sm text-gray-500">{featuredArtist.medium}</p>}
                {featuredArtist.statement && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-3">{featuredArtist.statement}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <AdminButton type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Set Featured Artist'}
        </AdminButton>
      </form>
    </div>
  )
}
