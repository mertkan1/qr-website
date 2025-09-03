import { getServerSupabase } from '@/lib/supabaseServer'
import { unstable_cache, revalidateTag } from 'next/cache'
import { userTag } from '@/lib/tags'

export default async function UserPage({ params }: { params: { username: string } }) {
  const supabase = getServerSupabase()

  const { data: profile } = await supabase.from('profiles').select('id, username, lang').eq('username', params.username).maybeSingle()
  if (!profile) return <div className="py-20 text-center">User not found</div>

  const getPage = unstable_cache(async () => {
    const { data: page } = await supabase.from('pages').select('*').eq('user_id', profile.id).maybeSingle()
    return page
  }, [profile.id], { tags: [userTag(profile.id)] })

  const page = await getPage()
  return (
    <main className="prose max-w-none">
      <h1>{page?.title ?? `${profile.username}'s Page`}</h1>
      <article>
        <pre className="whitespace-pre-wrap">{page?.content_md ?? ''}</pre>
      </article>
      <footer className="mt-8 text-sm opacity-70">Lang: {profile.lang}</footer>
    </main>
  )
}
