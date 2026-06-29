import { useState } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function ImageUpload({ bucket = 'gallery', currentUrl, onUpload, label = 'Image' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    const ext = file.name.split('.').pop()
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: false })

    if (uploadError) {
      setError(uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    onUpload(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      {currentUrl && (
        <img src={currentUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
      )}
      <label className="block">
        <span className="sr-only">Upload {label}</span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-secondary file:text-white hover:file:opacity-90 disabled:opacity-50"
        />
      </label>
      {uploading && <p className="text-xs text-gray-400">Uploading…</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
