import { supabase } from '../lib/supabase.js'

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  req.user = user
  req.role = roleData?.role || null
  next()
}

export function requireAdmin(req, res, next) {
  if (!['admin', 'system'].includes(req.role)) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

export function requireSystem(req, res, next) {
  if (req.role !== 'system') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}
