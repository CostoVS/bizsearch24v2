'use client';

import React from 'react';
import { Award, CheckCircle2, ShieldCheck, Mail, Globe, Sparkles, Building2, Terminal } from 'lucide-react';

export default function PricingTools() {
  const verifiedBenefits = [
    'Unlimited hosting for custom smart static websites',
    'Unlimited domain-branded @yourdomain.co.za emails',
    'Full professional design and hosting assistance',
    'Integration into our premium AI search index',
    'Custom physical/digital badge showing verified status'
  ];

  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 uppercase">
          Pricing Plans &amp; Listing Tools
        </span>
        <h1 className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-slate-900 mt-3">
          Join South Africa\'s Active Local Index
        </h1>
        <p className="text-slate-500 font-sans mt-2 max-w-2xl leading-relaxed">
          Get verified, connect your custom co.za domain, and let local residents find your plumbing, construction, or web design services using the BizSearch24 AI Assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Core Premium Plan Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-mono uppercase font-bold tracking-wider px-4 py-1.5 rounded-bl-2xl">
            Popular Choice
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400">Verified Business Partner</span>
            <h2 className="text-2xl font-bold font-sans text-slate-900">Base Premium Plan</h2>
            <div className="flex items-baseline space-x-1 pt-2">
              <span className="text-4xl font-extrabold text-slate-900">R199.00</span>
              <span className="text-slate-500 text-sm">/ month</span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Billed via South African debit card mandate</p>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h3 className="text-xs font-mono uppercase text-slate-500 tracking-wider">Plan Inclusions:</h3>
            <ul className="space-y-3">
              {verifiedBenefits.map((b, i) => (
                <li key={i} className="flex items-start space-x-2.5 text-sm text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4">
            <button className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all shadow-md">
              Apply for Premium Listing
            </button>
          </div>
        </div>

        {/* Extras & System Info */}
        <div className="space-y-6">
          {/* Add-on Card */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4 shadow-sm">
            <h3 className="text-sm font-mono uppercase text-amber-400 tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Available Extras &amp; Add-ons</span>
            </h3>
            <div className="divide-y divide-slate-800 space-y-4 text-sm font-sans">
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Additional Listed Ad</p>
                  <p className="text-xs text-slate-500">List multiple locations/franchises</p>
                </div>
                <span className="font-mono text-emerald-400">+R49.00 / mo</span>
              </div>
              <div className="pt-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">.co.za Domain Registration</p>
                  <p className="text-xs text-slate-500">Secure your custom South African web name</p>
                </div>
                <span className="font-mono text-emerald-400">R99.00 / year</span>
              </div>
            </div>
          </div>

          {/* How Verification Works */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
            <h3 className="text-xs font-sans font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>How Verification Works</span>
            </h3>
            <div className="space-y-3 text-xs text-slate-600 font-sans leading-relaxed">
              <p>
                Every premium listing undergoes manual vetting by our South African local team. We verify your professional credentials, business registration, and contact channels before authorizing placement in the public index and AI search assistant.
              </p>
              <p className="bg-white p-3 rounded-lg border border-slate-200 font-sans text-[11px] text-slate-500">
                Authorized listings are synced automatically to protect local residents from scam listings and spam.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
