'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BUSINESS_ADS, BusinessAd } from '@/lib/businesses';
import { SA_PROVINCES } from '@/lib/locations';
import { Search, MapPin, Phone, Mail, Globe, Sparkles, ShieldCheck, Award, CheckCircle2, Navigation } from 'lucide-react';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Categories list derived from businesses
  const categories = ['All', ...Array.from(new Set(BUSINESS_ADS.map((ad) => ad.category)))];
  const provinces = ['All', ...SA_PROVINCES.map((p) => p.name)];

  // Filter listings
  const filteredAds = BUSINESS_ADS.filter((ad) => {
    const matchesSearch = 
      ad.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.town.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProvince = selectedProvince === 'All' || ad.province === selectedProvince;
    const matchesCategory = selectedCategory === 'All' || ad.category === selectedCategory;

    return matchesSearch && matchesProvince && matchesCategory;
  });

  // Separate sponsored/premium from verified
  const premiumAndSponsored = filteredAds.filter((ad) => ad.type === 'premium' || ad.type === 'sponsored');
  const verifiedOnly = filteredAds.filter((ad) => ad.type === 'verified');

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 rounded-3xl p-8 sm:p-12 lg:p-16 text-white text-center space-y-6 relative overflow-hidden shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="inline-flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent AI Search Enabled</span>
        </div>

        <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-tight max-w-4xl mx-auto">
          Find Vetted &amp; Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Local Businesses</span> in South Africa
        </h1>

        <p className="text-slate-300 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto font-sans leading-relaxed">
          Access a curated index of local construction, plumbing, design, and professional services across SA's 9 provinces. Zero spam, 100% verified.
        </p>

        {/* AI Quick Callout */}
        <div className="pt-2">
          <Link
            href="/ai-chat"
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3.5 rounded-xl font-medium shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 animate-bounce" />
            <span>Chat with AI Assistant</span>
          </Link>
        </div>
      </section>

      {/* Main Directory & Search Stage */}
      <section className="space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search services, geysers, leak detection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
              />
            </div>

            {/* Province Select */}
            <div className="relative">
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900 appearance-none"
              >
                <option value="All">All Provinces (SA)</option>
                {provinces.filter(p => p !== 'All').map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
            </div>

            {/* Category Select */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900 appearance-none"
              >
                <option value="All">All Industries</option>
                {categories.filter(c => c !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <Navigation className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Premium & Sponsored Partners Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 flex items-center space-x-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <span>Premium &amp; Sponsored Partners</span>
            </h2>
            <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase">
              AI Powered
            </span>
          </div>

          {premiumAndSponsored.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumAndSponsored.map((ad) => (
                <article
                  key={ad.id}
                  className={`bg-white rounded-2xl p-6 border transition-all hover:shadow-lg relative flex flex-col justify-between ${
                    ad.type === 'sponsored'
                      ? 'border-amber-200 bg-gradient-to-br from-white to-amber-50/20'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Badge */}
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
                        {ad.category}
                      </span>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase border font-bold ${
                        ad.type === 'sponsored'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {ad.type}
                      </span>
                    </div>

                    {/* Info */}
                    <div>
                      <h3 className="font-sans font-bold text-lg text-slate-900 flex items-center space-x-1">
                        <span>{ad.name}</span>
                        {ad.type === 'sponsored' && <Award className="w-4 h-4 text-amber-500" />}
                      </h3>
                      <p className="text-xs text-slate-500 font-sans flex items-center mt-1">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        <span>{ad.town}, {ad.province}</span>
                      </p>
                    </div>

                    <p className="text-sm text-slate-600 font-sans leading-relaxed">
                      {ad.description}
                    </p>
                  </div>

                  {/* Contacts */}
                  <div className="border-t border-slate-100 mt-6 pt-4 space-y-2 text-xs font-mono text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ad.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{ad.email}</span>
                    </div>
                    {ad.website && (
                      <div className="flex items-center space-x-2">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <a href={ad.website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                          {ad.website.replace('https://', '')}
                        </a>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-sans">No matching premium partners found in this segment.</p>
            </div>
          )}
        </div>

        {/* Verified Listings Grid */}
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="font-sans font-bold text-xl text-slate-800 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-slate-500" />
              <span>Verified Directory Listings</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Directory Index Only
            </span>
          </div>

          {verifiedOnly.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verifiedOnly.map((ad) => (
                <article
                  key={ad.id}
                  className="bg-white rounded-xl p-5 border border-slate-200 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-mono text-slate-400 uppercase">
                        {ad.category}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 uppercase font-semibold flex items-center space-x-1">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>vetted</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="font-sans font-semibold text-base text-slate-800">
                        {ad.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                        <span>{ad.town}, {ad.province}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-500 font-sans leading-relaxed">
                      {ad.description}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 mt-4 pt-3 space-y-1.5 text-xs font-mono text-slate-500">
                    <div className="flex items-center space-x-2">
                      <Phone className="w-3.5 h-3.5 text-slate-300" />
                      <span>{ad.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-3.5 h-3.5 text-slate-300" />
                      <span>{ad.email}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 font-sans">No matching general directory listings found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Provinces Directory Quick Navigation */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-500">
          Browse South African Coverage Areas
        </h3>
        <div className="flex flex-wrap gap-2">
          {SA_PROVINCES.map((prov) => (
            <button
              key={prov.slug}
              onClick={() => {
                setSelectedProvince(prov.name);
                window.scrollTo({ top: 350, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
                selectedProvince === prov.name
                  ? 'bg-slate-900 border-slate-900 text-white font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {prov.name} ({prov.towns.length} areas)
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
