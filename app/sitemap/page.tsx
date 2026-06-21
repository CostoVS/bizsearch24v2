import Link from "next/link";
import { PROVINCES, CATEGORIES } from "@/lib/data";
import { getPostalCodeForTown } from "@/lib/locations";
import { MapPin, Briefcase } from "lucide-react";
import fs from "fs";
import path from "path";
import { db, initDb } from "@/lib/db";
import { storage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function SitemapPage() {
  // Load custom slugs on server-side
  let customSlugs: any[] = [];
  try {
    initDb();
    if (db) {
      const record = await db.select().from(storage).where(eq(storage.key, 'main')).limit(1);
      if (record && record.length > 0) {
        const parsed = JSON.parse(record[0].data);
        if (parsed && Array.isArray(parsed.slugs)) {
          customSlugs = parsed.slugs;
        }
      }
    }
  } catch (dbErr) {
    console.warn("DB fetch failed in sitemap page, relying on local db.json:", (dbErr as any).message);
  }

  // Fallback to local db.json if database was empty or failed
  if (customSlugs.length === 0) {
    try {
      const dbPath = path.join(process.cwd(), ".data", "db.json");
      if (fs.existsSync(dbPath)) {
        const dbFile = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        customSlugs = dbFile.slugs || [];
      }
    } catch (e) {
      console.error("Failed to load custom slugs fallback in sitemap page:", e);
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">Visual Sitemap</h1>
        <p className="text-slate-500 max-w-2xl">
          Browse all the locations and categories available on BizSearch24. We cover all 9 provinces and 244 major towns across South Africa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
            <MapPin className="mr-2 text-emerald-600" />
            Locations by Province
          </h2>
          
          <div className="space-y-10">
            {PROVINCES.map(prov => {
              const provSlugs = customSlugs.filter(
                s => s.province && (
                  slugify(s.province) === prov.slug ||
                  s.province.toLowerCase().trim() === prov.name.toLowerCase().trim() ||
                  s.province.toLowerCase().trim() === prov.slug.toLowerCase().trim()
                )
              );

              const townsMap = new Map<string, { name: string; href: string; customInfo?: any }>();
              
              prov.towns.forEach(t => {
                const staticSlug = slugify(t);
                const matchingSlug = provSlugs.find(
                  s => slugify(s.city || "") === staticSlug || 
                       slugify(s.properName || "") === staticSlug || 
                       slugify(s.slug || "") === staticSlug
                );
                
                if (matchingSlug) {
                  townsMap.set(staticSlug, {
                    name: matchingSlug.properName || matchingSlug.city || t,
                    href: `/${matchingSlug.slug}`,
                    customInfo: matchingSlug
                  });
                } else {
                  townsMap.set(staticSlug, {
                    name: t,
                    href: `/${staticSlug}`
                  });
                }
              });
              
              provSlugs.forEach(s => {
                const customKey = slugify(s.slug);
                const cityKey = slugify(s.city || "");
                const properKey = slugify(s.properName || "");
                
                const alreadyRepresented = townsMap.has(customKey) || 
                                          (cityKey && townsMap.has(cityKey)) || 
                                          (properKey && townsMap.has(properKey));
                                          
                if (!alreadyRepresented) {
                  townsMap.set(customKey, {
                    name: s.properName || s.city || s.slug,
                    href: `/${s.slug}`,
                    customInfo: s
                  });
                }
              });
              
              const combinedTowns = Array.from(townsMap.values());
              combinedTowns.sort((a, b) => a.name.localeCompare(b.name));

              return (
                <div key={prov.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                  <Link href={`/${prov.slug}`} className="text-xl font-semibold text-slate-900 hover:text-emerald-600 mb-4 inline-block transition-colors">
                    {prov.name} Province
                  </Link>
                  <div className="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-3.5 gap-x-4">
                    {combinedTowns.map((item, idx) => {
                      return (
                        <Link 
                          key={`${item.name}-${idx}`} 
                          href={item.href}
                          className="flex flex-col border-l-2 border-transparent hover:border-emerald-500 pl-2 transition-all focus:outline-none group min-w-0"
                        >
                          <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-600 transition-colors whitespace-normal break-words leading-tight">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-0.5 group-hover:text-emerald-500 transition-colors">
                            Code: {item.customInfo?.postalCode || getPostalCodeForTown(item.name)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 sticky top-28 block">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Briefcase className="mr-2 text-emerald-600" />
              All Categories
            </h2>
            <div className="flex flex-col space-y-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {CATEGORIES.map(cat => (
                <Link 
                  key={cat} 
                  href={`/directory?category=${encodeURIComponent(cat)}`}
                  className="text-sm text-slate-600 hover:text-emerald-600 py-1 transition-colors"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
