'use client'

export default function AdminDashboard() {
  return (
    <main className="max-w-5xl w-full mx-auto px-8 py-10">
      {/* Header Utama */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-white">System Infrastructure Overview</h1>
        <p className="text-sm text-slate-400 mt-1">Console initialized. Access operational modules from the core pipeline sidebar navigation.</p>
      </div>

      {/* Placeholder Grid Kosong yang Rapi */}
      <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center bg-slate-900/10">
        <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">Workspace Idle // Awaiting Pipeline Data</span>
      </div>
    </main>
  )
}