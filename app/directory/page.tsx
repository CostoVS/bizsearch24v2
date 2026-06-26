"use client";

import { useSearchParams } from 'next/navigation';
import { getStoredAds, saveStoredAds, deleteAd, sortAdsWithPositions, safeLocalStorage, fetchAndStoreAds } from '@/lib/data';
import { BadgeCheck, MapPin, Star, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { motion } from 'motion/react';
import Link from 'next/link';
import Image from 'next/image';
import { SearchBar } from '@/components/search-bar';
import { Suspense, useState, useEffect } from 'react';
import { VerificationBadge, PremiumBadge } from '@/components/ui-extras';
import AdDetailModal from '@/components/ad-detail-modal';
import { AdDescription } from '@/components/ad-description';

function DirectoryContent() {
  const { isAdmin } = useAuth();
  const searchParams = useSearchParams();
  const q = searchParams?.get('q')?.toLowerCase() || '';
  const category = searchParams?.get('category')?.toLowerCase() || '';
  const town = searchParams?.get('town')?.toLowerCase() || '';
  const province = searchParams?.get('province')?.toLowerCase() || '';
  const suburb = searchParams?.get('suburb')?.toLowerCase() || '';

  const [allAds, setAllAds] = useState<any[]>([]);
  const [selectedAd, setSelectedAd] = useState<any | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAllAds(getStoredAds().filter((a: any) => a.isActive !== false));

    // Force a fresh fetch from server immediately on mount to solve sync lag
    fetchAndStoreAds().then(freshAds => {
      if (freshAds) {
        setAllAds(freshAds.filter((a: any) => a.isActive !== false));
      }
    });

    const handleUpdate = () => {
      setAllAds(getStoredAds().filter((a: any) => a.isActive !== false));
    };
    window.addEventListener("bizsearch24_ads_updated", handleUpdate);
    return () => {
      window.removeEventListener("bizsearch24_ads_updated", handleUpdate);
    };
  }, []);

  const filteredResults = allAds.filter(ad => {
    let match = true;
    if (q && !ad.title.toLowerCase().includes(q) && !ad.description.toLowerCase().includes(q)) match = false;
    
    // Admin Override: "All Categories" ads should show in any category search
    if (category && ad.category.toLowerCase() !== category && ad.category.toLowerCase() !== "all categories") match = false;
    
    // We only have strict location at the moment mapped to 'ad.location' which maps to town or full string.
    // Admin Override: "All Locations" and "national" province ads should show in any town/location search
    const adLoc = ad.location?.toLowerCase().trim() || "";
    const adProv = (ad.province || "").toLowerCase().trim();
    const isGlobalLocation = adLoc === "all locations" || adLoc === "all-locations" || adProv === "national";

    if (province && ad.province?.toLowerCase() !== province && !isGlobalLocation) match = false;

    if (town && ad.location.toLowerCase() !== town.toLowerCase() && !isGlobalLocation) match = false;
    
    if (suburb) {
      const adSuburb = (ad.suburb || '').toLowerCase().trim();
      const adDesc = (ad.description || '').toLowerCase().trim();
      const targetSub = suburb.toLowerCase().trim();
      if (!isGlobalLocation && adSuburb !== targetSub && !adLoc.includes(targetSub) && !adDesc.includes(targetSub)) {
        match = false;
      }
    }
    
    return match;
  });

  const results = sortAdsWithPositions(filteredResults);

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
        <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg mb-4">No businesses found matching your criteria.</p>
          <Link href="/dashboard" className="text-emerald-600 font-medium hover:underline">
            Be the first to list a business for this search!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(ad => {
            const hasCustomBorder = ad.isSponsor || ad.isSpotlight || ad.isBannerPlacement || ad.isVideoPromo || ad.isPremium;
            const borderClass = 
              ad.isSponsor ? 'border-indigo-300 shadow-indigo-100/40 ring-1 ring-indigo-500/10' : 
              ad.isSpotlight ? 'border-amber-300 shadow-amber-100/40 ring-1 ring-amber-500/10' : 
              ad.isBannerPlacement ? 'border-rose-300 shadow-rose-100/40 ring-1 ring-rose-500/10' : 
              ad.isVideoPromo ? 'border-cyan-300 shadow-cyan-100/40 ring-1 ring-cyan-500/10' : 
              ad.isPremium ? 'border-emerald-300 shadow-emerald-100/40 ring-1 ring-emerald-500/10' : 
              'border-slate-100';

            return (
              <div 
                key={ad.id} 
                onClick={() => setSelectedAd(ad)}
                className={`bg-white rounded-3xl shadow-sm border p-6 flex flex-col hover:shadow-md hover:scale-[1.01] cursor-pointer transition-all duration-300 relative overflow-hidden ${borderClass}`}
              >
                {/* Visual Header Badges */}
                {ad.isSponsor && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm flex items-center gap-1">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className="inline-block"
                    >
                      <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 saturate-150 drop-shadow-[0_0_2px_rgba(251,191,36,0.8)]" />
                    </motion.span>
                    Sponsor
                  </div>
                )}
                {ad.isSpotlight && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm">
                    ★ Spotlight Deal
                  </div>
                )}
                {ad.isBannerPlacement && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm">
                    Banner Placement
                  </div>
                )}
                {ad.isVideoPromo && (
                  <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm flex items-center gap-1">
                    <span>🎥 Video Promo</span>
                  </div>
                )}

                {ad.image && (
                  <div className="w-full h-48 mb-4 relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                    <Image src={ad.image} alt={ad.title} fill referrerPolicy="no-referrer" className="object-cover object-center transform hover:scale-[1.04] transition duration-500" />
                  </div>
                )}
                <div className="flex flex-col gap-2 mb-3 pt-2">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight tracking-tight flex-1 min-w-0">{ad.title}</h3>
                  <div className="flex flex-wrap gap-1.5 justify-start items-center">
                    <PremiumBadge isPremium={ad.isPremium} />
                    <VerificationBadge verified={ad.verified} isGoogleImport={ad.isGoogleImport || ad.id?.startsWith('csv-') || ad.id?.startsWith('csv_')} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-3 text-xs font-semibold">
                   <span className="flex items-center bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg capitalize"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400"/>{ad.location}</span>
                   <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-150 truncate max-w-[150px]">{ad.category}</span>
                </div>
                <AdDescription description={ad.description} className="text-slate-500 text-sm flex-grow mb-4 line-clamp-3 leading-relaxed" />
                {isAdmin && (
                  <div className="flex gap-2 mb-3 pt-2 border-t border-rose-100 relative z-20" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setSelectedAd(ad)} 
                      className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase py-2 px-3 rounded-xl border border-emerald-200 transition-all flex items-center justify-center gap-1"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`ADMIN ACTIONS WARNING: Are you sure you want to PERMANENTLY REMOVE AND PURGE "${ad.title}"?`)) {
                          deleteAd(ad.id);
                          alert("Modified successfully. PURGED.");
                        }
                      }} 
                      className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-black uppercase py-2 px-3 rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                )}
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button className={`w-full text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    ad.isSponsor ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10' : 
                    ad.isSpotlight ? 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/10' : 
                    ad.isBannerPlacement ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10' : 
                    ad.isVideoPromo ? 'bg-cyan-600 hover:bg-cyan-700 shadow-md shadow-cyan-600/10' : 
                    ad.isPremium ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/10' : 
                    'bg-slate-900 hover:bg-slate-800'
                  }`}>
                    View Details & Contact
                  </button>
                </div>
              </div>
            );
          })}
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
