import { NextResponse } from 'next/server';
import { SA_PROVINCES } from '@/lib/locations';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.APP_URL || 'https://bizsearch24.co.za';
  
  // Hardcoded static pages
  const staticPages = [
    '',
    '/login',
    '/create-ad',
    '/dashboard',
    '/terms',
    '/premium',
    '/tools',
    '/news',
  ];

  const sitemapEntries = [
    ...staticPages.map(page => `
      <url>
        <loc>${baseUrl}${page}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>${page === '' ? '1.0' : '0.8'}</priority>
      </url>
    `),
    ...SA_PROVINCES.map(prov => `
      <url>
        <loc>${baseUrl}/${prov.slug}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>
    `),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${sitemapEntries.join('')}
    </urlset>
  `;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
