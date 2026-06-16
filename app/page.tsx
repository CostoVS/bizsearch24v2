'use client';

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { PROVINCES, CATEGORIES, getStoredAds } from "@/lib/data";
import { Search, MapPin, BadgeCheck, Star, Briefcase, Zap, Sparkles } from "lucide-react";

import { SearchBar } from "@/components/search-bar";
import { VerificationBadge } from "@/components/ui-extras";
import AdDetailModal from "@/components/ad-detail-modal";

export default function HomePage() {
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [ads, setAds] = useState<any[]>([]);

  useEffect(() => {
    // Fetch ads from server first to ensure public visibility across sessions
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/storage');
        if (response.ok) {
          const data = await response.json();
          if (data.ads && Array.isArray(data.ads)) {
            // Update local storage so other components stay synced
            localStorage.setItem("bizsearch24_all_ads", JSON.stringify(data.ads));
            setAds(data.ads.filter((a: any) => a.isActive !== false));
          }
        } else {
          // Fallback to local storage if API fails
          setAds(getStoredAds().filter((a: any) => a.isActive !== false));
        }
      } catch (err) {
        console.error("Failed to fetch ads from server", err);
        setAds(getStoredAds().filter((a: any) => a.isActive !== false));
      }
    };

    fetchAds();

    // Listen for global edits across components
    const handleUpdate = () => {
      setAds(getStoredAds().filter((a: any) => a.isActive !== false));
    };
    window.addEventListener("bizsearch24_ads_updated", handleUpdate);
    return () => {
      window.removeEventListener("bizsearch24_ads_updated", handleUpdate);
    };
  }, []);

  const sponsoredAds = ads.filter(ad => ad.isSponsor);
  const premiumAds = ads.filter(ad => ad.isPremium && !ad.isSponsor);
  const freeAds = ads.filter(ad => !ad.isPremium && !ad.isSponsor);

  return (
    <div className="flex flex-col w-full bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-[#052e22] text-white rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Background decorative blob */}
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#0a4233] rounded-full blur-3xl opacity-60"></div>
            
            <div className="relative z-10 max-w-2xl mx-auto md:mx-0 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-emerald-900/50 text-emerald-400 font-medium px-4 py-2 rounded-full text-xs sm:text-sm mb-6 border border-emerald-800/50">
                <Sparkles className="w-4 h-4" />
                <span>South Africa Directory</span>
              </div>
              
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-display font-bold tracking-tight leading-tight sm:leading-[1.05] mb-6">
                Find Verified Local <br className="hidden sm:block" />
                Businesses <span className="text-emerald-400">in</span> <br />
                <span className="text-emerald-400">South Africa</span>
              </h1>
              
              <p className="text-sm sm:text-lg text-slate-300 mb-8 sm:mb-12 max-w-lg mx-auto md:mx-0 font-light leading-relaxed">
                Easily search for verified local services, shops, and professionals near you.
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 sm:gap-12 mb-10 border-b border-emerald-900/60 pb-10">
                <div>
                  <div className="text-3xl sm:text-4xl font-display font-bold text-white mb-1">{ads.length}</div>
                  <div className="text-[10px] sm:text-xs tracking-widest text-slate-400 uppercase font-semibold">Companies</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-emerald-950/40"></div>
                <div>
                  <div className="text-3xl sm:text-4xl font-display font-bold text-emerald-400 mb-1">{ads.filter(a => a.verified).length}</div>
                  <div className="text-[10px] sm:text-xs tracking-widest text-slate-400 uppercase font-semibold">Approved & Active</div>
                </div>
              </div>
              
            </div>
          </div>
          
          {/* Search Bar Float */}
          <div className="max-w-5xl mx-auto -mt-6 relative z-20 px-4">
            <SearchBar />
          </div>
        </div>

      {/* Sponsored Ads Section */}
      {sponsoredAds.length > 0 && (
        <section className="w-full bg-indigo-50 py-16 px-4 sm:px-6 lg:px-8 border-b border-indigo-100">
          <div className="max-w-7xl mx-auto">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {sponsoredAds.map(ad => (
                <div 
                  key={ad.id} 
                  onClick={() => setSelectedAd(ad)}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-indigo-200 flex flex-col hover:shadow-lg hover:border-indigo-400 transition-all duration-300 group cursor-pointer relative overflow-hidden text-slate-800"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 z-0"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-xl text-slate-900">{ad.title}</h3>
                      <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 bg-indigo-100 px-3 py-1.5 rounded-full border border-indigo-200 flex items-center gap-1">
                          <motion.span
                            animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                            className="inline-block"
                          >
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 saturate-150 drop-shadow-[0_0_4px_rgba(245,158,11,0.6)]" />
                          </motion.span>
                          Sponsored
                        </span>
                        <VerificationBadge verified={ad.verified} />
                      </div>
                    </div>
                    {ad.image && (
                      <div className="w-full h-48 mb-4 relative rounded-2xl overflow-hidden shadow-sm">
                        <Image src={ad.image} alt={ad.title} fill referrerPolicy="no-referrer" className="object-cover group-hover:scale-[1.02] transition duration-500" />
                      </div>
                    )}
                    <div className="flex space-x-3 mb-4 text-xs font-semibold">
                      <span className="flex items-center text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl capitalize"><MapPin className="w-3.5 h-3.5 mr-1 text-slate-400"/> {ad.location}</span>
                      <span className="flex items-center text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-xl truncate"><Briefcase className="w-3.5 h-3.5 mr-1 text-indigo-405"/> {ad.category}</span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mt-auto">{ad.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Premium Ads Section */}
      {premiumAds.length > 0 && (
        <section className="w-full max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold font-display text-slate-900 mb-8 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-emerald-600" /> Verified Premium Placements
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumAds.map(ad => {
                const isSpotlight = ad.isSpotlight;
                const isBanner = ad.isBannerPlacement;
                const isVideo = ad.isVideoPromo;

                const borderClass = 
                  isSpotlight ? 'border-amber-300 hover:border-amber-500 shadow-amber-100/40' : 
                  isBanner ? 'border-rose-300 hover:border-rose-500 shadow-rose-100/40' : 
                  isVideo ? 'border-cyan-300 hover:border-cyan-500 shadow-cyan-100/40' : 
                  'border-slate-200 hover:border-emerald-300';

                const badgeClass = 
                  isSpotlight ? 'bg-amber-500 text-white' : 
                  isBanner ? 'bg-rose-500 text-white' : 
                  isVideo ? 'bg-cyan-600 text-white' : 
                  'bg-emerald-600 text-white';

                const badgeText = 
                  isSpotlight ? '★ Spotlight' : 
                  isBanner ? '★ Banner Header' : 
                  isVideo ? '🎥 Video Promo' : 
                  'Premium Listing';

                return (
                  <div 
                    key={ad.id} 
                    onClick={() => setSelectedAd(ad)}
                    className={`bg-white rounded-3xl p-6 shadow-sm border ${borderClass} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer overflow-hidden group relative text-slate-800`}
                  >
                    <div className={`absolute top-0 right-0 ${badgeClass} text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider z-10 shadow-sm`}>
                      {badgeText}
                    </div>

                    {ad.image && (
                      <div className="w-full h-40 mb-4 relative rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                        <Image src={ad.image} alt={ad.title} fill referrerPolicy="no-referrer" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-3 pt-2">
                      <h3 className="font-bold text-lg text-slate-900 leading-snug tracking-tight">{ad.title}</h3>
                      <VerificationBadge verified={ad.verified} />
                    </div>
                    <div className="flex space-x-2 mb-3 text-xs font-semibold">
                      <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg capitalize flex items-center"><MapPin className="w-3 h-3 mr-1 opacity-50"/>{ad.location}</span>
                      <span className="bg-slate-50 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-150 truncate max-w-[150px]">{ad.category}</span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed mt-auto">{ad.description}</p>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Free Ads Section */}
      {freeAds.length > 0 && (
        <section className="w-full bg-slate-100/50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold font-display text-slate-800 mb-8">Recent Listings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {freeAds.map(ad => (
                <div 
                  key={ad.id} 
                  onClick={() => setSelectedAd(ad)}
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer overflow-hidden group text-slate-800"
                >
                  {ad.image && (
                    <div className="w-full h-32 mb-3 relative rounded-xl overflow-hidden shadow-sm bg-slate-100">
                      <Image src={ad.image} alt={ad.title} fill referrerPolicy="no-referrer" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2 pt-1">
                    <h3 className="font-bold text-base text-slate-900 leading-snug truncate pr-2">{ad.title}</h3>
                    <VerificationBadge verified={ad.verified} />
                  </div>
                  <div className="flex space-x-2 mb-2 text-xs font-medium">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg capitalize flex items-center"><MapPin className="w-3 h-3 mr-1 opacity-50"/>{ad.location}</span>
                    <span className="bg-slate-50 text-slate-500 px-2 py-0.5 rounded-lg border border-slate-100 truncate">{ad.category}</span>
                  </div>
                  <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mt-auto">{ad.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Ad Detail Modal popup when any ad listing is active */}
      <AdDetailModal ad={selectedAd} onClose={() => setSelectedAd(null)} />
    </div>
  );
}

