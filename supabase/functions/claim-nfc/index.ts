import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { getServiceClient } from '../_shared/supabase.ts'
import { HmacSHA256, enc } from 'https://esm.sh/crypto-js@4.2.0'

function hmac(secret: string, msg: string) {
  return HmacSHA256(msg, secret).toString(enc.Hex)
}

serve(async (req) => {
  const supabase = getServiceClient()
  const body = await req.json()
  const { product_id, nonce, exp, sig, user_id } = body

  const expected = hmac(Deno.env.get('NFC_HMAC_SECRET')!, `${product_id}|${nonce}|${exp}`)
  if (expected !== sig) return new Response('invalid signature', { status: 400 })
  if (Date.now() > Number(exp)) return new Response('expired', { status: 400 })

  const { data: product } = await supabase.from('products').select('*').eq('id', product_id).maybeSingle()
  if (!product || product.revoked) return new Response('revoked or not found', { status: 404 })
  if (product.claimed_by && product.claimed_by !== user_id) return new Response('already claimed', { status: 409 })

  await supabase.from('products').update({ claimed_by: user_id }).eq('id', product_id)
  await supabase.from('claims').insert({ user_id, product_id })
  await supabase.from('audits').insert({ user_id, action: 'claim', meta: { product_id } })

  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' }})
})
