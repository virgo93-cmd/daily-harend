'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Layers, PlusCircle, Loader2, Trash2, Edit2, X, Check, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  parent_id: string | null
}

export default function CategoriesDashboard() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // State untuk Update Modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editName, setEditName] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [updateLoading, setUpdateLoading] = useState(false)

  const supabase = createClient()

  const fetchCategories = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
    if (!error && data) setCategories(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  // Fungsi hapus node kategori
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to purge this taxonomy node cluster? Children nodes might be orphaned.')) return
    setDeletingId(id)
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(categories.filter((c) => c.id !== id))
    } else {
      alert('Failed to delete node: ' + error.message)
    }
    setDeletingId(null)
  }

  // Fungsi buka modal edit
  const openEditModal = (cat: Category) => {
    setEditingCategory(cat)
    setEditName(cat.name)
    setEditSlug(cat.slug)
    setEditDesc(cat.description || '')
  }

  // Fungsi submit update modal
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCategory) return
    setUpdateLoading(true)

    const { error } = await supabase
      .from('categories')
      .update({
        name: editName,
        slug: editSlug,
        description: editDesc || null,
      })
      .eq('id', editingCategory.id)

    if (!error) {
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id
            ? { ...c, name: editName, slug: editSlug, description: editDesc || null }
            : c
        )
      )
      setEditingCategory(null)
    } else {
      alert('Update rejected: ' + error.message)
    }
    setUpdateLoading(false)
  }

  // Memisahkan kategori induk murni
  const mainCategories = categories.filter((c) => c.parent_id === null)

  return (
    <main className="max-w-7xl w-full mx-auto px-6 py-10">
      
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-500" /> Taxonomy Directory
          </h1>
          <p className="text-sm text-slate-400">
            Manage your master core categories and multi-level nested sub-category structures.
          </p>
        </div>
        <div>
          <Link
            href="/admin/dashboard/categories/create"
            className="inline-flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-blue-500/10 transition"
          >
            <PlusCircle className="w-4 h-4" /> Inject New Cluster
          </Link>
        </div>
      </div>

      {/* CORE DATA DISPLAY TABLE */}
      {loading ? (
        <div className="text-center py-20 text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> RETRIEVING LIVE TAXONOMY UNITS...
        </div>
      ) : mainCategories.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-3xl">
          <p className="text-sm text-slate-500 font-mono">No category core structures deployed yet.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Structure Node Name / Path</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">URL Slug Reference</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:table-cell">Node Description Mapping</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Operational Exec</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {mainCategories.map((parent) => {
                  const subBranches = categories.filter((c) => c.parent_id === parent.id)

                  return (
                    <React.Fragment key={parent.id}>
                      {/* BARIS UTAMA: KATEGORI INDUK */}
                      <tr className="bg-slate-900/20 hover:bg-slate-800/30 transition-colors group">
                        <td className="px-6 py-4.5 font-bold text-slate-200 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shadow-blue-400"></span>
                            {parent.name}
                          </div>
                        </td>
                        <td className="px-6 py-4.5 text-blue-400 font-medium">/{parent.slug}</td>
                        <td className="px-6 py-4.5 text-slate-500 hidden md:table-cell max-w-xs truncate">
                          {parent.description || <span className="text-slate-700 italic">No description spec</span>}
                        </td>
                        <td className="px-6 py-4.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(parent)}
                              className="p-2 text-slate-400 hover:text-blue-400 bg-slate-950 border border-slate-800 rounded-xl transition"
                              title="Modify Node"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(parent.id)}
                              disabled={deletingId === parent.id}
                              className="p-2 text-slate-400 hover:text-red-400 bg-slate-950 border border-slate-800 rounded-xl transition disabled:opacity-40"
                              title="Purge Node"
                            >
                              {deletingId === parent.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* BARIS SUB-KATEGORI */}
                      {subBranches.map((sub) => (
                        <tr key={sub.id} className="bg-slate-950/20 hover:bg-slate-800/20 transition-colors border-l-2 border-slate-800/80">
                          <td className="pl-12 pr-6 py-3.5 text-slate-300 font-sans text-xs">
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                              <span>{sub.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-purple-400/80">
                            <span className="text-slate-700">/{parent.slug}/</span>{sub.slug}
                          </td>
                          <td className="px-6 py-3.5 text-slate-500 hidden md:table-cell max-w-xs truncate">
                            {sub.description || <span className="text-slate-700 italic">No description spec</span>}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(sub)}
                                className="p-1.5 text-slate-500 hover:text-purple-400 bg-slate-900 border border-slate-800/60 rounded-lg transition"
                                title="Modify Sub-Node"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                disabled={deletingId === sub.id}
                                className="p-1.5 text-slate-500 hover:text-red-400 bg-slate-900 border border-slate-800/60 rounded-lg transition disabled:opacity-40"
                                title="Purge Sub-Node"
                              >
                                {deletingId === sub.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 font-mono">
                <Layers className="w-4 h-4 text-blue-500" /> Mutate Target Cluster
              </h3>
              <button
                onClick={() => setEditingCategory(null)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Structure Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">URL Slug</label>
                <input
                  type="text"
                  value={editSlug}
                  onChange={(e) => setEditSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Description</label>
                <textarea
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Paste or type your custom AI description here..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/50 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none resize-none leading-relaxed"
                />
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-800/60">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  {updateLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" /> Commit Update
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}