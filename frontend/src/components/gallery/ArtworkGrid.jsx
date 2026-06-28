import { useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'

export default function ArtworkGrid({ artworks = [] }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)

  const slides = artworks.map(a => ({
    src: a.image_url,
    title: a.title,
    description: [a.medium, a.dimensions, a.price ? `$${a.price}` : null]
      .filter(Boolean).join(' · '),
  }))

  if (!artworks.length) return (
    <p className="text-center opacity-50 py-12">No artworks to display.</p>
  )

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {artworks.map((artwork, i) => (
          <button
            key={artwork.id}
            onClick={() => { setIndex(i); setOpen(true) }}
            className="group relative aspect-square overflow-hidden rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <img
              src={artwork.image_url}
              alt={artwork.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
              <span className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                {artwork.title}
              </span>
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        open={open}
        close={() => setOpen(false)}
        slides={slides}
        index={index}
      />
    </>
  )
}
