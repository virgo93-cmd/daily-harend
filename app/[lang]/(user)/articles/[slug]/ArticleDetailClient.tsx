'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Calendar, User, CheckCircle, ChevronRight, Image as ImageIcon, X, ChevronDown, Grid, UserCheck } from 'lucide-react'
import Script from 'next/script'

// Import komponen global baru lo
import SectorHubs from '../../components/SectorHubs'
import EditorialPolicy from '../../components/EditorialPolicy'
import EditorialBoard from '../../components/EditorialBoard'

interface Author {
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
}

interface Reviewer {
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
}

interface FactChecker {
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
}

interface FaqItem {
  question: string
  answer: string
}

interface CategoryData {
  id: string
  name: string
  slug: string
  parent_id: string | null
  parent?: {
    name: string
    slug: string
  } | null
}

interface ArticleDetail {
  id: string
  title: string
  slug: string
  summary: string | null
  content: string
  cover_image: string | null
  image_source: string | null
  created_at: string
  category_id: string | null
  authors: Author | null
  reviewers: Reviewer | null
  fact_checkers: FactChecker | null
  faq: FaqItem[] | null
}

interface RelatedArticle {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_image: string | null
  created_at: string
  categories: CategoryData | null
  authors: Author | null
  reviewers: Reviewer | null
}

interface TocItem {
  id: string
  text: string
}

interface UiDictionary {
  toc: string
  zeroToc: string
  writtenBy: string
  reviewedBy: string
  factCheckedBy: string
  published: string
  readMore: string
  noCover: string
  zeroArticles: string
  sectorInventory: string
  faqTitle: string
  imageError: string
}

const fallbackEn: UiDictionary = {
  toc: "Table of Contents",
  zeroToc: "Zero segments indexed",
  writtenBy: "Written By",
  reviewedBy: "Reviewed By",
  factCheckedBy: "Fact Checked By",
  published: "Published",
  readMore: "READ MORE",
  noCover: "No Matrix Cover",
  zeroArticles: "Zero data packets found in this segment",
  sectorInventory: "Sector Inventory",
  faqTitle: "Frequently Asked Questions",
  imageError: "Asset Payload Unreachable / Too Large"
}

interface ClientProps {
  slug: string
  lang: string
  initialArticleData: ArticleDetail // Menampung data langsung dari Server Component (page.tsx)
}

export default function ArticleDetailClient({ slug, lang, initialArticleData }: ClientProps) {
  // Gunakan data dari server sebagai state awal agar robot Google langsung membaca isi konten utuh
  const [article, setArticle] = useState<ArticleDetail | null>(initialArticleData)
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([])
  const [mainCategories, setMainCategories] = useState<CategoryData[]>([])
  const [toc, setToc] = useState<TocItem[]>([])
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [dict, setDict] = useState<UiDictionary>(fallbackEn)

  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean
    title: string
    name: string
    role: string
    bio: string
    avatar: string | null
  }>({ isOpen: false, title: '', name: '', role: '', bio: '', avatar: null })

  const supabase = createClient()

  // Generate Table of Contents (TOC) dari artikel server-side secara langsung saat mount
  useEffect(() => {
    if (initialArticleData?.content) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(initialArticleData.content, 'text/html')
      const headings = doc.querySelectorAll('h2, h3')
      const tocItems: TocItem[] = []

      headings.forEach((heading, idx) => {
        const id = heading.id || `node-id-${idx}`
        heading.id = id
        tocItems.push({ id, text: heading.textContent || '' })
      })

      setToc(tocItems)
    }
  }, [initialArticleData])

  useEffect(() => {
    if (!slug) return

    const fetchConfigAndRelations = async () => {
      try {
        setLoading(true)
        const suffix = lang && lang !== 'en' ? `_${lang}` : ''

        // 1. Ambil data konfigurasi translasi situs
        const { data: configRes } = await supabase
          .from('site_config')
          .select('translations')
          .single()

        if (configRes?.translations) {
          const allTranslations = configRes.translations as any
          if (lang && lang !== 'en' && allTranslations[lang]) {
            setDict({ ...fallbackEn, ...allTranslations[lang] })
          } else {
            setDict(fallbackEn)
          }
        }

        // 2. Ambil kategori dan related insights menggunakan ID kategori dari server data
        if (initialArticleData) {
          const { data: allCats } = await supabase.from('categories').select('id, name, slug, parent_id')
          let categoryMap = new Map()
          
          if (allCats) {
            categoryMap = new Map(allCats.map(c => [c.id, { name: c.name, slug: c.slug, parent_id: c.parent_id }]))
            const filteredMainCats = (allCats as CategoryData[]).filter(c => c.parent_id === null)
            setMainCategories(filteredMainCats)
          }

          let { data: relatedData } = await supabase
            .from('articles')
            .select(`
              id,
              title,
              title_id,
              slug,
              summary,
              summary_id,
              cover_image,
              created_at,
              categories ( id, name, slug, parent_id ),
              authors ( name, role_title, short_bio, avatar_url ),
              reviewers ( name, role_title, short_bio, avatar_url )
            ` as any)
            .eq('status', 'published')
            .eq('category_id', initialArticleData.category_id)
            .neq('id', initialArticleData.id)
            .order('created_at', { ascending: false })
            .limit(3)

          if (!relatedData || relatedData.length === 0) {
            const { data: fallbackData } = await supabase
              .from('articles')
              .select(`
                id,
                title,
                title_id,
                slug,
                summary,
                summary_id,
                cover_image,
                created_at,
                categories ( id, name, slug, parent_id ),
                authors ( name, role_title, short_bio, avatar_url ),
                reviewers ( name, role_title, short_bio, avatar_url )
              ` as any)
              .eq('status', 'published')
              .neq('id', initialArticleData.id)
              .order('created_at', { ascending: false })
              .limit(3)
            relatedData = fallbackData
          }

          if (relatedData) {
            const mappedRelated: RelatedArticle[] = (relatedData as any[]).map((r) => {
              const currentCat = r.categories
              let parentObj = null

              if (currentCat && currentCat.parent_id) {
                const matchedParent = categoryMap.get(currentCat.parent_id)
                if (matchedParent) {
                  parentObj = { name: matchedParent.name, slug: matchedParent.slug }
                }
              }

              return {
                id: r.id,
                title: r[`title${suffix}`] || r.title || '',
                summary: r[`summary${suffix}`] || r.summary || null,
                slug: r.slug,
                cover_image: r.cover_image,
                created_at: r.created_at,
                categories: currentCat ? {
                  id: currentCat.id,
                  name: currentCat.name,
                  slug: currentCat.slug,
                  parent_id: currentCat.parent_id,
                  parent: parentObj
                } : null,
                authors: r.authors as unknown as Author | null,
                reviewers: r.reviewers as unknown as Reviewer | null,
              }
            })
            setRelatedArticles(mappedRelated)
          }
        }
      } catch (err) {
        console.error('Failed to resolve tactical localized payload:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchConfigAndRelations()
  }, [slug, lang, initialArticleData])

  const getInjectedContent = () => {
    if (!article) return ''
    const parser = new DOMParser()
    const doc = parser.parseFromString(article.content, 'text/html')
    const headings = doc.querySelectorAll('h2, h3')
    headings.forEach((heading, idx) => {
      heading.id = heading.id || `node-id-${idx}`
    })
    return doc.body.innerHTML
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  // Jika data awal dari server sudah ada, bypass screen loading untuk bot SEO/AdSense
  if (loading && !article) {
    return (
      <main className="w-full min-h-screen bg-white flex items-center justify-center">
        <div className="text-[11px] font-mono text-slate-800 tracking-widest uppercase animate-pulse">
          Decrypting secure content matrix...
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <main className="w-full min-h-screen bg-white flex items-center justify-center px-4 sm:px-6">
        <div className="border border-slate-200 rounded-2xl p-12 text-center text-xs font-mono text-slate-600 uppercase tracking-wider bg-slate-50 w-full max-w-md">
          Node Restricted or Data Packet Zero
        </div>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-white pt-20 sm:pt-24 pb-16 font-sans text-slate-950">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* ASIDE BARIS KIRI (DESKTOP STICKY) */}
          <aside className="w-full lg:col-span-3 lg:sticky top-24 space-y-6 pr-1">
            
            {/* BOKS TOC */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h3 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-3 mb-4 font-bold">
                {dict.toc}
              </h3>
              {toc.length === 0 ? (
                <p className="text-[10px] font-mono text-slate-400 uppercase">{dict.zeroToc}</p>
              ) : (
                <ul className="space-y-3">
                  {toc.map((item) => (
                    <li key={item.id} className="group flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 group-hover:text-slate-950 transition-colors" />
                      <a href={`#${item.id}`} className="text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors leading-tight">
                        {item.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* BOKS RELATED POSTS VERTIKAL RAMPING DI BAWAH TOC */}
            {relatedArticles.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
                <div>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
                    Contextual Feed
                  </span>
                  <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                    Related Insights
                  </h3>
                </div>

                <div className="flex flex-col gap-6">
                  {relatedArticles.map((rel) => (
                    <article 
                      key={rel.id} 
                      className="group flex flex-col justify-between bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[400px] w-full"
                    >
                      <div>
                        <div className="w-full h-40 bg-slate-50 border-b border-slate-200 overflow-hidden relative">
                          {rel.cover_image ? (
                            <img 
                              src={rel.cover_image} 
                              alt={rel.title} 
                              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-400 uppercase">
                              {dict.noCover}
                            </div>
                          )}
                        </div>

                        <div className="p-4 space-y-3">
                          {rel.categories && (
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {rel.categories.parent ? (
                                <>
                                  <span className="text-[9px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2 py-0.5 rounded font-bold shadow-sm">
                                    {rel.categories.parent.name}
                                  </span>
                                  <span className="text-[9px] font-mono bg-slate-100 text-slate-600 uppercase tracking-widest px-2 py-0.5 rounded font-bold border border-slate-200/60">
                                    # {rel.categories.name}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[9px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2 py-0.5 rounded font-bold shadow-sm">
                                  {rel.categories.name}
                                </span>
                              )}
                            </div>
                          )}

                          <h2 className="font-black text-sm sm:text-base text-slate-950 line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-slate-800 transition-colors">
                            <Link href={`/${lang}/articles/${rel.slug}`}>
                              {rel.title}
                            </Link>
                          </h2>

                          {rel.summary && (
                            <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                              {rel.summary}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="text-[10px] font-bold text-slate-950">
                            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block font-normal leading-none mb-0.5">{dict.published}</span>
                            {new Date(rel.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>

                          <Link 
                            href={`/${lang}/articles/${rel.slug}`}
                            className="bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                          >
                            {dict.readMore}
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* KOLOM UTAMA KANAN */}
          <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 shadow-sm space-y-6 sm:space-y-8">
            
            <div className="space-y-3 border-b border-slate-200 pb-5 sm:pb-6">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-black text-slate-950 tracking-tight uppercase leading-tight sm:leading-tight break-words">
                {article.title}
              </h1>
              {article.summary && (
                <p className="text-xs sm:text-sm md:text-base text-slate-700 font-medium leading-relaxed border-l-4 border-slate-900 pl-3 sm:pl-4 py-0.5">
                  {article.summary}
                </p>
              )}
            </div>

            {article.cover_image && (
              <div className="w-full rounded-xl sm:rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                <div className="aspect-video w-full relative flex items-center justify-center bg-slate-100">
                  {!imageError ? (
                    <img src={article.cover_image} alt={article.title} onError={() => setImageError(true)} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">{dict.imageError}</span>
                    </div>
                  )}
                </div>
                {article.image_source && (
                  <div className="px-3 py-1.5 bg-slate-50 text-right text-[8px] sm:text-[9px] font-mono text-slate-500 uppercase tracking-widest border-t border-slate-200">
                    Source: {article.image_source}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 py-3.5 px-4 sm:px-5 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-xs">
              <div 
                onClick={() => article.authors && setProfileModal({
                  isOpen: true, title: 'Author Profile', name: article.authors.name,
                  role: article.authors.role_title, bio: article.authors.short_bio, avatar: article.authors.avatar_url
                })}
                className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
              >
                {article.authors?.avatar_url ? (
                  <img src={article.authors.avatar_url} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-300 shadow-sm" alt="" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600"><User className="w-4 h-4" /></div>
                )}
                <div>
                  <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase tracking-wider">{dict.writtenBy}</p>
                  <p className="font-bold text-slate-900 text-xs group-hover:underline">{article.authors?.name || 'Intelligence Core'}</p>
                </div>
              </div>

              <div 
                onClick={() => article.reviewers && setProfileModal({
                  isOpen: true, title: 'Reviewer Profile', name: article.reviewers.name,
                  role: article.reviewers.role_title, bio: article.reviewers.short_bio, avatar: article.reviewers.avatar_url
                })}
                className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
              >
                {article.reviewers?.avatar_url ? (
                  <img src={article.reviewers.avatar_url} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-300 shadow-sm" alt="" />
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600"><CheckCircle className="w-4 h-4" /></div>
                )}
                <div>
                  <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase tracking-wider">{dict.reviewedBy}</p>
                  <p className="font-bold text-slate-900 text-xs group-hover:underline">{article.reviewers?.name || 'Verified Core'}</p>
                </div>
              </div>

              {article.fact_checkers && (
                <div 
                  onClick={() => article.fact_checkers && setProfileModal({
                    isOpen: true, title: 'Fact Checker Profile', name: article.fact_checkers.name,
                    role: article.fact_checkers.role_title, bio: article.fact_checkers.short_bio, avatar: article.fact_checkers.avatar_url
                  })}
                  className="flex items-center gap-3 cursor-pointer group hover:opacity-80 transition-opacity"
                >
                  {article.fact_checkers.avatar_url ? (
                    <img src={article.fact_checkers.avatar_url} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                  ) : (
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <p className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase tracking-wider">{dict.factCheckedBy}</p>
                    <p className="font-bold text-slate-900 text-xs group-hover:underline">{article.fact_checkers.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 sm:justify-end text-slate-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <Calendar className="w-4 h-4 shrink-0" />
                <div>
                  <p className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider">{dict.published}</p>
                  <p className="font-bold text-slate-900 text-xs">
                    {new Date(article.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            <div 
              className="article-body-container text-slate-900 text-xs sm:text-sm md:text-base leading-relaxed space-y-5 sm:space-y-6 font-normal break-words
              [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:md:text-2xl [&_h2]:font-black [&_h2]:text-slate-950 [&_h2]:border-b-2 [&_h2]:border-slate-900 [&_h2]:pb-1.5 [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:uppercase [&_h2]:tracking-tight
              [&_h3]:text-sm [&_h3]:sm:text-base [&_h3]:md:text-lg [&_h3]:font-extrabold [&_h3]:text-slate-950 [&_h3]:mt-6 [&_h3]:mb-3
              [&_p]:leading-relaxed [&_p]:text-slate-900 [&_p]:mb-4
              [&_strong]:font-black [&_strong]:text-slate-950
              [&_a]:text-blue-700 [&_a]:font-bold [&_a]:underline hover:[&_a]:text-blue-900
              [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_li]:text-slate-900 [&_li]:mb-1
              [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3
              [&_table]:w-full [&_table]:my-6 [&_table]:border-collapse [&_table]:border-2 [&_table]:border-slate-950 [&_table]:text-[11px] [&_table]:sm:text-xs [&_table]:md:text-sm
              [&_thead]:bg-slate-100 [&_thead]:border-b-2 [&_thead]:border-slate-950
              [&_th]:p-2 [&_th]:sm:p-3 [&_th]:font-black [&_th]:text-slate-950 [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-left [&_th]:border-r [&_th]:border-slate-300
              [&_tr]:border-b [&_tr]:border-slate-200 hover:[&_tr]:bg-slate-50/50
              [&_td]:p-2 [&_td]:sm:p-3 [&_td]:text-slate-800 [&_td]:border-r [&_td]:border-slate-200
              overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: getInjectedContent() }}
            />

            {/* BOKS FAQ BAWAAN ASLI LO */}
            {article.faq && article.faq.length > 0 && (
              <div className="pt-8 sm:pt-10 border-t border-slate-200 space-y-4">
                <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {dict.faqTitle}
                </h2>
                <div className="space-y-2.5">
                  {article.faq.map((item, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left font-bold text-slate-950 text-xs sm:text-sm md:text-base hover:bg-slate-100/70 transition-colors gap-3"
                      >
                        <span>{item.question}</span>
                        <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${openFaqIndex === idx ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaqIndex === idx && (
                        <div className="px-3.5 sm:p-4 pb-3.5 sm:pb-4 pt-1 text-xs sm:text-sm text-slate-700 leading-relaxed border-t border-slate-200/60 bg-white animate-in fade-in slide-in-from-top-1 duration-200">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BOKS DISCLAIMER BAWAAN ASLI LO */}
            <div className="pt-8 sm:pt-10 border-t border-slate-200">
              <div className="p-4 sm:p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row gap-3 items-start text-left">
                <div className="bg-slate-950 text-white rounded-lg p-2 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-900">
                    Editorial Integrity & Financial Disclaimer Notice
                  </h4>
                  <p className="text-[11px] sm:text-xs text-slate-600 font-medium leading-relaxed">
                    The intelligence matrix provided across this asset ecosystem is strictly tailored for general information, tracking metrics, and educational compliance. No specific packet parameters constitute professional financial architectural blueprints, tax consultations, or legal asset routing advice. Always verify with certified sector nodes before committing physical asset reserves.
                  </p>
                </div>
              </div>
            </div>

            {/* BOKS EXPLORE SECTORS BAWAAN ASLI LO */}
            {mainCategories.length > 0 && (
              <div className="pt-8 sm:pt-10 border-t border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Grid className="w-4 h-4 text-slate-950" />
                  <h3 className="text-base sm:text-lg font-black text-slate-950 uppercase tracking-tight">
                    Explore Sectors
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {mainCategories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/${lang}/articles?category=${cat.slug}`}
                      className="text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-2 bg-white border border-slate-200 text-slate-950 rounded-xl hover:bg-slate-950 hover:text-white hover:border-slate-950 transition-all duration-200 shadow-xs"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* SEKSI TAMBAHAN SESUAI PROMPT LO */}
            <EditorialPolicy />

            <EditorialBoard />

            <SectorHubs />

          </div>
        </div>
      </div>

      {profileModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 max-w-md w-full relative shadow-2xl animate-in zoom-in-95 duration-200 text-slate-950">
            <button 
              onClick={() => setProfileModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest px-2.5 py-1 bg-slate-100 rounded-full font-bold">
                {profileModal.title}
              </span>
              
              {profileModal.avatar ? (
                <img src={profileModal.avatar} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border border-slate-200 shadow-md" alt="" />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400"><User className="w-8 h-8" /></div>
              )}

              <div className="space-y-0.5">
                <h4 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight">{profileModal.name}</h4>
                <p className="text-[10px] sm:text-xs font-mono text-blue-700 font-bold uppercase">{profileModal.role}</p>
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-left">
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                  {profileModal.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Script 
        src="https://pl29845208.effectivecpmnetwork.com/d2/0b/97/d20b97b534a10ab9433e0ddd1e53e703.js"
        strategy="afterInteractive"
      />
    </main>
  )
}