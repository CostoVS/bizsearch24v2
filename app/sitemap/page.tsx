import Link from "next/link";
import { PROVINCES, CATEGORIES } from "@/lib/data";
import { MapPin, Briefcase } from "lucide-react";

export default function SitemapPage() {
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
            {PROVINCES.map(prov => (
              <div key={prov.slug} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <Link href={`/${prov.slug}`} className="text-xl font-semibold text-slate-900 hover:text-emerald-600 mb-4 inline-block transition-colors">
                  {prov.name} Province
                </Link>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-3 gap-x-4">
                  {prov.towns.map((town, idx) => {
                    const townSlug = town.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    return (
                      <Link 
                        key={`${town}-${idx}`} 
                        href={`/${townSlug}`}
                        className="text-sm text-slate-600 hover:text-emerald-600 truncate border-l-2 border-transparent hover:border-emerald-500 pl-2 transition-all focus:outline-none focus:text-emerald-600"
                      >
                        {town}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
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
