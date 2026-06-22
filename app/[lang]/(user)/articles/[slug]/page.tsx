import { Metadata } from 'next'
import ArticleDetailClient from './ArticleDetailClient'

interface PageProps {
  params: Promise<{ slug: string; lang: string }>
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const { slug, lang } = resolvedParams

  // Kita oper datanya ke client component agar kodenya bekerja normal kembali
  return <ArticleDetailClient slug={slug} lang={lang} />
}

// Fungsi generateMetadata tetap berada di Server dengan aman
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const { slug, lang } = resolvedParams
  const suffix = lang && lang !== 'en' ? `_${lang}` : ''

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const res = await fetch(
    `${supabaseUrl}/rest/v1/articles?slug=eq.${slug}&status=eq.published&select=title,title${suffix},summary,summary${suffix},cover_image`,
    {
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 3600 } 
    }
  )
  
  const data = await res.json()
  const article = data?.[0]

  if (!article) return {}

  const finalTitle = article[`title${suffix}`] || article.title || 'Daily Harend'
  const finalSummary = article[`summary${suffix}`] || article.summary || ''

  return {
    title: finalTitle,
    description: finalSummary,
    openGraph: {
      title: finalTitle,
      description: finalSummary,
      url: `https://dailyharend.com/${lang}/articles/${slug}`,
      siteName: 'Daily Harend',
      images: [
        {
          url: article.cover_image || 'https://dailyharend.com/fallback-thumbnail.png', 
          width: 1200,
          height: 630,
        },
      ],
      type: 'article',
    },
  }
}