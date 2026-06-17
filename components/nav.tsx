"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Search, Database, MessageSquare } from "lucide-react";
import React from "react";

export function Nav({ statsCount = 6, unreadMessages = 1 }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-xl border-b border-slate-800" id="global-navbar">
      {/* Top Banner indicating official BizSearch24 membership options */}
      <div className="bg-indigo-600 text-[11px] font-bold text-center py-2 px-4 tracking-wide text-indigo-50 flex items-center justify-center gap-2">
        <span className="inline-flex items-center justify-center bg-indigo-500 px-1.5 py-0.5 rounded text-[9px] uppercase font-black">PRO MEMBERSHIP</span>
        <span>Claim unclaimed bulk listings to secure access & elevate to Premium for only R199/month!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand Brand */}
          <Link href="/" className="flex items-center gap-3 transition-transform active:scale-95">
            <div className="bg-emerald-500 p-2 rounded-xl text-slate-900 shadow-md shadow-emerald-500/20">
              <Search className="w-5 h-5 text-slate-950 stroke-[3px]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight font-sans text-white">BizSearch24</span>
                <span className="bg-slate-800 text-slate-400 text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest">SA</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">South Africa Directory Database</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-2 ${pathname === "/" ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner" : "text-slate-300 hover:text-white hover:bg-slate-800/50"}`}
            >
              <Database className="w-4 h-4" />
              <span>Public Directory</span>
            </Link>

            <Link
              href="/admin"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-2 ${pathname.startsWith("/admin") ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-705"}`}
              id="admin-portal-link"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Deck</span>
              {unreadMessages > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {unreadMessages}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
