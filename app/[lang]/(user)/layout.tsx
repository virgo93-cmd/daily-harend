import type { Metadata } from 'next'
import Navbar from './components/Navbar'
import Footer from './components/Footer' // 1. Langkah Wajib: Import komponen Footer lu

export const metadata: Metadata = {
  title: 'Daily Harend - Personal Finance Matrix',
  description: 'Advanced insights for structural wealth management',
}

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}

export default function UserLayout({ children, params }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* NAVBAR DUA MODEL */}
      <Navbar />
      
      {/* KONTEN UTAMA HALAMAN USER */}
      <div className="flex-1">
        {children}
      </div>

      {/* FOOTER MEDIA PROFESIONAL */}
      {/* 2. Langkah Wajib: Render komponen Footer di sini agar muncul di semua halaman */}
      <Footer />
    </div>
  )
}