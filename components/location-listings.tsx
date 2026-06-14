'use client';

import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VerificationBadge } from '@/components/ui-extras';
import AdDetailModal from '@/components/ad-detail-modal';
import { getStoredAds } from '@/lib/data';

interface Ad {
  id: string;
  userId: string;
  title: string;
  category: string;
  location: string;
  description: string;
  verified: boolean;
  isPremium: boolean;
  isSponsor: boolean;
  image: string | null;
}

interface LocationListingsProps {
  ads: Ad[]; // Kept for prop-type compatibility, but ignored in favor of getStoredAds()
  properName: string;
}

export default function LocationListings({ ads: propAds, properName }: LocationListingsProps) {
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);

  useEffect(() => {
    const loadAndFilter = async () => {
      const allListings = getStoredAds() as Ad[];
      const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
      const currentSlug = (pathParts[pathParts.length - 1] || '').toLowerCase();

      let targetCity = "";
      let targetProvince = "";
      try {
        const res = await fetch("/api/slugs");
        if (res.ok) {
          const data = await res.json();
          if (data.slugs && Array.isArray(data.slugs)) {
            const matchedSlug = data.slugs.find((s: any) => s.slug === currentSlug);
            if (matchedSlug) {
              targetCity = matchedSlug.city.toLowerCase().trim();
              targetProvince = matchedSlug.province.toLowerCase().trim();
            }
          }
        }
      } catch (err) {
        console.error("Failed to load slugs in listings component", err);
      }

      const matched = allListings.filter(ad => {
        if (!ad.location) return false;
        const adLoc = ad.location.toLowerCase().trim();
        const adProv = ((ad as any).province || "").toLowerCase().trim();
        const normProper = properName.toLowerCase().trim();
        const normSlug = currentSlug.trim();
        const dashedSlug = currentSlug.replace(/-/g, ' ').toLowerCase().trim();

        if (targetCity) {
          return adLoc === targetCity || adProv === targetProvince || adLoc === normSlug;
        }

        return (
          adLoc === normProper || 
          adLoc === normSlug || 
          adLoc === dashedSlug ||
          adLoc.replace(/\s+/g, '-') === normSlug
        );
      });

      setFilteredAds(matched);
    };

    loadAndFilter();

    // Listen for admin edits, deletes, modifications on other screens
    window.addEventListener("bizsearch24_ads_updated", loadAndFilter);
    return () => {
      window.removeEventListener("bizsearch24_ads_updated", loadAndFilter);
    };
  }, [properName]);

  // Sort them so Sponsors are first, then Premiums
  const sortedAds = [...filteredAds].sort((a, b) => {
    if (a.isSponsor && !b.isSponsor) return -1;
    if (!a.isSponsor && b.isSponsor) return 1;
    if (a.isPremium && !b.isPremium) return -1;
    if (!a.isPremium && b.isPremium) return 1;
    return 0;
  });

  return (
    <div className="w-full">
      {sortedAds.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-lg mb-4">No businesses listed in this area yet.</p>
          <Link href="/dashboard" className="text-emerald-600 font-medium hover:underline">
            Be the first to list your business in {properName}!
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAds.map(ad => {
            const item = ad as any;
            const hasCustomBorder = item.isSponsor || item.isSpotlight || item.isBannerPlacement || item.isVideoPromo || item.isPremium;
            const borderClass = 
              item.isSponsor ? 'border-indigo-300 shadow-indigo-100/40 ring-1 ring-indigo-500/10' : 
              item.isSpotlight ? 'border-amber-300 shadow-amber-100/40 ring-1 ring-amber-500/10' : 
              item.isBannerPlacement ? 'border-rose-300 shadow-rose-100/40 ring-1 ring-rose-500/10' : 
              item.isVideoPromo ? 'border-cyan-300 shadow-cyan-100/40 ring-1 ring-cyan-500/10' : 
              item.isPremium ? 'border-emerald-300 shadow-emerald-100/40 ring-1 ring-emerald-500/10' : 
              'border-slate-100';

            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedAd(item)}
                className={`bg-white rounded-3xl shadow-sm border p-6 flex flex-col hover:shadow-md hover:scale-[1.01] cursor-pointer transition-all duration-300 relative overflow-hidden ${borderClass}`}
              >
                {/* Visual Header Badges */}
                {item.isSponsor && (
                  <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm animate-pulse-slow">
                    ★ Sponsor
                  </div>
                )}
                {item.isSpotlight && (
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm">
                    ★ Spotlight Deal
                  </div>
                )}
                {item.isBannerPlacement && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm">
                    Banner Placement
                  </div>
                )}
                {item.isVideoPromo && (
                  <div className="absolute top-0 right-0 bg-cyan-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm flex items-center gap-1">
                    <span>🎥 Video Promo</span>
                  </div>
                )}

                {item.image && (
                  <div className="w-full h-48 mb-4 relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                    <Image src={item.image} alt={item.title} fill referrerPolicy="no-referrer" className="object-cover object-center transform hover:scale-[1.04] transition duration-500" />
                  </div>
                )}
                <div className="flex justify-between items-start mb-3 pt-2">
                  <h3 className="font-bold text-lg text-slate-900 leading-tight tracking-tight">{item.title}</h3>
                  <VerificationBadge verified={item.verified} />
                </div>
                <div className="flex flex-wrap gap-2 mb-3 text-xs font-semibold">
                   <span className="flex items-center bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg capitalize"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400"/>{item.location}</span>
                   <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-150 truncate max-w-[150px]">{item.category}</span>
                </div>
                <p className="text-slate-500 text-sm flex-grow mb-4 line-clamp-3 leading-relaxed">{item.description}</p>
                <div className="mt-auto pt-4 border-t border-slate-100">
                  <button className={`w-full text-white py-3 rounded-xl font-bold text-sm transition-all duration-300 ${
                    item.isSponsor ? 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/10' : 
                    item.isSpotlight ? 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/10' : 
                    item.isBannerPlacement ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10' : 
                    item.isVideoPromo ? 'bg-cyan-600 hover:bg-cyan-700 shadow-md shadow-cyan-600/10' : 
                    item.isPremium ? 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/10' : 
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

      {/* Detail Modal popups */}
      <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}
