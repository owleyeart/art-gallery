import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase.js'
import AdminButton from './AdminButton.jsx'

export default function DocumentViewer({ doc, onClose }) {
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!doc) return
    supabase.storage
      .from('documents')
      .createSignedUrl(doc.storage_path, 300) // 5-minute window
      .then(({ data, error: err }) => {
        if (err) setError(err.message)
        else setUrl(data.signedUrl)
        setLoading(false)
      })
  }, [doc])

  if (!doc) return null

  const isPdf = doc.file_type === 'application/pdf'
  const isImage = doc.file_type?.startsWith('image/')

  async function handleDownload() {
    const a = document.createElement('a')
    a.href = url
    a.download = doc.name
    a.click()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/95">
      {/* Header bar */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-800 text-white shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-lg">{doc.name}</span>
          <span className="text-xs text-gray-400 uppercase tracking-wide">{doc.category}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {url && (
            <AdminButton size="sm" variant="ghost" onClick={handleDownload}
              className="text-white border-white/30 hover:bg-white/10">
              ⬇ Download
            </AdminButton>
          )}
          <button onClick={onClose}
            className="ml-2 text-gray-400 hover:text-white text-2xl leading-none px-1">
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex items-center justify-center p-4">
        {loading && (
          <div className="text-white/60 text-sm animate-pulse">Loading document…</div>
        )}
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        {!loading && !error && url && (
          <>
            {isPdf && (
              <iframe
                src={url}
                title={doc.name}
                className="w-full h-full rounded-lg bg-white"
              />
            )}
            {isImage && (
              <img
                src={url}
                alt={doc.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            )}
            {!isPdf && !isImage && (
              <div className="text-center text-white space-y-4">
                <p className="text-5xl">📁</p>
                <p className="font-medium">{doc.name}</p>
                <p className="text-sm text-gray-400">This file type can't be previewed inline.</p>
                <AdminButton onClick={handleDownload}>⬇ Download File</AdminButton>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
