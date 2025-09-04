import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default function AuthCallback() {
  const supabase = getServerSupabase()
  
  // URL'den code parametresini al ve session'ı exchange et
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    redirect('/dashboard')
  }
  
  return (
    <div className="py-20 text-center">
      <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-lg">Giriş yapılıyor...</p>
    </div>
  )
}
