'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import HeroSlider from '@/app/[lang]/(user)/components/HeroSlider'
import LatestInsights from '@/app/[lang]/(user)/components/LatestInsights'
import SectorHubs from '@/app/[lang]/(user)/components/SectorHubs'
import EditorialBoard from '@/app/[lang]/(user)/components/EditorialBoard' // BOARD REDAKSI (E-E-A-T)
import EditorialPolicy from '@/app/[lang]/(user)/components/EditorialPolicy' // STANDAR KUALITAS KONTEN
import FaqSection from '@/app/[lang]/(user)/components/FaqSection' // RESOURCE FAQ PALING BAWAH

export default function HomePage() {
  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-28 pb-12">
      {/* SECTION 1: HERO SLIDER (MAX 10) */}
      <HeroSlider />
      
      {/* SECTION 2: LATEST INSIGHTS (MAX 6 DENGAN PAGINATION) */}
      <LatestInsights />

      {/* SECTION 3: SECTOR HUBS KATEGORI & ACCORDION SUB MENU */}
      <SectorHubs />

      {/* SECTION 4: EDITORIAL BOARD */}
      <EditorialBoard />

      {/* SECTION 5: EDITORIAL POLICY (DI BAWAH EDITORIAL BOARD) */}
      <EditorialPolicy />

      {/* SECTION 6: RESOURCE FAQ (POSISI PALING BAWAH SEBELUM FOOTER) */}
      <FaqSection />
    </main>
  )
}