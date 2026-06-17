import Link from "next/link";
import { Check, Star, Shield, Zap } from "lucide-react";

export default function PremiumPage() {
  return (
    <div className="w-full bg-slate-50 min-h-[calc(100vh-80px)] pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-display font-black text-slate-900 tracking-tight mb-6 leading-tight">
            Elevate Your Business Visibility
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
            Gain consumer trust instantly with verified badges, rank higher, and outshine your competitors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-10 flex flex-col transition-shadow hover:shadow-md">
            <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Basic Listing</h3>
            <p className="text-slate-500 mb-8 flex-grow text-sm">A starting point to register your public presence.</p>
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-slate-900 tracking-tighter">R0</span>
              <span className="text-slate-500 font-medium"> / forever</span>
            </div>
            <ul className="space-y-5 mb-10">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-slate-700 font-medium">1 Single directory listing</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-slate-700 font-medium">Standard search indexing</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                <span className="text-slate-700 font-medium">Public profile page</span>
              </li>
              <li className="flex items-start opacity-30">
                <Shield className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <span className="text-slate-500 line-through">Verified Blue Badge</span>
              </li>
              <li className="flex items-start opacity-30">
                <Zap className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
                <span className="text-slate-500 line-through">Featured Sponsorship</span>
              </li>
            </ul>
            <Link href="/login" className="w-full text-center block bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-xl transition-all border border-slate-200">
              Start Free Trial
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-10 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-600 via-indigo-500 to-purple-500 rounded-t-3xl"></div>
            <div className="absolute -top-4 right-8">
              <span className="bg-gradient-to-r from-emerald-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg flex items-center border border-white/20">
                 Elite Status
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Premium Partner</h3>
            <p className="text-slate-400 mb-8 flex-grow text-sm">Dominate local search and build absolute trust.</p>
            <div className="mb-8 mt-auto">
              <span className="text-5xl font-extrabold text-white tracking-tighter">R199</span>
              <span className="text-slate-400 font-medium"> / month</span>
            </div>
            <ul className="space-y-5 mb-10">
              <li className="flex items-start">
                <Check className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                <span className="text-slate-200 font-medium">Unlimited ad creation</span>
              </li>
              <li className="flex items-start">
                <BadgeCheck className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                <span className="text-white font-bold">Exclusive Verified Blue Badge</span>
              </li>
              <li className="flex items-start">
                <Zap className="w-5 h-5 text-amber-400 mr-3 flex-shrink-0" />
                <span className="text-slate-200 font-medium">Priority Ranking in searches</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                <span className="text-slate-200 font-medium">Ads shown in &quot;Sponsored&quot; blocks</span>
              </li>
              <li className="flex items-start">
                <Check className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
                <span className="text-slate-200 font-medium">Advanced audience analytics</span>
              </li>
            </ul>
            <Link href="/login" className="w-full text-center block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-500/25 border border-emerald-500 text-lg">
              Upgrade to Premium
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function BadgeCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.76 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
