import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text') || ''
  if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

  const pngDataUrl = await QRCode.toDataURL(text, { margin: 2, width: 512 })
  const base64 = pngDataUrl.split(',')[1]

  // Optional: upload to Supabase Storage
  try {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const bin = Buffer.from(base64, 'base64')
    const path = `qrcodes/${Date.now()}-${Math.random().toString(36).slice(2)}.png`
    const { data, error } = await supabase.storage.from('public').upload(path, bin, { contentType: 'image/png', upsert: false })
    if (!error) {
      const { data: urlData } = supabase.storage.from('public').getPublicUrl(path)
      return NextResponse.json({ url: urlData.publicUrl })
    }
  } catch {}

  return NextResponse.json({ dataUrl: pngDataUrl })
}
