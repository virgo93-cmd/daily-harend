import React from 'react';

type Props = {
  params: {
    lang: string;
  };
};

export default function PrivacyPolicyPage({ params }: Props) {
  const currentYear = new Date().getFullYear();

  const tocItems = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'data-collection', title: '1. Information Collection & Use' },
    { id: 'technical-logging', title: '2. Technical Telemetry & Logging' },
    { id: 'google-adsense', title: '3. Google AdSense & Cookies' },
    { id: 'web-analytics', title: '4. Web Analytics Aggregation' },
    { id: 'content-disclaimer', title: '5. Informational Content Disclaimer' },
    { id: 'policy-amendments', title: '6. Privacy Policy Amendments' },
    { id: 'administrative-contact', title: '7. Administrative Communications' },
  ];

  return (
    // Ditambahkan pt-28 agar seluruh konten turun dan tidak bertabrakan dengan fixed/sticky navbar lu
    <main className="min-h-screen bg-[#faf8f5] text-slate-800 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Container Utama dengan Grid System */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* KOLOM KIRI: Komponen Table of Contents */}
        <aside className="lg:col-span-1">
          {/* top-28 memastikan saat di-scroll, box TOC ini berhenti dengan jarak yang aman dari navbar */}
          <div className="sticky top-28 bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Table of Contents
            </h2>
            <nav className="space-y-1">
              {tocItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="block text-sm text-slate-500 hover:text-blue-600 hover:translate-x-1 transition-all duration-200 py-1.5"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* KOLOM KANAN: Konten Utama Dokumen Privacy Policy */}
        <article className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-10">
          
          {/* Header Dokumen */}
          <header className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-slate-500">
              Last Updated: June 21, {currentYear}
            </p>
          </header>

          {/* Konten Utama Dokumen dengan Target ID Anchor */}
          {/* scroll-mt-28 diset agar saat meluncur ke target anchor, teks judulnya tidak tertutup navbar */}
          <div className="space-y-10 text-base leading-relaxed text-slate-600">
            
            {/* Bagian Pengantar */}
            <section id="introduction" className="scroll-mt-28">
              <p>
                Welcome to our digital publication platform. This platform operates strictly as an open-access informational resource dedicated to publishing comprehensive articles, technical analyses, market overviews, and structured educational guides. We are fundamentally committed to protecting the privacy of our readership. This Privacy Policy outlines the explicit, transparent protocols regarding data logging, third-party analytics tracking, and automated digital advertising frameworks deployed across our web properties.
              </p>
              <p className="mt-4">
                Because our website functions exclusively as an unrestricted digital information network, <strong>we do not enforce any user registration procedures, we do not issue or maintain user database accounts, and we do not implement any backend user login integrations</strong>. Your access to our published materials is entirely open, anonymous, and unmonitored at the user account level.
              </p>
            </section>

            {/* Section 1 */}
            <section id="data-collection" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-500 pl-3">
                1. Information Collection and Use
              </h2>
              <p>
                Given the absent infrastructure for user authentication, registration forms, or member profiles, this platform does not collect, harvest, or store any Personally Identifiable Information (PII) such as your legal name, electronic mail address, physical location, telephone coordinates, or individual identity metrics. 
              </p>
              <p className="mt-3">
                Our backend database architecture is decoupled from reader identity tracking. Reading our published research, thematic overviews, and analytical reports requires no disclosure of private credentials, ensuring a completely sanitized, non-invasive reading environment.
              </p>
            </section>

            {/* Section 2 */}
            <section id="technical-logging" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-500 pl-3">
                2. Technical Telemetry and Automated Server Logging
              </h2>
              <p>
                To maintain basic system operations, server stability, and cyber-security integrity, our system infrastructure automatically logs standardized technical telemetry transmitted directly by your internet browser interface. 
              </p>
              <p className="mt-3">
                This automated data logging encompasses parameters including your dynamic Internet Protocol (IP) address, browser software type, software configuration versions, referring/exit page sequences, geographical network distribution points, accurate time-and-date timestamps of page hits, and internal network performance diagnostic logs. This computational data is processed globally and anonymously solely for structural optimizations and threat mitigation.
              </p>
            </section>

            {/* Section 3 */}
            <section id="google-adsense" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-500 pl-3">
                3. Google AdSense and Third-Party Advertising Frameworks
              </h2>
              <p>
                This website integrates third-party programmatic monetization pipelines, specifically partnering with Google AdSense to serve automated contextual and behavioral ad units. Google, acting as our principal third-party vendor, implements tracking cookies to evaluate your specific internet usage patterns in order to display relevant ad units on this platform.
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 pl-2">
                <li>
                  <strong className="text-slate-800">The DoubleClick DART Cookie:</strong> Google&apos;s systematic deployment of dedicated tracking cookies enables its automated advertising core to match relevant promotional content to our active readers based on historical trajectories across this platform and various other properties on the broader web.
                </li>
                <li>
                  <strong className="text-slate-800">Personalization Controls:</strong> Visitors retain absolute autonomy over their tracking exposure and can explicitly disable behavioral ad targeting parameters by navigating to the official Google Advertising Settings framework (<a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.google.com/settings/ads</a>).
                </li>
                <li>
                  <strong className="text-slate-800">GDPR Compliance and TCF Frameworks:</strong> In strict alignment with modern international data privacy doctrines, visitors originating from within the European Economic Area (EEA) and specialized global jurisdictions are presented with an IAB Europe-certified Consent Management Platform (CMP). This interface explicitly captures and logs granular consent choices prior to the deployment of any behavioral ad tracking mechanisms or third-party cookies.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="web-analytics" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-500 pl-3">
                4. Third-Party Web Analytics and Audience Aggregation
              </h2>
              <p>
                To assess the structural relevance and readership metrics of our informational items, we utilize standardized third-party digital auditing tools, primarily including Google Analytics. These statistical engines employ basic cookies to harvest macro-level tracking information regarding organic user journeys, aggregate duration on specific articles, click-through frequencies, and reader retention indices. 
              </p>
              <p className="mt-3">
                The reporting data delivered by these analytics suites is fully consolidated and stripped of individual identifiers, serving exclusively as empirical insight to help guide future informational editorial planning.
              </p>
            </section>

            {/* Section 5 */}
            <section id="content-disclaimer" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-500 pl-3">
                5. Core Informational Content Disclaimer
              </h2>
              <p>
                The entirety of the analytical compositions, conceptual breakdowns, data matrices, and editorial interpretations published throughout this platform are produced strictly for high-level informational, educational, and journalistic distribution. This website does not render certified financial consultations, legal counsel, or statutory professional advice. 
              </p>
              <p className="mt-3">
                All published materials are prepared without regard to individual reader objectives. Consequently, any interpretations, adjustments, or operational executions carried out by readers based on information found within our articles are conducted entirely at their own empirical risk.
              </p>
            </section>

            {/* Section 6 */}
            <section id="policy-amendments" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-500 pl-3">
                6. Periodic Privacy Policy Amendments
              </h2>
              <p>
                We maintain absolute corporate discretion to alter, reconfigure, or update this privacy framework at any historical juncture without prior direct consultation. Structural updates are made visible instantly by modifying the chronological &quot;Last Updated&quot; metric posted at the prominent header of this documentation. We highly encourage our audience base to check back periodically to maintain a clear understanding of our strict data transparency and compliance standards.
              </p>
            </section>

            {/* Section 7 */}
            <section id="administrative-contact" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-blue-500 pl-3">
                7. Administrative Communications
              </h2>
              <p>
                For formal processing inquiries regarding the legal formatting of this operational framework, technical infrastructure policies, or clarity on third-party ad compliance parameters, you are advised to connect with our operations desk using our designated public communication routes.
              </p>
            </section>

          </div>
        </article>
      </div>
    </main>
  );
}