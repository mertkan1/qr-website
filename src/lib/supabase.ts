import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export function getSupabase() {
  return createClientComponentClient()
}

export function getServiceSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}