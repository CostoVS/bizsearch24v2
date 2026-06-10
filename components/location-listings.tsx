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
    const loadAndFilter = () => {
      const allListings = getStoredAds() as Ad[];
      const pathParts = typeof window !== 'undefined' ? window.location.pathname.split('/').filter(Boolean) : [];
      const currentSlug = pathParts[pathParts.length - 1] || '';

      const matched = allListings.filter(ad => {
        if (!ad.location) return false;
        const adLoc = ad.location.toLowerCase();
        const normProper = properName.toLowerCase();
        const normSlug = currentSlug.toLowerCase();
        const dashedSlug = currentSlug.replace(/-/g, ' ').toLowerCase();

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
          {sortedAds.map(ad => (
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

      {/* Detail Modal popups */}
      <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}
