import { notFound } from "next/navigation";
import { PROVINCES, MOCK_ADS } from "@/lib/data";
import { BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from 'next';
import { VerificationBadge } from "@/components/ui-extras";
import LocationListings from "@/components/location-listings";

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

  if (!isKnown) {
    properName = location.split(/[-_]+/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  const baseAds = MOCK_ADS.filter(ad => 
    slugify(ad.location) === targetSlug || 
    ad.location.toLowerCase() === properName.toLowerCase() || 
    ad.location.toLowerCase() === location.toLowerCase()
  );
  
  const adsForLocation = [...baseAds].sort((a, b) => {
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
            Businesses in {properName}
          </h1>
          <p className="text-slate-500 mt-2">Showing results for {properName}, South Africa</p>
        </div>
        <Link href="/dashboard" className="bg-emerald-600 text-white px-6 py-2.5 shadow-sm rounded-xl font-medium hover:bg-emerald-700 transition w-full sm:w-auto text-center">
          Post an Ad Here
        </Link>
      </div>

      <LocationListings ads={adsForLocation} properName={properName} />
    </div>
  );
}
