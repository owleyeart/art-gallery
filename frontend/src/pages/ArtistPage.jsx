import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase.js'
import { useSiteConfig } from '../context/SiteConfigContext.jsx'
import ArtworkGrid from '../components/gallery/ArtworkGrid.jsx'

const SOCIAL_ICONS = {
  instagram: '📸',
  facebook: '👤',
  website: '🌐',
  youtube: '▶️',
  etsy: '🛍️',
}

export default function ArtistPage() {
  const { slug } = useParams()
  const { config } = useSiteConfig()
  const [artist, setArtist] = useState(null)
  const [artworks, setArtworks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('artists')
        .select('*, artworks(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      if (data) {
        setArtist(data)
        setArtworks(data.artworks || [])
      }
      setLoading(false)
    }
    load()
  }, [slug])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
    </div>
  )

  if (!artist) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-xl opacity-50">Artist not found.</p>
      <Link to="/gallery" className="text-secondary hover:underline">← Back to Gallery</Link>
    </div>
  )

  const socials = artist.social_links || {}
  const links = artist.external_links || []

  return (
    <>
      <Helmet>
        <title>{artist.name} — {config.site_name}</title>
        <meta name="description" content={artist.statement?.slice(0, 160)} />
      </Helmet>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <Link to="/gallery" className="text-sm text-secondary hover:underline mb-8 inline-block">
          ← Member Gallery
        </Link>

        {/* Artist header */}
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          <div>
            {artist.headshot_url && (
              <img src={artist.headshot_url} alt={artist.name}
                className="w-full rounded-xl object-cover aspect-square shadow-md" />
            )}
          </div>
          <div className="md:col-span-2">
            <h1 className="font-heading text-4xl font-bold mb-1">{artist.name}</h1>
            {artist.medium && <p className="text-secondary font-medium mb-4">{artist.medium}</p>}

            {artist.statement && (
              <div className="mb-6">
                <h2 className="font-heading text-lg font-semibold mb-2">Artist Statement</h2>
                <p className="text-sm leading-relaxed opacity-80 whitespace-pre-line">{artist.statement}</p>
              </div>
            )}

            {artist.bio && (
              <div className="mb-6">
                <h2 className="font-heading text-lg font-semibold mb-2">Biography</h2>
                <p className="text-sm leading-relaxed opacity-70 whitespace-pre-line">{artist.bio}</p>
              </div>
            )}

            {/* Contact */}
            <div className="text-sm space-y-1 mb-4">
              {artist.email && <p>✉️ <a href={`mailto:${artist.email}`} className="text-secondary hover:underline">{artist.email}</a></p>}
              {artist.phone && <p>📞 {artist.phone}</p>}
            </div>

            {/* Social links */}
            {Object.keys(socials).length > 0 && (
              <div className="flex gap-3 flex-wrap">
                {Object.entries(socials).map(([platform, url]) => url && (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                    className="text-sm bg-gray-100 px-3 py-1 rounded-full hover:bg-gray-200 transition capitalize">
                    {SOCIAL_ICONS[platform] || '🔗'} {platform}
                  </a>
                ))}
              </div>
            )}

            {/* External links */}
            {links.length > 0 && (
              <div className="mt-4 space-y-1">
                {links.map((link, i) => (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="block text-sm text-secondary hover:underline">
                    🔗 {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* YouTube embeds */}
        {artist.youtube_urls?.length > 0 && (
          <div className="mb-12">
            <h2 className="font-heading text-2xl font-bold mb-6">Video</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {artist.youtube_urls.map((url, i) => (
                <div key={i} className="aspect-video rounded-xl overflow-hidden shadow">
                  <iframe
                    src={url.replace('watch?v=', 'embed/')}
                    className="w-full h-full"
                    allowFullScreen
                    title={`${artist.name} video ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Artwork gallery */}
        <div>
          <h2 className="font-heading text-2xl font-bold mb-6">Portfolio</h2>
          <ArtworkGrid artworks={artworks} />
        </div>
      </section>
    </>
  )
}
