'use client'
import { useState } from 'react'
import { getSupabase } from '@/lib/supabase'

export default function AuthButton() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const supabase = getSupabase()

  const handleAuth = async () => {
    if (!email) return
    setLoading(true)
    try {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })
      alert('E-posta adresinizi kontrol edin!')
    } catch (error) {
      console.error('Auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        type="email"
        placeholder="E-posta adresiniz"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border rounded-lg px-3 py-2 text-sm"
        disabled={loading}
      />
      <button
        onClick={handleAuth}
        disabled={loading || !email}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors"
      >
        {loading ? 'Gönderiliyor...' : 'Giriş'}
      </button>
    </div>
  )
}