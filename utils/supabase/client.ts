import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Membaca env langsung di dalam fungsi saat fungsi ini dieksekusi, bukan di luar scope global
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}