import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Auth check — must be admin or system
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Verify caller role
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

    if (!roleRow || !['admin', 'system'].includes(roleRow.role)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
    }

    const { campaignId, subject, bodyHtml, bodyText } = await req.json()

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Resend API key not configured' }), { status: 500, headers: corsHeaders })
    }

    // Get active subscribers
    const { data: subscribers, error: subErr } = await supabase
      .from('newsletter_subscribers')
      .select('id, email')
      .eq('is_active', true)

    if (subErr) throw subErr
    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ error: 'No active subscribers' }), { status: 400, headers: corsHeaders })
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://images.twoseven.art'
    const fromAddress = Deno.env.get('NEWSLETTER_FROM') || 'newsletter@twoseven.art'
    const fromName = Deno.env.get('NEWSLETTER_FROM_NAME') || 'Images Art Gallery'

    // Build batch emails (Resend batch endpoint, max 100 per call)
    const buildHtml = (email: string, subId: string) => {
      const unsubLink = `${siteUrl}/unsubscribe?id=${subId}`
      return `${bodyHtml}
<br><br>
<hr style="border:none;border-top:1px solid #eee;margin:32px 0">
<p style="font-size:12px;color:#999;text-align:center">
  You're receiving this because you subscribed at ${fromName}.<br>
  <a href="${unsubLink}" style="color:#999">Unsubscribe</a>
</p>`
    }

    const buildText = (email: string, subId: string) => {
      const unsubLink = `${siteUrl}/unsubscribe?id=${subId}`
      return `${bodyText || ''}\n\n---\nYou're receiving this because you subscribed at ${fromName}.\nUnsubscribe: ${unsubLink}`
    }

    // Resend supports batch up to 100 — chunk if needed
    const chunkSize = 100
    let totalSent = 0
    let failed = 0

    for (let i = 0; i < subscribers.length; i += chunkSize) {
      const chunk = subscribers.slice(i, i + chunkSize)
      const batch = chunk.map(sub => ({
        from: `${fromName} <${fromAddress}>`,
        to: sub.email,
        subject,
        html: buildHtml(sub.email, sub.id),
        text: buildText(sub.email, sub.id),
      }))

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(batch),
      })

      if (res.ok) {
        totalSent += chunk.length
      } else {
        failed += chunk.length
        console.error('Resend batch error:', await res.text())
      }
    }

    // Log campaign result
    const campaignData = {
      subject,
      body_html: bodyHtml,
      body_text: bodyText,
      status: failed === 0 ? 'sent' : totalSent > 0 ? 'sent' : 'failed',
      recipient_count: totalSent,
      sent_at: new Date().toISOString(),
      sent_by: user.id,
      error_message: failed > 0 ? `${failed} recipients failed to send` : null,
    }

    if (campaignId) {
      await supabase.from('newsletter_campaigns').update(campaignData).eq('id', campaignId)
    } else {
      await supabase.from('newsletter_campaigns').insert(campaignData)
    }

    return new Response(
      JSON.stringify({ sent: totalSent, failed, total: subscribers.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
