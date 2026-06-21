'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users, UserPlus, Loader2, Trash2, Edit2, X, Check, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface Author {
  id: string
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
}

export default function AuthorsDashboard() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // State untuk Update/Edit Modal
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editBio, setEditBio] = useState('')
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editPreview, setEditPreview] = useState<string | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)

  const supabase = createClient()

  const fetchAuthors = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setAuthors(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAuthors()
  }, [])

  // Buka Modal Edit & Set Initial Data
  const openEditModal = (author: Author) => {
    setEditingAuthor(author)
    setEditName(author.name)
    setEditRole(author.role_title)
    setEditBio(author.short_bio)
    setEditPreview(author.avatar_url)
    setEditFile(null)
  }

  // Handle Edit File Upload
  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setEditFile(file)
      setEditPreview(URL.createObjectURL(file))
    }
  }

  // EXECUTE UPDATE (U dari CRUD)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAuthor) return
    setUpdateLoading(true)

    try {
      let finalAvatarUrl = editingAuthor.avatar_url

      // Jika admin upload foto baru, ganti file lama di storage
      if (editFile) {
        if (editingAuthor.avatar_url) {
          const oldFileName = editingAuthor.avatar_url.split('/').pop()
          if (oldFileName) await supabase.storage.from('author-avatars').remove([oldFileName])
        }

        const fileExt = editFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('author-avatars').upload(fileName, editFile)
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('author-avatars').getPublicUrl(fileName)
        finalAvatarUrl = publicUrl
      }

      // Update baris tabel database
      const { error: updateError } = await supabase
        .from('authors')
        .update({
          name: editName,
          role_title: editRole,
          short_bio: editBio,
          avatar_url: finalAvatarUrl
        })
        .eq('id', editingAuthor.id)

      if (updateError) throw updateError

      // Refresh data di UI
      setAuthors((prev) => prev.map((item) => item.id === editingAuthor.id ? { ...item, name: editName, role_title: editRole, short_bio: editBio, avatar_url: finalAvatarUrl } : item))
      setEditingAuthor(null)
    } catch (err: any) {
      alert(err.message || 'Failed to update author node.')
    } finally {
      setUpdateLoading(false)
    }
  }

  // EXECUTE DELETE (D dari CRUD)
  const handleDelete = async (id: string, avatarUrl: string | null) => {
    if (!confirm('Completely wipe this author from database?')) return
    setDeletingId(id)
    try {
      if (avatarUrl) {
        const fileName = avatarUrl.split('/').pop()
        if (fileName) await supabase.storage.from('author-avatars').remove([fileName])
      }
      const { error } = await supabase.from('authors').delete().eq('id', id)
      if (error) throw error
      setAuthors((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete execution node.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="max-w-5xl w-full mx-auto px-6 py-10 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-purple-500" /> Identity Author Hub</h1>
          <p className="text-xs text-slate-400 mt-1">Manage active content creator identity structures for global EEAT alignment.</p>
        </div>
        <Link href="/admin/dashboard/authors/create" className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition"><UserPlus className="w-4 h-4" /> Inject New Author</Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-500 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-purple-500" /> FETCHING NODES...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authors.map((author) => (
            <div key={author.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-start justify-between gap-4 group hover:border-slate-700 transition-all">
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                  {author.avatar_url ? <img src={author.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-slate-800 text-xs">NA</div>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white truncate">{author.name}</h3>
                    <span className="text-[9px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded">{author.role_title}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{author.short_bio}</p>
                </div>
              </div>
              <div className="flex gap-1 self-start shrink-0">
                <button onClick={() => openEditModal(author)} className="p-2 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(author.id, author.avatar_url)} disabled={deletingId === author.id} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition">{deletingId === author.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL DI ATAS LAYOUT */}
      {editingAuthor && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Update Identity Node</h2>
              <button type="button" onClick={() => setEditingAuthor(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                {editPreview ? <img src={editPreview} alt="" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-700 m-auto mt-4" />}
              </div>
              <div>
                <label className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono px-3 py-1.5 rounded-lg cursor-pointer transition border border-slate-700/50">Replace Avatar<input type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" /></label>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Full Name</label>
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Expertise Title</label>
              <input type="text" value={editRole} onChange={(e) => setEditRole(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Short Bio</label>
              <textarea rows={4} value={editBio} onChange={(e) => setEditBio(e.target.value)} className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500/50 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none resize-none leading-relaxed" required />
            </div>
            <div className="flex gap-2 pt-2 border-t border-slate-800/60">
              <button type="button" onClick={() => setEditingAuthor(null)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-xl transition">Cancel</button>
              <button type="submit" disabled={updateLoading} className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2">{updateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Commit Update</button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}