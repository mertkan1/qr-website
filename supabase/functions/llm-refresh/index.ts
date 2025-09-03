// Scheduled: */360 * * * *
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { getServiceClient } from '../_shared/supabase.ts'

async function callLLM(prompt: string): Promise<string> {
  const provider = Deno.env.get('LLM_PROVIDER') || 'openai'
  if (provider !== 'openai') throw new Error('only openai supported in demo')
  const key = Deno.env.get('OPENAI_API_KEY')!
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: 'Write in Markdown only.' }, { role: 'user', content: prompt }],
      temperature: 0.7
    })
  })
  const json = await res.json()
  return json.choices?.[0]?.message?.content ?? ''
}

serve(async (_req) => {
  const supabase = getServiceClient()
  const { data: profiles, error } = await supabase.from('profiles')
    .select('id, lang, plan, active, expires_at, monthly_token_limit, used_tokens, username')
    .eq('active', true)
  if (error) return new Response(error.message, { status: 500 })

  for (const p of profiles ?? []) {
    if (p.expires_at && new Date(p.expires_at).getTime() < Date.now()) continue

    // naive token estimate
    const estimate = 800
    if ((p.used_tokens ?? 0) + estimate > (p.monthly_token_limit ?? 0)) continue

    const { data: page } = await supabase.from('pages').select('id, lang, title').eq('user_id', p.id).maybeSingle()
    if (!page) continue

    // Choose template by lang (simplified demo)
    const prompt = p.lang === 'tr'
      ? "Türkçe, 80–120 kelime; ‘bugünün odağı’, ‘küçük görev’, ‘kapanış’ sırasını izle. Sade, olumlu; jargon yok."
      : "Write a concise 120–180-word morning note in English. Tone: supportive, practical. Structure: 1 idea → 1 tip → 1 micro-challenge. Avoid clichés."

    const content = await callLLM(prompt)

    await supabase.from('pages').update({ content_md: content, updated_at: new Date().toISOString() }).eq('id', page.id)
    await supabase.from('profiles').update({ used_tokens: (p.used_tokens ?? 0) + estimate }).eq('id', p.id)

    // Revalidate via Next.js
    const tag = `page:user:${p.id}`
    const resp = await fetch(`${Deno.env.get('NEXT_PUBLIC_SITE_URL')}/api/revalidate`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('REVALIDATE_TOKEN')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag })
    })
    await supabase.from('audits').insert({ user_id: p.id, action: 'llm-refresh', meta: { tag, revalidateStatus: resp.status } })
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' }})
})
