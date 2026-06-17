"use client";

import React, { useState, useEffect } from "react";
import { 
  getStoredAds, getStoredBanners, getStoredMessages, Ad, Banner, Message,
  SA_PROVINCES, CATEGORIES 
} from "@/lib/data";
import { Nav } from "@/components/nav";
import AdDetailModal from "@/components/ad-detail-modal";
import { 
  Building2, Search, MapPin, Tag, ArrowRight, ShieldCheck, 
  HelpCircle, Sparkles, Filter, Database, Calendar, PlusCircle
} from "lucide-react";

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Search parameters
  const [queryTerm, setQueryTerm] = useState("");
  const [provinceFilter, setProvinceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [selectedAdForModal, setSelectedAdForModal] = useState<Ad | null>(null);

  // Load state on mount and keep sync
  const loadDatabase = () => {
    setAds(getStoredAds());
    setBanners(getStoredBanners());
    setMessages(getStoredMessages());
  };

  useEffect(() => {
    loadDatabase();
    // Refresh interval for instant real-time simulated client-admin chats
    const checkTimer = setInterval(loadDatabase, 3000);
    return () => clearInterval(checkTimer);
  }, []);

  // Filter listings based on multi-dimensional search
  const filteredListings = ads.filter(ad => {
    if (!ad.isActive) return false;

    // Search query matches title, description, contact, or services
    if (queryTerm.trim()) {
      const q = queryTerm.toLowerCase();
      const textMatch = 
        (ad.title || "").toLowerCase().includes(q) ||
        (ad.description || "").toLowerCase().includes(q) ||
        (ad.servicesOffered || "").toLowerCase().includes(q) ||
        (ad.phone || "").toLowerCase().includes(q);
      if (!textMatch) return false;
    }

    // Province Match
    if (provinceFilter !== "all") {
      if ((ad.location || "").toLowerCase() !== provinceFilter.toLowerCase()) {
        return false;
      }
    }

    // City Name Match (matches in address or description text)
    if (cityFilter.trim()) {
      const city = cityFilter.toLowerCase();
      const cityMatch = 
        (ad.address || "").toLowerCase().includes(city) ||
        (ad.title || "").toLowerCase().includes(city);
      if (!cityMatch) return false;
    }

    // Category Match
    if (categoryFilter !== "all") {
      if ((ad.category || "").toLowerCase() !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  const activeBanner = banners.find(b => b.isActive);
  const unreadCount = messages.filter(m => !m.isChecked).length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans overflow-x-hidden w-full" id="directory-page-wrapper">
      <Nav statsCount={ads.length} unreadMessages={unreadCount} />

      {/* Global Notice Banner */}
      {activeBanner && (
        <div className="bg-emerald-50 text-emerald-800 text-xs font-bold px-6 py-2.5 text-center border-b border-emerald-100 flex items-center justify-center gap-1.5 shrink-0" id="site-active-banner">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>{activeBanner.text}</span>
        </div>
      )}

      {/* Hero Header Presentation */}
      <section className="bg-slate-900 text-white py-12 px-4 shadow-xl relative overflow-hidden" id="hero-brand-section">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#0f766e,transparent)] opacity-40" />
        <div className="absolute inset-y-0 right-0 w-1/3 bg-[radial-gradient(circle_at_70%_80%,#312e81,transparent)] opacity-40 hidden md:block" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <span className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-[10px] tracking-widest px-3 py-1.5 rounded-full uppercase">
            <Database className="w-3 h-3 text-emerald-500 animate-pulse" /> South African Verified Trades Index
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Connecting local clients with verified tradesmen across South Africa.
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto font-medium">
            Alpha directory seeding from bulk CSV files. Clean claims processes undergo real-time security malware scans and clarity-contrast formatting.
          </p>

          {/* Statistics Grid */}
          <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-4 text-center">
            <div className="bg-slate-800/60 border border-slate-700/60 py-2.5 rounded-xl">
              <span className="block text-lg font-black text-white">{ads.length}</span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Ads</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 py-2.5 rounded-xl">
              <span className="block text-lg font-black text-amber-400">
                {ads.filter(a => !a.isClaimed).length}
              </span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Unclaimed</span>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 py-2.5 rounded-xl">
              <span className="block text-lg font-black text-emerald-400">
                {ads.filter(a => a.isClaimed).length}
              </span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Verified Owners</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Search Deck / Filters */}
      <section className="relative z-20 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 -mt-6" id="directory-filter-section">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-5 space-y-4">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-emerald-500" />
              <span>Multi-Dimensional Search Engine Directory</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400 font-mono">
              Displaying {filteredListings.length} matching trades
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Search Term Input */}
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Solar, Plumbing, GC..."
                  value={queryTerm}
                  onChange={(e) => setQueryTerm(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 rounded-2xl pl-9 pr-3 py-3 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                />
              </div>
            </div>

            {/* Province Choice dropdown */}
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Province (South Africa)</label>
              <select
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 rounded-2xl px-3.5 py-3 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold cursor-pointer"
              >
                <option value="all">All Provinces (National)</option>
                {SA_PROVINCES.map(prov => (
                  <option key={prov.slug} value={prov.slug}>{prov.name}</option>
                ))}
              </select>
            </div>

            {/* Specific Town / City text */}
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Filter by City or Town name</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Johannesburg, Durban North..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 rounded-2xl pl-9 pr-3 py-3 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                />
              </div>
            </div>

            {/* Service Category Selection */}
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Service Categories</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 rounded-2xl px-3.5 py-3 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold cursor-pointer"
              >
                <option value="all">All Service Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filter Info Alert */}
          {(queryTerm || provinceFilter !== "all" || cityFilter || categoryFilter !== "all") && (
            <div className="bg-indigo-50 text-indigo-800 px-4 py-2.5 rounded-xl border border-indigo-150 flex items-center justify-between text-xs">
              <span>Active filters in use. Showing <strong>{filteredListings.length}</strong> matching results.</span>
              <button
                onClick={() => {
                  setQueryTerm("");
                  setProvinceFilter("all");
                  setCityFilter("");
                  setCategoryFilter("all");
                }}
                className="text-xs font-bold text-indigo-700 border-b border-indigo-700 hover:text-indigo-900"
              >
                Clear Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Listings Visual Feed */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full" id="public-directories-grid">
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
              A-Z Business Listings Catalog
            </h2>
          </div>

          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
              <HelpCircle className="w-12 h-12 text-slate-400 mx-auto animate-pulse" />
              <h4 className="text-base font-extrabold text-slate-900">No Listings Found</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                No active records matched your multi-dimensional query parameters. Clear your current search filters or type alternative keywords.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredListings.map(ad => (
                <div 
                  key={ad.id} 
                  id={`public-ad-card-${ad.id}`}
                  onClick={() => setSelectedAdForModal(ad)}
                  className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:scale-[1.01] hover:border-slate-300 cursor-pointer ${
                    ad.isSponsor ? "ring-2 ring-indigo-500 ring-offset-2" : ad.isPremium ? "border-emerald-500" : ""
                  }`}
                >
                  
                  {/* Card Visual Header */}
                  <div>
                    <div className="w-full h-44 bg-slate-100 relative overflow-hidden">
                      <img 
                        src={ad.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=450&auto=format&fit=crop"} 
                        className="w-full h-full object-cover" 
                        alt={ad.title} 
                      />
                      
                      {/* Badge Layers */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                        {ad.isSponsor && (
                          <span className="bg-indigo-600 border border-indigo-400 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                            ★ Featured Sponsor
                          </span>
                        )}
                        {ad.isPremium && (
                          <span className="bg-emerald-600 border border-emerald-400 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow">
                            ✓ Verified Premium
                          </span>
                        )}
                      </div>

                      {/* Unique Database ID Badge */}
                      <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-sm text-white px-2 py-0.5 rounded font-mono text-[9px] font-bold">
                        ID: {ad.id}
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase block font-mono">
                          {ad.category}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight block truncate max-w-[250px]">
                          {ad.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-500 limit-lines-2 line-clamp-2 leading-relaxed">
                        {ad.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-400 font-bold uppercase font-mono mt-2">
                        <span>Province: {ad.location}</span>
                        <span>•</span>
                        <span>South Africa</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Bottom */}
                  <div className="p-5 border-t border-slate-100 flex items-center justify-between mt-auto bg-slate-50/70">
                    <div className="flex items-center gap-1.5 shrink-0">
                      {ad.isClaimed === false ? (
                        <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Unclaimed System File
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-250 text-emerald-800 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Owner
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-800 hover:text-indigo-600 transition flex items-center gap-1 shrink-0">
                      <span>Explore Trade</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Unified detail and diagnostic claims wizard modal */}
      {selectedAdForModal && (
        <AdDetailModal 
          ad={selectedAdForModal} 
          onClose={() => setSelectedAdForModal(null)} 
          onClaimSubmitted={() => {
            loadDatabase();
          }}
        />
      )}

      {/* Simple Footer footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs shrink-0" id="site-footer">
        <p className="font-medium text-slate-500">&copy; 2026 BizSearch24 SA. Connecting verified local business entities and trade specialists.</p>
        <p className="text-[10px] text-slate-600 mt-1 uppercase font-mono tracking-widest">Active Server Nodes: SA-ZAR-01 (ClamAV Shield Enabled)</p>
      </footer>
    </div>
  );
}
