import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import { useSiteConfig } from '../../context/SiteConfigContext.jsx'
import FormField, { Input, Textarea, ColorInput } from '../../components/admin/FormField.jsx'
import AdminButton from '../../components/admin/AdminButton.jsx'

const SOCIAL_PLATFORMS = ['instagram', 'facebook', 'youtube', 'pinterest', 'twitter', 'tiktok']
const FONT_PRESETS = [
  { label: 'Georgia (Classic Serif)', value: "'Georgia', serif" },
  { label: 'Playfair Display (Elegant)', value: "'Playfair Display', Georgia, serif" },
  { label: 'Cormorant Garamond (Fine Art)', value: "'Cormorant Garamond', serif" },
  { label: 'Inter (Modern Sans)', value: "'Inter', system-ui, sans-serif" },
  { label: 'Lato (Clean Sans)', value: "'Lato', sans-serif" },
]

export default function AdminSiteConfig() {
  const { setConfig } = useSiteConfig()
  const [form, setForm] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase.from('site_config').select('*').single()
      .then(({ data }) => data && setForm(data))
  }, [])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleSocial(platform, value) {
    setForm(f => ({
      ...f,
      social_links: { ...(f.social_links || {}), [platform]: value }
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('site_config')
      .update(form)
      .eq('id', 1)
      .select()
      .single()

    if (err) {
      setError(err.message)
    } else {
      setConfig(data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
    setSaving(false)
  }

  if (!form) return <div className="animate-pulse text-sm text-gray-400">Loading…</div>

  return (
    <form onSubmit={handleSave}>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-2xl font-bold">Site Settings</h1>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-600 text-sm font-medium">✓ Saved</span>}
          {error && <span className="text-red-500 text-sm">{error}</span>}
          <AdminButton type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </AdminButton>
        </div>
      </div>

      <div className="space-y-10 max-w-3xl">

        {/* Identity */}
        <Section title="Identity">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Gallery Name">
              <Input name="site_name" value={form.site_name || ''} onChange={handleChange} required />
            </FormField>
            <FormField label="Tagline">
              <Input name="tagline" value={form.tagline || ''} onChange={handleChange} />
            </FormField>
          </div>
          <FormField label="About / Mission Statement" hint="Shown on the About page">
            <Textarea name="about" value={form.about || ''} onChange={handleChange} rows={5} />
          </FormField>
          <FormField label="Logo URL" hint="Paste a URL or upload to Supabase Storage and paste the public URL">
            <Input name="logo_url" value={form.logo_url || ''} onChange={handleChange} placeholder="https://…" />
          </FormField>
        </Section>

        {/* Contact */}
        <Section title="Contact & Hours">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Address">
              <Input name="address" value={form.address || ''} onChange={handleChange} />
            </FormField>
            <FormField label="Hours">
              <Input name="hours" value={form.hours || ''} onChange={handleChange} placeholder="Tue–Sat 11am–5pm" />
            </FormField>
            <FormField label="Phone">
              <Input name="phone" value={form.phone || ''} onChange={handleChange} placeholder="(913) 555-0100" />
            </FormField>
            <FormField label="Email">
              <Input name="email" type="email" value={form.email || ''} onChange={handleChange} />
            </FormField>
          </div>
        </Section>

        {/* Social Links */}
        <Section title="Social Media Links">
          <div className="grid sm:grid-cols-2 gap-4">
            {SOCIAL_PLATFORMS.map(platform => (
              <FormField key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                <Input
                  value={form.social_links?.[platform] || ''}
                  onChange={e => handleSocial(platform, e.target.value)}
                  placeholder={`https://${platform}.com/…`}
                />
              </FormField>
            ))}
          </div>
        </Section>

        {/* Colors */}
        <Section title="Color Scheme" hint="These update the live site instantly on save">
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { name: 'color_primary', label: 'Primary (navbar, footer, headings)' },
              { name: 'color_secondary', label: 'Secondary (buttons, links, accents)' },
              { name: 'color_accent', label: 'Accent (highlights, badges)' },
              { name: 'color_surface', label: 'Surface (page background)' },
            ].map(({ name, label }) => (
              <FormField key={name} label={label}>
                <ColorInput name={name} value={form[name]} onChange={handleChange} />
              </FormField>
            ))}
          </div>
        </Section>

        {/* Fonts */}
        <Section title="Typography">
          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Heading Font">
              <select
                name="font_heading"
                value={form.font_heading || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
              >
                {FONT_PRESETS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Body Font">
              <select
                name="font_body"
                value={form.font_body || ''}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary bg-white"
              >
                {FONT_PRESETS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </FormField>
          </div>
        </Section>

        {/* Calendar & SEO */}
        <Section title="Calendar & SEO">
          <FormField label="Google Calendar ID" hint="Found in Google Calendar → Settings → Integrate calendar">
            <Input name="google_calendar_id" value={form.google_calendar_id || ''} onChange={handleChange} placeholder="abc123@group.calendar.google.com" />
          </FormField>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <FormField label="Meta Description" hint="~160 characters for search engines">
              <Textarea name="meta_description" value={form.meta_description || ''} onChange={handleChange} rows={3} />
            </FormField>
            <FormField label="Meta Keywords" hint="Comma-separated">
              <Textarea name="meta_keywords" value={form.meta_keywords || ''} onChange={handleChange} rows={3} />
            </FormField>
          </div>
        </Section>

      </div>
    </form>
  )
}

function Section({ title, hint, children }) {
  return (
    <div>
      <div className="mb-4 pb-2 border-b">
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
