'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { User, CheckCircle, X, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react'

interface CategoryData {
  name: string
  slug: string
  parent_id: string | null
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

interface ArticleNode {
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

export default function LatestInsights() {
  const [articles, setArticles] = useState<ArticleNode[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const params = useParams()
  const lang = (params?.lang as string) || 'en'
  const itemsPerPage = 6 

  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean
    title: string
    name: string
    role: string
    bio: string
    avatar: string | null
  }>({ isOpen: false, title: '', name: '', role: '', bio: '', avatar: null })

  useEffect(() => {
    const fetchLatestArticles = async () => {
      try {
        setLoading(true)
        const suffix = lang && lang !== 'en' ? `_${lang}` : ''

        const { data: allCats, error: catError } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')

        let categoryMap = new Map()
        if (!catError && allCats) {
          categoryMap = new Map(allCats.map(c => [c.id, { name: c.name, slug: c.slug, parent_id: c.parent_id }]))
        }

        const { count } = await supabase
          .from('articles')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'published')

        setTotalCount(count || 0)

        const { data, error } = await supabase
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
            categories ( id, name, slug, parent_id ),
            authors ( name, role_title, short_bio, avatar_url ),
            reviewers ( name, role_title, short_bio, avatar_url ),
            fact_checkers ( name, role_title, short_bio, avatar_url )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1)

        if (!error && data) {
          const rawDataArray = data as any[]
          
          const mapped: ArticleNode[] = rawDataArray.map((rawData) => {
            const currentCat = rawData.categories
            let parentObj = null

            if (currentCat && currentCat.parent_id) {
              const matchedParent = categoryMap.get(currentCat.parent_id)
              if (matchedParent) {
                parentObj = { name: matchedParent.name, slug: matchedParent.slug }
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
        console.error('Failed to resolve dynamic main feed telemetry:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLatestArticles()
  }, [supabase, lang, currentPage])

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (loading) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="text-[11px] font-mono tracking-widest text-slate-800 uppercase animate-pulse">
          Syncing main segment matrix feed...
        </div>
      </div>
    )
  }

  if (articles.length === 0) return null

  return (
    <section className="w-full pt-12 space-y-8 border-t border-slate-100 mt-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div>
          <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
            Contextual Feed
          </span>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
            Latest Insights
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {articles.map((article) => (
          <article 
            key={article.id} 
            className="group flex flex-col justify-between bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 min-h-[440px]"
          >
            <div>
              <div className="w-full h-44 bg-slate-50 border-b border-slate-200 overflow-hidden relative">
                {article.cover_image ? (
                  <img 
                    src={article.cover_image} 
                    alt={article.title} 
                    className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-slate-400 uppercase">
                    NO COVER
                  </div>
                )}
              </div>

              <div className="p-5 space-y-3.5">
                {article.categories && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {article.categories.parent ? (
                      <>
                        <span className="text-[8.5px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2 py-0.5 rounded font-bold shadow-sm">
                          {article.categories.parent.name}
                        </span>
                        <span className="text-[8.5px] font-mono bg-slate-100 text-slate-600 uppercase tracking-widest px-2 py-0.5 rounded font-bold border border-slate-200/60">
                          # {article.categories.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[8.5px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2 py-0.5 rounded font-bold shadow-sm">
                        {article.categories.name}
                      </span>
                    )}
                  </div>
                )}

                <h4 className="font-black text-base text-slate-950 line-clamp-2 leading-tight uppercase tracking-tight group-hover:text-slate-800 transition-colors">
                  <Link href={`/${lang}/articles/${article.slug}`}>
                    {article.title}
                  </Link>
                </h4>

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
                      <p className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">Written By</p>
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
                      <p className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">Reviewed By</p>
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
                      <p className="text-[7.5px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">Fact Checked By</p>
                      <p className="font-bold text-purple-700 text-[11px] group-hover/meta:underline leading-tight">{article.fact_checkers.name}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[10px] font-bold text-slate-950">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block font-normal leading-none mb-0.5">Published</span>
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
                  READ MORE
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <div className="text-[10px] font-mono font-bold text-slate-950 uppercase tracking-wider">
            Page {currentPage} / {totalPages}
          </div>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center justify-center w-8 h-8 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {profileModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full relative shadow-2xl text-slate-950">
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
                <img src={profileModal.avatar} className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-md" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400"><User className="w-8 h-8" /></div>
              )}

              <div className="space-y-0.5">
                <h4 className="text-lg font-black text-slate-950 uppercase tracking-tight">{profileModal.name}</h4>
                <p className="text-[10px] font-mono text-blue-700 font-bold uppercase">{profileModal.role}</p>
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                  {profileModal.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}