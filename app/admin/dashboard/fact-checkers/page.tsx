'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  FileCheck, 
  PlusCircle, 
  Search, 
  Trash2, 
  Edit3, 
  X, 
  Loader2, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface FactCheckerNode {
  id: string
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
  created_at: string
}

export default function FactCheckersPage() {
  const [checkers, setCheckers] = useState<FactCheckerNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Edit Modal States
  const [editingChecker, setEditingChecker] = useState<FactCheckerNode | null>(null)
  const [editName, setEditName] = useState('')
  const [editRoleTitle, setEditRoleTitle] = useState('')
  const [editShortBio] = useState('') // Menjaga sinkronisasi textarea edit
  const [editBioState, setEditBioState] = useState('') // State mutasi lokal untuk bio
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null)

  const supabase = createClient()

  // 1. Fetch Data dari Tabel 'fact_checkers'
  const fetchFactCheckers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fact_checkers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCheckers(data || [])
    } catch (err: any) {
      console.error('Failed to sync fact checker roster:', err)
      setMessage({ type: 'error', text: err.message || 'Failed to fetch verifier pipeline.' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFactCheckers()
  }, [])

  // 2. Handler Hapus Data Fact Checker
  const handleDelete = async (id: string, avatarUrl: string | null) => {
    if (!confirm('Are you absolutely sure you want to terminate this data node?')) return
    setActionLoading(id)
    setMessage(null)

    try {
      // Hapus file fisik foto dari bucket 'fact-checkers' jika ada
      if (avatarUrl) {
        const fileName = avatarUrl.split('/').pop()
        if (fileName) {
          await supabase.storage.from('fact-checkers').remove([fileName])
        }
      }

      const { error } = await supabase.from('fact_checkers').delete().eq('id', id)
      if (error) throw error

      setCheckers(prev => prev.filter(c => c.id !== id))
      setMessage({ type: 'success', text: 'Data node terminated successfully from the expert cluster.' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failure during data truncation.' })
    } finally {
      setActionLoading(null)
    }
  }

  // 3. Handler Buka Modal Edit
  const openEditModal = (checker: FactCheckerNode) => {
    setEditingChecker(checker)
    setEditName(checker.name)
    setEditRoleTitle(checker.role_title)
    setEditBioState(checker.short_bio)
    setEditPreviewUrl(checker.avatar_url)
    setEditFile(null)
  }

  // 4. Handler Ganti File Gambar Modal Edit
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        alert('File too large. Max size is 2MB.')
        return
      }
      setEditFile(file)
      setEditPreviewUrl(URL.createObjectURL(file))
    }
  }

  // 5. Handler Update/Simpan Perubahan Modal Edit
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingChecker) return
    setActionLoading('modal-submit')
    setMessage(null)

    try {
      let finalAvatarUrl = editingChecker.avatar_url

      // Proses upload foto baru jika user mengganti file lokal
      if (editFile) {
        if (editingChecker.avatar_url) {
          const oldFileName = editingChecker.avatar_url.split('/').pop()
          if (oldFileName) {
            await supabase.storage.from('fact-checkers').remove([oldFileName])
          }
        }

        const fileExt = editFile.name.split('.').pop()
        const newFileName = `${crypto.randomUUID()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('fact-checkers')
          .upload(newFileName, editFile)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('fact-checkers')
          .getPublicUrl(newFileName)

        finalAvatarUrl = publicUrl
      }

      // Update record ke tabel 'fact_checkers'
      const { error: updateError } = await supabase
        .from('fact_checkers')
        .update({
          name: editName,
          role_title: editRoleTitle,
          short_bio: editBioState
        })
        .eq('id', editingChecker.id)

      if (updateError) throw updateError

      // Jika ada perubahan foto terpisah, sinkronisasikan kolom avatar_url
      if (editFile) {
        await supabase
          .from('fact_checkers')
          .update({ avatar_url: finalAvatarUrl })
          .eq('id', editingChecker.id)
      }

      setMessage({ type: 'success', text: 'Data credentials re-indexed successfully.' })
      setEditingChecker(null)
      fetchFactCheckers()
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to update system node credentials.' })
    } finally {
      setActionLoading(null)
    }
  }

  // Sistem Filter Pencarian Lokal
  const filteredCheckers = checkers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <main className="max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
      
      {/* Top Header Region */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-purple-500" /> Fact Checker Registry
          </h1>
          <p className="text-sm text-slate-400">Manage high-tier data verifiers allocated to advanced editorial check pipelines.</p>
        </div>
        <Link 
          href="/admin/dashboard/fact-checkers/create"
          className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-purple-600/10 w-max"
        >
          <PlusCircle className="w-4 h-4" /> Deploy Fact Checker
        </Link>
      </div>

      {/* Action Messages */}
      {message && (
        <div className={`p-4 rounded-2xl border flex items-center gap-4 ${
          message.type === 'success' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-xs font-mono font-semibold tracking-wide uppercase">{message.text}</p>
        </div>
      )}

      {/* Query Filter Section */}
      <div className="w-full bg-slate-900 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-500 ml-1" />
        <input 
          type="text" 
          placeholder="Filter credentials by name or operational title..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm text-slate-300 placeholder-slate-600 outline-none w-full"
        />
      </div>

      {/* Matrix Node Loader */}
      {loading ? (
        <div className="w-full py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Synchronizing verifier cluster...</span>
        </div>
      ) : filteredCheckers.length === 0 ? (
        <div className="w-full py-16 bg-slate-950/40 border border-slate-800/60 rounded-3xl text-center">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">No credentialed data verifiers indexed inside this pipeline.</p>
        </div>
      ) : (
        /* Grid Loop Card Render */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCheckers.map((checker) => (
            <div 
              key={checker.id}
              className="bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-3xl p-6 flex flex-col justify-between transition duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {checker.avatar_url ? (
                    <img src={checker.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-800" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600">
                      <FileCheck className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-200 truncate uppercase tracking-tight">{checker.name}</h3>
                    <p className="text-[10px] font-mono font-bold text-purple-400 uppercase truncate tracking-wider mt-0.5">{checker.role_title}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed font-medium bg-slate-950/40 border border-slate-800/40 rounded-xl p-3 min-h-[90px]">
                  {checker.short_bio}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60 mt-5">
                <button
                  onClick={() => openEditModal(checker)}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Node
                </button>
                <button
                  onClick={() => handleDelete(checker.id, checker.avatar_url)}
                  disabled={actionLoading === checker.id}
                  className="px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/20 text-red-400 rounded-xl transition disabled:opacity-40"
                >
                  {actionLoading === checker.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POP-UP MODAL EDIT (SINKRON 100%) */}
      {editingChecker && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 relative shadow-2xl animate-in zoom-in-95 duration-150">
            <button 
              onClick={() => setEditingChecker(null)}
              className="absolute top-4 right-4 p-1.5 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>

            <form onSubmit={handleUpdateSubmit} className="space-y-5">
              <div>
                <span className="text-[9px] font-mono text-purple-400 font-bold uppercase tracking-widest block mb-1">Configuration Matrix</span>
                <h3 className="text-base font-black text-white uppercase tracking-tight">Re-Index Verifier Credentials</h3>
              </div>

              {/* Avatar Uploader Inside Modal */}
              <div className="flex items-center gap-4 bg-slate-950 p-4 border border-slate-800 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {editPreviewUrl ? (
                    <img src={editPreviewUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-600" />
                  )}
                </div>
                <div className="space-y-1">
                  <label className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg cursor-pointer border border-slate-700/60 transition">
                    Change Photo
                    <input type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
                  </label>
                  <p className="text-[9px] text-slate-500">Maximum package scale 2MB.</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Verifier Identity Name</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl focus:border-purple-500/50 outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Operational Title / Authority</label>
                <input 
                  type="text" 
                  value={editRoleTitle}
                  onChange={(e) => setEditRoleTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl focus:border-purple-500/50 outline-none transition"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">Core Statement / Bio Matrix</label>
                <textarea 
                  rows={4}
                  value={editShortBio || editBioState}
                  onChange={(e) => setEditBioState(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs px-4 py-3 rounded-xl focus:border-purple-500/50 outline-none transition resize-none leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading === 'modal-submit'}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 text-white font-black text-xs uppercase tracking-widest rounded-xl transition flex items-center justify-center gap-2"
              >
                {actionLoading === 'modal-submit' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Commit Re-indexing...
                  </>
                ) : (
                  'Commit Credentials Update'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  )
}