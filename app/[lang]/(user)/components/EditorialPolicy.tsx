'use client'

import React from 'react'
import { ShieldCheck, Award, Eye } from 'lucide-react'

export default function EditorialPolicy() {
  const principles = [
    {
      icon: <ShieldCheck className="w-5 h-5 text-slate-950" />,
      title: "Empirical Verification",
      desc: "Every informative manuscript undergoes strict baseline triangulation against verified institutional records and market databases."
    },
    {
      icon: <Award className="w-5 h-5 text-slate-950" />,
      title: "Expert Supervision",
      desc: "Content distribution is structurally audited by specialized reviewers and fact-checkers to isolate subjective biases."
    },
    {
      icon: <Eye className="w-5 h-5 text-slate-950" />,
      title: "Absolute Transparency",
      desc: "We maintain a clear division between educational research tracks and automated third-party programmatic ad units."
    }
  ]

  return (
    <section className="w-full pt-12 space-y-6 border-t border-slate-100 mt-12">
      <div>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
          Quality Assurance
        </span>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase">
          Editorial Standards
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {principles.map((p, i) => (
          <div key={i} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
              {p.icon}
            </div>
            <h4 className="font-black text-sm text-slate-950 uppercase tracking-tight">{p.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">{p.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}