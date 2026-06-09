'use client';

import { useState, useEffect } from 'react';
import { Newspaper, Globe, MapPin, Search, RefreshCcw, ExternalLink, ShieldCheck, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsItem {
  headline: string;
  summary: string;
  source: string;
  url?: string;
  category: string;
  timestamp?: string;
}

const CATEGORIES = ["General", "Politics", "Business", "Technology", "Sports", "Health", "Entertainment"];

export default function NewsPage() {
  const [region, setRegion] = useState<'south-africa' | 'international'>('south-africa');
  const [category, setCategory] = useState("General");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`/api/news?region=${region}&category=${category}`);
      const data = await resp.json();
      setNews(data.news || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, category]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full border border-emerald-500/20 text-xs font-bold uppercase tracking-widest">
                <Newspaper className="w-4 h-4" /> Global & Local News
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                LLaMA-3 NEWS ENGINE
              </h1>
              <p className="text-slate-400 max-w-xl text-lg font-medium">
                Live South African news parsed directly from online sources and summarized by local LLaMA-3 pipelines.
              </p>
            </div>
            
            <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
              <button
                onClick={() => setRegion('south-africa')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs transition-all ${
                  region === 'south-africa' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapPin className="w-4 h-4" /> SOUTH AFRICA
              </button>
              <button
                onClick={() => setRegion('international')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs transition-all ${
                  region === 'international' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" /> INTERNATIONAL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Constraints & Stats */}
      <div className="max-w-6xl mx-auto -mt-8 px-6 pb-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8">
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mb-8 items-center">
            <div className="flex items-center gap-2 text-slate-400 mr-2 uppercase text-[10px] font-black tracking-widest">
              <Filter className="w-3 h-3" /> Categories:
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  category === cat
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg'
                    : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
            
            <div className="flex-1" />
            
            {lastUpdated && (
              <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
                <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>

          {/* News List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <AnimatePresence mode="popLayout">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={`loader-${i}`} className="animate-pulse bg-slate-50 rounded-3xl p-8 h-64 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="h-4 bg-slate-200 rounded w-1/4" />
                      <div className="h-8 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-2/3" />
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                  </div>
                ))
              ) : news.length > 0 ? (
                news.map((item, idx) => (
                  <motion.div
                    key={`${item.headline}-${idx}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-white hover:bg-slate-50 border border-slate-100 p-8 rounded-3xl transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">
                          {item.source}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors tracking-tight leading-tight">
                        {item.headline}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6 font-medium">
                        {item.summary}
                      </p>
                    </div>
                    
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-600 font-black text-xs hover:gap-3 transition-all uppercase tracking-widest"
                      >
                        Read Full Story <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <div className="bg-slate-50 inline-flex p-6 rounded-full mb-4">
                    <Search className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-bold">No news found for this category.</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Disclaimer (Fair Use Notice) */}
          <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 mt-12">
            <div className="bg-amber-100 p-2 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-xs text-amber-950 font-medium leading-relaxed">
              <span className="font-black uppercase text-amber-700">Fair Use & Transparency:</span> These summaries are programmatically scraped and formatted by our local LLaMA-3 summarization pipeline. We respect publisher copyright and provide direct official redirect links to the reference publishers for full articles.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
