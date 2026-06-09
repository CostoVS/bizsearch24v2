import { notFound } from "next/navigation";
import { PROVINCES, MOCK_ADS } from "@/lib/data";
import { BadgeCheck, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from 'next';
import { VerificationBadge } from "@/components/ui-extras";

type Props = {
  params: Promise<{ location: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { location } = await params;
  return {
    title: `Businesses in ${location} | BizSearch24`,
    description: `Find top rated and verified local businesses, plumbers, electricians and more in ${location}, South Africa.`,
  }
}

export default async function LocationPage({ params }: Props) {
  const { location } = await params;
  
  // Verify this location is known
  let isKnown = false;
  let properName = location;
  let type = 'Location';
  
  for (const prov of PROVINCES) {
    if (prov.slug === location.toLowerCase()) {
      isKnown = true;
      properName = prov.name;
      type = 'Province';
      break;
    }
    for (const t of prov.towns) {
      if (t.toLowerCase().replace(/\s+/g, '-') === location.toLowerCase()) {
        isKnown = true;
        properName = t;
        type = 'Town';
        break;
      }
    }
    if (isKnown) break;
  }

  if (!isKnown) {
    properName = location.charAt(0).toUpperCase() + location.slice(1);
  }

  const baseAds = MOCK_ADS.filter(ad => ad.location.toLowerCase() === properName.toLowerCase() || ad.location.toLowerCase() === location.toLowerCase());
  
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

      {adsForLocation.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg mb-4">No businesses listed in this area yet.</p>
          <Link href="/dashboard" className="text-emerald-600 font-medium hover:underline">
            Be the first to list your business in {properName}!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adsForLocation.map(ad => (
            <div key={ad.id} className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden ${ad.isSponsor ? 'border-indigo-200' : ad.isPremium ? 'border-emerald-200' : 'border-slate-200'}`}>
              {ad.isSponsor && (
                <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-800 text-[9px] font-bold uppercase px-3 py-1 rounded-bl-lg tracking-widest z-10">
                  Sponsored
                </div>
              )}
              {ad.image && (
                <div className="w-full h-48 mb-4 relative rounded-xl overflow-hidden shadow-sm">
                  <Image src={ad.image} alt={ad.title} fill referrerPolicy="no-referrer" className="object-cover object-center" />
                </div>
              )}
              <div className="flex justify-between items-start mb-3 pt-2">
                <h3 className="font-semibold text-lg text-slate-900 leading-tight">{ad.title}</h3>
                <VerificationBadge verified={ad.verified} />
              </div>
              <div className="flex space-x-2 mb-3 text-xs font-medium">
                 <span className="flex items-center bg-slate-100 text-slate-600 px-2 py-1 rounded capitalize"><MapPin className="w-3 h-3 mr-1 opacity-50"/>{ad.location}</span>
                 <span className="bg-slate-50 text-slate-500 px-2 py-1 rounded border border-slate-100 truncate">{ad.category}</span>
              </div>
              <p className="text-slate-600 text-sm flex-grow mb-4">{ad.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-100">
                <button className={`w-full text-white py-2 rounded font-medium transition ${ad.isSponsor ? 'bg-indigo-600 hover:bg-indigo-700' : ad.isPremium ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  Contact Business
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
