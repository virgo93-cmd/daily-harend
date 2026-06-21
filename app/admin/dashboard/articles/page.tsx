'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { FileText, PlusCircle, Loader2, Trash2, Edit3, ShieldCheck, UserCheck, Filter } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  parent_id: string | null
}

interface Article {
  id: string
  title: string
  slug: string
  status: string
  created_at: string
  categories: { name: string } | null
  authors: { name: string; avatar_url: string | null } | null
  reviewers: { name: string; avatar_url: string | null } | null
  fact_checkers: { name: string; avatar_url: string | null } | null
}

export default function ArticlesDashboard() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Filter state dengan array untuk Multi-Select
  const [showFilters, setShowFilters] = useState(false)
  const [filter, setFilter] = useState({ 
    status: 'all', 
    author: 'all', 
    selectedCategories: [] as string[] 
  })

  const supabase = createClient()

  const fetchArticles = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        status,
        created_at,
        categories ( name ),
        authors ( name, avatar_url ),
        reviewers ( name, avatar_url ),
        fact_checkers ( name, avatar_url )
      `)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setArticles(data as any)
    }
    setLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('id, name, parent_id')
    if (data) setCategories(data)
  }

  useEffect(() => {
    fetchArticles()
    fetchCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Wipe this article from the production registry?')) return
    setDeletingId(id)
    try {
      const { error } = await supabase.from('articles').delete().eq('id', id)
      if (error) throw error
      setArticles((prev) => prev.filter((item) => item.id !== id))
    } catch (err: any) {
      alert(err.message || 'Failed to delete operational node.')
    } finally {
      setDeletingId(null)
    }
  }

  // Multi-select logic
  const toggleCategory = (name: string) => {
    setFilter(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(name) 
        ? prev.selectedCategories.filter(c => c !== name)
        : [...prev.selectedCategories, name]
    }))
  }

  // Filter logika dengan Multi-Select
  const filteredArticles = articles.filter(art => {
    const matchStatus = filter.status === 'all' || art.status === filter.status
    const matchAuthor = filter.author === 'all' || art.authors?.name === filter.author
    const matchCategory = filter.selectedCategories.length === 0 || filter.selectedCategories.includes(art.categories?.name || '')
    return matchStatus && matchAuthor && matchCategory
  })

  const uniqueAuthors = Array.from(new Set(articles.map(a => a.authors?.name).filter(Boolean)));

  return (
    <main className="max-w-full w-full mx-auto px-6 py-10">
      
      {/* Header Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" /> Article Engine Pipeline
          </h1>
          <p className="text-xs text-slate-400 mt-1">Monitor, audit, and track content deployments across core matrix sectors.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition">
                <Filter className="w-4 h-4" /> Filter
            </button>
            <Link 
            href="/admin/dashboard/articles/create" 
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition"
            >
            <PlusCircle className="w-4 h-4" /> Deploy Content
            </Link>
        </div>
      </div>

      {showFilters && (
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl mb-6 flex flex-col gap-4">
              <div className="flex gap-4 flex-wrap">
                  <select className="bg-slate-950 p-2 text-xs rounded-lg text-white border border-slate-800" onChange={e => setFilter({...filter, status: e.target.value})}>
                      <option value="all">Status: All</option><option value="published">Published</option><option value="draft">Draft</option>
                  </select>
                  <select className="bg-slate-950 p-2 text-xs rounded-lg text-white border border-slate-800" onChange={e => setFilter({...filter, author: e.target.value})}>
                      <option value="all">Author: All</option>
                      {uniqueAuthors.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <button onClick={() => setFilter({status: 'all', author: 'all', selectedCategories: []})} className="text-xs text-red-400 font-bold px-2">Reset</button>
              </div>
              
              {/* Multi-Select Kategori Berjenjang */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-800 pt-4">
                {categories.filter(c => !c.parent_id).map(parent => (
                  <div key={parent.id} className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-blue-400 uppercase">{parent.name}</label>
                    <div className="flex flex-col gap-1">
                      {categories.filter(c => c.parent_id === parent.id).map(child => (
                        <label key={child.id} className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer hover:text-white">
                          <input type="checkbox" checked={filter.selectedCategories.includes(child.name)} onChange={() => toggleCategory(child.name)} className="rounded border-slate-700 bg-slate-950" />
                          {child.name}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
          </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-12 text-xs font-mono text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> FETCHING CORE PIPELINES...
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/10">
          <p className="text-xs font-mono text-slate-500 uppercase tracking-wider">No active deployment nodes discovered.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
                  <th className="p-4 pl-6">Article Details</th>
                  <th className="p-4">Taxonomy Cluster</th>
                  <th className="p-4">Author Node</th>
                  <th className="p-4">Reviewer Node</th>
                  <th className="p-4">Fact Checker Node</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredArticles.map((art) => (
                  <tr key={art.id} className="hover:bg-slate-850/20 transition-colors group">
                    <td className="p-4 pl-6 max-w-sm">
                      <div className="font-bold text-sm text-slate-200 line-clamp-1 group-hover:text-white transition-colors">{art.title}</div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">/{art.slug}</div>
                    </td>
                    
                    <td className="p-4 text-xs text-slate-400 font-medium">
                      {art.categories?.name ? (
                        <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-slate-300">
                          {art.categories.name}
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      {art.authors ? (
                        <div className="flex items-center gap-2.5">
                          {art.authors.avatar_url ? (
                            <img 
                              src={art.authors.avatar_url} 
                              alt={art.authors.name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-700 bg-slate-950"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-mono font-bold text-slate-400">
                              A
                            </div>
                          )}
                          <span className="font-medium text-slate-300">{art.authors.name}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[9px] font-mono font-bold text-slate-600">
                            S
                          </div>
                          <span className="text-slate-600 italic">System Node</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      {art.reviewers ? (
                        <div className="flex items-center gap-2.5">
                          {art.reviewers.avatar_url ? (
                            <img 
                              src={art.reviewers.avatar_url} 
                              alt={art.reviewers.name}
                              className="w-6 h-6 rounded-full object-cover border border-blue-500/20 bg-slate-950"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-950/20 border border-blue-500/20 flex items-center justify-center text-[9px] font-mono font-bold text-blue-400">
                              R
                            </div>
                          )}
                          <span className="font-medium text-slate-300 flex items-center gap-1">
                            {art.reviewers.name}
                            <ShieldCheck className="w-3 h-3 text-blue-500 shrink-0" />
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic pl-8">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4 text-xs text-slate-400">
                      {art.fact_checkers ? (
                        <div className="flex items-center gap-2.5">
                          {art.fact_checkers.avatar_url ? (
                            <img 
                              src={art.fact_checkers.avatar_url} 
                              alt={art.fact_checkers.name}
                              className="w-6 h-6 rounded-full object-cover border border-purple-500/20 bg-slate-950"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-purple-950/20 border border-purple-500/20 flex items-center justify-center text-[9px] font-mono font-bold text-purple-400">
                              FC
                            </div>
                          )}
                          <span className="font-medium text-slate-300 flex items-center gap-1">
                            {art.fact_checkers.name}
                            <UserCheck className="w-3 h-3 text-purple-500 shrink-0" />
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic pl-8">Unassigned</span>
                      )}
                    </td>

                    <td className="p-4 text-xs">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider ${
                        art.status === 'published' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        art.status === 'scheduled' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {art.status}
                      </span>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/admin/dashboard/articles/create?id=${art.id}`}
                          className="p-2 bg-slate-800 text-slate-400 hover:text-blue-400 rounded-xl transition border border-transparent hover:border-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(art.id)}
                          disabled={deletingId === art.id}
                          className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition border border-transparent hover:border-red-500/20"
                        >
                          {deletingId === art.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}