import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const token = auth.replace(/^Bearer\s+/i, '')
  if (token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const { tag } = await req.json()
  if (!tag) return NextResponse.json({ error: 'tag required' }, { status: 400 })
  revalidateTag(tag)
  return NextResponse.json({ revalidated: true, tag })
}
