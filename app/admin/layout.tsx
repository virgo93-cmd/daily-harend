'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Sidebar from './components/Sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState<string | null>(null)
  const [isMinimized, setIsMinimized] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Jika di root /admin (halaman login), jangan tendang dulu
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin'
        } else {
          setLoading(false)
        }
      } else {
        setAdminEmail(session.user.email ?? 'Authenticated Admin')
        setLoading(false)
        // Jika sudah login tapi masih di halaman login utama, lempar ke dashboard
        if (window.location.pathname === '/admin') {
          window.location.href = '/admin/dashboard'
        }
      }
    }

    checkSession()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-500 flex flex-col items-center justify-center gap-3 font-mono text-xs">
        <span className="h-5 w-5 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></span>
        <span>INITIALIZING SECURITY PROTOCOLS...</span>
      </div>
    )
  }

  // Jika di halaman login utama (/admin), kita tidak perlu menampilkan sidebar
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname === '/admin'

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar Modular Tunggal */}
      <Sidebar 
        adminEmail={adminEmail} 
        isMinimized={isMinimized} 
        setIsMinimized={setIsMinimized} 
      />

      {/* Konten Sebelah Kanan yang Otomatis Reflow */}
      <div className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isMinimized ? 'ml-20' : 'ml-64'}`}>
        {/* Header Atas */}
        <header className="border-b border-slate-900 bg-slate-950/50 backdrop-blur sticky top-0 z-40 px-8 py-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono text-slate-500 tracking-wider">DAILY HAREND MANAGEMENT CONSOLE</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-mono text-emerald-400 tracking-wide uppercase">Console Link Secured</span>
          </div>
        </header>

        {/* REVISI AREA KONTEN: 
          Menambahkan max-w-7xl (atau max-w-[95%] jika mau mentok kanan) untuk memaksa konten melebar secara global, 
          w-full agar tetap responsif, dan mx-auto agar posisi konten tetap seimbang di tengah.
        */}
        <div className="flex-1 p-8 w-full max-w-7xl mx-auto xl:max-w-[95%] transition-all duration-300">
          {children}
        </div>
      </div>
    </div>
  )
}