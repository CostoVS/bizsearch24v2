"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MOCK_USERS, MOCK_ADS } from "@/lib/data";
import { ShieldAlert, Users, Database, Globe, MonitorSmartphone, Settings, Edit, Trash2, LayoutTemplate, Activity, Eye, MousePointerClick } from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dynamic State for Management
  const [users, setUsers] = useState(MOCK_USERS);
  const [ads, setAds] = useState(MOCK_ADS);
  const [userSearch, setUserSearch] = useState("");

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
    setAds(ads.filter(a => a.id !== id));
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.location.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (isLoading || !user || user.role !== "ADMIN") return <div className="p-20 text-center text-slate-500 text-sm">Authenticating Secure Session...</div>;

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center">
          <div className="bg-slate-900 p-3 rounded-xl mr-4 shadow-sm">
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
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                     </label>
                   </div>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Banner Headline</label>
                       <input type="text" defaultValue="🔥 PROMOTE YOUR BUSINESS TODAY! Get 50% off Premium Listings." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Redirect URL</label>
                          <input type="text" defaultValue="/premium" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5 ml-1">Visibility</label>
                          <select className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20">
                             <option>All Pages</option>
                             <option>Home Only</option>
                             <option>Search Results Only</option>
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
                        <select className="bg-slate-50 border border-slate-200 text-[10px] font-bold uppercase tracking-tighter text-slate-700 rounded-lg px-3 py-2 outline-none cursor-pointer focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all">
                          <option>DOMINEER_HOME</option>
                          <option>CAT_TIER_1</option>
                          <option>LOC_TIER_2</option>
                          <option>HIDE_FROM_GRID</option>
                          <option>ARCHIVE_ONLY</option>
                        </select>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end">
                           <button onClick={() => alert("Launching Secure Ad Interaction Logic (SAIL) Editor...")} className="text-slate-400 hover:text-emerald-600 p-2.5 transition active:scale-90" title="Edit Properties"><Edit className="w-5 h-5" /></button>
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

      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <Activity className="w-20 h-20" />
              </div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 font-display">Daily Engagement</h3>
                <Activity className="text-emerald-500 w-6 h-6" />
              </div>
              <p className="text-5xl font-display font-bold text-slate-900 mb-3 tracking-tighter">1,248</p>
              <div className="flex items-center">
                 <span className="text-sm text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded mr-2">+14%</span>
                 <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Unique IP addresses</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 font-display">System Reach</h3>
                <Eye className="text-indigo-500 w-6 h-6" />
              </div>
              <p className="text-5xl font-display font-bold text-slate-900 mb-3 tracking-tighter">3,892</p>
              <div className="flex items-center">
                 <span className="text-xs text-slate-500 font-bold uppercase tracking-widest"><span className="text-indigo-600">Top Hub:</span> Gauteng</span>
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm group">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 font-display">Conversion Node</h3>
                <MousePointerClick className="text-amber-500 w-6 h-6" />
              </div>
              <p className="text-5xl font-display font-bold text-slate-900 mb-3 tracking-tighter">452</p>
              <div className="flex items-center">
                 <span className="text-sm text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded mr-2">4.2%</span>
                 <span className="text-xs text-slate-400 font-medium">System CTR average</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
               <div>
                  <h3 className="text-xl font-bold text-slate-900 font-display">Live Network Identity Stream</h3>
                  <p className="text-sm text-slate-500 mt-1">Real-time monitoring of client requests across South African points of presence.</p>
               </div>
               <div className="flex items-center text-emerald-600 font-bold text-xs uppercase tracking-widest animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mr-2"></div> Incoming_Link
               </div>
            </div>
            <div className="space-y-4">
              {[
                { ip: '197.23.45.11', page: '/gauteng', search: '', time: '2 mins ago', location: 'Johannesburg' },
                { ip: '41.13.120.11', page: '/directory', search: '?q=electrician&town=Umkomaas', time: '14 mins ago', location: 'Umkomaas' },
                { ip: '102.132.89.44', page: '/premium', search: '', time: '32 mins ago', location: 'Durban' },
                { ip: '197.80.12.99', page: '/posts', search: '', time: '1 hour ago', location: 'Sandton' },
              ].map((log, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-900/5 transition-all group">
                   <div className="flex items-center mb-3 sm:mb-0 min-w-0">
                     <div className="bg-slate-50 p-2 rounded-lg mr-4 border border-slate-100 flex-shrink-0">
                        <Globe className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                     </div>
                     <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                           <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-md">{log.ip}</span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase">{log.location}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 truncate block sm:max-w-xs">{log.page}{log.search}</span>
                     </div>
                   </div>
                   <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                     <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol</div>
                        <div className="text-xs font-bold text-emerald-600">HTTPS/2.0</div>
                     </div>
                     <div className="text-right">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</div>
                        <div className="text-xs font-bold text-slate-700">{log.time}</div>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
