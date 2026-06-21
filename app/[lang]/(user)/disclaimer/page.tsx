import React from 'react';

type Props = {
  params: {
    lang: string;
  };
};

export default function DisclaimerPage({ params }: Props) {
  const currentYear = new Date().getFullYear();

  // Data Array untuk Table of Contents (TOC)
  const tocItems = [
    { id: 'general-disclaimer', title: 'General Information Disclaimer' },
    { id: 'no-professional', title: '1. No Professional Advice' },
    { id: 'accuracy-data', title: '2. Accuracy & Material Integrity' },
    { id: 'external-links', title: '3. Third-Party Links & Ads' },
    { id: 'user-onus', title: '4. Readership Responsibility' },
    { id: 'legal-as-is', title: '5. "As-Is" Legal Provision' },
  ];

  return (
    // Jarak pt-28 agar seimbang dan tidak bertabrakan dengan navbar lu
    <main className="min-h-screen bg-[#faf8f5] text-slate-800 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Container Utama dengan Grid Layout */}
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
                  className="block text-sm text-slate-500 hover:text-rose-600 hover:translate-x-1 transition-all duration-200 py-1.5"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* KOLOM KANAN: Konten Utama Disclaimer */}
        <article className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-10">
          
          {/* Header Dokumen */}
          <header className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-2">
              Disclaimer
            </h1>
            <p className="text-sm text-slate-500">
              Last Updated: June 21, {currentYear}
            </p>
          </header>

          {/* Konten Utama Dokumen - scroll-mt-28 agar penargetan anchor mulus di bawah navbar */}
          <div className="space-y-10 text-base leading-relaxed text-slate-600">
            
            {/* Bagian Pengantar */}
            <section id="general-disclaimer" className="scroll-mt-28">
              <p>
                The comprehensive compositions, analyses, research archives, and editorial summaries hosted across this digital publication platform are generated exclusively for broad-scope educational, historical, and generalized informational paradigms. The operational management, independent authors, and infrastructure developers of this website assume zero static liability or legal accountability for structural errors, contextual omissions, or real-world execution failures found within our distributed literature layers.
              </p>
            </section>

            {/* Section 1 */}
            <section id="no-professional" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-rose-500 pl-3">
                1. Absolute Absence of Certified Professional Advice
              </h2>
              <p>
                The informational articles, statistical overviews, historical evaluations, and strategic commentary published throughout this domain are not structured to serve as professional legal, transactional, medical, financial, or certified tax consultations. <strong>This platform does not operate as a licensed advisory body, nor do we employ registered financial consultants to provide targeted allocation mapping</strong>.
              </p>
              <p className="mt-3">
                All written materials are formatted without direct insight into any reader&apos;s personal logistical environment, sovereign budget limitations, or individual technical capabilities. Consequently, the information provided here cannot substitute for formal, custom-tailored consultations with certified professionals who are legally qualified to audit your real-world strategies.
              </p>
            </section>

            {/* Section 2 */}
            <section id="accuracy-data" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-rose-500 pl-3">
                2. Information Integrity and Accuracy Parameters
              </h2>
              <p>
                While our editorial staff dedicates extensive research parameters to verifying the baseline integrity, regulatory compliance, and factual accuracy of published historical text logs, we make no absolute assertions, explicit contracts, or legal promises regarding the comprehensive completeness, modern-day relevance, or technological precision of the data layouts inside our archives. 
              </p>
              <p className="mt-3">
                The digital landscape evolves at a swift empirical pace, meaning that structural insights, market laws, or code parameters detailed in older informational essays may become obsolete or inaccurate over time without our immediate knowledge.
              </p>
            </section>

            {/* Section 3 */}
            <section id="external-links" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-rose-500 pl-3">
                3. Programmatic Advertisements and External Hyperlinks
              </h2>
              <p>
                To sustain our public-access model, our server backend integrates automated programmatic advertising banners, primarily powered by Google AdSense pipelines. These promotional blocks, along with occasional contextual hyperlinks embedded within our analytical articles, automatically direct readers to external internet domains owned and operated by separate third-party entities.
              </p>
              <p className="mt-3">
                We maintain no analytical oversight, data control, or legal audit rights over the material statements, security scripts, operational terms, or transactional safety of those outside networks. Navigating beyond our domain boundaries through any sponsored ad unit or hyperlink is executed under your sole discretion and personal tracking accountability.
              </p>
            </section>

            {/* Section 4 */}
            <section id="user-onus" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-rose-500 pl-3">
                4. Sole Readership Onus and Empirical Risk
              </h2>
              <p>
                By maintaining an active reading session across our technical publications, you explicitly acknowledge and agree that any subsequent decisions, conceptual transformations, or operational actions you perform are executed entirely at your own independent empirical risk. 
              </p>
              <p className="mt-3">
                Under no legal theory, regulatory challenge, or tort claim shall the administrative owners, developers, or content writers of this domain be held liable to you or any secondary party for any direct loss, corporate deficit, system volatility, data corruption, or business interruption arising out of the use, interpretation, or deployment of information found on this platform.
              </p>
            </section>

            {/* Section 5 */}
            <section id="legal-as-is" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-rose-500 pl-3">
                5. Statutory &quot;As-Is&quot; Legal Provision
              </h2>
              <p>
                The entire digital repository of this platform is delivered to the global reading public on an strictly &quot;as-is&quot; and &quot;as-available&quot; standard. We explicitly disclaim all representations and warranties of any kind, whether express, implied, or statutory, regarding our textual presentation layers. 
              </p>
              <p className="mt-3">
                We do not guarantee that our article distribution systems will remain uninterrupted, fully secure against automated scraping networks, or completely free of technical typographic anomalies.
              </p>
            </section>

          </div>
        </article>
      </div>
    </main>
  );
}