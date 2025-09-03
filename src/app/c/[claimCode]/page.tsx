import { getServerSupabase } from '@/lib/supabaseServer'
import { redirect } from 'next/navigation'

export default async function Claim({ params }: { params: { claimCode: string } }) {
  const supabase = getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/')

  // Demo: just echo claim code; real logic in Edge Function 'claim-nfc'
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Claim</h1>
      <p>Kod: <b>{params.claimCode}</b></p>
      <p>Bu kod Edge Function <code>claim-nfc</code> ile doğrulanmalı.</p>
    </div>
  )
}
