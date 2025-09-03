import Header from '@/components/Header'
import PlanCard from '@/components/PlanCard'

export default function Home() {
  async function buy(plan: string) {
    'use server'
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/checkout`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    if (!res.ok) throw new Error('Checkout başlatılamadı')
    const { url } = await res.json()
    return { redirect: url as string }
  }

  return (
    <main>
      <Header />
      <section className="py-10">
        <h1 className="text-4xl font-bold">Tek sayfalık akıllı notlar</h1>
        <p className="text-lg opacity-80">LLM ile 6 saatte bir güncellenen, QR/NFC ile sahip olduğunuz mini yayın.</p>
      </section>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlanCard name="Monthly" price="$5/mo" onBuy={async (p) => {
          const r = await buy(p); // @ts-ignore
          if (typeof window !== 'undefined') window.location.href = r.redirect
        }} />
        <PlanCard name="Yearly" price="$49/yr" onBuy={async (p) => {
          const r = await buy(p); // @ts-ignore
          if (typeof window !== 'undefined') window.location.href = r.redirect
        }} />
        <PlanCard name="Lifetime" price="$149" onBuy={async (p) => {
          const r = await buy(p); // @ts-ignore
          if (typeof window !== 'undefined') window.location.href = r.redirect
        }} />
      </section>
      <section className="py-10">
        <h2 className="text-2xl font-semibold">Sık Sorulan Sorular</h2>
        <ul className="list-disc pl-6">
          <li>Sayfam güncellenmezse yayından kalkar mı? Hayır, sadece otomatik güncelleme durur.</li>
          <li>İçerik hangi dillerde? EN varsayılan; TR/ES destekli.</li>
        </ul>
      </section>
    </main>
  )
}
