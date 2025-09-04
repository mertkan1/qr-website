'use client'
import { useState, useTransition } from 'react'

export default function PlanCard({
  name, price, onBuy
}: { name: string; price: string; onBuy: (plan: string) => Promise<{ redirectUrl?: string }> }) {
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleBuy = () => {
    startTransition(async () => {
      setLoading(true)
      try {
        const result = await onBuy(name.toLowerCase())
        if (result?.redirectUrl) {
          window.location.href = result.redirectUrl
        }
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Bir hata oluştu')
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="rounded-2xl border-2 p-6 flex flex-col gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="text-xl font-semibold text-gray-800">{name}</div>
      <div className="text-3xl font-bold text-blue-600">{price}</div>
      <div className="text-sm text-gray-600 space-y-1">
        <div>✓ Kişisel sayfa</div>
        <div>✓ 6 saatlik güncelleme</div>
        <div>✓ QR kod paylaşımı</div>
        <div>✓ Çoklu dil desteği</div>
      </div>
      <button
        onClick={handleBuy}
        disabled={loading || isPending}
        className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 disabled:opacity-50 hover:from-blue-700 hover:to-purple-700 transition-all font-semibold"
      >
        {loading || isPending ? 'Yönlendiriliyor...' : 'Satın Al'}
      </button>
    </div>
  )
}
