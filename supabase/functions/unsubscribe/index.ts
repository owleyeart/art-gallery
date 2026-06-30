import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id') || (await req.json().catch(() => ({}))).id

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing subscriber id' }), { status: 400, headers: corsHeaders })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    // Return a friendly HTML page for browser unsubscribe links
    const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Unsubscribed</title>
<style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fafafa}
.card{text-align:center;padding:48px;max-width:400px}h1{font-size:1.5rem;margin-bottom:8px}p{color:#666}</style>
</head>
<body><div class="card">
<h1>You've been unsubscribed.</h1>
<p>You won't receive any more emails from us. We'll miss you!</p>
</div></body></html>`

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})
