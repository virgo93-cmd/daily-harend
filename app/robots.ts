import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.dailyharend.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*/_next/',       // Melarang bot merayap file sistem internal Next.js
        '/api/',           // Mengamankan jalur API routing lo dari spam bot
        '/*/login',        // Halaman login gak perlu masuk index pencarian Google
        '/*/dashboard',    // Mengamankan halaman internal user/admin jika ada
      ],
    },
    // Menunjukkan jalan lurus ke file sitemap dinamis yang baru lo bikin
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}