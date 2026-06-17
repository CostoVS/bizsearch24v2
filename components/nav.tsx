"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Search, Database, MessageSquare } from "lucide-react";
import React from "react";

export function Nav({ statsCount = 6, unreadMessages = 1 }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-xl border-b border-slate-800 w-full" id="global-navbar">
      {/* Top Banner indicating official BizSearch24 membership options */}
      <div className="bg-indigo-600 text-[10px] sm:text-[11px] font-bold text-center py-2 px-3 sm:px-4 tracking-wide text-indigo-50 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2" id="nav-top-banner">
        <span className="inline-flex items-center justify-center bg-indigo-500 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] uppercase font-black shrink-0">PRO MEMBERSHIP</span>
        <span className="break-words text-center">Claim unclaimed bulk listings to secure access & elevate to Premium for only R199/month!</span>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo Brand Brand */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 transition-transform active:scale-95 shrink-0">
            <div className="bg-emerald-500 p-1.5 sm:p-2 rounded-xl text-slate-900 shadow-md shadow-emerald-500/20 shrink-0">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[3px]" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-base sm:text-lg font-extrabold tracking-tight font-sans text-white">BizSearch24</span>
                <span className="bg-slate-800 text-slate-400 text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded tracking-widest shrink-0">SA</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">South Africa Directory Database</p>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1.5 sm:gap-4 shrink-0">
            <Link
              href="/"
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 sm:gap-2 ${pathname === "/" ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-inner" : "text-slate-300 hover:text-white hover:bg-slate-800/50"}`}
            >
              <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>
                <span className="hidden md:inline">Public Directory</span>
                <span className="md:hidden inline">Directory</span>
              </span>
            </Link>

            <Link
              href="/admin"
              className={`px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 flex items-center gap-1.5 sm:gap-2 ${pathname.startsWith("/admin") ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"}`}
              id="admin-portal-link"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>
                <span className="hidden md:inline">Admin Deck</span>
                <span className="md:hidden inline">Admin</span>
              </span>
              {unreadMessages > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse shrink-0">
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
