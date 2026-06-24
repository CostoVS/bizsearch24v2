import Link from "next/link";
import { PROVINCES, CATEGORIES } from "@/lib/data";
import { getPostalCodeForTown, KZN_SUBURBS, GAUTENG_SUBURBS, WESTERN_CAPE_SUBURBS, EASTERN_CAPE_SUBURBS, FREE_STATE_SUBURBS } from "@/lib/locations";
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

// Memory caching for lightning-fast loading
let cachedCustomSlugs: any[] | null = null;
let lastSlugsCacheTime = 0;
const SLUGS_CACHE_TTL = 30000; // 30 seconds caching

async function getCustomSlugsCached(): Promise<any[]> {
  const now = Date.now();
  if (cachedCustomSlugs && (now - lastSlugsCacheTime < SLUGS_CACHE_TTL)) {
    return cachedCustomSlugs;
  }

  let list: any[] = [];
  try {
    initDb();
    if (db) {
      const record = await db.select().from(storage).where(eq(storage.key, 'main')).limit(1);
      if (record && record.length > 0) {
        const parsed = JSON.parse(record[0].data);
        if (parsed && Array.isArray(parsed.slugs)) {
          list = parsed.slugs;
        }
      }
    }
  } catch (dbErr) {
    console.warn("DB fetch failed in sitemap, fallback to JSON file:", (dbErr as any).message);
  }

  if (list.length === 0) {
    try {
      const dbPath = path.join(process.cwd(), ".data", "db.json");
      if (fs.existsSync(dbPath)) {
        const dbFile = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        list = dbFile.slugs || [];
      }
    } catch (e) {
      console.error("Failed to load custom slugs fallback in sitemap page:", e);
    }
  }

  cachedCustomSlugs = list;
  lastSlugsCacheTime = now;
  return list;
}

export default async function SitemapPage() {
  // Load custom slugs on server-side using caching
  const customSlugs = await getCustomSlugsCached();

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

              const provinceSubMap = prov.slug === 'kwazulu-natal' 
                ? KZN_SUBURBS 
                : prov.slug === 'gauteng' 
                  ? GAUTENG_SUBURBS 
                  : prov.slug === 'western-cape'
                    ? WESTERN_CAPE_SUBURBS
                    : prov.slug === 'eastern-cape'
                      ? EASTERN_CAPE_SUBURBS
                      : prov.slug === 'free-state'
                        ? FREE_STATE_SUBURBS
                        : null;

              const totalSuburbs = provinceSubMap 
                ? combinedTowns.reduce((acc, townItem) => acc + (provinceSubMap[townItem.name] || []).length, 0)
                : 0;

              return (
                <div key={prov.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fade-in">
                  <Link href={`/${prov.slug}`} className="text-xl font-bold text-slate-900 hover:text-emerald-600 mb-6 inline-block transition-colors border-b-2 border-emerald-500 pb-1">
                    {prov.name} Province {provinceSubMap ? `(${combinedTowns.length} Towns, ${totalSuburbs} Suburbs)` : ''}
                  </Link>

                  {provinceSubMap ? (
                    <div className="space-y-6">
                      <p className="text-xs text-slate-500 italic mb-2">
                        Showing {prov.name} cities/towns with their respective suburbs and original postal codes. Click on any location to view local businesses.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {combinedTowns.map((townItem, idx) => {
                          const sublist = provinceSubMap[townItem.name] || [];
                          return (
                            <div key={`${townItem.name}-${idx}`} className="bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-emerald-300 hover:shadow-md transition-all duration-300">
                              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2.5">
                                <Link 
                                  href={townItem.href}
                                  className="text-sm font-bold text-slate-800 hover:text-emerald-600 transition-colors flex items-center gap-1.5"
                                >
                                  🏙️ {idx + 1}. {townItem.name} <span className="text-xs font-normal text-slate-500">({sublist.length} suburbs)</span>
                                </Link>
                                <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">
                                  Code: {townItem.customInfo?.postalCode || getPostalCodeForTown(townItem.name)}
                                </span>
                              </div>
                              {sublist.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {sublist.map((sub, sIdx) => {
                                    const subSlug = slugify(sub.name);
                                    return (
                                      <Link
                                        key={`${sub.name}-${sIdx}`}
                                        href={`/${subSlug}`}
                                        className="text-xs bg-white text-slate-700 hover:text-emerald-600 hover:border-emerald-200 px-2 py-1 rounded-lg border border-slate-150 flex items-center justify-between transition-all group min-w-0"
                                      >
                                        <span className="truncate group-hover:underline pr-1">{sub.name}</span>
                                        <span className="text-[9px] text-slate-400 font-mono flex-shrink-0 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                                          {sub.postalCode}
                                        </span>
                                      </Link>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-[10px] text-slate-400 italic">No suburbs pre-defined.</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
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
                  )}
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
