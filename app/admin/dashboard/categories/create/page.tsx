'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Layers, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface ParentCategory {
  id: string
  name: string
  description: string | null
}

export default function CreateCategoryPage() {
  const [loading, setLoading] = useState(false)
  const [fetchingParents, setFetchingParents] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Fitur Pemisah Mode: 'new_parent' atau 'existing_parent'
  const [creationMode, setCreationMode] = useState<'new_parent' | 'existing_parent'>('new_parent')
  const [parentList, setParentList] = useState<ParentCategory[]>([])

  // State Pilihan Dropdown di UI
  const [selectedParentId, setSelectedParentId] = useState('')

  // State untuk Kategori Induk Utama
  const [parentName, setParentName] = useState('')
  const [parentSlug, setParentSlug] = useState('')
  const [parentDesc, setParentDesc] = useState('')

  // State untuk menampung banyak Sub-Kategori sekaligus
  const [subCategories, setSubCategories] = useState<{ name: string; slug: string; description: string }[]>([
    { name: '', slug: '', description: '' }
  ])

  const supabase = createClient()

  // Ambil daftar kategori induk murni dari database
  const fetchParentCategories = async () => {
    setFetchingParents(true)
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description')
        .is('parent_id', null) // Hanya yang parent_id-nya null (Induk)
        .order('name', { ascending: true })

      if (data) setParentList(data)
    } catch (err) {
      console.error('Error fetching parent taxonomy units:', err)
    } finally {
      setFetchingParents(false)
    }
  }

  useEffect(() => {
    fetchParentCategories()
  }, [])

  // Efek Auto-Fill deskripsi saat memilih Kategori Induk di dropdown
  const handleParentDropdownChange = (id: string) => {
    setSelectedParentId(id)
    const target = parentList.find(p => p.id === id)
    if (target) {
      setParentName(target.name)
      setParentDesc(target.description || '')
    } else {
      setParentName('')
      setParentDesc('')
    }
  }

  // Handler auto-slug Kategori Induk
  const handleParentNameChange = (val: string) => {
    setParentName(val)
    setParentSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))
  }

  // Handler input nama Sub-Kategori
  const handleSubNameChange = (index: number, val: string) => {
    const updatedSub = [...subCategories]
    updatedSub[index].name = val
    updatedSub[index].slug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    setSubCategories(updatedSub)
  }

  // Handler input deskripsi Sub-Kategori
  const handleSubDescChange = (index: number, val: string) => {
    const updatedSub = [...subCategories]
    updatedSub[index].description = val
    setSubCategories(updatedSub)
  }

  // Tambah baris form sub-kategori baru
  const addSubRow = () => {
    setSubCategories([...subCategories, { name: '', slug: '', description: '' }])
  }

  // Hapus baris form sub-kategori
  const removeSubRow = (index: number) => {
    if (subCategories.length === 1) return
    setSubCategories(subCategories.filter((_, i) => i !== index))
  }

  // PROSES SUBMIT PIPELINE (FLEKSIBEL MODE)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      let finalParentId = selectedParentId

      // 1. Jika mode Buat Induk Baru, jalankan logic lama
      if (creationMode === 'new_parent') {
        if (!parentName || !parentSlug) {
          throw new Error('Main Parent validation incomplete. Name and Slug are required.')
        }

        const { data: insertedParent, error: parentError } = await supabase
          .from('categories')
          .insert([
            {
              name: parentName,
              slug: parentSlug,
              description: parentDesc || null,
              parent_id: null
            }
          ])
          .select('id')
          .single()

        if (parentError) {
          if (parentError.code === '23505') throw new Error(`Parent category "${parentName}" already exists. Switch to "Use Existing Parent" mode.`)
          throw parentError
        }

        if (insertedParent) finalParentId = insertedParent.id
      } else {
        // Jika mode Pakai Induk yang Ada, pastikan dropdown terisi
        if (!finalParentId) throw new Error('Please select an active existing parent category.')
      }

      // 2. Filter & siapkan data sub-kategori di bawah ID Induk
      const validSubs = subCategories
        .filter(sub => sub.name.trim() !== '' && sub.slug.trim() !== '')
        .map(sub => ({
          name: sub.name,
          slug: sub.slug,
          description: sub.description || null,
          parent_id: finalParentId // Mengunci ke ID induk yang tepat
        }))

      // Insert semua sub-kategori sekaligus jika ada inputnya
      if (validSubs.length > 0) {
        const { error: subsError } = await supabase
          .from('categories')
          .insert(validSubs)

        if (subsError) throw subsError
      }

      // Sukses Total: Reset form & reload list parent dropdown
      setMessage({ type: 'success', text: 'Taxonomy cluster network successfully deployed and linked.' })
      setParentName('')
      setParentSlug('')
      setParentDesc('')
      setSelectedParentId('')
      setSubCategories([{ name: '', slug: '', description: '' }])
      await fetchParentCategories()

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Critical failure during operational pipeline execution.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-7xl w-full mx-auto px-6 py-10">
      
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <Link href="/admin/dashboard/categories" className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-blue-400 transition mb-4">
            <ArrowLeft className="w-3 h-3" /> RETURN TO DIRECTORY
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-500" /> Bulk Hierarchical Injector
          </h1>
          <p className="text-sm text-slate-400">Deploy a master parent category node along with multiple child branches simultaneously.</p>
        </div>
      </div>

      {/* Alert System Status */}
      {message && (
        <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-4 ${
          message.type === 'success' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-xs font-mono font-semibold tracking-wide uppercase">{message.text}</p>
        </div>
      )}

      {fetchingParents ? (
        <div className="text-center py-20 text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> SYNCING TAXONOMY MATRIX CONFIGURATIONS...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* TOGGLE SWITCH MODE FITUR */}
          <div className="flex gap-4 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl max-w-md">
            <button type="button" onClick={() => { setCreationMode('new_parent'); setSelectedParentId(''); setParentName(''); setParentDesc(''); }} className={`flex-1 py-3 text-xs font-mono font-bold uppercase rounded-xl transition ${creationMode === 'new_parent' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
              ➕ Create New Parent
            </button>
            <button type="button" onClick={() => setCreationMode('existing_parent')} className={`flex-1 py-3 text-xs font-mono font-bold uppercase rounded-xl transition ${creationMode === 'existing_parent' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
              📂 Use Existing Parent
            </button>
          </div>
          
          {/* BAGIAN 1: INPUT KATEGORI INDUK UTAMA */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h2 className="text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-slate-800/60 pb-3 font-mono">[STAGE 01] - MASTER PARENT NODE</h2>
            
            {creationMode === 'existing_parent' ? (
              // JIKA PILIH MODE B: PAKAI INDUK YANG SUDAH ADA
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Select Active Parent Category</label>
                  <select value={selectedParentId} onChange={(e) => handleParentDropdownChange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none cursor-pointer" required>
                    <option value="">-- Choose Existing Parent Category --</option>
                    {parentList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                
                {/* AUTO-FILL FIELD DESKRIPSI INDUK ASLI DATABASE */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parent Description Archive (Auto-Loaded)</label>
                  <textarea rows={3} value={parentDesc} readOnly placeholder="No description archived for this node data." className="w-full bg-slate-950/40 border border-slate-800 text-slate-500 text-xs p-5 rounded-2xl outline-none resize-none cursor-not-allowed leading-relaxed" />
                </div>
              </div>
            ) : (
              // JIKA MODE A: BUAT INDUK BARU DARI NOL
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parent Name</label>
                    <input type="text" value={parentName} onChange={(e) => handleParentNameChange(e.target.value)} placeholder="e.g. BUDGETING" className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl transition-all outline-none" required />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parent URL Slug</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-5 text-xs text-slate-600 font-mono">/</span>
                      <input type="text" value={parentSlug} readOnly placeholder="budgeting" className="w-full bg-slate-950/40 border border-slate-800 text-slate-500 text-sm pl-8 pr-5 py-4 rounded-2xl font-mono cursor-not-allowed" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Parent Description</label>
                  <textarea rows={3} value={parentDesc} onChange={(e) => setParentDesc(e.target.value)} placeholder="Paste your custom AI generated description for this parent cluster here..." className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none resize-none leading-relaxed" />
                </div>
              </div>
            )}
          </div>

          {/* BAGIAN 2: INPUT BANYAK SUB-KATEGORI (CHILD BRANCHES) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest font-mono">[STAGE 02] - SUB-CATEGORY CHILD BRANCHES</h2>
              <button type="button" onClick={addSubRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/10 hover:bg-purple-600 border border-purple-500/20 text-purple-400 hover:text-white text-[11px] font-mono font-bold rounded-xl transition-all">
                <Plus className="w-3.5 h-3.5" /> ADD CHILD SUB
              </button>
            </div>

            <div className="space-y-6">
              {subCategories.map((sub, index) => (
                <div key={index} className="p-5 bg-slate-950 border border-slate-800/60 rounded-2xl space-y-4 relative group">
                  
                  {/* Tombol Delete Baris Sub */}
                  {subCategories.length > 1 && (
                    <button type="button" onClick={() => removeSubRow(index)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono font-bold text-slate-600 uppercase">Sub-Category #{index + 1} Name</label>
                      <input type="text" value={sub.name} onChange={(e) => handleSubNameChange(index, e.target.value)} placeholder="e.g. Financial Planning" className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none" required />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-mono font-bold text-slate-600 uppercase">Sub URL Slug</label>
                      <input type="text" value={sub.slug} readOnly placeholder="financial-planning" className="w-full bg-slate-900/40 border border-slate-800 text-slate-500 text-xs px-4 py-3 rounded-xl font-mono cursor-not-allowed" required />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-mono font-bold text-slate-600 uppercase">Sub Description</label>
                    <textarea rows={2} value={sub.description} onChange={(e) => handleSubDescChange(index, e.target.value)} placeholder="Paste custom AI generated description for this specific sub-category branch..." className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none resize-none leading-relaxed" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Submit Button */}
          <div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> EXECUTING HIERARCHICAL INJECTION...
                </>
              ) : (
                'Deploy Master & Child Clusters'
              )}
            </button>
          </div>

        </form>
      )}
    </main>
  )
}