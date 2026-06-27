'use client';

import React from 'react';
import { BUSINESS_ADS } from '@/lib/businesses';
import { SA_PROVINCES } from '@/lib/locations';
import { ShieldCheck, ArrowRight, Wrench, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Services() {
  const categories = Array.from(new Set(BUSINESS_ADS.map(ad => ad.category)));

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900">
          Professional Services Index
        </h1>
        <p className="text-slate-500 font-sans mt-2">
          Find trade services, digital design agencies, logistics, and hospitality experts vetted for South Africa.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category, index) => {
          const matching = BUSINESS_ADS.filter(ad => ad.category === category);
          return (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-600" />
                  <span>{category}</span>
                </h2>
                <span className="text-xs font-mono text-slate-400">({matching.length} verified)</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-sans">
                Vetted services in {category} available across our primary SA nodes. Includes emergency 24/7 service providers.
              </p>
              <div className="divide-y divide-slate-100">
                {matching.map(ad => (
                  <div key={ad.id} className="py-3 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800">{ad.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono">{ad.town}, {ad.province}</p>
                    </div>
                    <Link href={`/directory?q=${encodeURIComponent(ad.name)}`} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
