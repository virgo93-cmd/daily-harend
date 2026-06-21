'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, User, CheckCircle, X, UserCheck } from 'lucide-react'

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
  cover_image: string | null
  created_at: string
  categories: CategoryData | null
  authors: AuthorData | null
  reviewers: ReviewerData | null
  fact_checkers: FactCheckerData | null
}

export default function HeroSlider() {
  const [articles, setArticles] = useState<ArticleNode[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const params = useParams()
  const lang = (params?.lang as string) || 'en'

  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean
    title: string
    name: string
    role: string
    bio: string
    avatar: string | null
  }>({ isOpen: false, title: '', name: '', role: '', bio: '', avatar: null })

  useEffect(() => {
    const fetchHeroArticles = async () => {
      try {
        setLoading(true)
        const suffix = lang && lang !== 'en' ? `_${lang}` : ''

        // 1. Tarik data artikel, ketebalan author, reviewer, dan fact_checkers dari Supabase
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select(`
            id,
            title,
            title${suffix},
            slug,
            cover_image,
            created_at,
            categories ( id, name, slug, parent_id ),
            authors ( name, role_title, short_bio, avatar_url ),
            reviewers ( name, role_title, short_bio, avatar_url ),
            fact_checkers ( name, role_title, short_bio, avatar_url )
          `)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10)

        if (!articleError && articleData) {
          const rawDataArray = articleData as any[]

          // 2. Tarik semua list data categories untuk dijadikan kamus/map pencarian bapak (parent)
          const { data: allCats, error: catError } = await supabase
            .from('categories')
            .select('id, name, slug')

          if (!catError && allCats) {
            // Kamus lokal untuk pencarian cepat data induk kategori berdasarkan UUID
            const categoryMap = new Map(allCats.map(c => [c.id, { name: c.name, slug: c.slug }]))

            const mappedArticles: ArticleNode[] = rawDataArray.map((rawData) => {
              const currentCat = rawData.categories
              let parentObj = null

              // Jika kategori memiliki parent_id, cari nama bapaknya di kamus lokal (ex: BUDGETING)
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
                slug: rawData.slug,
                cover_image: rawData.cover_image,
                created_at: rawData.created_at,
                categories: currentCat ? {
                  name: currentCat.name,
                  slug: currentCat.slug,
                  parent_id: currentCat.parent_id,
                  parent: parentObj // Suntik data objek bapak secara manual ke state React
                } : null,
                authors: rawData.authors as unknown as AuthorData | null,
                reviewers: rawData.reviewers as unknown as ReviewerData | null,
                fact_checkers: rawData.fact_checkers as unknown as FactCheckerData | null,
              }
            })

            setArticles(mappedArticles)
          }
        }
      } catch (err) {
        console.error('Failed to resolve dynamic hero slider content metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHeroArticles()
  }, [supabase, lang])

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-20 flex items-center justify-center min-h-[400px]">
        <div className="text-[11px] font-mono tracking-widest text-slate-800 uppercase animate-pulse">
          Decrypting secure slider matrix...
        </div>
      </div>
    )
  }

  if (articles.length === 0) return null

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % articles.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length)
  }

  const formatArticleDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const currentCategory = articles[currentIndex].categories

  return (
    <section className="w-full relative group select-none py-4">
      <div className="w-full bg-white border border-slate-200 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm min-h-[400px] flex flex-col md:flex-row relative">
        
        {/* KOLOM KIRI: Metadata Teks Artikel */}
        <div className="w-full md:w-2/5 p-6 sm:p-10 flex flex-col justify-between relative z-10 bg-white">
          <div className="space-y-5 my-auto">
            
            {/* LABEL KATEGORI UTAMA & SUB KATEGORI */}
            {currentCategory && (
              <div className="flex flex-wrap gap-2 items-center">
                {/* JIKA ADA INDUK (parent), TAMPILKAN INDUK DI LABEL HITAM & ANAK DI LABEL ABU-ABU */}
                {currentCategory.parent ? (
                  <>
                    <span className="text-[10px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2.5 py-1 rounded-md font-bold shadow-sm">
                      {currentCategory.parent.name}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-600 uppercase tracking-widest px-2.5 py-1 rounded-md font-bold border border-slate-200/60">
                      # {currentCategory.name}
                    </span>
                  </>
                ) : (
                  // JIKA ARTIKEL BERADA LANGSUNG DI INDUK, TAMPILKAN SATU LABEL HITAM
                  <span className="text-[10px] font-mono bg-slate-950 text-white uppercase tracking-widest px-2.5 py-1 rounded-md font-bold shadow-sm">
                    {currentCategory.name}
                  </span>
                )}
              </div>
            )}
            
            {/* Judul Artikel Dinamis */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-950 tracking-tight uppercase leading-tight sm:leading-tight break-words pt-1">
              {articles[currentIndex].title}
            </h2>
            
            {/* Kredensial Relasional: Author, Reviewer & Fact Checker dengan Pop-up Modal */}
            <div className="grid grid-cols-1 gap-3 pt-2 border-t border-slate-100">
              {articles[currentIndex].authors && (
                <div 
                  onClick={() => articles[currentIndex].authors && setProfileModal({
                    isOpen: true,
                    title: 'Author Profile',
                    name: articles[currentIndex].authors.name,
                    role: articles[currentIndex].authors.role_title,
                    bio: articles[currentIndex].authors.short_bio,
                    avatar: articles[currentIndex].authors.avatar_url
                  })}
                  className="flex items-center gap-3 cursor-pointer group/meta hover:opacity-85 transition-opacity max-w-max"
                >
                  {articles[currentIndex].authors.avatar_url ? (
                    <img src={articles[currentIndex].authors.avatar_url} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><User className="w-4 h-4" /></div>
                  )}
                  <div>
                    <p className="text-[8px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">Written By</p>
                    <p className="font-bold text-slate-900 text-xs group-hover/meta:underline">{articles[currentIndex].authors.name}</p>
                  </div>
                </div>
              )}

              {articles[currentIndex].reviewers && (
                <div 
                  onClick={() => articles[currentIndex].reviewers && setProfileModal({
                    isOpen: true,
                    title: 'Reviewer Profile',
                    name: articles[currentIndex].reviewers.name,
                    role: articles[currentIndex].reviewers.role_title,
                    bio: articles[currentIndex].reviewers.short_bio,
                    avatar: articles[currentIndex].reviewers.avatar_url
                  })}
                  className="flex items-center gap-3 cursor-pointer group/meta hover:opacity-85 transition-opacity max-w-max"
                >
                  {articles[currentIndex].reviewers.avatar_url ? (
                    <img src={articles[currentIndex].reviewers.avatar_url} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><CheckCircle className="w-4 h-4" /></div>
                  )}
                  <div>
                    <p className="text-[8px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">Reviewed By</p>
                    <p className="font-bold text-slate-600 text-xs group-hover/meta:underline">{articles[currentIndex].reviewers.name}</p>
                  </div>
                </div>
              )}

              {articles[currentIndex].fact_checkers && (
                <div 
                  onClick={() => articles[currentIndex].fact_checkers && setProfileModal({
                    isOpen: true,
                    title: 'Fact Checker Profile',
                    name: articles[currentIndex].fact_checkers.name,
                    role: articles[currentIndex].fact_checkers.role_title,
                    bio: articles[currentIndex].fact_checkers.short_bio,
                    avatar: articles[currentIndex].fact_checkers.avatar_url
                  })}
                  className="flex items-center gap-3 cursor-pointer group/meta hover:opacity-85 transition-opacity max-w-max"
                >
                  {articles[currentIndex].fact_checkers.avatar_url ? (
                    <img src={articles[currentIndex].fact_checkers.avatar_url} className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-sm" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500"><UserCheck className="w-4 h-4" /></div>
                  )}
                  <div>
                    <p className="text-[8px] font-mono text-slate-400 uppercase tracking-wider leading-none mb-0.5">Fact Checked By</p>
                    <p className="font-bold text-purple-700 text-xs group-hover/meta:underline">{articles[currentIndex].fact_checkers.name}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tanggal Rilis & Tombol Aksi */}
            <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
              <div className="text-[11px] font-bold text-slate-950">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-normal leading-none mb-1">Published</span>
                {formatArticleDate(articles[currentIndex].created_at)}
              </div>
              <Link 
                href={`/articles/${articles[currentIndex].slug}`}
                className="inline-block bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-mono font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-colors duration-200 w-max shadow-sm"
              >
                READ MORE
              </Link>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: Visual Cover Image */}
        <div className="w-full md:w-3/5 min-h-[250px] md:min-h-[450px] relative bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 overflow-hidden">
          {articles[currentIndex].cover_image ? (
            <img src={articles[currentIndex].cover_image} alt={articles[currentIndex].title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-100" />
          )}
        </div>

        {/* TOMBOL NAVIGASI MANUAL */}
        {articles.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-50 z-20"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-700 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-slate-50 z-20"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* INDIKATOR BULAT/DOTS */}
      {articles.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {articles.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'w-6 bg-slate-950' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}

      {/* POP-UP MODAL PROFIL */}
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
    </section>
  );
}