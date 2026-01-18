import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/login'], // Admin paneli arama sonuçlarında çıkmasın
    },
    sitemap: 'https://bikodvardi.com/sitemap.xml',
  }
}