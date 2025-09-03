import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  const { data: page } = await supabase.from('pages').select('*').eq('user_id', user.id).maybeSingle()

  async function create(formData: FormData) {
    'use server'
    const supabase = getServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const title = String(formData.get('title') ?? 'My Page')
    const lang = String(formData.get('lang') ?? 'en')
    const slug = 'home'
    await supabase.from('pages').upsert({ user_id: user.id, title, lang, slug })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="rounded-xl border p-4">
        <div>Plan: <b>{profile?.plan}</b> {profile?.active ? '(active)' : '(inactive)'} </div>
        <div>Tokens: {profile?.used_tokens} / {profile?.monthly_token_limit}</div>
      </div>

      <form action={create} className="rounded-xl border p-4 space-y-3">
        <div className="font-semibold">Sayfanı oluştur</div>
        <input name="title" placeholder="Title" className="border rounded px-3 py-2 w-full" />
        <select name="lang" className="border rounded px-3 py-2">
          <option value="en">EN</option>
          <option value="tr">TR</option>
          <option value="es">ES</option>
        </select>
        <button className="rounded bg-black text-white px-4 py-2">Kaydet</button>
      </form>

      {page ? (
        <div className="rounded-xl border p-4">
          <div>Sayfanız hazır:</div>
          <Link className="text-blue-600 underline" href={`/u/${profile?.username}`}>/u/{profile?.username}</Link>
        </div>
      ) : null}
    </div>
  )
}
