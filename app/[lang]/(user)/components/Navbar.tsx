'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { ChevronDown, Menu, X } from 'lucide-react'

interface CategoryNode {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

export default function Navbar() {
  const [mainCategories, setMainCategories] = useState<CategoryNode[]>([])
  const [subCategories, setSubCategories] = useState<CategoryNode[]>([])
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const navbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Inisialisasi di dalam useEffect agar aman di Vercel production
    const supabase = createClient()

    const fetchTaxonomyTree = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')
          .order('name', { ascending: true })

        if (!error && data) {
          const dataNodes = data as CategoryNode[]
          setMainCategories(dataNodes.filter(node => node.parent_id === null))
          setSubCategories(dataNodes.filter(node => node.parent_id !== null))
        }
      } catch (err) {
        console.error('Failed to resolve dynamic taxonomy layout:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTaxonomyTree()
  }, []) // Dependensi kosong agar dijalankan sekali saat mount

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setActiveDropdownId(null)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const activeSubNodes = subCategories.filter(
    (sub) => sub.parent_id === activeDropdownId
  )

  return (
    <div ref={navbarRef} className="fixed top-0 left-0 right-0 z-50 transition-all duration-300">
      {/* GLOBAL BANNER / TELEMETRY RUNTIME TAPE */}
      <div className="w-full bg-slate-950 border-b border-slate-900/60 py-1.5 px-4 overflow-hidden relative">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 animate-pulse">
            <span className="text-[9px] font-mono tracking-[0.2em] text-emerald-400 font-black uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping" />
              System Status: Operational
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[9px] font-mono text-slate-500 tracking-wider">
            <span>NODE_ENV: PRODUCTION</span>
            <span className="text-slate-700">|</span>
            <span>REGION: ASIA_PACIFIC</span>
          </div>
        </div>
      </div>

      {/* CORE NAVBAR STRUCTURE */}
      <header
        className={`w-full transition-all duration-300 ${
          isScrolled 
            ? 'bg-slate-950/90 backdrop-blur-md shadow-lg border-b border-slate-900/40 py-3' 
            : 'bg-slate-950 py-4.5 border-b border-slate-900/20'
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex items-center justify-between">
          {/* TECHNICAL MONOLITH BRAND MARK */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 bg-white text-slate-950 font-black flex items-center justify-center text-sm rounded shadow-sm group-hover:scale-95 transition-transform duration-200">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-white tracking-tight uppercase leading-none mb-0.5">
                DAILY HAREND
              </span>
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest leading-none">
                Intelligence Engine
              </span>
            </div>
          </Link>

          {/* DESKTOP DESCRIPTOR ROUTING MATRIX */}
          <nav className="hidden md:block">
            <ul className="flex items-center gap-1">
              {loading ? (
                <li className="text-[10px] font-mono text-slate-600 uppercase tracking-wider animate-pulse px-3">
                  Populating matrix taxonomy...
                </li>
              ) : (
                mainCategories.map((mainCat) => {
                  const hasSubs = subCategories.some(sub => sub.parent_id === mainCat.id)
                  const isDropdownActive = activeDropdownId === mainCat.id

                  return (
                    <li key={mainCat.id} className="relative">
                      {hasSubs ? (
                        <button
                          onClick={() => setActiveDropdownId(isDropdownActive ? null : mainCat.id)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-all duration-150 ${
                            isDropdownActive
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                          }`}
                        >
                          {mainCat.name}
                          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isDropdownActive ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                        </button>
                      ) : (
                        <Link
                          href={`/articles?category=${mainCat.slug}`}
                          onClick={() => setActiveDropdownId(null)}
                          className="block px-3 py-1.5 rounded-md text-[11px] font-bold text-slate-400 hover:text-white hover:bg-slate-900/40 uppercase tracking-wider transition-colors"
                        >
                          {mainCat.name}
                        </Link>
                      )}
                    </li>
                  )
                })
              )}
            </ul>
          </nav>

          {/* INTERACTION HUB & RESPONSIVE TRIGGER */}
          <div className="flex items-center gap-3">
            <Link
              href="/contact"
              className="hidden sm:inline-block bg-white hover:bg-slate-100 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-colors shadow-sm"
            >
              Terminal Access
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE RESPONSIVE LAYER OVERLAY */}
      {isMobileMenuOpen && (
        <div className="md:hidden w-full bg-slate-950 border-b border-slate-900 px-4 py-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="w-full">
            <ul className="flex flex-col gap-2">
              {loading ? (
                <li className="text-[10px] font-mono text-slate-600 uppercase tracking-wider p-2 animate-pulse">
                  Populating system taxonomy...
                </li>
              ) : (
                mainCategories.map((mainCat) => {
                  const hasSubs = subCategories.some(sub => sub.parent_id === mainCat.id)
                  const specificSubs = subCategories.filter(sub => sub.parent_id === mainCat.id)
                  const isDropdownActive = activeDropdownId === mainCat.id

                  return (
                    <li key={mainCat.id} className="w-full bg-slate-900/20 border border-slate-900/40 rounded-lg p-1.5">
                      {hasSubs ? (
                        <div className="w-full">
                          <button
                            onClick={() => setActiveDropdownId(isDropdownActive ? null : mainCat.id)}
                            className="w-full flex items-center justify-between p-2 text-xs font-bold text-slate-300 hover:text-white uppercase tracking-wider text-left"
                          >
                            {mainCat.name}
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isDropdownActive ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                          </button>
                          
                          {isDropdownActive && (
                            <ul className="mt-1 ml-3 pl-3 border-l border-slate-800 space-y-1 bg-slate-900/40 rounded-r-lg p-1.5">
                              {specificSubs.map((subCat) => (
                                <li key={subCat.id}>
                                  <Link
                                    href={`/articles?category=${subCat.slug}`}
                                    onClick={() => {
                                      setIsMobileMenuOpen(false)
                                      setActiveDropdownId(null)
                                    }}
                                    className="block py-1.5 text-[11px] font-bold text-slate-400 hover:text-white uppercase tracking-wider"
                                  >
                                    # {subCat.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={`/articles?category=${mainCat.slug}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block py-1.5 text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider"
                        >
                          {mainCat.name}
                        </Link>
                      )}
                    </li>
                  )
                })
              )}
            </ul>
          </nav>
        </div>
      )}

      {/* DETACHED SUB-CATEGORY PANEL (BG SLATE-900 UNTUK KONTRAS PREMIUM) */}
      {activeDropdownId && activeSubNodes.length > 0 && (
        <div className="hidden md:block absolute left-0 right-0 top-full bg-slate-900 border-b border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="w-full max-w-7xl mx-auto px-6 py-3.5VISION">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {activeSubNodes.map((subCat) => (
                <li key={subCat.id}>
                  <Link
                    href={`/articles?category=${subCat.slug}`}
                    onClick={() => setActiveDropdownId(null)}
                    className="inline-block py-0.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
                  >
                    # {subCat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}