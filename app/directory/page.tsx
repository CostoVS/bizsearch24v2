"use client";

import { useSearchParams } from 'next/navigation';
import { getStoredAds } from '@/lib/data';
import { BadgeCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchBar } from '@/components/search-bar';
import { Suspense, useState, useEffect } from 'react';
import { VerificationBadge } from '@/components/ui-extras';
import AdDetailModal from '@/components/ad-detail-modal';

function DirectoryContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q')?.toLowerCase() || '';
  const category = searchParams.get('category')?.toLowerCase() || '';
  const town = searchParams.get('town')?.toLowerCase() || '';
  const province = searchParams.get('province')?.toLowerCase() || '';

  const [allAds, setAllAds] = useState<any[]>([]);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  useEffect(() => {
    setAllAds(getStoredAds());

    const handleUpdate = () => {
      setAllAds(getStoredAds());
    };
    window.addEventListener("bizsearch24_ads_updated", handleUpdate);
    return () => {
      window.removeEventListener("bizsearch24_ads_updated", handleUpdate);
    };
  }, []);

  const filteredResults = allAds.filter(ad => {
    let match = true;
    if (q && !ad.title.toLowerCase().includes(q) && !ad.description.toLowerCase().includes(q)) match = false;
    if (category && ad.category.toLowerCase() !== category) match = false;
    
    // We only have strict location at the moment mapped to 'ad.location' which maps to town or full string.
    // In a real app we'd map ad to a specific town, and check if that town belongs to the province.
    if (town && ad.location.toLowerCase() !== town.toLowerCase()) match = false;
    
    return match;
  });

  const results = [...filteredResults].sort((a, b) => {
    if (a.isSponsor && !b.isSponsor) return -1;
    if (!a.isSponsor && b.isSponsor) return 1;
    
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;

    return 0;
  });

  return (
    <div className="w-full max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-4">Search Results</h1>
        <div className="w-full max-w-5xl">
            <SearchBar />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-slate-500 font-medium">Found {results.length} businesses matching your criteria.</p>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg mb-4">No businesses found matching your criteria.</p>
          <Link href="/dashboard" className="text-emerald-600 font-medium hover:underline">
            Be the first to list a business for this search!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(ad => (
            <div 
              key={ad.id} 
              onClick={() => setSelectedAd(ad)}
              className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col hover:shadow-md cursor-pointer transition-shadow relative overflow-hidden ${ad.isSponsor ? 'border-indigo-200' : ad.isPremium ? 'border-emerald-200' : 'border-slate-200'}`}
            >
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
              <p className="text-slate-600 text-sm flex-grow mb-4 line-clamp-3">{ad.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-100">
                <button className={`w-full text-white py-2 rounded font-medium transition ${ad.isSponsor ? 'bg-indigo-600 hover:bg-indigo-700' : ad.isPremium ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  View Details & Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ad Detail popup showing on trigger */}
      <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading Directory...</div>}>
      <DirectoryContent />
    </Suspense>
  )
}
