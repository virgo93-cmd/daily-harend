'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  UserPlus, 
  Image as ImageIcon, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  PlusCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CreateFactCheckerPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Form
  const [name, setName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [shortBio, setShortBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const supabase = createClient()

  // Handler Pilih File Gambar
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'File too large. Maximum size is 2MB.' })
        return
      }
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Handler Submit ke Database & Storage Bucket 'fact-checkers'
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (!name || !roleTitle || !shortBio) {
        throw new Error('All identity nodes must be initialized.')
      }

      let uploadedAvatarUrl = null

      // PROSES 1: Upload ke Supabase Storage Bucket 'fact-checkers'
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('fact-checkers')
          .upload(filePath, avatarFile)

        if (uploadError) throw uploadError

        // Ambil URL Publik
        const { data: { publicUrl } } = supabase.storage
          .from('fact-checkers')
          .getPublicUrl(filePath)

        uploadedAvatarUrl = publicUrl
      }

      // PROSES 2: Simpan Data ke Tabel 'fact_checkers'
      const { error: insertError } = await supabase
        .from('fact_checkers')
        .insert([
          {
            name,
            role_title: roleTitle,
            short_bio: shortBio,
            avatar_url: uploadedAvatarUrl,
          },
        ])

      if (insertError) throw insertError

      // SELESAI: Feedback Sukses
      setMessage({ type: 'success', text: 'Fact Checker successfully injected into the verification panel pipeline.' })
      setName('')
      setRoleTitle('')
      setShortBio('')
      setAvatarFile(null)
      setPreviewUrl(null)

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Critical system failure during deployment.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-4xl w-full mx-auto px-6 py-10">
      
      {/* Header & Back Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <Link 
            href="/admin/dashboard/fact-checkers" 
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-purple-400 transition mb-4"
          >
            <ArrowLeft className="w-3 h-3" /> RETURN TO BOARD
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-purple-500" /> Deploy New Fact Checker
          </h1>
          <p className="text-sm text-slate-400">Establish data verifier board peers for advanced truth authentication tags.</p>
        </div>
        <div className="hidden md:block">
          <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Board Status</span>
              <span className="text-xs text-slate-300 font-mono">Verify Node Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message && (
        <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-4 animate-fadeIn ${
          message.type === 'success' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-xs font-mono font-semibold tracking-wide uppercase">{message.text}</p>
        </div>
      )}

      {/* Main Deployment Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Photo Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Verifier Avatar</label>
            
            <div className="relative group">
              <div className="w-32 h-32 rounded-full bg-slate-950 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden transition-all group-hover:border-purple-500/50">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-slate-700" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full cursor-pointer shadow-lg transition-transform active:scale-90">
                <PlusCircle className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            
            <p className="text-[10px] text-slate-500 mt-6 leading-relaxed">
              Use formal/credential portraits from <br/> Envato Elements to maximize system authority.
            </p>
          </div>
        </div>

        {/* Right Col: Identity Data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Verifier Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins, CPA"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Board Credential / Title</label>
                <input 
                  type="text" 
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Lead Financial Data Verifier"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl transition-all outline-none"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fact Checker Core Statement / Bio</label>
              <textarea 
                rows={5}
                value={shortBio}
                onChange={(e) => setShortBio(e.target.value)}
                placeholder="State the fact checker's data auditing authority, verifying their status to check database mathematical accuracy..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl transition-all outline-none resize-none leading-relaxed"
                required
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-purple-600/10 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Committing Verifier Node...
                  </>
                ) : (
                  'Deploy Fact Checker Node'
                )}
              </button>
            </div>

          </div>
        </div>

      </form>
    </main>
  )
}