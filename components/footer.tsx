import Link from "next/link";
import { ShieldCheck, MapPin, Mail, Phone, ChevronRight } from "lucide-react";

export function Footer({ onShowLegal }: { onShowLegal?: () => void }) {
  return (
    <footer className="bg-[#0f172a] text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <Link href="/" className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
            <div>
              <div className="font-display font-bold text-3xl tracking-tighter text-white">
                Biz<span className="text-emerald-500">Search</span>24
              </div>
              <div className="text-[10px] tracking-widest text-slate-500 uppercase font-semibold">South Africa</div>
            </div>
          </Link>
          <p className="text-base text-slate-400 mb-6 max-w-md leading-relaxed">
            Connecting local clients with verified tradesmen and businesses across South Africa.
          </p>
          <p className="text-sm text-slate-500 mb-8 font-mono">
            &copy; {new Date().getFullYear()} Bizsearch24 SA. All Rights Reserved.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-white font-bold mb-4 text-base">Active Provinces</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <Link href="/gauteng" className="hover:text-emerald-400 transition-colors">Gauteng</Link>
              <Link href="/western-cape" className="hover:text-emerald-400 transition-colors">Western Cape</Link>
              <Link href="/kwazulu-natal" className="hover:text-emerald-400 transition-colors">KwaZulu-Natal</Link>
              <Link href="/eastern-cape" className="hover:text-emerald-400 transition-colors">Eastern Cape</Link>
              <Link href="/free-state" className="hover:text-emerald-400 transition-colors">Free State</Link>
              <Link href="/limpopo" className="hover:text-emerald-400 transition-colors">Limpopo</Link>
              <Link href="/mpumalanga" className="hover:text-emerald-400 transition-colors">Mpumalanga</Link>
              <Link href="/north-west" className="hover:text-emerald-400 transition-colors">North West</Link>
              <Link href="/northern-cape" className="hover:text-emerald-400 transition-colors">Northern Cape</Link>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-bold mb-4 text-base">Quick Links</h3>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
               <Link href="/directory" className="hover:text-emerald-400 transition-colors">Home Directory</Link>
               <Link href="/services" className="hover:text-emerald-400 transition-colors font-bold text-emerald-500">BizSearch24 Services</Link>
               <Link href="/news" className="hover:text-emerald-400 transition-colors font-bold text-emerald-400">News</Link>
               <Link href="/create-ad" className="hover:text-emerald-400 transition-colors">Create Ad</Link>
               <Link href="/sitemap" className="hover:text-emerald-400 transition-colors">Visual Sitemap</Link>
               <Link href="/posts" className="hover:text-emerald-400 transition-colors">Community Posts</Link>
               <button onClick={onShowLegal} className="text-left hover:text-emerald-400 transition-colors">Terms of Service</button>
               <button onClick={onShowLegal} className="text-left hover:text-emerald-400 transition-colors">Privacy Policy</button>
               <button onClick={onShowLegal} className="text-left hover:text-emerald-400 transition-colors col-span-2">Disclaimer & POPIA</button>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
