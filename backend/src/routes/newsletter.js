import { Router } from 'express'
import { Resend } from 'resend'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
const resend = new Resend(process.env.RESEND_API_KEY)

// Public: subscribe
router.post('/subscribe', async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Email required' })

  const { error } = await supabase
    .from('newsletter_subscribers')
    .upsert({ email }, { onConflict: 'email' })
  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true })
})

// Admin: send campaign
router.post('/send', requireAuth, requireAdmin, async (req, res) => {
  const { subject, html_content, from_name } = req.body

  const { data: siteConfig } = await supabase.from('site_config').select('site_name, email').single()
  const { data: subscribers } = await supabase
    .from('newsletter_subscribers')
    .select('email')
    .eq('is_active', true)

  if (!subscribers?.length) return res.status(400).json({ error: 'No subscribers' })

  const emails = subscribers.map(s => s.email)

  const { data, error } = await resend.batch.send(
    emails.map(to => ({
      from: `${from_name || siteConfig?.site_name} <newsletter@${process.env.EMAIL_DOMAIN}>`,
      to,
      subject,
      html: html_content,
    }))
  )

  if (error) return res.status(500).json({ error: error.message })
  res.json({ sent: emails.length, data })
})

export default router
