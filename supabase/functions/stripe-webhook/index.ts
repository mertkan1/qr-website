// deno run -A --watch=static/,supabase/ functions serve stripe-webhook
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@16.11.0?target=deno'
import { getServiceClient } from '../_shared/supabase.ts'

serve(async (req) => {
  const supabase = getServiceClient()
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })

  let event
  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 })
  }

  const writeAudit = async (user_id: string | null, action: string, meta: any) => {
    await supabase.from('audits').insert({ user_id, action, meta })
  }

  if (event.type === 'checkout.session.completed') {
    // TODO: map session to user (e.g., via client_reference_id or metadata)
    await writeAudit(null, 'checkout.session.completed', event)
  }

  if (event.type.startsWith('customer.subscription.')) {
    const sub = event.data.object as any
    const customerId = sub.customer as string
    // Look up profile by stored stripe_customer_id (not modeled here); demo updates all active users for brevity.
    const plan = sub.items?.data?.[0]?.plan?.interval === 'month' ? 'monthly'
        : sub.items?.data?.[0]?.plan?.interval === 'year' ? 'yearly'
        : 'lifetime'

    const expires_at = plan === 'monthly' ? new Date(Date.now() + 30*24*3600*1000).toISOString()
      : plan === 'yearly' ? new Date(Date.now() + 365*24*3600*1000).toISOString()
      : null

    await supabase.from('profiles').update({
      active: true,
      plan,
      expires_at,
      used_tokens: 0,
      monthly_token_limit: plan === 'monthly' ? 250000 : plan === 'yearly' ? 500000 : 1000000
    }).eq('active', true) // DEMO: replace with eq('stripe_customer_id', customerId)

    await writeAudit(null, event.type, { customerId, plan })
  }

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' }})
})
