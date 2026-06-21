import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Daftar kluster bahasa utama yang kita siapkan foldernya untuk target Meta Ads
const supportedLocales = ['en', 'id', 'es', 'fr', 'de', 'ja', 'zh', 'ar']
const defaultLocale = 'en' // Universal Fallback: otomatis ke Inggris jika bahasa negara user belum terdaftar

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language')
  if (!acceptLanguage) return defaultLocale

  // Mengambil kode bahasa utama dari browser (misal: "fr-CH" -> "fr", "es-ES" -> "es")
  const detectedLang = acceptLanguage.split(',')[0].split('-')[0].toLowerCase()

  if (supportedLocales.includes(detectedLang)) {
    return detectedLang
  }

  return defaultLocale
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. KECUALIKAN ASET STATIS & API INTERNAL
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') || 
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next()
  }

  // 2. INITIALIZE INTEL RESPONSE & SUPABASE AUTH CLIENT
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // 3. PROTEKSI PANEL GERBANG ADMIN
  if (pathname.startsWith('/admin/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return response
  }

  if (pathname.startsWith('/admin')) {
    return response
  }

  // 4. AUTOMATED UNIVERSAL LOCALIZATION ROUTING
  // Cek apakah URL sudah membawa salah satu kode bahasa dari supportedLocales
  const pathnameHasLocale = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (pathnameHasLocale) {
    return response
  }

  // Jika tidak ada prefix bahasa di URL, tangkap bahasa browser mereka atau lempar ke default global (en)
  const locale = getLocale(request)
  request.nextUrl.pathname = `/${locale}${pathname}`
  
  const rewriteResponse = NextResponse.rewrite(request.nextUrl)
  
  // Amankan sinkronisasi session cookie Supabase ke dalam response baru
  response.cookies.getAll().forEach((cookie) => {
    rewriteResponse.cookies.set(cookie.name, cookie.value)
  })

  return rewriteResponse
}

export const config = {
  matcher: [
    '/((?!_next|api|assets).*)',
  ],
}