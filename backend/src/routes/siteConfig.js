import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (_req, res) => {
  const { data, error } = await supabase.from('site_config').select('*').single()
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

router.patch('/', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('site_config').update(req.body).eq('id', 1).select().single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

export default router
