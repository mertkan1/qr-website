import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

const PRICE_MAP: Record<string, string> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY || '',
  yearly: process.env.STRIPE_PRICE_YEARLY || '',
  lifetime: process.env.STRIPE_PRICE_LIFETIME || '',
}

export async function POST(req: NextRequest) {
  const { plan } = await req.json()
  const price = PRICE_MAP[(plan || '').toLowerCase()]
  if (!price) return NextResponse.json({ error: 'invalid plan' }, { status: 400 })

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
    allow_promotion_codes: true
  })
  return NextResponse.json({ url: session.url })
}
