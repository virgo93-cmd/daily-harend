import React from 'react';

type Props = {
  params: {
    lang: string;
  };
};

export default function TermsOfServicePage({ params }: Props) {
  const currentYear = new Date().getFullYear();

  // Data Array untuk pemetaan Table of Contents (TOC)
  const tocItems = [
    { id: 'acceptance', title: 'Acceptance of Terms' },
    { id: 'informational-purpose', title: '1. Informational Purpose Only' },
    { id: 'intellectual-property', title: '2. Intellectual Property Rights' },
    { id: 'user-conduct', title: '3. Acceptable User Conduct' },
    { id: 'limitation-liability', title: '4. Limitation of Liability' },
    { id: 'third-party-links', title: '5. Third-Party Ads & Services' },
    { id: 'modifications', title: '6. Modifications to Terms' },
    { id: 'governing-law', title: '7. Governing Law & Jurisdiction' },
  ];

  return (
    // Jarak pt-28 agar aman dan tidak mepet atau tertutup navbar lu
    <main className="min-h-screen bg-[#faf8f5] text-slate-800 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Container Utama Grid Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* KOLOM KIRI: Table of Contents (Sticky top-28 agar seimbang dengan navbar) */}
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
                  className="block text-sm text-slate-500 hover:text-amber-600 hover:translate-x-1 transition-all duration-200 py-1.5"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* KOLOM KANAN: Konten Utama Terms of Service */}
        <article className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-10">
          
          {/* Header Dokumen */}
          <header className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-2">
              Terms of Service
            </h1>
            <p className="text-sm text-slate-500">
              Effective Date: June 21, {currentYear}
            </p>
          </header>

          {/* Konten Utama Dokumen - scroll-mt-28 agar lompatan anchor pas di bawah navbar */}
          <div className="space-y-10 text-base leading-relaxed text-slate-600">
            
            {/* Bagian Pengantar */}
            <section id="acceptance" className="scroll-mt-28">
              <p>
                By accessing, browsing, or interacting with this digital publication platform, you explicitly acknowledge that you have read, understood, and agreed to be bound by the statutory terms and provisions detailed in this agreement. These binding terms apply systematically to all visitors, aggregate readers, and entities who access our published insights, literary assets, and structured information models.
              </p>
              <p className="mt-4">
                If you do not accept these comprehensive terms, you are requested to discontinue your reading session immediately. This platform operates as an open digital database, meaning access to our published materials is provided without requirements for membership profiles or credential authentication.
              </p>
            </section>

            {/* Section 1 */}
            <section id="informational-purpose" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-amber-500 pl-3">
                1. Purely Informational and Educational Purpose
              </h2>
              <p>
                The primary architecture of this website is built to deliver open-access informational materials, technical overviews, operational breakdowns, and journalistic documentation. <strong>This platform does not build, embed, or maintain software calculations, database tool matrices, or automated interactive digital utility calculators</strong>.
              </p>
              <p className="mt-3">
                All texts, outlines, data presentation matrices, and editorial explanations are tailored exclusively for conceptual representation and research reference. No element of this digital library should be treated as dynamic technical processing, certified data execution, or automated consultation data.
              </p>
            </section>

            {/* Section 2 */}
            <section id="intellectual-property" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-amber-500 pl-3">
                2. Intellectual Property Rights and Distribution
              </h2>
              <p>
                The holistic collection of original content, syntax styles, editorial outlines, data matrices, graphic assets, and structural presentation logic published on this web domain are the exclusive copyright and property of this platform and its operational creators. 
              </p>
              <p className="mt-3">
                Our analytical items and informational arrangements are protected globally by strict digital copyright, international trademark provisions, and trade dress regulations. Readers are prohibited from reproducing, distributing, modifying, caching, scraping, or mirroring any portion of our informational properties without obtaining an express, signed authorization document from our administrative desk.
              </p>
            </section>

            {/* Section 3 */}
            <section id="user-conduct" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-amber-500 pl-3">
                3. Acceptable User Conduct and Network Security
              </h2>
              <p>
                As a strict condition of your session access, you agree to utilize our informational resource only for legitimate, non-commercial research parameters. You are prohibited from executing automated data scraping scripts, denial-of-service (DoS) network attacks, code injections, or deploying deep-learning training aggregators against our content layout. 
              </p>
              <p className="mt-3">
                Any deliberate attempt to destabilize the system environment, bypass data security filters, or leverage third-party programmatic networks embedded on this domain will result in a permanent infrastructure access block and immediate escalation to relevant cyber-security authorities.
              </p>
            </section>

            {/* Section 4 */}
            <section id="limitation-liability" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-amber-500 pl-3">
                4. Comprehensive Limitation of Liability
              </h2>
              <p>
                Under no historical, statutory, or equitable legal framework shall the management, developers, content creators, or corporate partners of this platform be held liable for any direct, indirect, incidental, special, exemplary, or consequential damages whatsoever. This protective shield extends to damages regarding fiscal deficit, business interruption, data loss, misinterpretation of written materials, or network disruptions arising directly from your reliance on our published text items. 
              </p>
              <p className="mt-3 font-semibold text-slate-800">
                Our material is compiled with no assumptions regarding the specific reader&apos;s real-world operational variables. Any adjustment or systemic execution you choose to carry out based on our reports is undertaken entirely at your own independent empirical risk.
              </p>
            </section>

            {/* Section 5 */}
            <section id="third-party-links" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-amber-500 pl-3">
                5. Third-Party Ad Networks and External Services
              </h2>
              <p>
                To support open-access digital publishing, our infrastructure utilizes third-party ad networks, primarily integrating programmatic Google AdSense spaces. These automated advertising components links readers to outside marketing properties and target destinations not managed or monitored by us. 
              </p>
              <p className="mt-3">
                We assume zero operational responsibility for the privacy practices, transaction parameters, or compliance codes of external third-party landing pages. Interacting with any sponsored banner advertisement is conducted under your sole accountability.
              </p>
            </section>

            {/* Section 6 */}
            <section id="modifications" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-amber-500 pl-3">
                6. Modifications to Service and Terms
              </h2>
              <p>
                We reserve the absolute right to re-engineer, terminate, expand, or adjust any published article section or baseline documentation parameters at any historical time without prior warning or advisory distributions to our audience. 
              </p>
              <p className="mt-3">
                Your continued technical connection to this platform following the structural integration of updated Terms of Service parameters indicates your automated compliance with the updated documentation rules.
              </p>
            </section>

            {/* Section 7 */}
            <section id="governing-law" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-amber-500 pl-3">
                7. Governing Law and Legal Jurisdiction
              </h2>
              <p>
                These systemic Terms of Service documentation profiles shall be managed, interpreted, and governed under the applicable regulatory frameworks governing digital media services and intellectual property laws. 
              </p>
              <p className="mt-3">
                Any legal discrepancy, procedural conflict, or regulatory challenge originating from your technical reading session on this web resource must be submitted exclusively before a court of proper jurisdiction competent in matters of digital media publication compliance.
              </p>
            </section>

          </div>
        </article>
      </div>
    </main>
  );
}