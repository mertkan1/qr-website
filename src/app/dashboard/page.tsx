import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import QRGenerator from '@/components/QRGenerator'

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
    const template = String(formData.get('template') ?? 'daily_motivation')
    const slug = 'home'
    
    // Örnek içerik şablonları
    const templates = {
      daily_motivation: 'Günlük motivasyon ve pratik ipuçları içeren kişisel notlarınız burada yer alacak.',
      tech_digest: 'Teknoloji dünyasından güncel haberler ve özetler burada paylaşılacak.',
      short_note: 'Kısa ve öz günlük notlarınız burada yer alacak.'
    }
    
    const content = templates[template as keyof typeof templates] || templates.daily_motivation
    
    await supabase.from('pages').upsert({ 
      user_id: user.id, 
      title, 
      lang, 
      slug,
      content_md: content
    })
    
    // Kullanıcı profili yoksa oluştur
    if (!profile) {
      const username = user.email?.split('@')[0] || `user${Date.now()}`
      await supabase.from('profiles').upsert({
        id: user.id,
        username,
        lang,
        plan: 'free',
        active: true
      })
    }
  }

  async function signOut() {
    'use server'
    const supabase = getServerSupabase()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <form action={signOut}>
          <button className="text-red-600 hover:text-red-700 text-sm">Çıkış Yap</button>
        </form>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Plan Bilgileri</h2>
          <div className="space-y-2">
            <div>Plan: <span className="font-semibold text-blue-600">{profile?.plan || 'Free'}</span></div>
            <div>Durum: <span className={`font-semibold ${profile?.active ? 'text-green-600' : 'text-red-600'}`}>
              {profile?.active ? 'Aktif' : 'Pasif'}
            </span></div>
            <div>Token Kullanımı: {profile?.used_tokens || 0} / {profile?.monthly_token_limit || 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="font-semibold mb-4">Sayfa Durumu</h2>
          {page ? (
            <div className="space-y-2">
              <div>Başlık: <span className="font-semibold">{page.title}</span></div>
              <div>Dil: <span className="font-semibold">{page.lang}</span></div>
              <div>Son Güncelleme: <span className="text-sm text-gray-600">
                {new Date(page.updated_at).toLocaleString('tr-TR')}
              </span></div>
              <Link 
                href={`/u/${profile?.username}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Sayfanızı Görüntüle
              </Link>
            </div>
          ) : (
            <p className="text-gray-600">Henüz sayfa oluşturmadınız.</p>
          )}
        </div>
      </div>

      {!page && (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Sayfanızı Oluşturun</h2>
          <form action={create} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Sayfa Başlığı</label>
              <input 
                name="title" 
                placeholder="Örn: John's Daily Notes" 
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Dil</label>
              <select name="lang" className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500">
                <option value="en">English</option>
                <option value="tr">Türkçe</option>
                <option value="es">Español</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">İçerik Şablonu</label>
              <select name="template" className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500">
                <option value="daily_motivation">Günlük Motivasyon</option>
                <option value="tech_digest">Teknoloji Özeti</option>
                <option value="short_note">Kısa Not</option>
              </select>
            </div>
            
            <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all">
              Sayfayı Oluştur
            </button>
          </form>
        </div>
      )}

      {page && profile?.username && (
        <div className="bg-white rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">QR Kod Yönetimi</h2>
          <p className="text-gray-600 mb-4">
            Sayfanızı paylaşmak için QR kod oluşturun ve indirin.
          </p>
          <QRGenerator username={profile.username} />
        </div>
      )}
    </div>
  )
}
