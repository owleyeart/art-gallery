import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const SiteConfigContext = createContext(null)

const DEFAULT_CONFIG = {
  site_name: 'Images Art Gallery',
  tagline: 'Where Art Comes Alive',
  logo_url: null,
  address: '7945 Marty St, Overland Park, KS 66204',
  phone: '',
  email: '',
  hours: 'Tue–Sat 11am–5pm',
  social_links: {},
  color_primary: '#2d2d2d',
  color_secondary: '#6b4c8a',
  color_accent: '#c9a84c',
  color_surface: '#fafafa',
  font_heading: "'Georgia', serif",
  font_body: "'Inter', system-ui, sans-serif",
  google_calendar_id: '',
  meta_description: 'A community art gallery showcasing local artists.',
  meta_keywords: 'art gallery, local art, artists',
}

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadConfig() {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .single()

      if (!error && data) {
        setConfig({ ...DEFAULT_CONFIG, ...data })
        applyCssVars(data)
      }
      setLoading(false)
    }
    loadConfig()
  }, [])

  function applyCssVars(cfg) {
    const root = document.documentElement
    if (cfg.color_primary)   root.style.setProperty('--color-primary', cfg.color_primary)
    if (cfg.color_secondary) root.style.setProperty('--color-secondary', cfg.color_secondary)
    if (cfg.color_accent)    root.style.setProperty('--color-accent', cfg.color_accent)
    if (cfg.color_surface)   root.style.setProperty('--color-surface', cfg.color_surface)
    if (cfg.font_heading)    root.style.setProperty('--font-heading', cfg.font_heading)
    if (cfg.font_body)       root.style.setProperty('--font-body', cfg.font_body)
  }

  return (
    <SiteConfigContext.Provider value={{ config, setConfig, loading }}>
      {children}
    </SiteConfigContext.Provider>
  )
}

export function useSiteConfig() {
  return useContext(SiteConfigContext)
}
