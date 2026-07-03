import { MetadataRoute } from 'next';
import { SA_PROVINCES } from '@/lib/locations';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_URL || 'https://searchbiz.co.za';

  const baseRoutes = [
    '',
    '/directory',
    '/services',
    '/news',
    '/tools',
    '/premium-partners',
    '/posts',
    '/terms',
    '/qa',
    '/ai-chat',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  const provinceRoutes = SA_PROVINCES.map((province) => ({
    url: `${baseUrl}/${province.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  const townRoutes: { url: string; lastModified: Date; changeFrequency: "weekly" | "daily" | "always" | "hourly" | "monthly" | "yearly" | "never" | undefined; priority: number; }[] = [];
  SA_PROVINCES.forEach((province) => {
    province.towns.forEach((town) => {
      if (town.toLowerCase() !== 'all locations') {
        const slug = town.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
        townRoutes.push({
          url: `${baseUrl}/${slug}`,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        });
      }
    });
  });

  return [...baseRoutes, ...provinceRoutes, ...townRoutes];
}
