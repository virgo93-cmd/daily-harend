import React from 'react';

type Props = {
  params: {
    lang: string;
  };
};

export default function ContactUsPage({ params }: Props) {
  // Data Array untuk Table of Contents (TOC)
  const tocItems = [
    { id: 'communication-channels', title: 'Official Communications' },
    { id: 'corporate-office', title: '1. Corporate Headquarters' },
    { id: 'editorial-desk', title: '2. Editorial & Business Inquiries' },
    { id: 'operating-hours', title: '3. Media Operating Hours' },
    { id: 'response-protocol', title: '4. Readership Response Protocol' },
  ];

  return (
    // Jarak pt-28 memastikan halaman tidak mepet atau terpotong oleh navbar lu
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
                  className="block text-sm text-slate-500 hover:text-emerald-600 hover:translate-x-1 transition-all duration-200 py-1.5"
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* KOLOM KANAN: Konten Utama Hubungi Kami */}
        <article className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-100 p-6 sm:p-10">
          
          {/* Header Profil */}
          <header className="border-b border-slate-100 pb-6 mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl mb-2">
              Contact Us
            </h1>
            <p className="text-sm text-slate-500 italic">
              Get in touch with the Daily Harend editorial and administrative desk.
            </p>
          </header>

          {/* Konten Utama - scroll-mt-28 agar posisi lompatan pas di bawah navbar */}
          <div className="space-y-10 text-base leading-relaxed text-slate-600">
            
            {/* Bagian Pengantar */}
            <section id="communication-channels" className="scroll-mt-28">
              <p>
                At <strong className="text-slate-900">Daily Harend</strong>, we place a high corporate premium on establishing transparent, verifiable communication channels between our editorial network and global audience. Whether you are looking to report dynamic news updates, address structural content alignments, resolve privacy questions, or discuss programmatic advertising collaborations, our communication infrastructure is fully prepared to assist you.
              </p>
            </section>

            {/* Section 1 */}
            <section id="corporate-office" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-500 pl-3">
                1. Corporate Headquarters
              </h2>
              <p>
                For official physical mailings, legal notices, or administrative compliance deliveries, you can reach out directly to our centrally managed publishing house located at our corporate footprint:
              </p>
              <div className="mt-4 bg-slate-50 border border-slate-100 p-5 rounded-lg text-sm text-slate-700">
                <p className="font-semibold text-slate-900 mb-1">Daily Harend Office Desk</p>
                <p>46 Cikalang Girang Street, Kahuripan,</p>
                <p>Tawang District, Tasikmalaya Regency,</p>
                <p>West Java 46115 - Indonesia</p>
              </div>
            </section>

            {/* Section 2 */}
            <section id="editorial-desk" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-500 pl-3">
                2. Editorial and Business Inquiries
              </h2>
              <p>
                To avoid operational congestion and ensure your technical messages are processed by the correct operational department, we handle all incoming electronic communications through our verified digital route:
              </p>
              <div className="mt-4 bg-slate-50 border border-slate-100 p-5 rounded-lg text-sm text-slate-700">
                <p>
                  <strong className="text-slate-900">Primary Administrative Email:</strong>{' '}
                  <a href="mailto:admin@dailyharend.com" className="text-emerald-600 hover:underline font-medium">
                    admin@dailyharend.com
                  </a>
                </p>
              </div>
              <p className="mt-3">
                Please state the specific nature of your inquiry in the message subject line (e.g., &quot;Editorial Correction Request&quot;, &quot;AdSense Partner Compliance Inquiry&quot;, or &quot;General Data Alignment Feedback&quot;) to facilitate swift computational sorting.
              </p>
            </section>

            {/* Section 3 */}
            <section id="operating-hours" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-500 pl-3">
                3. Media Operating Hours
              </h2>
              <p>
                Our structural review infrastructure and digital communication desks process audience messages during fixed intervals throughout the working week:
              </p>
              <ul className="list-disc list-inside mt-3 space-y-2 pl-2">
                <li><strong className="text-slate-800">Monday through Friday:</strong> 09:00 AM to 05:00 PM (Western Indonesian Time / GMT+7)</li>
                <li><strong className="text-slate-800">Saturday and Sunday:</strong> Closed (Automated logging systems active)</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="response-protocol" className="scroll-mt-28">
              <h2 className="text-xl font-bold text-slate-900 mb-3 border-l-4 border-emerald-500 pl-3">
                4. Readership Response Protocol
              </h2>
              <p>
                Due to the high volume of daily traffic data and systemic analytics requests processed across our digital publication framework, our team operates under a strict communication response policy. While we make every structural effort to audit every communication, valid inquiries generally receive a personalized response within 24 to 48 business hours.
              </p>
              <p className="mt-3">
                Automated promotional submissions, bulk marketing pitches, or messages that engage in inappropriate network behavior will be flagged by our security systems and permanently filtered from our mail servers.
              </p>
            </section>

          </div>
        </article>
      </div>
    </main>
  );
}