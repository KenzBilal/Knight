import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://knight.app'

  const routes = [
    '',
    '/pricing',
    '/about',
    '/enterprise',
    '/contact',
    '/trust',
    '/security',
    '/privacy',
    '/terms',
    '/acceptable-use',
    '/ai-policy',
    '/cookie-policy',
    '/refund',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  return routes
}
