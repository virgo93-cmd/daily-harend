'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  ShieldAlert, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  PlusCircle, 
  ListOrdered,
  Users,
  UserCheck,
  FileCheck, // IMPOR BARU: Icon khusus profesional untuk Fact Checker
  Globe
} from 'lucide-react'

interface SidebarProps {
  adminEmail: string | null
  isMinimized: boolean
  setIsMinimized: (value: boolean) => void
}

export default function Sidebar({ adminEmail, isMinimized, setIsMinimized }: SidebarProps) {
  const pathname = usePathname()
  const supabase = createClient()

  // State untuk kontrol accordion sub-menu
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    articles: true,
    taxonomy: false,
    roles: true,
    webProperties: true, 
  })

  const toggleMenu = (menuKey: string) => {
    if (isMinimized) {
      setIsMinimized(false)
    }
    setOpenMenus((prev) => ({ ...prev, [menuKey]: !prev[menuKey] }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/admin'
  }

  const isActive = (path: string) => pathname === path

  return (
    <div 
      className={`min-h-screen bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between fixed left-0 top-0 z-50 transition-all duration-300 ease-in-out ${
        isMinimized ? 'w-20' : 'w-64'
      }`}
    >
      {/* UPPER REGION: Identity & Core Flows */}
      <div>
        {/* Console Brand Header + Minimize Trigger */}
        <div className="px-4 py-5 border-b border-slate-800/60 bg-slate-950/20 flex items-center justify-between gap-2 h-[73px]">
          {!isMinimized && (
            <div className="pl-2 animate-fadeIn">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Control Panel</span>
              <span className="text-sm font-extrabold tracking-tight text-white">Daily Harend</span>
            </div>
          )}
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className={`p-2 bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all duration-200 ${isMinimized ? 'mx-auto' : ''}`}
            title={isMinimized ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isMinimized ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Dynamic Navigation Stack */}
        <div className="px-3 py-6 space-y-2">
          
          {/* Main Module: Overview Dashboard */}
          <div>
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                isActive('/admin/dashboard')
                  ? 'bg-white text-slate-950 shadow-lg shadow-white/5'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
              title="Infrastructure Overview"
            >
              <LayoutDashboard className={`w-4 h-4 shrink-0 ${isActive('/admin/dashboard') ? 'text-slate-950' : 'text-slate-400'}`} />
              {!isMinimized && <span className="truncate">Overview</span>}
            </Link>
          </div>

          {/* Module Cluster: Article Engine */}
          <div className="pt-2">
            <button
              onClick={() => toggleMenu('articles')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                openMenus.articles && !isMinimized ? 'bg-slate-800/20 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
              title="Article Management Engine"
            >
              <div className="flex items-center gap-3 text-xs font-semibold tracking-wide">
                <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                {!isMinimized && <span>Article Engine</span>}
              </div>
              {!isMinimized && (
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${openMenus.articles ? 'rotate-180' : ''}`} />
              )}
            </button>
            {openMenus.articles && !isMinimized && (
              <div className="mt-1 ml-5 pl-4 border-l border-slate-800 space-y-1.5 animate-slideDown">
                <Link href="/admin/dashboard/articles" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/articles') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <ListOrdered className="w-3.5 h-3.5 opacity-60" />
                  All Pipelines
                </Link>
                <Link href="/admin/dashboard/articles/create" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/articles/create') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <PlusCircle className="w-3.5 h-3.5 opacity-60" />
                  Deploy Content
                </Link>
              </div>
            )}
          </div>

          {/* Module Cluster: Taxonomy Hub */}
          <div>
            <button
              onClick={() => toggleMenu('taxonomy')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                openMenus.taxonomy && !isMinimized ? 'bg-slate-800/20 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
              title="Taxonomy Structure"
            >
              <div className="flex items-center gap-3 text-xs font-semibold tracking-wide">
                <Layers className="w-4 h-4 text-blue-500 shrink-0" />
                {!isMinimized && <span>Taxonomy Hub</span>}
              </div>
              {!isMinimized && (
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${openMenus.taxonomy ? 'rotate-180' : ''}`} />
              )}
            </button>
            {openMenus.taxonomy && !isMinimized && (
              <div className="mt-1 ml-5 pl-4 border-l border-slate-800 space-y-1.5 animate-slideDown">
                <Link href="/admin/dashboard/categories" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/categories') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <ListOrdered className="w-3.5 h-3.5 opacity-60" />
                  Directory List
                </Link>
                <Link href="/admin/dashboard/categories/create" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/categories/create') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <PlusCircle className="w-3.5 h-3.5 opacity-60" />
                  Inject Cluster
                </Link>
              </div>
            )}
          </div>

          {/* Module Cluster: Authority Roles */}
          <div>
            <button
              onClick={() => toggleMenu('roles')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                openMenus.roles && !isMinimized ? 'bg-slate-800/20 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
              title="Authority Credentials Board"
            >
              <div className="flex items-center gap-3 text-xs font-semibold tracking-wide">
                <ShieldAlert className="w-4 h-4 text-purple-500 shrink-0" />
                {!isMinimized && <span>Authority Roles</span>}
              </div>
              {!isMinimized && (
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${openMenus.roles ? 'rotate-180' : ''}`} />
              )}
            </button>
            {openMenus.roles && !isMinimized && (
              <div className="mt-1 ml-5 pl-4 border-l border-slate-800 space-y-1.5 animate-slideDown">
                <Link href="/admin/dashboard/authors" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/authors') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <Users className="w-3.5 h-3.5 opacity-60" />
                  Author Hub
                </Link>
                <Link href="/admin/dashboard/reviewers" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/reviewers') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <UserCheck className="w-3.5 h-3.5 opacity-60" />
                  Reviewer Board
                </Link>
                {/* REVISI INTEGRASI: Jalur sub-menu modular baru untuk Fact Checker */}
                <Link href="/admin/dashboard/fact-checkers" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/fact-checkers') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <FileCheck className="w-3.5 h-3.5 opacity-60 text-purple-400" />
                  Fact Checker List
                </Link>
              </div>
            )}
          </div>

          {/* Module Cluster: Web Properties */}
          <div>
            <button
              onClick={() => toggleMenu('webProperties')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-left ${
                openMenus.webProperties && !isMinimized ? 'bg-slate-800/20 text-slate-200' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/20'
              }`}
              title="Web Properties Configuration"
            >
              <div className="flex items-center gap-3 text-xs font-semibold tracking-wide">
                <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                {!isMinimized && <span>Web Properties</span>}
              </div>
              {!isMinimized && (
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${openMenus.webProperties ? 'rotate-180' : ''}`} />
              )}
            </button>
            {openMenus.webProperties && !isMinimized && (
              <div className="mt-1 ml-5 pl-4 border-l border-slate-800 space-y-1.5 animate-slideDown">
                <Link href="/admin/dashboard/web-properties" className={`flex items-center gap-2 py-1.5 px-2 rounded-lg text-xs transition-all ${isActive('/admin/dashboard/web-properties') ? 'text-white font-semibold bg-slate-800/40' : 'text-slate-400 hover:text-slate-300'}`}>
                  <Globe className="w-3.5 h-3.5 opacity-60" />
                  Site Configuration
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* LOWER REGION: Operator Node & Secure Disconnect */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-950/20 space-y-3">
        {!isMinimized ? (
          <div className="animate-fadeIn">
            <div className="flex flex-col gap-0.5 px-2 mb-2">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">Active Node</span>
              <span className="text-xs text-slate-400 truncate font-mono" title={adminEmail ?? ''}>
                {adminEmail}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 hover:border-red-500/20 text-xs font-bold rounded-xl transition-all duration-150"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect Console
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/10 rounded-xl transition-all flex justify-center"
            title="Disconnect Console Session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}