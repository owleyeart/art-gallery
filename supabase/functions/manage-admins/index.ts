import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    // Service-role client for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify caller is system role
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const { data: roleRow } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!roleRow || roleRow.role !== 'system') {
      return new Response(JSON.stringify({ error: 'Forbidden: system role required' }), { status: 403, headers: corsHeaders })
    }

    const body = await req.json()
    const { action } = body

    // ── LIST ──────────────────────────────────────────────────────────────
    if (action === 'list') {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at')
        .order('created_at')

      if (!roles) return new Response(JSON.stringify({ users: [] }), { headers: corsHeaders })

      // Fetch auth user details for each
      const users = await Promise.all(
        roles.map(async (r) => {
          const { data: { user: authUser } } = await supabase.auth.admin.getUserById(r.user_id)
          return {
            user_id: r.user_id,
            role: r.role,
            email: authUser?.email || '(unknown)',
            created_at: r.created_at,
            last_sign_in: authUser?.last_sign_in_at || null,
            confirmed: !!authUser?.email_confirmed_at,
          }
        })
      )

      return new Response(JSON.stringify({ users }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── INVITE ────────────────────────────────────────────────────────────
    if (action === 'invite') {
      const { email } = body
      if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400, headers: corsHeaders })

      const { data: inviteData, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email)
      if (inviteErr) throw inviteErr

      // Insert role — on conflict (re-invite) update role
      await supabase
        .from('user_roles')
        .upsert({ user_id: inviteData.user.id, role: 'admin' }, { onConflict: 'user_id' })

      return new Response(JSON.stringify({ success: true, user_id: inviteData.user.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── REVOKE ────────────────────────────────────────────────────────────
    if (action === 'revoke') {
      const { userId } = body
      if (!userId) return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: corsHeaders })

      // Guard: can't revoke a system user
      const { data: targetRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single()

      if (targetRole?.role === 'system') {
        return new Response(JSON.stringify({ error: 'Cannot revoke system users' }), { status: 400, headers: corsHeaders })
      }

      await supabase.from('user_roles').delete().eq('user_id', userId)
      // Optionally ban the user so they can't re-auth
      await supabase.auth.admin.updateUserById(userId, { ban_duration: '876600h' }) // ~100 years

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── RESTORE ───────────────────────────────────────────────────────────
    if (action === 'restore') {
      const { userId } = body
      if (!userId) return new Response(JSON.stringify({ error: 'userId required' }), { status: 400, headers: corsHeaders })

      await supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' })
      await supabase.from('user_roles').upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
