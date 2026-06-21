'use client'

import { useEffect, useState, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { User, CheckCircle, X, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react'

interface CategoryData {
  name: string
  slug: string
  parent_id: string | null
  description?: string | null
  parent?: {
    name: string
    slug: string
  } | null
}

interface AuthorData {
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
}

interface ReviewerData {
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
}

interface FactCheckerData {
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
}

interface Article {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_image: string | null
  created_at: string
  categories: CategoryData | null
  authors: AuthorData | null
  reviewers: ReviewerData | null
  fact_checkers: FactCheckerData | null
}

interface PageProps {
  params: Promise<{ lang: string }>
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

export default function ArticlesPage({ params }: PageProps) {
  const resolvedParams = use(params)
  const lang = resolvedParams.lang || 'en'
  
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const currentCategorySlug = searchParams?.get('category') || null
  const currentPage = parseInt(searchParams?.get('page') || '1', 10)
  const itemsPerPage = 9

  const [articles, setArticles] = useState<Article[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [activeCategoryDesc, setActiveCategoryDesc] = useState<string | null>(null)
  const supabase = createClient()

  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean
    title: string
    name: string
    role: string
    bio: string
    avatar: string | null
  }>({ isOpen: false, title: '', name: '', role: '', bio: '', avatar: null })

  useEffect(() => {
    const fetchArticlesData = async () => {
      try {
        setLoading(true)
        setActiveCategoryDesc(null)
        const suffix = lang && lang !== 'en' ? `_${lang}` : ''

        const { data: allCats, error: catError } = await supabase
          .from('categories')
          .select('id, name, slug, description')

        let categoryMap = new Map()
        if (!catError && allCats) {
          categoryMap = new Map(allCats.map(c => [c.id, { name: c.name, slug: c.slug, description: c.description }]))
        }

        let targetCategoryId: string | null = null
        if (currentCategorySlug) {
          const { data: catRecord } = await supabase
            .from('categories')
            .select('id, description')
            .eq('slug', currentCategorySlug)
            .single()
          
          if (catRecord) {
            targetCategoryId = catRecord.id
            setActiveCategoryDesc(catRecord.description || null)
          }
        }

        let countQuery = supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')

        if (targetCategoryId) {
          countQuery = countQuery.eq('category_id', targetCategoryId)
        }

        const { count } = await countQuery
        setTotalCount(count || 0)

        let articlesQuery = supabase
          .from('articles')
          .select(`
            id,
            title,
            title${suffix},
            slug,
            summary,
            summary${suffix},
            cover_image,
            created_at,
            categories ( id, name, slug, parent_id, description ),
            authors ( name, role_title, short_bio, avatar_url ),
            reviewers ( name, role_title, short_bio, avatar_url ),
            fact_checkers ( name, role_title, short_bio, avatar_url )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

        if (targetCategoryId) {
          articlesQuery = articlesQuery.eq('category_id', targetCategoryId)
        }

        const { data, error } = await articlesQuery

        if (!error && data) {
          const rawDataArray = data as any[]
          
          const mapped: Article[] = rawDataArray.map((rawData) => {
            const currentCat = rawData.categories
            let parentObj = null

            if (currentCat && currentCat.parent_id) {
              const matchedParent = categoryMap.get(currentCat.parent_id)
              if (matchedParent) {
                parentObj = {
                  name: matchedParent.name,
                  slug: matchedParent.slug
                }
              }
            }

            return {
              id: rawData.id,
              title: rawData[`title${suffix}`] || rawData.title || '',
              summary: rawData[`summary${suffix}`] || rawData.summary || null,
              slug: rawData.slug,
              cover_image: rawData.cover_image,
              created_at: rawData.created_at,
              categories: currentCat ? {
                name: currentCat.name,
                slug: currentCat.slug,
                parent_id: currentCat.parent_id,
                description: currentCat.description,
                parent: parentObj
              } : null,
              authors: rawData.authors as unknown as AuthorData | null,
              reviewers: rawData.reviewers as unknown as ReviewerData | null,
              fact_checkers: rawData.fact_checkers as unknown as FactCheckerData | null,
            }
          })

          setArticles(mapped)
        }
      } catch (err) {
        console.error('Error standardizing article system matrix feed:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticlesData()
  }, [supabase, lang, currentCategorySlug, currentPage])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('page', newPage.toString())
    router.push(`/${lang}/articles?${params.toString()}`)
  }

  const dict = fallbackEn

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-20 flex items-center justify-center min-h-[500px]">
        <div className="text-[11px] font-mono tracking-widest text-slate-800 uppercase animate-pulse">
          Syncing article archive matrix...
        </div>
      </div>
    )
  }

  return (
    <main className="w-full bg-white text-slate-950 pt-28 sm:pt-32 pb-16 min-h-screen">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
        
        <div className="border-b border-slate-100 pb-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
                Archive Registry
              </span>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight uppercase text-slate-950">
                {currentCategorySlug ? `${dict.sectorInventory}: ${currentCategorySlug}` : 'All Insights'}
              </h1>
            </div>
            <div className="text-[11px] font-mono text-slate-500 font-bold bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200/60 w-max">
              TOTAL INDEXED: {totalCount} UNITS
            </div>
          </div>

          {activeCategoryDesc && (
            <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-3xl leading-relaxed pt-1 animate-in fade-in duration-300">
              {activeCategoryDesc}
            </p>
          )}
        </div>

        {articles.length === 0 ? (
          <div className="w-full py-20 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">{dict.zeroArticles}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {articles.map((article) => (
              <article 
                key={article.id} 
                className="group flex flex-col justify-between bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[460px]"
              >
                <div>
                  <div className="w-full h-48 bg-slate-50 border-b border-slate-200 overflow-hidden relative">
                    {article.cover_image ? (
                      <img 
                        src={article.cover_image} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-400 uppercase">
                        {dict.noCover}
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    {article.categories && (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {article.categories.parent ? (
                          <>
                            <span className="text-[9px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2 py-0.5 rounded font-bold shadow-sm">
                              {article.categories.parent.name}
                            </span>
                            <span className="text-[9px] font-mono bg-slate-100 text-slate-600 uppercase tracking-widest px-2 py-0.5 rounded font-bold border border-slate-200/60">
                              # {article.categories.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-[9px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2 py-0.5 rounded font-bold shadow-sm">
                            {article.categories.name}
                          </span>
                        )}
                      </div>
                    )}

                    <h2 className="font-black text-base sm:text-lg text-slate-950 line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-slate-800 transition-colors">
                      <Link href={`/${lang}/articles/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h2>

                    {article.summary && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                        {article.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-4">
                  <div className="grid grid-cols-1 gap-2.5 pt-3 border-t border-slate-100">
                    {article.authors && (
                      <div 
                        onClick={() => article.authors && setProfileModal({
                          isOpen: true,
                          title: 'Author Profile',
                          name: article.authors.name,
                          role: article.authors.role_title,
                          bio: article.authors.short_bio,
                          avatar: article.authors.avatar_url
                        })}
                        className="flex items-center gap-2.5 cursor-pointer group/meta hover:opacity-85 transition-opacity max-w-max"
                      >
                        {article.authors.avatar_url ? (
                          <img src={article.authors.avatar_url} className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><User className="w-3.5 h-3.5" /></div>
                        )}
                        <div>
                          <p className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">{dict.writtenBy}</p>
                          <p className="font-bold text-slate-900 text-[11px] group-hover/meta:underline leading-tight">{article.authors.name}</p>
                        </div>
                      </div>
                    )}

                    {article.reviewers && (
                      <div 
                        onClick={() => article.reviewers && setProfileModal({
                          isOpen: true,
                          title: 'Reviewer Profile',
                          name: article.reviewers.name,
                          role: article.reviewers.role_title,
                          bio: article.reviewers.short_bio,
                          avatar: article.reviewers.avatar_url
                        })}
                        className="flex items-center gap-2.5 cursor-pointer group/meta hover:opacity-85 transition-opacity max-w-max"
                      >
                        {article.reviewers.avatar_url ? (
                          <img src={article.reviewers.avatar_url} className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><CheckCircle className="w-3.5 h-3.5" /></div>
                        )}
                        <div>
                          <p className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">{dict.reviewedBy}</p>
                          <p className="font-bold text-slate-600 text-[11px] group-hover/meta:underline leading-tight">{article.reviewers.name}</p>
                        </div>
                      </div>
                    )}

                    {article.fact_checkers && (
                      <div 
                        onClick={() => article.fact_checkers && setProfileModal({
                          isOpen: true,
                          title: 'Fact Checker Profile',
                          name: article.fact_checkers.name,
                          role: article.fact_checkers.role_title,
                          bio: article.fact_checkers.short_bio,
                          avatar: article.fact_checkers.avatar_url
                        })}
                        className="flex items-center gap-2.5 cursor-pointer group/meta hover:opacity-85 transition-opacity max-w-max"
                      >
                        {article.fact_checkers.avatar_url ? (
                          <img src={article.fact_checkers.avatar_url} className="w-7 h-7 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><UserCheck className="w-3.5 h-3.5" /></div>
                        )}
                        <div>
                          <p className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">{dict.factCheckedBy}</p>
                          <p className="font-bold text-purple-700 text-[11px] group-hover/meta:underline leading-tight">{article.fact_checkers.name}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-bold text-slate-950">
                      <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block font-normal leading-none mb-0.5">{dict.published}</span>
                      {new Date(article.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>

                    <Link 
                      href={`/${lang}/articles/${article.slug}`}
                      className="bg-slate-950 hover:bg-slate-800 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                      {dict.readMore}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-100">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-[11px] font-mono font-bold text-slate-950 uppercase tracking-wider">
              Segment {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-9 h-9 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
        
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
    </main>
  )
}