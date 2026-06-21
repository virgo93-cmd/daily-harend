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
      console.error('Failed to resolve database core taxonomy:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTaxonomyTree()

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

  const toggleDropdown = (id: string) => {
    setActiveDropdownId(activeDropdownId === id ? null : id)
  }

  const activeSubNodes = subCategories.filter(sub => sub.parent_id === activeDropdownId)

  return (
    <header 
      ref={navbarRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled 
          ? 'bg-slate-950/95 backdrop-blur-md border-slate-900 py-4 shadow-xl' 
          : 'bg-slate-950 border-transparent py-6'
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-6">
        <div className={`flex transition-all duration-300 ${
          isScrolled 
            ? 'flex-row items-center justify-between gap-8' 
            : 'flex-col items-start md:flex-row md:items-center md:justify-between gap-5'
        }`}>
          
          {/* BRAND IDENTITY BLOCK */}
          <div className="w-full md:w-auto flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <img 
                src="/img/logo/d.png" 
                alt="Daily Harend Logo" 
                className="w-8 h-8 object-contain"
              />
              <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-slate-300 transition-colors">
                Daily Harend
              </span>
            </Link>

            {/* HAMBURGER TRIGGER (MOBILE ONLY) */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 text-slate-400 hover:text-white md:hidden transition-colors outline-none"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* DESKTOP NAVIGATION INTERFACE */}
          <nav className="hidden md:block">
            {loading ? (
              <div className="text-[10px] font-mono text-slate-800 tracking-widest uppercase">
                Synchronizing...
              </div>
            ) : (
              <ul className="flex items-center gap-7">
                {mainCategories.map((mainCat) => {
                  const childNodes = subCategories.filter(sub => sub.parent_id === mainCat.id)
                  const hasChildren = childNodes.length > 0
                  const isOpen = activeDropdownId === mainCat.id

                  return (
                    <li key={mainCat.id} className="relative">
                      {hasChildren ? (
                        <button
                          onClick={() => toggleDropdown(mainCat.id)}
                          className={`text-xs font-bold transition-colors tracking-wider uppercase flex items-center gap-1.5 outline-none select-none ${
                            isOpen ? 'text-white' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>{mainCat.name}</span>
                          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                        </button>
                      ) : (
                        <Link 
                          href={`/articles?category=${mainCat.slug}`}
                          className="text-xs font-bold text-slate-400 hover:text-white transition-colors tracking-wider uppercase"
                        >
                          {mainCat.name}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </nav>
        </div>

        {/* MOBILE NAVIGATION DRAWER */}
        {isMobileMenuOpen && (
          <nav className="w-full md:hidden mt-4 border-t border-slate-900/60 pt-3 animate-in fade-in duration-150">
            <ul className="space-y-2.5">
              {mainCategories.map((mainCat) => {
                const childNodes = subCategories.filter(sub => sub.parent_id === mainCat.id)
                const hasChildren = childNodes.length > 0
                const isOpen = activeDropdownId === mainCat.id

                return (
                  <li key={mainCat.id} className="w-full">
                    {hasChildren ? (
                      <div className="w-full">
                        <button
                          onClick={() => setActiveDropdownId(isOpen ? null : mainCat.id)}
                          className="w-full py-1.5 text-xs font-bold text-slate-400 hover:text-white flex items-center justify-between uppercase tracking-wider"
                        >
                          <span>{mainCat.name}</span>
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-white' : 'text-slate-500'}`} />
                        </button>
                        
                        {isOpen && (
                          <ul className="mt-1 ml-3 pl-3 border-l border-slate-900 space-y-2 py-1">
                            {childNodes.map((subCat) => (
                              <li key={subCat.id}>
                                <Link
                                  href={`/articles?category=${subCat.slug}`}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false)
                                    setActiveDropdownId(null)
                                  }}
                                  className="block py-1 text-[11px] font-bold text-slate-500 hover:text-white uppercase tracking-wide"
                                >
                                  {subCat.name}
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
              })}
            </ul>
          </nav>
        )}
      </div>

      {/* DETACHED SUB-CATEGORY PANEL (BG SLATE-900 UNTUK KONTRAS PREMIUM) */}
      {activeDropdownId && activeSubNodes.length > 0 && (
        <div className="hidden md:block absolute left-0 right-0 top-full bg-slate-900 border-b border-slate-800 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="w-full max-w-7xl mx-auto px-6 py-3.5">
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
    </header>
  )
}