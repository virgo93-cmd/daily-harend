'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Mail, Phone } from 'lucide-react' // Hanya impor Mail dan Phone yang sudah terbukti valid di project lu

interface CategoryNode {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

interface SiteConfig {
  site_name: string
  contact_email: string
  facebook_url: string
  office_address: string
}

export default function Footer() {
  const [mainCategories, setMainCategories] = useState<CategoryNode[]>([])
  const [subCategories, setSubCategories] = useState<CategoryNode[]>([])
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const currentYear = new Date().getFullYear()
  const supabase = createClient()
  
  const params = useParams()
  const lang = (params?.lang as string) || 'id'

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const { data: catData, error: catError } = await supabase
          .from('categories')
          .select('id, name, slug, parent_id')
          .order('name', { ascending: true })

        if (!catError && catData) {
          const dataNodes = catData as CategoryNode[]
          setMainCategories(dataNodes.filter(node => node.parent_id === null))
          setSubCategories(dataNodes.filter(node => node.parent_id !== null))
        }

        const { data: configData, error: configError } = await supabase
          .from('site_config')
          .select('site_name, contact_email, facebook_url, office_address')
          .single()

        if (!configError && configData) {
          setConfig(configData as SiteConfig)
        }
      } catch (err) {
        console.error('Failed to resolve database metadata for footer:', err)
      }
    }

    fetchFooterData()
  }, [supabase])

  return (
    <footer className="w-full bg-slate-950 border-t border-slate-900 text-slate-400 text-sm">
      {/* Bagian Atas Footer */}
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Kolom 1: BRAND IDENTITY BLOCK & SOCIAL ICON ROADS */}
        <div className="space-y-4">
          <Link href={`/${lang}`} className="flex items-center gap-3 shrink-0 group">
            <img 
              src="/img/logo/d.png" 
              alt="Daily Harend Logo" 
              className="w-8 h-8 object-contain"
            />
            <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-slate-300 transition-colors uppercase">
              {config?.site_name || 'Daily Harend'}
            </span>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed pt-1">
            A premier independent digital publication network dedicated to distributing high-level informational articles, systemic market reports, and structured educational guidelines.
          </p>
          
          {/* PERBAIKAN TOTAL: Menggunakan SVG Murni Bawaan untuk Facebook Icon */}
          <div className="flex items-center gap-5 pt-2 text-slate-500">
            {config?.facebook_url && (
              <a 
                href={config.facebook_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-150"
                title="Facebook Official Page"
              >
                {/* SVG Murni Facebook - 100% Kebal Eror Impor Library */}
                <svg 
                  className="w-5 h-5 fill-current" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                >
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
            )}
            {config?.contact_email && (
              <a 
                href={`mailto:${config.contact_email}`} 
                className="hover:text-white transition-colors duration-150"
                title="Email Desk"
              >
                <Mail className="w-5 h-5" />
              </a>
            )}
            <Link 
              href={`/${lang}/contact`} 
              className="hover:text-white transition-colors duration-150"
              title="Contact Support Channel"
            >
              <Phone className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Kolom 2: EDITORIAL SECTORS */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Editorial Sectors
          </h3>
          <div className="space-y-4 text-xs">
            {mainCategories.length > 0 ? (
              mainCategories.slice(0, 3).map((mainCat) => {
                const activeSubNodes = subCategories.filter(sub => sub.parent_id === mainCat.id)
                
                return (
                  <div key={mainCat.id} className="space-y-1">
                    <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                      {mainCat.name}
                    </div>
                    <ul className="space-y-1 pl-1">
                      {activeSubNodes.length > 0 ? (
                        activeSubNodes.map((subCat) => (
                          <li key={subCat.id}>
                            <Link 
                              href={`/articles?category=${subCat.slug}`}
                              className="hover:text-white text-slate-400 transition-colors duration-150 block text-[11px]"
                            >
                              # {subCat.name}
                            </Link>
                          </li>
                        ))
                      ) : (
                        <li className="text-slate-600 italic text-[10px]">No segments</li>
                      )}
                    </ul>
                  </div>
                )
              })
            ) : (
              <p className="text-slate-600 italic text-xs">No sectors available</p>
            )}
          </div>
        </div>

        {/* Kolom 3: Halaman Informasi Perusahaan */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Company Profile
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${lang}/about`} className="hover:text-white transition-colors duration-150">
                About Daily Harend
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/contact`} className="hover:text-white transition-colors duration-150">
                Contact Office Desk
              </Link>
            </li>
          </ul>
        </div>

        {/* Kolom 4: Regulasi Hukum & Kebijakan Publik */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white">
            Legal Regulations
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href={`/${lang}/privacy-policy`} className="hover:text-white transition-colors duration-150">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/terms-of-service`} className="hover:text-white transition-colors duration-150">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href={`/${lang}/disclaimer`} className="hover:text-white transition-colors duration-150">
                Disclaimer Statement
              </Link>
            </li>
          </ul>
        </div>

      </div>

      {/* Bagian Bawah Footer */}
      <div className="w-full bg-slate-950 border-t border-slate-900/60 py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; {currentYear} <span className="text-slate-400 font-medium">{config?.site_name || 'Daily Harend'}</span>. All corporate publication rights reserved.
          </div>
          <div className="tracking-wide text-[11px] text-slate-600 text-center sm:text-right max-w-xs md:max-w-none truncate">
            {config?.office_address || 'Physical Administration Desk: Tasikmalaya, West Java, Indonesia'}
          </div>
        </div>
      </div>
    </footer>
  );
}