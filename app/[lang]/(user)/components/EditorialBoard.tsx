'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Users, X, User, CheckCircle, FileCheck } from 'lucide-react'

interface StaffNode {
  id: string
  name: string
  role_title: string
  short_bio: string
  avatar_url: string | null
  type: 'author' | 'reviewer' | 'fact_checker' // REVISI: Tambah tipe fact_checker
}

export default function EditorialBoard() {
  const [staff, setStaff] = useState<StaffNode[]>([])
  const [loading, setLoading] = useState(true)
  const [profileModal, setProfileModal] = useState<{
    isOpen: boolean
    title: string
    name: string
    role: string
    bio: string
    avatar: string | null
  }>({ isOpen: false, title: '', name: '', role: '', bio: '', avatar: null })

  const supabase = createClient()

  useEffect(() => {
    const fetchEditorialStaff = async () => {
      try {
        setLoading(true)

        // REVISI: Tarik data dari 3 tabel secara paralel dari Supabase
        const [authorsRes, reviewersRes, factCheckersRes] = await Promise.all([
          supabase.from('authors').select('id, name, role_title, short_bio, avatar_url'),
          supabase.from('reviewers').select('id, name, role_title, short_bio, avatar_url'),
          supabase.from('fact_checkers').select('id, name, role_title, short_bio, avatar_url')
        ])

        const combinedStaff: StaffNode[] = []

        // Map data Penulis
        if (!authorsRes.error && authorsRes.data) {
          authorsRes.data.forEach((a: any) => {
            combinedStaff.push({ ...a, type: 'author' })
          })
        }

        // Map data Peninjau/Reviewer
        if (!reviewersRes.error && reviewersRes.data) {
          reviewersRes.data.forEach((r: any) => {
            combinedStaff.push({ ...r, type: 'reviewer' })
          })
        }

        // REVISI: Map data Fact Checker
        if (!factCheckersRes.error && factCheckersRes.data) {
          factCheckersRes.data.forEach((f: any) => {
            combinedStaff.push({ ...f, type: 'fact_checker' })
          })
        }

        // Filter nama unik agar personil yang merangkap ganda tidak duplikat di beranda
        const uniqueStaff = combinedStaff.filter(
          (v, i, a) => a.findIndex((t) => t.name === v.name) === i
        )

        setStaff(uniqueStaff)
      } catch (err) {
        console.error('Failed to sync corporate editorial telemetry network:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEditorialStaff()
  }, [supabase])

  if (loading) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase animate-pulse">
          Reticulating Expert Networks...
        </div>
      </div>
    )
  }

  if (staff.length === 0) return null

  // Helper untuk menentukan judul modal berdasarkan tipe personil
  const getModalTitle = (type: 'author' | 'reviewer' | 'fact_checker') => {
    if (type === 'author') return 'Editorial Author'
    if (type === 'reviewer') return 'Expert Reviewer'
    return 'Fact Checker Specialist'
  }

  return (
    <section className="w-full pt-12 space-y-6 border-t border-slate-100 mt-12">
      {/* Header Board */}
      <div>
        <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-bold block mb-1">
          Verification Roster
        </span>
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
          <Users className="w-5 h-5 text-slate-950 shrink-0" />
          Editorial Board
        </h3>
      </div>

      {/* Grid Profil Personil */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            onClick={() => setProfileModal({
              isOpen: true,
              title: getModalTitle(member.type),
              name: member.name,
              role: member.role_title,
              bio: member.short_bio,
              avatar: member.avatar_url
            })}
            className="group flex items-center gap-3.5 p-4 bg-white border border-slate-200 rounded-2xl hover:border-slate-900 transition-all duration-300 shadow-xs cursor-pointer select-none"
          >
            {/* Foto Avatar Mini */}
            {member.avatar_url ? (
              <img 
                src={member.avatar_url} 
                alt={member.name} 
                className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-xs group-hover:scale-105 transition-transform shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                {/* REVISI: Penambahan fallback icon untuk tipe fact_checker */}
                {member.type === 'author' && <User className="w-5 h-5" />}
                {member.type === 'reviewer' && <CheckCircle className="w-5 h-5" />}
                {member.type === 'fact_checker' && <FileCheck className="w-5 h-5 text-purple-600" />}
              </div>
            )}

            {/* Teks Identitas */}
            <div className="min-w-0 flex-1 space-y-0.5">
              {/* REVISI: Penambahan style badge warna monokromatis khusus fact_checker */}
              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider block px-1.5 py-0.5 rounded max-w-max leading-none ${
                member.type === 'author' ? 'bg-slate-950 text-white' : 
                member.type === 'reviewer' ? 'bg-slate-100 text-slate-600 border border-slate-200/60' :
                'bg-purple-50 text-purple-700 border border-purple-200/60' // Style badge untuk fact_checker
              }`}>
                {member.type === 'fact_checker' ? 'fact checker' : member.type}
              </span>
              <h4 className="font-black text-sm text-slate-950 uppercase tracking-tight truncate group-hover:underline">
                {member.name}
              </h4>
              <p className="text-[10px] font-medium text-slate-500 truncate leading-tight uppercase tracking-tight">
                {member.role_title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pop-up Modal Detail Bio Pakar */}
      {profileModal.isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 max-w-md w-full relative shadow-2xl text-slate-950">
            <button 
              onClick={() => setProfileModal(prev => ({ ...prev, isOpen: false }))}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-4">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest px-2.5 py-1 bg-slate-100 rounded-full font-bold">
                {profileModal.title}
              </span>
              
              {profileModal.avatar ? (
                <img src={profileModal.avatar} className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-md" alt="" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                  <User className="w-8 h-8" />
                </div>
              )}

              <div className="space-y-0.5">
                <h4 className="text-lg font-black text-slate-950 uppercase tracking-tight">{profileModal.name}</h4>
                <p className="text-[10px] font-mono text-blue-700 font-bold uppercase">{profileModal.role}</p>
              </div>

              <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-left">
                <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                  {profileModal.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}