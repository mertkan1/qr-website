import { getServerSupabase } from '@/lib/supabaseServer'
import { unstable_cache, revalidateTag } from 'next/cache'
import { userTag } from '@/lib/tags'
import Link from 'next/link'

export default async function UserPage({ params }: { params: { username: string } }) {
  const supabase = getServerSupabase()

  const { data: profile } = await supabase.from('profiles').select('id, username, lang').eq('username', params.username).maybeSingle()
  if (!profile) return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Kullanıcı Bulunamadı</h1>
      <p className="text-gray-600 mb-6">Aradığınız sayfa mevcut değil.</p>
      <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
        Ana Sayfaya Dön
      </Link>
    </div>
  )

  const getPage = unstable_cache(async () => {
    const { data: page } = await supabase.from('pages').select('*').eq('user_id', profile.id).maybeSingle()
    return page
  }, [profile.id], { tags: [userTag(profile.id)] })

  const page = await getPage()
  
  return (
    <main className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 mb-8">
        <h1 className="text-3xl font-bold mb-2">{page?.title ?? `${profile.username}'s Page`}</h1>
        <p className="opacity-90">@{profile.username}</p>
      </div>
      
      <article className="bg-white rounded-xl p-8 shadow-sm border prose prose-lg max-w-none">
        {page?.content_md ? (
          <div className="whitespace-pre-wrap leading-relaxed">
            {page.content_md}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>İçerik henüz hazırlanıyor...</p>
            <p className="text-sm mt-2">Sayfa sahibi içerik şablonunu seçtikten sonra otomatik olarak güncellenecek.</p>
          </div>
        )}
      </article>
      
      <footer className="mt-8 text-center">
        <div className="bg-gray-50 rounded-xl p-6">
          <p className="text-sm text-gray-600 mb-2">
            Bu sayfa her 6 saatte bir otomatik olarak güncellenir
          </p>
          <p className="text-xs text-gray-500">
            Dil: {profile.lang.toUpperCase()} • Son güncelleme: {page?.updated_at ? new Date(page.updated_at).toLocaleString('tr-TR') : 'Henüz güncellenmedi'}
          </p>
          <Link 
            href="/" 
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Kendi sayfanızı oluşturun →
          </Link>
        </div>
      </footer>
    </main>
  )
}
