import React from 'react';

type Props = {
  params: {
    lang: string;
  };
};

export default function AboutUsPage({ params }: Props) {
  const tocItems = [
    { id: 'editorial-mission', title: 'Our Editorial Mission' },
    { id: 'content-pillars', title: '1. Core Content Pillars' },
    { id: 'eeat-compliance', title: '2. E-E-A-T Compliance & Integrity' },
    { id: 'monetization-transparency', title: '3. Monetization Transparency' },
    { id: 'corporate-footprint', title: '4. Corporate Footprint' },
  ];

  return (
    // Jarak pt-28 memastikan halaman tidak mepet atau terpotong oleh navbar
    <main className="min-h-screen bg-[#faf8f5] text-slate-800 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Container Utama dengan Grid System */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* KOLOM KIRI: Table of Contents (Sticky top-28) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-28 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Table of Contents
            </h2>
            <nav className="space-y-1">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-slate-500 hover:text-indigo-600 hover:translate-x-1 transition-all duration-200 py-1.5"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* KOLOM KANAN: Konten Utama Profil Media */}
        <article className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-10">
          
          {/* Header Profil */}
          <header className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-2">
              About Daily Harend
            </h1>
            <p className="text-sm text-slate-500 italic">
              Empowering global readers with structural intelligence and technical analysis.
            </p>
          </header>

          {/* Konten Utama - scroll-mt-28 agar posisi lompatan pas di bawah navbar */}
          <div className="space-y-10 text-base leading-relaxed text-slate-600">
            
            {/* Bagian Pengantar / Misi */}
            <section id="editorial-mission" className="scroll-mt-28">
              <p>
                Welcome to <strong className="text-slate-900">Daily Harend</strong>, a premier independent digital publication network dedicated to distributing high-level informational articles, systemic market reports, technical research overviews, and structured educational guidelines. Founded with the vision to bridge the gap between complex technological evolution and reader comprehensive analysis, our platform serves as a meticulous repository of knowledge for a global audience.
              </p>
              <p className="mt-4">
                We believe that structured public access to uncompromised digital research is the baseline cornerstone of corporate and technical advancement. In strict compliance with open-web standards, Daily Harend delivers unfiltered, comprehensive literary items without restricting reader traffic behind payroll walls, login authentications, or dynamic access credentials.
              </p>
            </section>

            {/* Section 1 */}
            <section id="content-pillars" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-indigo-500 pl-3">
                1. Core Content Pillars
              </h2>
              <p>
                To provide meaningful data distribution structures to our expanding audience, the editorial layout at Daily Harend revolves around major knowledge sectors:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 pl-2">
                <li>
                  <strong className="text-slate-800">Technical Intelligence:</strong> In-depth articles breaking down modern software architecture, engineering breakthroughs, and systemic network automation standards.
                </li>
                <li>
                  <strong className="text-slate-800">Macro Market Overviews:</strong> Verifiable, data-backed reports tracking regional and international digital economy distributions.
                </li>
                <li>
                  <strong className="text-slate-800">Structured Academic Guides:</strong> Step-by-step thematic walkthroughs designed to cultivate empirical skills in computing and technological execution.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="eeat-compliance" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-indigo-500 pl-3">
                2. E-E-A-T Compliance & Editorial Integrity
              </h2>
              <p>
                In perfect alignment with international journalism frameworks and Google&apos;s stringent E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) guidelines, Daily Harend enforces a highly secure content validation policy. Every publication, data table, and analytical matrix item listed within our subfolders undergoes a comprehensive technical review process.
              </p>
              <p className="mt-3">
                Our informational items are curated by experienced industry professionals and technical architects who apply empirical rigor to eliminate low-value outputs. We strictly verify historical parameters, structural sources, and cross-border regulatory information to provide a highly authoritative reporting catalog for our readers.
              </p>
            </section>

            {/* Section 3 */}
            <section id="monetization-transparency" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-indigo-500 pl-3">
                3. Monetization & Operational Transparency
              </h2>
              <p>
                To maintain our open-access informational infrastructure without charging membership fees, Daily Harend collaborates with third-party programmatic advertisement networks, specifically utilizing Google AdSense pipelines. This automated monetization process displays targeted and contextual marketing assets on various sections of our domain properties.
              </p>
              <p className="mt-3">
                We maintain absolute editorial independence; no external commercial partner or sponsored programmatic network has any authority to modify or influence our independent journalistic analyses, analytical matrix records, or technical data layouts.
              </p>
            </section>

            {/* Section 4 */}
            <section id="corporate-footprint" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-indigo-500 pl-3">
                4. Corporate Footprint & Infrastructure Locations
              </h2>
              <p>
                Daily Harend operates under highly formal data transparency protocols. Our central physical administration network and strategic editing desks are permanently established at our main office hub:
              </p>
              <div className="mt-4 bg-slate-50 border border-slate-100 p-5 rounded-lg text-sm text-slate-700 space-y-2">
                <p>
                  <strong className="text-slate-900">Headquarters Address:</strong> 46 Cikalang Girang Street, Kahuripan, Tawang District, Tasikmalaya Regency, West Java 46115 - Indonesia
                </p>
                <p>
                  <strong className="text-slate-900">Administrative Email:</strong> admin@dailyharend.com
                </p>
              </div>
              <p className="mt-4">
                For corporate inquiries, editorial feedback, or data alignment matters, our operations team is reachable directly through our verified digital communication routes during standard operating intervals.
              </p>
            </section>

          </div>
        </article>
      </div>
    </main>
  );
}