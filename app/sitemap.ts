import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.dailyharend.com'

  // Daftar halaman utama website lo yang mau di-index pertama kali
  const routes = [
    '',
    '/id',
    '/en',
    '/id/login',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  }))

  return [...routes]
}