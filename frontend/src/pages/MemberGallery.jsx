import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase.js'
import { useSiteConfig } from '../context/SiteConfigContext.jsx'

export default function MemberGallery() {
  const { config } = useSiteConfig()
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('artists')
      .select('id, name, slug, headshot_url, medium, is_featured')
      .eq('is_active', true)
      .order('name')
      .then(({ data }) => {
        setArtists(data || [])
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Helmet><title>Member Gallery — {config.site_name}</title></Helmet>

      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <span className="w-10 h-0.5 bg-accent" />
          <h1 className="font-heading text-3xl font-bold">Member Gallery</h1>
        </div>
        <p className="opacity-70 mb-10 max-w-2xl">
          Discover the talented artists who make up our cooperative. Click any artist to explore their portfolio, bio, and contact information.
        </p>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-secondary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {artists.map(artist => (
              <Link
                key={artist.id}
                to={`/gallery/${artist.slug}`}
                className="group text-center"
              >
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                  {artist.headshot_url
                    ? <img src={artist.headshot_url} alt={artist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">🎨</div>
                  }
                </div>
                <h3 className="font-heading font-semibold text-sm">{artist.name}</h3>
                {artist.medium && <p className="text-xs opacity-50 mt-0.5">{artist.medium}</p>}
                {artist.is_featured && (
                  <span className="inline-block mt-1 text-xs bg-accent text-primary px-2 py-0.5 rounded-full font-medium">
                    Featured
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
