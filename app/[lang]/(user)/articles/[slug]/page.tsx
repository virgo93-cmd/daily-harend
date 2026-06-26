import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleDetailClient from './ArticleDetailClient'

interface PageProps {
  params: Promise<{ slug: string; lang: string }>
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  const { slug, lang } = resolvedParams
  const suffix = lang && lang !== 'en' ? `_${lang}` : ''

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Ambil seluruh payload data artikel utuh secara server-side menggunakan Fetch API statis (Aman dari ParserError)
  const res = await fetch(
    `${supabaseUrl}/rest/v1/articles?slug=eq.${slug}&status=eq.published&select=id,title,title_id,slug,summary,summary_id,content,content_id,cover_image,image_source,created_at,category_id,faq,faq_id,authors(name,role_title,short_bio,avatar_url),reviewers(name,role_title,short_bio,avatar_url),fact_checkers(name,role_title,short_bio,avatar_url)`,
    {
      headers: {
        apikey: supabaseKey!,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 3600 }
    }
  )

  const data = await res.json()
  const rawArticle = data?.[0]

  // Jika artikel tidak ditemukan di database, langsung hentikan dan lempar ke halaman 404
  if (!rawArticle) {
    notFound()
  }

  // Petakan data bahasa terjemahan secara aman langsung dari server
  const serverArticleData = {
    id: rawArticle.id,
    title: rawArticle[`title${suffix}`] || rawArticle.title || '',
    slug: rawArticle.slug,
    summary: rawArticle[`summary${suffix}`] || rawArticle.summary,
    content: rawArticle[`content${suffix}`] || rawArticle.content || '',
    cover_image: rawArticle.cover_image,
    image_source: rawArticle.image_source,
    created_at: rawArticle.created_at,
    category_id: rawArticle.category_id,
    authors: rawArticle.authors || null,
    reviewers: rawArticle.reviewers || null,
    fact_checkers: rawArticle.fact_checkers || null,
    faq: rawArticle[`faq${suffix}`] || rawArticle.faq || null,
  }

  // Oper data matang langsung ke Client Component tanpa mengacak-acak layout visual
  return (
    <ArticleDetailClient 
      slug={slug} 
      lang={lang} 
      initialArticleData={serverArticleData} 
    />
  )
}

// Fungsi generateMetadata tetap bekerja secara terpisah di sisi server
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