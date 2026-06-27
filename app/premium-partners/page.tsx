'use client';

import React from 'react';
import { BUSINESS_ADS } from '@/lib/businesses';
import { Award, ShieldCheck, CheckCircle2, Phone, Mail, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function PremiumPartners() {
  const premiums = BUSINESS_ADS.filter(ad => ad.type === 'premium' || ad.type === 'sponsored');

  return (
    <div className="space-y-12">
      {/* Banner */}
      <section className="bg-gradient-to-br from-emerald-950 to-slate-950 p-8 sm:p-12 rounded-3xl text-white relative overflow-hidden border border-emerald-900/40">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            <span>BizSearch24 Verified Premium Club</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight">
            Meet Our Elite Local Partners
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-sans leading-relaxed">
            These businesses have undergone rigorous background verification, hold active certifications (such as PIRB, NHBRC), and offer premium services backed by South African local support.
          </p>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {premiums.map(ad => (
          <div key={ad.id} className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-all flex flex-col justify-between shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-50 rounded-bl-3xl flex items-center justify-center border-l border-b border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <ShieldCheck className="w-5 h-5 text-emerald-600 group-hover:text-white transition-all" />
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">{ad.category}</span>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{ad.name}</h2>
                <p className="text-xs text-slate-500 font-mono mt-1 uppercase tracking-wide">
                  {ad.town}, {ad.province}
                </p>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">{ad.description}</p>
            </div>

            <div className="border-t border-slate-100 mt-8 pt-6 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-600">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{ad.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{ad.email}</span>
                </div>
              </div>
              {ad.website && (
                <div className="flex items-center justify-between text-xs font-mono border-t border-slate-50 pt-3">
                  <span className="text-slate-400">• Certified Domain Partner</span>
                  <a href={ad.website} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline flex items-center space-x-1 font-semibold">
                    <span>{ad.website.replace('https://', '')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Become a Partner CTA */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-4 border border-slate-800 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold font-sans">Are You a Local Business Owner?</h3>
        <p className="text-slate-400 text-xs sm:text-sm font-sans max-w-xl mx-auto leading-relaxed">
          List your local services, get verified, and receive active search referrals via our AI Assistant. Only R199.00 / month with unlimited hosting and co.za branding.
        </p>
        <div>
          <Link href="/tools" className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-semibold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-950/50">
            <span>View Member Benefits</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
