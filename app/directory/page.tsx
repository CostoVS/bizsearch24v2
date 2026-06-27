'use client';

import React, { useState } from 'react';
import { BUSINESS_ADS } from '@/lib/businesses';
import { SA_PROVINCES } from '@/lib/locations';
import { Search, MapPin, Phone, Mail, Globe, Award, ShieldCheck } from 'lucide-react';

export default function Directory() {
  const [query, setQuery] = useState('');
  const [province, setProvince] = useState('All');

  const filtered = BUSINESS_ADS.filter(ad => {
    const matchesQuery = ad.name.toLowerCase().includes(query.toLowerCase()) || 
                         ad.category.toLowerCase().includes(query.toLowerCase()) || 
                         ad.description.toLowerCase().includes(query.toLowerCase());
    const matchesProv = province === 'All' || ad.province === province;
    return matchesQuery && matchesProv;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900">
          The Verified Business Directory
        </h1>
        <p className="text-slate-500 font-sans mt-2">
          Browse vetted, active professionals, trade services, and consultants in South Africa.
        </p>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search directory..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-950"
          />
        </div>
        <select
          value={province}
          onChange={(e) => setProvince(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-950 min-w-[200px]"
        >
          <option value="All">All Provinces</option>
          {SA_PROVINCES.map(p => (
            <option key={p.slug} value={p.name}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(ad => (
          <div key={ad.id} className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">{ad.category}</span>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full uppercase border font-bold ${
                  ad.type === 'sponsored' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                  ad.type === 'premium' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {ad.type}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <span>{ad.name}</span>
                  {ad.type !== 'verified' && <Award className="w-4 h-4 text-emerald-600 shrink-0" />}
                </h2>
                <p className="text-xs text-slate-400 font-sans flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1 text-slate-400" />
                  <span>{ad.town}, {ad.province}</span>
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">{ad.description}</p>
            </div>

            <div className="border-t border-slate-100 mt-6 pt-4 space-y-2 text-xs font-mono text-slate-500">
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-slate-300" />
                <span>{ad.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-slate-300" />
                <span>{ad.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
