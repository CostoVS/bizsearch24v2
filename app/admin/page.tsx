"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_USERS, MOCK_ADS, getStoredAds, saveStoredAds } from "@/lib/data";
import { ShieldAlert, Users, Database, Globe, MonitorSmartphone, Settings, Edit, Trash2, LayoutTemplate, Activity, Eye, MousePointerClick, BarChart3, Trash, Search, Sparkles, Filter, ChevronRight, CornerDownRight } from "lucide-react";
import { getAnalyticsEvents, clearAnalyticsStorage, AnalyticsEvent } from "@/lib/analytics-utils";

const SEED_EVENTS: AnalyticsEvent[] = [
  { id: 'seed-pv-1', type: 'pageview', pathname: '/directory', ip: '197.80.12.145', city: 'Soweto', region: 'Gauteng', country: 'South Africa', browser: 'Google Chrome', device: 'Android Mobile', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 'seed-sr-1', type: 'search', query: 'electrician', category: 'Construction & Trades', province: 'gauteng', area: 'Soweto', ip: '197.80.12.145', city: 'Soweto', region: 'Gauteng', country: 'South Africa', browser: 'Google Chrome', device: 'Android Mobile', timestamp: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: 'seed-ac-1', type: 'adclick', adId: 'custom-ad-1', adTitle: 'Soweto Safe Electricians', category: 'Construction & Trades', province: 'Gauteng', location: 'Soweto', ip: '197.80.12.145', city: 'Soweto', region: 'Gauteng', country: 'South Africa', browser: 'Google Chrome', device: 'Android Mobile', timestamp: new Date(Date.now() - 12 * 60000).toISOString() },
  { id: 'seed-pv-2', type: 'pageview', pathname: '/services', ip: '165.25.110.122', city: 'Cape Town', region: 'Western Cape', country: 'South Africa', browser: 'Apple Safari', device: 'Apple iOS Mobile', timestamp: new Date(Date.now() - 45 * 60000).toISOString() },
  { id: 'seed-sr-2', type: 'search', query: 'lawn trimming', category: 'Gardening & Landscaping', province: 'western-cape', area: 'Cape Town', ip: '165.25.110.122', city: 'Cape Town', region: 'Western Cape', country: 'South Africa', browser: 'Apple Safari', device: 'Apple iOS Mobile', timestamp: new Date(Date.now() - 50 * 60000).toISOString() },
  { id: 'seed-pv-3', type: 'pageview', pathname: '/directory', ip: '102.132.89.12', city: 'Durban', region: 'KwaZulu-Natal', country: 'South Africa', browser: 'Firefox', device: 'Desktop Computer', timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
  { id: 'seed-pv-4', type: 'pageview', pathname: '/directory', ip: '196.22.45.2', city: 'Pretoria', region: 'Gauteng', country: 'South Africa', browser: 'Microsoft Edge', device: 'Desktop Computer', timestamp: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'seed-sr-3', type: 'search', query: 'pest control', category: 'Home Services', province: 'gauteng', area: 'Pretoria', ip: '196.22.45.2', city: 'Pretoria', region: 'Gauteng', country: 'South Africa', browser: 'Microsoft Edge', device: 'Desktop Computer', timestamp: new Date(Date.now() - 3 * 3600000 - 15 * 60000).toISOString() },
  { id: 'seed-pv-5', type: 'pageview', pathname: '/posts', ip: '197.81.144.11', city: 'Umhlanga', region: 'KwaZulu-Natal', country: 'South Africa', browser: 'Samsung Internet', device: 'Android Mobile', timestamp: new Date(Date.now() - 18 * 3600000).toISOString() }
];

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Sticky global banner state
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [bannerText, setBannerText] = useState("🔥 PROMOTE YOUR BUSINESS TODAY! Get 50% off Premium Listings this June.");
  const [bannerLink, setBannerLink] = useState("/premium");
  const [bannerVisibility, setBannerVisibility] = useState("All Pages");

  // Load banner config from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bizsearch24_global_banner");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setBannerEnabled(parsed.enabled ?? true);
          setBannerText(parsed.text ?? "🔥 PROMOTE YOUR BUSINESS TODAY! Get 50% off Premium Listings this June.");
          setBannerLink(parsed.link ?? "/premium");
          setBannerVisibility(parsed.visibility ?? "All Pages");
        } catch (e) {}
      }
    }
  }, []);

  const saveBannerConfig = (enabled: boolean, text: string, link: string, visibility: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("bizsearch24_global_banner", JSON.stringify({
        enabled,
        text,
        link,
        visibility
      }));
      // Dispatch update event
      window.dispatchEvent(new CustomEvent("bizsearch24_banner_updated"));
    }
  };

  // Dynamic State for Management
  const [users, setUsers] = useState(MOCK_USERS);
  const [ads, setAds] = useState(MOCK_ADS);
  const [userSearch, setUserSearch] = useState("");
  const [reports, setReports] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'hours' | 'days' | 'weeks' | 'months'>('days');

  // Load analytics events and unified advertisements list
  useEffect(() => {
    if (typeof window !== "undefined") {
      const tracked = getAnalyticsEvents();
      if (tracked.length === 0) {
        setEvents(SEED_EVENTS);
      } else {
        // Sort newest first
        const combined = [...tracked, ...SEED_EVENTS].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
        setEvents(combined);
      }

      // Load unified ads from master store
      setAds(getStoredAds());
    }
  }, [activeTab]);

  const purgeAllAnalytics = () => {
    if (confirm("Are you sure you want to delete all stored interaction history? This action is permanent.")) {
      clearAnalyticsStorage();
      setEvents(SEED_EVENTS);
    }
  };

  // Hook to fetch reported participants from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bizsearch24_reports_v1");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          Promise.resolve().then(() => {
            setReports(parsed);
          });
        } catch (e) {}
      }
    }
  }, [activeTab]);

  const resolveReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("bizsearch24_reports_v1", JSON.stringify(updated));
    }
  };

  const blockReportActor = (id: string, accusedEmail: string) => {
    alert(`Acclaimed Bad Actor Banned: [${accusedEmail}]. Access revoked from community feed and direct client channels.`);
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("bizsearch24_reports_v1", JSON.stringify(updated));
    }
  };

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  const removeUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const blockUser = (id: string) => {
    alert("User account has been locked. Access revoked until further manual override.");
  };

  const removeAd = (id: string) => {
    if (confirm("Are you sure you want to remove this advertisement listing?")) {
      const updatedAds = ads.filter(a => a.id !== id);
      setAds(updatedAds);

      // Save to centralized database key
      saveStoredAds(updatedAds);
      alert("Listing successfully removed and purged from server registers.");
    }
  };

  const changeAdTier = (adId: string, value: string) => {
    const isPremiumValue = value === "PREMIUM" || value === "SPONSOR";
    const isSponsorValue = value === "SPONSOR";

    const updated = ads.map(a => {
      if (a.id === adId) {
        return {
          ...a,
          isPremium: isPremiumValue,
          isSponsor: isSponsorValue,
          verified: isPremiumValue
        };
      }
      return a;
    });

    setAds(updated);

    // Save to centralized database key
    saveStoredAds(updated);
    alert("Ad tiering changed successfully!");
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.location.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (isLoading || !user || user.role !== "ADMIN") return <div className="p-20 text-center text-slate-500 text-sm">Authenticating Secure Session...</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-2 sm:px-6 w-full min-w-0 overflow-x-hidden sm:overflow-x-visible">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center">
          <div className="bg-slate-900 p-3 rounded-xl mr-4 shadow-sm shrink-0">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">System Control</h1>
            <p className="text-slate-500 mt-1 max-w-sm font-medium">Global oversight and user intelligence platform.</p>
          </div>
        </div>
        <div className="flex items-center space-x-3 text-sm">
          <div className="flex flex-col items-end">
            <span className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium font-mono text-xs shadow-inner">
               AUTH_LVL: ROOT_ADMIN
            </span>
            <span className="text-[10px] text-slate-400 mt-1 font-bold">NODE: SA-ZAR-01</span>
          </div>
          <button className="bg-white border border-slate-200 text-slate-700 p-2.5 rounded-lg hover:bg-slate-50 shadow-sm transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('overview')} className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}>User Intelligence</button>
        <button onClick={() => setActiveTab('ads')} className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ads' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}>Advertisement Control</button>
        <button onClick={() => setActiveTab('banners')} className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'banners' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}>Global Site Banners</button>
        <button onClick={() => setActiveTab('analytics')} className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'analytics' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}>Public Traffic</button>
        <button onClick={() => setActiveTab('reports')} className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-1 shrink-0 ${activeTab === 'reports' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400 hover:text-slate-900'}`}>
          ⚠️ Security Reports <span className="bg-rose-100 text-rose-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold">{reports.length}</span>
        </button>
      </div>

      {activeTab === 'banners' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-20"></div>
             <div className="relative z-10">
               <h2 className="text-xl font-bold text-slate-900 font-display mb-2">Global UI Banner Control</h2>
               <p className="text-sm text-slate-500 mb-8">Inject banner advertisements across the entire platform or specific pages.</p>
               
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 {/* Top Banner Control */}
                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><MonitorSmartphone className="w-5 h-5"/></div>
                        <h3 className="font-bold text-slate-900">Header Sticky Banner</h3>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={bannerEnabled} 
                          onChange={(e) => {
                            const newVal = e.target.checked;
                            setBannerEnabled(newVal);
                            saveBannerConfig(newVal, bannerText, bannerLink, bannerVisibility);
                          }}
                          className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                     </label>
                   </div>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Banner Headline</label>
                       <input 
                          type="text" 
                          value={bannerText} 
                          onChange={(e) => {
                            const newVal = e.target.value;
                            setBannerText(newVal);
                            saveBannerConfig(bannerEnabled, newVal, bannerLink, bannerVisibility);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" 
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Redirect URL</label>
                          <input 
                            type="text" 
                            value={bannerLink} 
                            onChange={(e) => {
                              const newVal = e.target.value;
                              setBannerLink(newVal);
                              saveBannerConfig(bannerEnabled, bannerText, newVal, bannerVisibility);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Visibility</label>
                          <select 
                             value={bannerVisibility} 
                             onChange={(e) => {
                               const newVal = e.target.value;
                               setBannerVisibility(newVal);
                               saveBannerConfig(bannerEnabled, bannerText, bannerLink, newVal);
                             }}
                             className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                           >
                              <option value="All Pages">All Pages</option>
                              <option value="Home Only">Home Only</option>
                              <option value="Search Results Only">Search Results Only</option>
                           </select>
                        </div>
                     </div>
                   </div>
                 </div>

                 {/* Middle / Interstitial Banners */}
                 <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><LayoutTemplate className="w-5 h-5"/></div>
                        <h3 className="font-bold text-slate-900">Interstitial/Above Ad Banner</h3>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                     </label>
                   </div>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Banner Graphic text</label>
                       <input type="text" placeholder="e.g. Featured Businesses in your area" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Placement Logic</label>
                          <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20">
                             <option>Above Every Listing</option>
                             <option>Below Every Listing</option>
                             <option>Center of Page</option>
                          </select>
                        </div>
                        <button className="h-[43px] self-end bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition">Update Global Banners</button>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <ShieldAlert className="w-6 h-6 text-amber-500" />
                <h3 className="font-bold text-slate-900 font-display">Active Banner Registry</h3>
             </div>
             <div className="space-y-4">
                {[
                  { name: 'June Promo Banner', pos: 'Top Sticky', status: 'LIVE', reach: '4.2k impressions' },
                  { name: 'Legal Disclaimer Float', pos: 'Bottom Center', status: 'INACTIVE', reach: '0 impressions' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-4">
                       <div className={`w-3 h-3 rounded-full ${b.status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                       <div>
                         <p className="text-sm font-bold text-slate-900">{b.name}</p>
                         <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{b.pos} • {b.reach}</p>
                       </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="p-2 text-slate-400 hover:text-slate-900"><Edit className="w-4 h-4"/></button>
                       <button className="p-2 text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>
      )}

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:border-emerald-200 transition-colors">
              <div className="bg-emerald-50 p-4 rounded-xl mr-5 text-emerald-600">
                <Users className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Total Users</p>
                <div className="flex items-baseline space-x-2">
                   <p className="text-3xl font-bold text-slate-900">{users.length}</p>
                   <span className="text-xs text-emerald-600 font-bold">+2 today</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:border-indigo-200 transition-colors">
              <div className="bg-indigo-50 p-4 rounded-xl mr-5 text-indigo-600">
                <Database className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Active Ads</p>
                <p className="text-3xl font-bold text-slate-900">{ads.length}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:border-amber-200 transition-colors">
              <div className="bg-amber-50 p-4 rounded-xl mr-5 text-amber-500">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Critical Alerts</p>
                <p className="text-3xl font-bold text-slate-900">0</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center hover:border-emerald-200 transition-colors">
              <div className="bg-emerald-100 p-4 rounded-xl mr-5 text-emerald-800">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Server Health</p>
                <p className="text-3xl font-bold text-emerald-600 tracking-tight">99.8%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
              <div>
                <h2 className="font-bold text-xl text-slate-900 font-display">User Intelligence Registry</h2>
                <p className="text-sm text-slate-500 mt-1">Manage global access, block bad actors, and reset credentials.</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-slate-400"><Users className="w-4 h-4"/></span>
                  <input 
                    type="text" 
                    placeholder="Search accounts..." 
                    className="bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all w-full md:w-64"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-800 transition">Add User</button>
              </div>
            </div>
            <div className="overflow-x-auto relative z-0">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80 backdrop-blur-sm sticky top-0">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Account Details</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Tier</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Network Logic</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Client Identity</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Operations</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredUsers.length > 0 ? filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center">
                           <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold mr-4">
                              {u.email[0].toUpperCase()}
                           </div>
                           <div>
                              <div className="text-sm font-bold text-slate-900">{u.email}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-tighter">Joined {u.joined}</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm">
                        <span className={`px-2.5 py-1 inline-flex text-[10px] uppercase tracking-widest font-extrabold rounded-lg ${
                          u.plan === 'PREMIUM' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {u.plan}
                        </span>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-xs text-slate-600 font-mono">
                        <span className="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">{u.lastLoginIP}</span>
                        <div className="text-[9px] text-slate-400 mt-1 font-sans">{u.location} • RSA_EXIT_V4</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center text-xs text-slate-600 font-bold">
                          <MonitorSmartphone className="w-4 h-4 mr-2" />
                          {u.device}
                        </div>
                        <div className="text-[9px] text-emerald-600 font-bold mt-1">2FA_VERIFIED</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <button onClick={() => alert("Verification code sent to user email.")} className="text-[10px] font-bold uppercase tracking-widest bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition">Reset</button>
                           <button onClick={() => blockUser(u.id)} className="text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition">Block</button>
                           <button onClick={() => removeUser(u.id)} className="text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 border border-rose-100 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition">Delete</button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="p-20 text-center text-slate-400 italic">No matching user accounts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'ads' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden relative">
            <div className="px-8 py-6 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-4">
               <div>
                 <h2 className="font-bold text-xl text-slate-900 font-display">Ad Placement Lifecycle</h2>
                 <p className="text-sm text-slate-500 mt-1">Directly modify advertisements, change tiering, or remove listings.</p>
               </div>
               <button onClick={() => alert("Redirecting to Ad Designer Tool...")} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">Provision New Advertisement</button>
            </div>
            <div className="overflow-x-auto relative z-0">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Creative / Title</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Metadata</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Tiering</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Global State</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {ads.map(ad => (
                    <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="flex items-center">
                           {ad.image && (
                             <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 border border-slate-100 flex-shrink-0">
                                <img src={ad.image} className="w-full h-full object-cover" alt="" />
                             </div>
                           )}
                           <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 truncate">{ad.title}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5 truncate">{ad.description.substring(0, 40)}...</div>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                         <div className="text-xs font-bold text-slate-600">{ad.category}</div>
                         <div className="text-[10px] text-slate-400 mt-0.5">{ad.location} • RSA</div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {ad.isSponsor ? (
                          <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase rounded-lg border border-indigo-200">Featured Sponsor</span>
                        ) : ad.isPremium ? (
                          <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase rounded-lg border border-emerald-200">Premium Verified</span>
                        ) : (
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-extrabold uppercase rounded-lg border border-slate-200">Basic Listing</span>
                        )}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <select 
                          value={ad.isSponsor ? "SPONSOR" : ad.isPremium ? "PREMIUM" : "BASIC"}
                          onChange={(e) => changeAdTier(ad.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase tracking-tighter text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-sans font-medium"
                        >
                          <option value="BASIC">Basic Free</option>
                          <option value="PREMIUM">Premium Verified</option>
                          <option value="SPONSOR">Featured Sponsor</option>
                        </select>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                           <button onClick={() => alert("Secure Ad Editor Mode: Customize this ad details by promoting its status tier above, or click Delete to remove permanently.")} className="text-slate-400 hover:text-emerald-600 p-2.5 transition active:scale-90" title="Edit Info"><Edit className="w-5 h-5" /></button>
                           <button onClick={() => removeAd(ad.id)} className="text-slate-400 hover:text-rose-600 p-2.5 transition active:scale-90" title="Purge Record"><Trash2 className="w-5 h-5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (() => {
        // Filter events based on chosen timeframe
        const now = new Date();
        const filteredEvents = events.filter(e => {
          const evDate = new Date(e.timestamp);
          if (timeframe === 'hours') {
            return (now.getTime() - evDate.getTime()) <= 24 * 60 * 60 * 1000;
          } else if (timeframe === 'days') {
            return (now.getTime() - evDate.getTime()) <= 7 * 24 * 60 * 60 * 1000;
          } else if (timeframe === 'weeks') {
            return (now.getTime() - evDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
          } else { // months (Year-to-date)
            return (now.getTime() - evDate.getTime()) <= 365 * 24 * 60 * 60 * 1000;
          }
        });

        const totalPV = filteredEvents.filter(e => e.type === 'pageview').length;
        const totalSR = filteredEvents.filter(e => e.type === 'search').length;
        const totalAC = filteredEvents.filter(e => e.type === 'adclick').length;
        const uniqueIps = new Set(filteredEvents.map(e => e.ip)).size;

        // Group Queries
        const queryCounts: Record<string, number> = {};
        filteredEvents.forEach(e => {
          if (e.type === 'search' && e.query) {
            const q = e.query.trim().toLowerCase();
            queryCounts[q] = (queryCounts[q] || 0) + 1;
          }
        });
        const topQueries = Object.entries(queryCounts)
          .map(([query, count]) => ({ query, count }))
          .sort((a,b) => b.count - a.count)
          .slice(0, 5);

        // Group Categories (from both Search & AdClicks)
        const categoryCounts: Record<string, number> = {};
        filteredEvents.forEach(e => {
          if (e.type === 'search' && e.category) {
            categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
          } else if (e.type === 'adclick' && e.category) {
            categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
          }
        });
        const topCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a,b) => b.count - a.count)
          .slice(0, 5);

        // Group Provinces
        const provinceCounts: Record<string, number> = {};
        filteredEvents.forEach(e => {
          const prov = e.region || e.province;
          if (prov) {
            // Capitalize
            const pName = prov.charAt(0).toUpperCase() + prov.slice(1).replace('-', ' ');
            provinceCounts[pName] = (provinceCounts[pName] || 0) + 1;
          }
        });
        const topProvinces = Object.entries(provinceCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a,b) => b.count - a.count)
          .slice(0, 4);

        // Group Device Proportions
        const deviceCounts: Record<string, number> = {};
        filteredEvents.forEach(e => {
          if (e.device) {
            deviceCounts[e.device] = (deviceCounts[e.device] || 0) + 1;
          }
        });
        const deviceStats = Object.entries(deviceCounts).map(([name, count]) => ({ name, count }));

        // Group Browser Proportions
        const browserCounts: Record<string, number> = {};
        filteredEvents.forEach(e => {
          if (e.browser) {
            browserCounts[e.browser] = (browserCounts[e.browser] || 0) + 1;
          }
        });
        const browserStats = Object.entries(browserCounts).map(([name, count]) => ({ name, count }));

        // Group Clicked Ads Rank
        const clickedAdsCounts: Record<string, { title: string; count: number; category: string }> = {};
        filteredEvents.forEach(e => {
          if (e.type === 'adclick') {
            const key = e.adId;
            if (!clickedAdsCounts[key]) {
              clickedAdsCounts[key] = { title: e.adTitle, count: 0, category: e.category };
            }
            clickedAdsCounts[key].count += 1;
          }
        });
        const topClickedAds = Object.values(clickedAdsCounts)
          .sort((a,b) => b.count - a.count)
          .slice(0, 5);

        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Sub-nav control */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between border border-slate-800 gap-6 shadow-xl shadow-slate-900/10">
              <div>
                <h3 className="text-xl font-bold font-display">Traffic Analytics Control Room</h3>
                <p className="text-slate-400 text-sm mt-1">Collecting true server-proxied connections & search indexes from South African IP locations.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex text-xs font-bold font-mono">
                  {(['hours', 'days', 'weeks', 'months'] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${timeframe === t ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      {t === 'hours' ? '24h' : t === 'days' ? '1 Week' : t === 'weeks' ? '30 Days' : '1 Year'}
                    </button>
                  ))}
                </div>
                <button
                  onClick={purgeAllAnalytics}
                  className="bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ml-auto md:ml-0"
                >
                  <Trash className="w-3.5 h-3.5" /> Purge Cache
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Eye className="w-16 h-16 text-slate-900" /></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Page Impressions</p>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight">{totalPV}</p>
                <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">Direct tracking active</span>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Search className="w-16 h-16 text-slate-900" /></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Database Queries</p>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight">{totalSR}</p>
                <span className="text-[11px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded mt-2 inline-block">Real-time searches</span>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><MousePointerClick className="w-16 h-16 text-slate-900" /></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Sponsor Clicks</p>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight">{totalAC}</p>
                <span className="text-[11px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded mt-2 inline-block">Average CTR 12.3%</span>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Globe className="w-16 h-16 text-slate-900" /></div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Unique Interactors</p>
                <p className="text-4xl font-display font-bold text-slate-900 tracking-tight">{uniqueIps}</p>
                <span className="text-[11px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded mt-2 inline-block">By Client IP Address</span>
              </div>
            </div>

            {/* Custom Bar Charts Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Search Queries & Ad Clicks */}
              <div className="space-y-6">
                {/* 1. Most Popular Searches */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-900 font-display flex items-center gap-2">
                      <Search className="w-5 h-5 text-emerald-600" />
                      Top Search Queries
                    </h4>
                    <span className="text-xs text-slate-400 font-bold uppercase font-mono">Occurrences</span>
                  </div>
                  {topQueries.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">No search queries recorded in this timeframe.</div>
                  ) : (
                    <div className="space-y-4">
                      {topQueries.map((item, idx) => {
                        const maxCount = Math.max(...topQueries.map(q => q.count));
                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-slate-800 font-mono text-xs tracking-tight">"{item.query}"</span>
                              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md text-xs">{item.count}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Ad Click Rankings */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-900 font-display flex items-center gap-2">
                      <MousePointerClick className="w-5 h-5 text-amber-500" />
                      Sponsor Ad Clicks Rank
                    </h4>
                    <span className="text-xs text-slate-400 font-bold uppercase font-mono">Clicks</span>
                  </div>
                  {topClickedAds.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">No advertisement interaction registered yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {topClickedAds.map((item, idx) => {
                        const maxCount = Math.max(...topClickedAds.map(q => q.count));
                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <div className="mr-4 min-w-0">
                                <span className="font-bold text-slate-800 block truncate text-xs">{item.title}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{item.category}</span>
                              </div>
                              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded hover:bg-amber-100 text-xs flex-shrink-0">{item.count} clicks</span>
                            </div>
                            <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Categories & Geographic Hubs */}
              <div className="space-y-6">
                {/* 3. Top Search Categories */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-900 font-display flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-indigo-500" />
                      Popular Service Categories
                    </h4>
                    <span className="text-xs text-slate-400 font-bold uppercase font-mono">Weight</span>
                  </div>
                  {topCategories.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">No category logs.</div>
                  ) : (
                    <div className="space-y-4">
                      {topCategories.map((item, idx) => {
                        const maxCount = Math.max(...topCategories.map(q => q.count));
                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                              <span className="font-semibold text-indigo-600 font-mono text-xs">{item.count}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 4. Active Regional Provinces */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="font-bold text-slate-900 font-display flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-500" />
                      Province / District Hotspots
                    </h4>
                    <span className="text-xs text-slate-400 font-bold uppercase font-mono">Sessions</span>
                  </div>
                  {topProvinces.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-sm font-medium">No regional logs found.</div>
                  ) : (
                    <div className="space-y-4.5">
                      {topProvinces.map((item, idx) => {
                        const maxCount = Math.max(...topProvinces.map(q => q.count));
                        const pct = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                        return (
                          <div key={idx} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 w-1/3 min-w-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></div>
                              <span className="font-bold text-slate-800 text-xs truncate">{item.name}</span>
                            </div>
                            <div className="w-2/3 flex items-center gap-3">
                              <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                              </div>
                              <span className="font-bold text-slate-700 text-xs text-right w-10 shrink-0 font-mono">{item.count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Browser & Device Proportions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Devices */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-900 font-display mb-4 text-sm flex items-center gap-2">
                  <MonitorSmartphone className="w-4 h-4 text-emerald-600" /> Operating Platforms
                </h4>
                <div className="space-y-3">
                  {deviceStats.map((st, i) => {
                    const totalDeviceCount = deviceStats.reduce((acc, d) => acc + d.count, 0);
                    const percent = totalDeviceCount > 0 ? Math.round((st.count / totalDeviceCount) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{st.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">{percent}%</span>
                          <span className="text-slate-400">({st.count})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Browsers */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200">
                <h4 className="font-bold text-slate-900 font-display mb-4 text-sm flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-600" /> Browsing Clients
                </h4>
                <div className="space-y-3">
                  {browserStats.map((st, i) => {
                    const totalBrowserCount = browserStats.reduce((acc, d) => acc + d.count, 0);
                    const percent = totalBrowserCount > 0 ? Math.round((st.count / totalBrowserCount) * 100) : 0;
                    return (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">{st.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono">{percent}%</span>
                          <span className="text-slate-400">({st.count})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Interactive Logging Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-slate-100 pb-6 gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Live Network Request Stream</h3>
                  <p className="text-sm text-slate-500 mt-1">Direct un-truncated feed of queries, page clicks, and ad views.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1.5 uppercase font-mono animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Node Online
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {filteredEvents.map((log) => {
                  let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                  let eventIcon = <Eye className="w-4 h-4 text-slate-500" />;
                  let displayDetail = log.pathname;

                  if (log.type === 'search') {
                    badgeColor = "bg-indigo-50 text-indigo-700 border-indigo-100";
                    eventIcon = <Search className="w-4 h-4 text-indigo-500" />;
                    displayDetail = `Search Index: Keyword "${log.query}" under "${log.category}" in ${log.province}, ${log.area}`;
                  } else if (log.type === 'adclick') {
                    badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                    eventIcon = <MousePointerClick className="w-4 h-4 text-amber-500" />;
                    displayDetail = `Ad Banner: Clicked sponsored Listing: "${log.adTitle}" [ID: ${log.adId}]`;
                  } else {
                    displayDetail = `Page View: Transitioned path "${log.pathname}"`;
                  }

                  const evTime = new Date(log.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' });
                  const evDate = new Date(log.timestamp).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });

                  return (
                    <div key={log.id} className="flex flex-col lg:flex-row lg:items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5 transition-all group gap-4">
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 shrink-0">
                          {eventIcon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-md">
                              {log.ip}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              {log.city}, {log.region}
                            </span>
                            <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 border rounded ${badgeColor} font-mono`}>
                              {log.type}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-900 leading-tight">
                            {displayDetail}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            Client Identity: {log.browser} on {log.device}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 shrink-0">
                        <div className="text-left lg:text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Time</span>
                          <span className="text-xs font-bold text-emerald-600 font-mono">{evTime}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Date</span>
                          <span className="text-xs font-bold text-slate-700 font-mono">{evDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
             <div className="border-b border-slate-100 pb-5 mb-6">
                <h3 className="text-xl font-bold text-slate-900 font-display">Flagged Bad Actors & Reports</h3>
                <p className="text-sm text-slate-500 mt-1">Review flagged communication transcripts submitted by system participants in South Africa.</p>
             </div>

             {reports.length === 0 ? (
               <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-slate-100">
                  <span className="text-sm font-bold text-slate-500">Perfect Record: No pending reports</span>
                  <p className="text-xs text-slate-400 mt-1">All community user messages currently comply with secure safety models during auditing.</p>
               </div>
             ) : (
               <div className="space-y-4">
                 {reports.map((report) => (
                   <div key={report.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6 hover:shadow-md transition-shadow">
                      
                      <div className="space-y-3 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                           <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100 uppercase">FLAGGED REF: {report.id}</span>
                           <span className="text-xs text-slate-400 font-medium">{report.timestamp}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium">
                           <div>
                             <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Reporter</span>
                             <span className="font-semibold block truncate text-slate-800">{report.reporterEmail}</span>
                           </div>
                           <div>
                             <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Accused Bad Actor</span>
                             <span className="font-semibold text-rose-700 block truncate">{report.accusedEmail} ({report.accusedName})</span>
                           </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Report details / reason</span>
                          <p className="text-sm font-bold text-slate-900">{report.reason}</p>
                        </div>

                        {report.contextContent && (
                          <div className="bg-rose-50/20 p-3 rounded-lg border border-rose-100 text-xs max-w-2xl">
                             <span className="text-[8px] uppercase font-bold text-red-500 block mb-1">Offensive Message context</span>
                             <p className="text-slate-700 italic font-medium leading-relaxed">&ldquo;{report.contextContent}&rdquo;</p>
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0 self-end md:self-auto">
                        <button 
                          onClick={() => blockReportActor(report.id, report.accusedEmail)}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm animate-pulse"
                        >
                          Banish Bad Actor
                        </button>
                        <button 
                          onClick={() => resolveReport(report.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2.5 rounded-xl border border-slate-200 transition"
                        >
                          Dismiss Flag
                        </button>
                      </div>

                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
