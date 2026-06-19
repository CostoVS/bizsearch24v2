import { notFound } from "next/navigation";
import { PROVINCES, MOCK_ADS } from "@/lib/data";
import { BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from 'next';
import { VerificationBadge } from "@/components/ui-extras";
import LocationListings from "@/components/location-listings";
import fs from "fs";
import path from "path";
import { db, initDb } from "@/lib/db";
import { storage } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

type Props = {
  params: Promise<{ location: string }>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  const targetSlug = slugify(location);

  // Load Custom Slugs from server-side JSON store
  let customSlugMatch: any = null;
  try {
    const dbPath = path.join(process.cwd(), ".data", "db.json");
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      const list = db.slugs || [];
      customSlugMatch = list.find(
        (s: any) => s.slug === targetSlug || s.slug === location.toLowerCase().trim()
      );
    }
  } catch (e) {
    console.error("Failed to load custom slugs in generateMetadata:", e);
  }

  if (customSlugMatch && customSlugMatch.seoTitle) {
    return {
      title: customSlugMatch.seoTitle,
      description: customSlugMatch.seoDescription || `Find top rated local services in ${customSlugMatch.city}, South Africa.`,
      keywords: customSlugMatch.seoKeywords || undefined,
      other: customSlugMatch.seoGeoRegion ? {
        "geo.region": customSlugMatch.seoGeoRegion
      } : undefined
    };
  }

  // Capitalize nicely for display
  const displayName = location.split(/[-_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return {
    title: `Businesses in ${displayName} | BizSearch24`,
    description: `Find top rated and verified local businesses, plumbers, electricians and more in ${displayName}, South Africa.`,
  }
}

export default async function LocationPage({ params }: Props) {
  const { location } = await params;
  const targetSlug = slugify(location);
  
  // Verify this location is known
  let isKnown = false;
  let properName = location;
  let type = 'Location';
  
  // Load Custom Slugs from server-side JSON store
  let customSlugsList: any[] = [];
  let customSlugMatch: any = null;
  try {
    const dbPath = path.join(process.cwd(), ".data", "db.json");
    if (fs.existsSync(dbPath)) {
      const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
      customSlugsList = db.slugs || [];
    }
    customSlugMatch = customSlugsList.find(
      (s: any) => s.slug === targetSlug || s.slug === location.toLowerCase().trim()
    );
  } catch (e) {
    console.error("Failed to load custom slugs in location page:", e);
  }

  if (customSlugMatch) {
    isKnown = true;
    properName = customSlugMatch.properName || customSlugMatch.city;
    type = 'Custom Slug';
  } else {
    for (const prov of PROVINCES) {
      if (prov.slug === targetSlug || slugify(prov.name) === targetSlug) {
        isKnown = true;
        properName = prov.name;
        type = 'Province';
        break;
      }
      for (const t of prov.towns) {
        if (slugify(t) === targetSlug) {
          isKnown = true;
          properName = t;
          type = 'Town';
          break;
        }
      }
      if (isKnown) break;
    }
  }

  if (!isKnown) {
    properName = location.split(/[-_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  // Load ads from server-side JSON store
  let allStoredAds: any[] = [];
  try {
    initDb();
    if (db) {
      const record = await db.select().from(storage).where(eq(storage.key, 'main')).limit(1);
      if (record && record.length > 0) {
        const parsed = JSON.parse(record[0].data);
        if (parsed && Array.isArray(parsed.ads)) {
          allStoredAds = parsed.ads;
        }
      }
    }
  } catch (dbErr) {
    console.warn("DB fetch failed in location page, relying on local db.json:", (dbErr as any).message);
  }

  // Fallback to local db.json file if empty or DB was disconnected
  if (allStoredAds.length === 0) {
    try {
      const dbPath = path.join(process.cwd(), ".data", "db.json");
      if (fs.existsSync(dbPath)) {
        const dbFile = JSON.parse(fs.readFileSync(dbPath, "utf-8"));
        allStoredAds = dbFile.ads || [];
      }
    } catch (e) {
      console.error("Failed to load fallback ads in location page:", e);
    }
  }

  const baseAds = [...MOCK_ADS, ...allStoredAds].filter(ad => {
    if (customSlugMatch) {
      const matchCity = customSlugMatch.city.toLowerCase().trim();
      const matchProv = customSlugMatch.province.toLowerCase().trim();
      const adLoc = ad.location.toLowerCase().trim();
      const adProv = ((ad as any).province || '').toLowerCase().trim();
      return adLoc === matchCity || adProv === matchProv || adLoc === targetSlug;
    }
    return (
      slugify(ad.location) === targetSlug || 
      ad.location.toLowerCase() === properName.toLowerCase() || 
      ad.location.toLowerCase() === location.toLowerCase()
    );
  });
  
  const adsForLocation = [...baseAds].filter(a => a.isActive !== false).sort((a, b) => {
    if (a.isSponsor && !b.isSponsor) return -1;
    if (!a.isSponsor && b.isSponsor) return 1;
    
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;

    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4 text-center sm:text-left">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center justify-center sm:justify-start">
            <MapPin className="mr-3 text-emerald-600" />
            {customSlugMatch?.seoMainHeading || `Businesses in ${properName}`}
          </h1>
          <p className="text-slate-550 mt-2 font-medium">
            {customSlugMatch?.seoContentSnippet || `Showing results for ${properName}, South Africa`}
          </p>
        </div>
        <Link href="/dashboard" className="bg-emerald-600 text-white px-6 py-2.5 shadow-sm rounded-xl font-medium hover:bg-emerald-700 transition w-full sm:w-auto text-center font-bold">
          Post an Ad Here
        </Link>
      </div>

      <LocationListings ads={adsForLocation} properName={properName} />
    </div>
  );
}
