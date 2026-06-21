'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Globe, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

export default function SiteConfigPage() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Form fields
  const [siteName, setSiteName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [officeAddress, setOfficeAddress] = useState('')

  const supabase = createClient()

  // Ambil data dari jangkar ID: 1 saat halaman di-load
  useEffect(() => {
    const fetchConfig = async () => {
      setFetching(true)
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .eq('id', 1)
        .single()

      if (!error && data) {
        setSiteName(data.site_name || '')
        setContactEmail(data.contact_email || '')
        setFacebookUrl(data.facebook_url || '')
        setOfficeAddress(data.office_address || '')
      }
      setFetching(false)
    }

    fetchConfig()
  }, [])

  // Handler simpan perubahan data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const { error } = await supabase
      .from('site_config')
      .upsert({
        id: 1,
        site_name: siteName,
        contact_email: contactEmail,
        facebook_url: facebookUrl,
        office_address: officeAddress,
        updated_at: new Date().toISOString()
      })

    if (error) {
      setMessage({ type: 'error', text: `Failed to update configuration: ${error.message}` })
    } else {
      setMessage({ type: 'success', text: 'Site configuration updated successfully!' })
    }
    setLoading(false)
  }

  if (fetching) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-400 flex flex-col items-center justify-center gap-3 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        LOADING SYSTEM CONFIGURATION NODE...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
        
        {/* Header Title */}
        <div className="flex items-center gap-4 border-b border-slate-800/60 pb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block">Web Properties</span>
            <h1 className="text-xl font-black tracking-tight text-white">Site Configuration</h1>
          </div>
        </div>

        {/* Feedback Alert Board */}
        {message && (
          <div className={`p-4 rounded-xl border flex items-start gap-3 animate-slideDown ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <div className="text-xs font-medium leading-relaxed">
              <span className="font-bold uppercase font-mono block mb-0.5">{message.type === 'success' ? 'SUCCESS' : 'ERROR'}</span>
              {message.text}
            </div>
          </div>
        )}

        {/* Configuration Core Form */}
        <form onSubmit={handleSubmit} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/20">
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Site Name</label>
            <input 
              type="text" 
              value={siteName} 
              onChange={(e) => setSiteName(e.target.value)} 
              placeholder="e.g. Daily Harend" 
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none transition" 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Contact Email</label>
            <input 
              type="email" 
              value={contactEmail} 
              onChange={(e) => setContactEmail(e.target.value)} 
              placeholder="e.g. admin@daily-harend.com" 
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none transition" 
              required 
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Facebook URL</label>
            <input 
              type="url" 
              value={facebookUrl} 
              onChange={(e) => setFacebookUrl(e.target.value)} 
              placeholder="e.g. https://facebook.com/yourpage" 
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none transition" 
              required 
            />
          </div>

          {/* INPUT BARU: ALAMAT KANTOR */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Office Address</label>
            <textarea 
              rows={3}
              value={officeAddress} 
              onChange={(e) => setOfficeAddress(e.target.value)} 
              placeholder="e.g. 123 Financial District, Suite 500, New York, NY" 
              className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-4 py-3 rounded-xl outline-none resize-none leading-relaxed transition" 
              required 
            />
          </div>

          {/* Action Submit */}
          <div className="pt-4 border-t border-slate-800/60">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-xl transition shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> COMMITTING CONFIGURATION CHANGES...
                </>
              ) : (
                'SAVE CONFIGURATION'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}