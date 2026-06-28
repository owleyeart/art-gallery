import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase.js'

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // 'success' | 'error' | null

  useEffect(() => {
    const dismissed = sessionStorage.getItem('newsletter_dismissed')
    if (!dismissed) {
      const timer = setTimeout(() => setVisible(true), 8000)
      return () => clearTimeout(timer)
    }
  }, [])

  function dismiss() {
    sessionStorage.setItem('newsletter_dismissed', '1')
    setVisible(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email })
    if (error) {
      setStatus('error')
    } else {
      setStatus('success')
      setTimeout(dismiss, 2000)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface rounded-xl shadow-2xl max-w-md w-full p-8 relative">
        <button onClick={dismiss} className="absolute top-3 right-4 text-2xl opacity-40 hover:opacity-80" aria-label="Close">×</button>
        <h2 className="font-heading text-2xl font-bold mb-2">Stay in the Loop</h2>
        <p className="text-sm opacity-70 mb-5">
          Get notified about Featured Artist Fridays, upcoming shows, and gallery events.
        </p>
        {status === 'success' ? (
          <p className="text-green-600 font-medium">You're on the list! See you at the gallery. 🎨</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <button type="submit" className="bg-secondary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
              Subscribe
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-500 text-xs mt-2">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  )
}
