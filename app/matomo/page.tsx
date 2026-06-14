"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Globe, BarChart3, Clock, MapPin, Monitor, Server, Plus, Download, ChevronRight, Hash } from "lucide-react";
import { getAnalyticsEvents, AnalyticsEvent, ExternalSiteEvent } from "@/lib/analytics-utils";

export default function MatomoDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [properties, setProperties] = useState<{id: string, domain: string, added: string}[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [activeProperty, setActiveProperty] = useState<string>("internal"); // internal or external domain

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== "ADMIN") {
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setEvents(getAnalyticsEvents());
      const savedProps = localStorage.getItem("bs24_matomo_props");
      if (savedProps) {
        try { setProperties(JSON.parse(savedProps)); } catch(e){}
      }
    }
  }, []);

  const addProperty = () => {
    if(!newDomain.trim() || !newDomain.includes(".")) return;
    const clean = newDomain.trim().toLowerCase().replace(/^https?:\/\//, "");
    if(properties.find(p => p.domain === clean)) return;
    
    const next = [...properties, { id: "prop_" + Date.now(), domain: clean, added: new Date().toISOString() }];
    setProperties(next);
    localStorage.setItem("bs24_matomo_props", JSON.stringify(next));
    setNewDomain("");
    console.log(`Tracking property ${clean} registered.`);
  };

  if (isLoading || !user || user.role !== "ADMIN") return null;

  // Filter logic based on property
  let displayedEvents = events;
  if (activeProperty === "internal") {
    // Only internal events
    displayedEvents = events.filter(e => e.type !== "external_site");
  } else {
    // External events matching domain
    const propDomain = properties.find(p => p.id === activeProperty)?.domain;
    if (propDomain) {
      displayedEvents = events.filter(e => e.type === "external_site" && (e as ExternalSiteEvent).targetUrl.includes(propDomain));
    } else {
      displayedEvents = [];
    }
  }

  // Summary stats
  const totalVisits = displayedEvents.length;
  const uniqueIps = new Set(displayedEvents.map(e => e.ip)).size;
  const topBrowsers = Object.entries(displayedEvents.reduce((acc, e) => { acc[e.browser] = (acc[e.browser]||0)+1; return acc; }, {} as Record<string, number>)).sort((a,b)=>b[1]-a[1]).slice(0, 3);
  const recentEvents = [...displayedEvents].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 50); // limit pile up

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 pb-20">
      <div className="bg-[#1e293b] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-emerald-500 rounded flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
             <div>
               <h1 className="font-bold text-lg leading-tight">BizSearch24 Analytics Node</h1>
               <div className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">Self-Hosted Matomo Equivalent</div>
             </div>
           </div>
           <button onClick={() => router.push('/admin')} className="text-sm font-medium hover:text-emerald-400 flex items-center">
             Back to Admin <ChevronRight className="w-4 h-4 ml-1" />
           </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Properties Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded border border-slate-200 shadow-sm p-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Monitoring Properties</h2>
              
              <button 
                onClick={() => setActiveProperty("internal")}
                className={`w-full text-left px-3 py-2 rounded mb-2 text-sm font-bold flex items-center gap-2 ${activeProperty === 'internal' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'hover:bg-slate-50 text-slate-700 border border-transparent'}`}
              >
                <Server className="w-4 h-4" /> BizSearch24 (Internal)
              </button>
              
              <div className="h-px bg-slate-100 my-4"></div>
              <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-2">External Trackers</h3>
              
              {properties.map(p => (
                 <button 
                   key={p.id}
                   onClick={() => setActiveProperty(p.id)}
                   className={`w-full text-left px-3 py-2 rounded mb-2 text-sm font-bold flex items-center gap-2 overflow-hidden text-ellipsis ${activeProperty === p.id ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'hover:bg-slate-50 text-slate-700 border border-transparent'}`}
                 >
                   <Globe className="w-4 h-4 shrink-0" /> <span className="truncate">{p.domain}</span>
                 </button>
              ))}

              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <input type="text" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="example.com" className="w-full bg-slate-50 border border-slate-200 text-sm px-3 py-2 rounded outline-none focus:border-emerald-500" />
                <button onClick={addProperty} className="w-full bg-slate-900 text-white rounded px-3 py-2 text-xs font-bold flex items-center justify-center gap-1 hover:bg-slate-800"><Plus className="w-3 h-3" /> Add External Website</button>
              </div>
            </div>
          </div>

          {/* Main Dashboard Panel */}
          <div className="lg:col-span-3 space-y-6">
             {/* Snippet display if external */}
             {activeProperty !== "internal" && (
                <div className="bg-slate-900 text-slate-300 rounded-lg p-5 border border-slate-800 shadow shadow-sky-900/10">
                  <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2"><Hash className="w-4 h-4 text-sky-400"/> Tracking Snippet for this Property</h3>
                  <p className="text-xs mb-3 text-slate-400">Place this code before the closing &lt;/head&gt; tag on all pages of the target website. It automatically picks up the URL path it is embedded on.</p>
                  <pre className="p-3 bg-black/50 rounded font-mono text-[10px] text-sky-300 overflow-x-auto select-all">
{`<!-- BizSearch24 External Tracker -->
<script>
  (function() {
    var trackerUrl = "https://bizsearch24.co.za/api/track/ping";
    var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.async = true; g.src = trackerUrl + "?domain=${properties.find(p => p.id === activeProperty)?.domain}&path=" + encodeURIComponent(window.location.pathname);
    s.parentNode.insertBefore(g, s);
  })();
</script>
<!-- End Tracker Code -->`}
                  </pre>
                </div>
             )}

             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Hits</div>
                  <div className="text-3xl font-bold font-mono text-slate-900">{totalVisits}</div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Unique IP Addresses</div>
                  <div className="text-3xl font-bold font-mono text-indigo-600">{uniqueIps}</div>
                </div>
                <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-center border-t-4 border-t-emerald-500">
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Top Browsers</div>
                  {topBrowsers.length === 0 ? <div className="text-sm text-slate-400 italic">No data yet</div> : topBrowsers.map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-700 truncate">{name}</span>
                      <span className="text-slate-500 bg-slate-100 px-1.5 rounded">{count}</span>
                    </div>
                  ))}
                </div>
             </div>

             <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
               <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-lg">
                 <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-600" /> Live Visitor Stream (Last 50 Entries)</h3>
                 <span className="bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block"></span> Recv Data</span>
               </div>
               
               <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200">
                     <tr>
                       <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Timestamp</th>
                       <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Type / Path</th>
                       <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">IP Address</th>
                       <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Location</th>
                       <th className="px-4 py-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">Client Identity</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {recentEvents.length === 0 && (
                       <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400 text-sm">No activity recorded for this property yet. Waiting for pings...</td></tr>
                     )}
                     {recentEvents.map(ev => {
                       let pathStr = "";
                       if(ev.type === 'pageview') pathStr = `Page: ${ev.pathname}`;
                       else if(ev.type === 'external_site') pathStr = `Path: ${ev.targetUrl}`;
                       else if(ev.type === 'search') pathStr = `Search: ${ev.query}`;
                       else if(ev.type === 'upload') pathStr = `Upload: ${ev.fileName}`;
                       else if(ev.type === 'adclick') pathStr = `Ad Click: ${ev.adId}`;

                       return (
                         <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-4 py-3 text-xs text-slate-500 font-mono whitespace-nowrap">{new Date(ev.timestamp).toLocaleString()}</td>
                           <td className="px-4 py-3">
                             <div className="flex items-center gap-1.5">
                               {ev.type === 'external_site' ? <Globe className="w-3.5 h-3.5 text-sky-500" /> : <Monitor className="w-3.5 h-3.5 text-emerald-500" /> }
                               <span className="text-xs font-bold text-slate-900">{pathStr}</span>
                             </div>
                           </td>
                           <td className="px-4 py-3 text-xs font-mono text-slate-500">{ev.ip || 'Unknown'}</td>
                           <td className="px-4 py-3">
                             {ev.city ? (
                               <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                                 <MapPin className="w-3 h-3 text-slate-400" /> {ev.city}, {ev.region}
                               </div>
                             ) : <span className="text-xs text-slate-400 italic">Unknown Location</span>}
                           </td>
                           <td className="px-4 py-3 text-[11px] text-slate-500 leading-tight">
                             {ev.browser} <br/><span className="text-slate-400">{ev.device}</span>
                           </td>
                         </tr>
                       );
                     })}
                   </tbody>
                 </table>
               </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}
