'use client'
import { useState } from 'react'

export default function PlanCard({
  name, price, onBuy
}: { name: string; price: string; onBuy: (plan: string) => void }) {
  const [loading, setLoading] = useState(false)
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-3">
      <div className="text-xl font-semibold">{name}</div>
      <div className="text-3xl font-bold">{price}</div>
      <button
        onClick={async () => { setLoading(true); try { await onBuy(name.toLowerCase()) } finally { setLoading(false) } }}
        disabled={loading}
        className="rounded-xl bg-black text-white px-4 py-2 disabled:opacity-50"
      >
        {loading ? 'Redirecting…' : 'Satın Al'}
      </button>
    </div>
  )
}
