import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// Public: list active artists
router.get('/', async (_req, res) => {
  const { data, error } = await supabase
    .from('artists')
    .select('id, name, slug, headshot_url, medium, is_featured')
    .eq('is_active', true)
    .order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

// Public: single artist by slug
router.get('/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('artists')
    .select('*, artworks(*)')
    .eq('slug', req.params.slug)
    .eq('is_active', true)
    .single()
  if (error) return res.status(404).json({ error: 'Not found' })
  res.json(data)
})

// Admin: create artist
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase.from('artists').insert(req.body).select().single()
  if (error) return res.status(400).json({ error: error.message })
  res.status(201).json(data)
})

// Admin: update artist
router.patch('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from('artists').update(req.body).eq('id', req.params.id).select().single()
  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// Admin: delete artist
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { error } = await supabase.from('artists').delete().eq('id', req.params.id)
  if (error) return res.status(400).json({ error: error.message })
  res.status(204).end()
})

export default router
