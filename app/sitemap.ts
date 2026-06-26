import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.dailyharend.com'
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // 1. Daftar halaman utama statis website lo
  const staticRoutes = [
    '',
    '/id',
    '/en',
    '/id/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  let articleRoutes: any[] = []

  try {
    // 2. Tarik semua slug artikel yang sudah published langsung dari Supabase
    const res = await fetch(
      `${supabaseUrl}/rest/v1/articles?status=eq.published&select=slug,created_at`,
      {
        headers: {
          apikey: supabaseKey!,
          Authorization: `Bearer ${supabaseKey}`,
        },
        next: { revalidate: 3600 } // Cache selama 1 jam biar gak nge-hit DB terus-menerus
      }
    )

    if (res.ok) {
      const articles = await res.json()

      // 3. Generasikan URL dinamis untuk setiap bahasa (/id/articles/slug dan /en/articles/slug)
      articleRoutes = articles.flatMap((article: { slug: string; created_at: string }) => [
        {
          url: `${baseUrl}/id/articles/${article.slug}`,
          lastModified: new Date(article.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        },
        {
          url: `${baseUrl}/en/articles/${article.slug}`,
          lastModified: new Date(article.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        }
      ])
    }
  } catch (error) {
    console.error('Failed to generate dynamic sitemap routes from Supabase:', error)
  }

  // Gabungkan rute statis dan rute artikel dinamis untuk diserahkan ke Googlebot
  return [...staticRoutes, ...articleRoutes]
}