'use client'

import React, { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface FaqItem {
  id: string
  question: string
  answer: string
}

export default function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null)

  const faqItems: FaqItem[] = [
    {
      id: 'objective',
      question: 'What is the core editorial objective of Daily Harend?',
      answer: 'Daily Harend operates as a premier independent digital publication network dedicated to distributing high-level informational articles, systemic market reports, and structured educational guidelines across multiple specialized sectors.'
    },
    {
      id: 'advice',
      question: 'Are the publications considered professional financial or legal advice?',
      answer: 'No. All written compositions, archives, and statistical overviews are generated exclusively for broad-scope educational and generalized informational paradigms. This platform does not operate as a licensed advisory body, and content should never substitute for professional consultations.'
    },
    {
      id: 'accuracy',
      question: 'How does the platform ensure information integrity and accuracy?',
      answer: 'Our editorial staff dedicates extensive research parameters to verifying the baseline integrity and factual accuracy of our text logs. However, because the digital and regulatory landscapes evolve rapidly, we assume zero static liability for out-of-date metrics or typographical anomalies.'
    },
    {
      id: 'ads',
      question: 'Why does Daily Harend include programmatic advertisements?',
      answer: 'To sustain our public-access model and digital server infrastructure, we integrate automated programmatic advertising pipelines (primarily Google AdSense). We maintain no analytical oversight or data control over the terms or safety of these third-party external networks.'
    },
    {
      id: 'responsibility',
      question: 'What is the scope of readership responsibility?',
      answer: 'By maintaining an active reading session, you explicitly agree that any subsequent strategic decisions, transformations, or practical execution failures you perform are conducted entirely at your own independent empirical risk.'
    }
  ]

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <section className="w-full pt-12 space-y-6 border-t border-slate-100 mt-12">
      {/* Header FAQ */}
      <div>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
          Information Hub
        </span>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-slate-950 shrink-0" />
          Frequently Asked Questions
        </h3>
      </div>

      {/* Accordion List Container */}
      <div className="max-w-4xl space-y-3">
        {faqItems.map((item) => {
          const isOpen = openId === item.id

          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:border-slate-300 shadow-xs"
            >
              {/* Trigger Button */}
              <button
                onClick={() => toggleFaq(item.id)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left outline-none select-none group"
              >
                <span className="font-bold text-sm sm:text-base text-slate-950 uppercase tracking-tight group-hover:text-rose-600 transition-colors duration-200">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>

              {/* Content Panel */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isOpen ? 'max-h-[500px] border-t border-slate-100 bg-[#faf8f5]/40' : 'max-h-0'
                }`}
              >
                <div className="p-5 text-sm leading-relaxed text-slate-600 font-medium">
                  {item.answer}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}