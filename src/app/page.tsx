import Header from '@/components/Header'
import PlanCard from '@/components/PlanCard'
import { getServerSupabase } from '@/lib/supabaseServer'
import Link from 'next/link'

export default function Home() {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  async function buy(plan: string) {
    'use server'
    if (!user) {
      throw new Error('Önce giriş yapmalısınız')
    }
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    if (!res.ok) throw new Error('Checkout başlatılamadı')
    const { url } = await res.json()
    return { redirectUrl: url }
  }

  return (
    <main>
      <Header />
      <section className="py-10">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Tek Sayfalık Akıllı Notlar
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            LLM ile 6 saatte bir güncellenen, QR kod ile paylaşabileceğiniz kişisel mini yayınınız
          </p>
          {user && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-green-800">
                Hoş geldiniz! <Link href="/dashboard" className="font-semibold underline">Dashboard</Link>'a geçin.
              </p>
            </div>
          )}
        </div>
      </section>
      
      <section className="py-8">
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-semibold">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="font-semibold mb-2">1. Sayfanızı Oluşturun</h3>
              <p className="text-gray-600 text-sm">Başlık, dil ve içerik şablonunu seçin</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="font-semibold mb-2">2. Otomatik Güncelleme</h3>
              <p className="text-gray-600 text-sm">AI her 6 saatte bir yeni içerik üretir</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold mb-2">3. QR ile Paylaşın</h3>
              <p className="text-gray-600 text-sm">QR kod oluşturun ve herkesle paylaşın</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlanCard name="Monthly" price="$5/mo" onBuy={buy} />
        <PlanCard name="Yearly" price="$49/yr" onBuy={buy} />
        <PlanCard name="Lifetime" price="$149" onBuy={buy} />
      </section>
      
      <section className="py-10">
        <div className="bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Sık Sorulan Sorular</h2>
          <div className="space-y-4 max-w-2xl mx-auto">
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">Sayfam güncellenmezse yayından kalkar mı?</h3>
              <p className="text-gray-600">Hayır, sayfanız yayında kalır. Sadece otomatik güncelleme durur.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">İçerik hangi dillerde üretilir?</h3>
              <p className="text-gray-600">İngilizce varsayılan, Türkçe ve İspanyolca desteklenir.</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <h3 className="font-semibold mb-2">QR kod nasıl çalışır?</h3>
              <p className="text-gray-600">QR kod sayfanızın linkini içerir. Herkes tarayarak sayfanıza ulaşabilir.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
