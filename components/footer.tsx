'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Sparkles, Shield, Mail, Phone, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Search className="w-4 h-4 text-white" />
              </div>
              <span className="font-sans font-bold text-lg tracking-tight">
                BizSearch<span className="text-emerald-500">24</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              South Africa\'s premier verified local business directory. Powering verified search, premium co.za hostings, and custom lead generation.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100% Vetted Local Directory</span>
            </div>
          </div>

          {/* Quick Nav */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 mb-4">Core Directory</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home Base</Link>
              </li>
              <li>
                <Link href="/directory" className="hover:text-white transition-colors">Business Finder</Link>
              </li>
              <li>
                <Link href="/premium-partners" className="hover:text-white transition-colors">Premium Partners</Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-white transition-colors">Listing Tools & Fees</Link>
              </li>
            </ul>
          </div>

          {/* AI Assistance */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 mb-4">Intelligent Search</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/ai-chat" className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>AI LLaMA3 Assistant</span>
                </Link>
              </li>
              <li>
                <Link href="/qa" className="hover:text-white transition-colors">Frequently Asked Q&A</Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-white transition-colors">Business News Hub</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>

          {/* Core Pricing Context */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-400">Core Premium Rates</h4>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white leading-none">R199.00 / month</p>
              <p className="text-[10px] text-slate-500">Base Premium Plan (debit mandate)</p>
            </div>
            <div className="text-[10px] space-y-1 text-slate-400 border-t border-slate-800 pt-2 font-sans">
              <p>• +R49.00 / mo each extra listed ad</p>
              <p>• co.za registration: R99.00 / yr</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-sans">
          <p>© {new Date().getFullYear()} BizSearch24 SA Directory. All rights reserved.</p>
          <div className="flex space-x-4">
            <span className="flex items-center space-x-1 text-slate-600">
              <Shield className="w-3.5 h-3.5" />
              <span>POPIA Compliant</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
