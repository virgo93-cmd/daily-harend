'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Grid, 
  ArrowUpRight, 
  ChevronDown, 
  Layers,
  Wallet,
  TrendingUp,
  Home,
  Globe,
  Landmark,
  Briefcase,
  Compass,
  PlusCircle
} from 'lucide-react'

interface CategoryNode {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

export default function SectorHubs() {
  const [mainCategories, setMainCategories] = useState<CategoryNode[]>([])
  const [subCategoriesMap, setSubCategoriesMap] = useState<Map<string, CategoryNode[]>>(new Map())
  const [openAccordionId, setOpenAccordionId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const params = useParams()
  const lang = (params?.lang as string) || 'en'

  // Kamus pemetaan icon dinamis berdasarkan slug kategori utama
  // REVISI: Ukuran icon diperbesar menjadi w-8 h-8
  const getSectorIcon = (slug: string) => {
    switch (slug) {
      case 'budgeting':
        return <Wallet className="w-8 h-8 text-slate-950" />
      case 'investing':
        return <TrendingUp className="w-8 h-8 text-slate-950" />
      case 'mortgages':
        return <Home className="w-8 h-8 text-slate-950" />
      case 'economics':
        return <Globe className="w-8 h-8 text-slate-950" />
      case 'banking':
        return <Landmark className="w-8 h-8 text-slate-950" />
      case 'small-business':
        return <Briefcase className="w-8 h-8 text-slate-950" />
      case 'career-planning':
        return <Compass className="w-8 h-8 text-slate-950" />
      default:
        return <PlusCircle className="w-8 h-8 text-slate-950" />
    }
  }

  useEffect(() => {
    const fetchSectorHubData = async () => {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')
          .order('name', { ascending: true })

        if (!error && data) {
          const allCats = data as CategoryNode[]

          const parents = allCats.filter(c => c.parent_id === null)
          setMainCategories(parents)

          const subMap = new Map<string, CategoryNode[]>()
          allCats.forEach(c => {
            if (c.parent_id) {
              const existing = subMap.get(c.parent_id) || []
              subMap.set(c.parent_id, [...existing, c])
            }
          })
          setSubCategoriesMap(subMap)
        }
      } catch (err) {
        console.error('Failed to sync dynamic multi-tier sector telemetry:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchSectorHubData()
  }, [supabase])

  const toggleAccordion = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    setOpenAccordionId(openAccordionId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase animate-pulse">
          Indexing Core Sectors & Sub-Nodes...
        </div>
      </div>
    )
  }

  if (mainCategories.length === 0) return null

  return (
    <section className="w-full pt-12 space-y-6 border-t border-slate-100 mt-12">
      {/* Header Sektor */}
      <div>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
          Structural Layout
        </span>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
          <Grid className="w-5 h-5 text-slate-950 shrink-0" />
          Sector Hubs
        </h3>
      </div>

      {/* Grid Kartu Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mainCategories.map((cat) => {
          const subs = subCategoriesMap.get(cat.id) || []
          const isAccordionOpen = openAccordionId === cat.id

          return (
            <div 
              key={cat.id}
              className="group flex flex-col justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-slate-400 transition-all duration-300 shadow-xs relative"
            >
              {/* BOX ATAS: Judul Kategori, Icon Besar di Kiri & Tombol Direct Tautan */}
              <div className="flex items-start justify-between gap-4 w-full">
                
                {/* REVISI: Kontainer Flexbox untuk menata Icon di Kiri & Teks di Kanan */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  
                  {/* REVISI: Icon Besar diperbesar menjadi w-8 h-8 */}
                  <div className="shrink-0 flex items-center justify-center">
                    {getSectorIcon(cat.slug)}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    {/* Label Atas murni teks karena Icon sudah dipindah ke kiri */}
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block font-bold leading-none">
                      Core Sector
                    </span>
                    {/* Judul Utama Link Langsung */}
                    <h4 className="font-black text-sm sm:text-base text-slate-950 uppercase tracking-tight leading-tight hover:text-slate-700 transition-colors break-words">
                      <Link href={`/${lang}/articles?category=${cat.slug}`}>
                        {cat.name}
                      </Link>
                    </h4>
                  </div>
                </div>

                {/* Tombol Direct Link Ke Kategori Utama */}
                <Link
                  href={`/${lang}/articles?category=${cat.slug}`}
                  className="w-7 h-7 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-950 hover:border-slate-400 transition-all duration-300 shrink-0"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* BOX BAWAH: Accordion Pemicu Sub-Kategori */}
              {subs.length > 0 && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 w-full space-y-3">
                  <button
                    onClick={(e) => toggleAccordion(e, cat.id)}
                    className="w-full flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider hover:text-slate-950 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3 h-3" />
                      Sub-Sectors ({subs.length})
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAccordionOpen ? 'rotate-180 text-slate-950' : ''}`} />
                  </button>

                  {/* Panel List Sub-Kategori Terbuka */}
                  {isAccordionOpen && (
                    <div className="flex flex-col gap-1.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {subs.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/${lang}/articles?category=${sub.slug}`}
                          className="text-xs font-semibold text-slate-600 hover:text-slate-950 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-all text-left block truncate uppercase"
                        >
                          # {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}