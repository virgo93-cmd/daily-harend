'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { FileText, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Upload, Code, PlusCircle, Trash2, HelpCircle } from 'lucide-react'
import Link from 'next/link'

interface RelationData {
  id: string
  name: string
}

interface CategoryData {
  id: string
  name: string
  parent_id: string | null
}

// Interface baru untuk menyusun struktur skema data JSONB FAQ
interface FaqItem {
  question: string
  answer: string
}

export default function CreateArticlePage() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('id') // Deteksi parameter ID untuk mode Edit hibrida

  const [loading, setLoading] = useState(false)
  const [fetchingRelations, setFetchingRelations] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // State Relasi Dropdown dari Database
  const [authors, setAuthors] = useState<RelationData[]>([])
  const [reviewers, setReviewers] = useState<RelationData[]>([])
  const [factCheckers, setFactCheckers] = useState<RelationData[]>([]) // HANYA MENAMBAH: State Fact Checker baru
  const [allCategories, setAllCategories] = useState<CategoryData[]>([])

  // State Filtered Kategori untuk Tampilan
  const [mainCategories, setMainCategories] = useState<CategoryData[]>([])
  const [subCategories, setSubCategories] = useState<CategoryData[]>([])

  // State Pilihan Dropdown di UI
  const [selectedMainCatId, setSelectedMainCatId] = useState('')
  const [selectedSubCatId, setSelectedSubCatId] = useState('')

  // State Form Utama
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [summary, setSummary] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [imageSource, setImageSource] = useState('Envato Premium')
  const [content, setContent] = useState('') 
  const [metaDescription, setMetaDescription] = useState('')
  
  // State Dropdown Relasi Lainnya
  const [authorId, setAuthorId] = useState('')
  const [reviewerId, setReviewerId] = useState('')
  const [factCheckerId, setFactCheckerId] = useState('') // HANYA MENAMBAH: State tampung ID pilihan
  const [status, setStatus] = useState('draft')

  // State baru penampung array dynamic fields FAQ (Optional)
  const [faqs, setFaqs] = useState<FaqItem[]>([])

  const supabase = createClient()

  // Load data dependency untuk dropdown relasi
  const fetchRelations = async () => {
    setFetchingRelations(true)
    try {
      // HANYA MENYELIPKAN: Penarikan paralel tabel fact_checkers
      const [authorsRes, reviewersRes, factCheckersRes, categoriesRes] = await Promise.all([
        supabase.from('authors').select('id, name').order('name', { ascending: true }),
        supabase.from('reviewers').select('id, name').order('name', { ascending: true }),
        supabase.from('fact_checkers').select('id, name').order('name', { ascending: true }),
        supabase.from('categories').select('id, name, parent_id').order('name', { ascending: true })
      ])

      if (authorsRes.data) setAuthors(authorsRes.data)
      if (reviewersRes.data) setReviewers(reviewersRes.data)
      if (factCheckersRes.data) setFactCheckers(factCheckersRes.data) // HANYA MENAMBAH: Assign data verifikator
      
      let categoriesData: CategoryData[] = []
      if (categoriesRes.data) {
        categoriesData = categoriesRes.data
        setAllCategories(categoriesData)
        const mains = categoriesData.filter(c => c.parent_id === null)
        setMainCategories(mains)
      }

      // Jika dalam mode EDIT hibrida, tarik data spesifik artikel setelah relasi dimuat
      if (editId) {
        const { data: article, error: articleErr } = await supabase
          .from('articles')
          .select('*')
          .eq('id', editId)
          .single()

        if (!articleErr && article) {
          setTitle(article.title || '')
          setSlug(article.slug || '')
          setSummary(article.summary || '')
          setCoverImage(article.cover_image || '')
          setImageSource(article.image_source || 'Envato Premium')
          setContent(article.content || '')
          setMetaDescription(article.meta_description || '')
          setAuthorId(article.author_id || '')
          setReviewerId(article.reviewer_id || '')
          setFactCheckerId(article.fact_checker_id || '') // HANYA MENAMBAH: Set ID edit jika ada di DB
          setStatus(article.status || 'draft')
          setFaqs(article.faq || [])

          // Sinkronisasi pemetaan dropdown kategori bertingkat
          if (article.category_id) {
            const targetCat = categoriesData.find(c => c.id === article.category_id)
            if (targetCat) {
              if (targetCat.parent_id) {
                setSelectedMainCatId(targetCat.parent_id)
                const subs = categoriesData.filter(c => c.parent_id === targetCat.parent_id)
                setSubCategories(subs)
                setSelectedSubCatId(targetCat.id)
              } else {
                setSelectedMainCatId(targetCat.id)
              }
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching dependency structures:', err)
    } finally {
      setFetchingRelations(false)
    }
  }

  useEffect(() => {
    fetchRelations()
  }, [editId])

  // Efek untuk memfilter Sub Kategori ketika Kategori Induk dipilih secara manual
  useEffect(() => {
    if (selectedMainCatId) {
      const subs = allCategories.filter(c => c.parent_id === selectedMainCatId)
      setSubCategories(subs)
    } else {
      setSubCategories([])
    }
  }, [selectedMainCatId, allCategories])

  // Auto-generate URL Slug dari ketikan Judul (Hanya berjalan jika membuat artikel baru)
  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!editId) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '')
      setSlug(generatedSlug)
    }
  }

  // Auto-Extract Paragraf Pertama HTML untuk Summary & Meta Description
  const handleContentChange = (htmlVal: string) => {
    setContent(htmlVal)

    if (!htmlVal.trim()) return

    const match = htmlVal.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
    if (match && match[1]) {
      const cleanText = match[1]
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/\s+/g, " ")
        .trim()

      const shortExcerpt = cleanText.length > 160 ? cleanText.substring(0, 157) + "..." : cleanText

      setSummary(shortExcerpt)
      setMetaDescription(shortExcerpt)
    }
  }

  // Handler Upload Foto Lokal ke Bucket Storage 'article-assets'
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setMessage(null)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('article-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('article-assets')
        .getPublicUrl(filePath)

      setCoverImage(publicUrl)
      setMessage({ type: 'success', text: 'Media asset successfully deployed to bucket storage.' })

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload local image asset.' })
    } finally {
      setUploading(false)
    }
  }

  // Handler Fungsi Manajemen Array FAQ Dinamis
  const addFaqItem = () => {
    setFaqs([...faqs, { question: '', answer: '' }])
  }

  const removeFaqItem = (index: number) => {
    setFaqs(faqs.filter((_, i) => i !== index))
  }

  const handleFaqChange = (index: number, field: keyof FaqItem, value: string) => {
    const updatedFaqs = [...faqs]
    updatedFaqs[index][field] = value
    setFaqs(updatedFaqs)
  }

  // Handler Submit Pipeline
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const finalCategoryId = selectedSubCatId || selectedMainCatId || null

    // Filter FAQ agar item kosong tidak ikut terkirim ke database
    const filteredFaqs = faqs.filter(f => f.question.trim() || f.answer.trim())

    try {
      if (!title || !slug || !content.trim()) {
        throw new Error('Deployment rejected. Title, Slug, and HTML Content Source are required.')
      }

      const payload = {
        title,
        slug,
        summary: summary || null,
        content: content.trim(), 
        meta_description: metaDescription || null,
        cover_image: coverImage || null,
        image_source: imageSource || null,
        author_id: authorId || null,
        reviewer_id: reviewerId || null,
        fact_checker_id: factCheckerId || null, // HANYA MENAMBAH: Masukkan kolom baru ke DB Payload
        category_id: finalCategoryId,
        status,
        faq: filteredFaqs.length > 0 ? filteredFaqs : null,
        updated_at: new Date().toISOString()
      }

      let error = null

      if (editId) {
        // Operasi CRUD: Update data lama menggunakan upsert terikat ID
        const { error: updateError } = await supabase
          .from('articles')
          .upsert({ id: editId, ...payload })
        error = updateError
      } else {
        // Operasi CRUD: Insert data baru seperti biasa
        const { error: insertError } = await supabase
          .from('articles')
          .insert([payload])
        error = insertError
      }

      if (error) {
        if (error.code === '23505') throw new Error('Duplicate URL slug detected. Modify title node context.')
        throw error
      }

      setMessage({ 
        type: 'success', 
        text: editId 
          ? 'HTML Content cluster successfully updated in the master engine.' 
          : 'HTML Content cluster successfully deployed into the master engine.' 
      })
      
      // Hanya lakukan reset state jika berada dalam mode pembuatan data BARU
      if (!editId) {
        setTitle('')
        setSlug('')
        setSummary('')
        setCoverImage('')
        setImageSource('Envato Premium')
        setContent('')
        setMetaDescription('')
        setAuthorId('')
        setReviewerId('')
        setFactCheckerId('') // HANYA MENAMBAH: Reset input
        setSelectedMainCatId('')
        setSelectedSubCatId('')
        setStatus('draft')
        setFaqs([])
      }

    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Critical logic crash during distribution phase.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-full w-full mx-auto px-6 py-10">
      
      {/* Header Pipeline Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <Link href="/admin/dashboard/articles" className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 hover:text-blue-400 transition mb-4">
            <ArrowLeft className="w-3 h-3" /> PIPELINE ARCHIVE
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-500" /> {editId ? 'Modify Content Node' : 'Deploy Content Node'}
          </h1>
          <p className="text-sm text-slate-400">Inject full-scale structured HTML articles along with localized media components into core registry sectors.</p>
        </div>

        {/* MASTER SUBMIT OPERATION (PINDAH KE KANAN ATAS SEJAJAR JUDUL NODE) */}
        <div className="shrink-0 w-full md:w-auto">
          <button 
            type="submit" 
            form="article-pipeline-form" 
            disabled={loading || fetchingRelations} 
            className="w-full md:w-auto px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> COMMITTING...
              </>
            ) : (
              editId ? 'Update Core Article Cluster' : 'Deploy Core Article Cluster'
            )}
          </button>
        </div>
      </div>

      {/* Alert Banner Status */}
      {message && (
        <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-4 ${
          message.type === 'success' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <p className="text-xs font-mono font-semibold tracking-wide uppercase">{message.text}</p>
        </div>
      )}

      {fetchingRelations ? (
        <div className="text-center py-20 text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> LOADING PRODUCTION CORE RELATIONSHIPS...
        </div>
      ) : (
        <form id="article-pipeline-form" onSubmit={handleSubmit} className="space-y-6">
          
          {/* STAGE 1: METADATA & UTILITY INPUT */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Article Title</label>
                <input type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. 5 Easy Steps to Automate Financial Systems" className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl transition-all outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">URL Path Slug {editId ? '(Locked Mode)' : '(Auto-Generated)'}</label>
                <input type="text" value={slug} onChange={(e) => editId && setSlug(e.target.value)} readOnly={!editId} placeholder="auto-generated-slug-path" className={`w-full border border-slate-800 text-sm px-5 py-4 rounded-2xl font-mono ${editId ? 'bg-slate-950 focus:border-blue-500/50 text-slate-200 outline-none' : 'bg-slate-950/40 text-slate-500 cursor-not-allowed'}`} required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Short Summary / Excerpt (Auto-Filled)</label>
                <input type="text" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Will auto-fill but you can overwrite freely..." className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none" />
              </div>
              
              {/* PIPELINE INTEGRASI UPLOAD FOTO LOKAL */}
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Local Cover Image Asset</label>
                <div className="flex gap-3">
                  <input type="text" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Upload image asset or paste direct URL..." className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs px-5 py-4 rounded-2xl font-mono outline-none truncate focus:border-blue-500/50" />
                  <label className="px-5 py-4 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-2xl transition cursor-pointer flex items-center justify-center gap-2 shrink-0 select-none">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Upload className="w-4 h-4" />}
                    <span>Upload Foto</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* BARIS DATA SOURCE GAMBAR */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cover Image Source Credential</label>
              <input type="text" value={imageSource} onChange={(e) => setImageSource(e.target.value)} placeholder="e.g. Envato Premium, Unsplash, Self Documented" className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none transition-all" />
            </div>
          </div>

          {/* STAGE 2: PRODUCTION INVENTORY RELATIONSHIPS */}
          {/* REVISI: Mengubah grid-cols-4 menjadi grid-cols-5 untuk menyisipkan dropdown tanpa merubah style */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Author Node</label>
              <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none cursor-pointer">
                <option value="">-- Assign Author --</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Reviewer Node</label>
              <select value={reviewerId} onChange={(e) => setReviewerId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none cursor-pointer">
                <option value="">-- Assign Reviewer --</option>
                {reviewers.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            {/* HANYA MENAMBAH: Dropdown khusus kolom baru Fact Checker Node */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fact Checker Node</label>
              <select value={factCheckerId} onChange={(e) => setFactCheckerId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none cursor-pointer">
                <option value="">-- Optional Fact Checker --</option>
                {factCheckers.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            {/* DROPDOWN 1 - KATEGORI INDUK */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Main Category Target</label>
              <select value={selectedMainCatId} onChange={(e) => setSelectedMainCatId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none cursor-pointer">
                <option value="">-- Select Main Category --</option>
                {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* DROPDOWN 2 - SUB KATEGORI DINAMIS */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Sub Category Target</label>
              <select value={selectedSubCatId} onChange={(e) => setSelectedSubCatId(e.target.value)} disabled={!selectedMainCatId} className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-5 py-4 rounded-2xl outline-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                <option value="">-- Select Sub Category (Optional) --</option>
                {subCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {/* STAGE 3: DIRECT HTML CODE EDITOR FIELD */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 ml-1 mb-1">
                <Code className="w-4 h-4 text-blue-500" />
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core Article Body (Raw HTML Code Field)</label>
              </div>
              <textarea 
                rows={18} 
                value={content} 
                onChange={(e) => handleContentChange(e.target.value)} 
                placeholder="&#10;<h2>1. Know How Much You Owe</h2>&#10;<p>Content paragraph here...</p>" 
                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-emerald-400 font-mono text-xs p-5 rounded-2xl outline-none resize-none leading-relaxed" 
                required />
            </div>

            {/* MANUAL SEO META DESCRIPTION INPUT */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Manual Meta Description (Auto-Filled)</label>
              <textarea rows={3} value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Will auto-fill but you can overwrite freely..." className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-xs p-5 rounded-2xl outline-none resize-none leading-relaxed" />
            </div>

            {/* STATUS SELECTION */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Pipeline Operational Status</label>
              <div className="flex gap-4">
                {['draft', 'scheduled', 'published'].map((st) => (
                  <label key={st} className={`flex-1 py-3 px-4 border rounded-xl flex items-center justify-center gap-2 cursor-pointer font-mono text-xs uppercase tracking-wider transition-all ${
                    status === st 
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400 font-bold' 
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-400'
                  }`}>
                    <input type="radio" name="status" value={st} checked={status === st} onChange={(e) => setStatus(e.target.value)} className="hidden" />
                    {st}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* DYNAMIC STAGE: FREQUENTLY ASKED QUESTIONS (OPTIONAL) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/60 pb-4">
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-5 h-5 text-purple-500" />
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest">Frequently Asked Questions</label>
                  <span className="text-[11px] text-slate-400">Append high-yield dynamic FAQ schema blocks into the article viewport (Optional).</span>
                </div>
              </div>
              <button
                type="button"
                onClick={addFaqItem}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 hover:border-purple-500/40 text-xs font-bold rounded-xl transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add FAQ Item</span>
              </button>
            </div>

            {faqs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-[11px] font-mono text-slate-600 uppercase tracking-wider">
                NO FAQ OBJECTS TIED TO THIS CONTENT NODE
              </div>
            ) : (
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                {faqs.map((faq, index) => (
                  <div key={index} className="group bg-slate-950 border border-slate-800/80 rounded-2xl p-5 relative space-y-4 transition-all hover:border-slate-700/60">
                    <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                      <span className="text-[10px] font-mono font-bold text-purple-500 uppercase tracking-widest">FAQ Node #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFaqItem(index)}
                        className="text-slate-600 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition"
                        title="Delete FAQ Node"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider pl-0.5">Question Context</label>
                        <input
                          type="text"
                          value={faq.question}
                          onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                          placeholder="e.g. What is the fundamental concept of this workflow?"
                          className="w-full bg-slate-900 border border-slate-800/80 focus:border-purple-500/40 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-slate-600 uppercase tracking-wider pl-0.5">Answer Context</label>
                        <textarea
                          rows={2}
                          value={faq.answer}
                          onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                          placeholder="Provide the direct structural breakdown or solution logic..."
                          className="w-full bg-slate-900 border border-slate-800/80 focus:border-purple-500/40 text-slate-200 text-xs px-4 py-3 rounded-xl outline-none resize-none leading-relaxed transition"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </form>
      )}
    </main>
  )
}