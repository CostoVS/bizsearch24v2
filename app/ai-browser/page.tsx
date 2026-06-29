"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  Globe,
  ArrowLeft,
  RotateCw,
  BookOpen,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check,
  X,
  Compass,
  FileText,
  AlertCircle
} from "lucide-react";

interface SearchLink {
  title: string;
  url: string;
  snippet: string;
}

export default function AIBrowserPage() {
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  
  // Search state variables
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [links, setLinks] = useState<SearchLink[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-app Virtual Browser state variables
  const [activeTab, setActiveTab] = useState<"reader" | "live">("reader");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [viewerMarkdown, setViewerMarkdown] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSummary(null);
    setLinks([]);
    setHasSearched(true);
    
    // Reset in-app browser view on new search
    setActiveUrl(null);
    setActiveTitle(null);
    setViewerMarkdown(null);
    setViewerError(null);

    try {
      const response = await fetch("/api/ai-browser/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        throw new Error("Local backend query dispatch failed.");
      }

      const data = await response.json();
      
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setSummary(data.summary || "");
        setLinks(data.links || []);
        
        // Auto-load the first source in the in-app browser view for premium experience
        if (data.links && data.links.length > 0) {
          handleOpenInAppBrowser(data.links[0].url, data.links[0].title);
        }
      }
    } catch (err: any) {
      console.error("AI Browser Search Error:", err);
      setErrorMsg("Failed to connect to local Llama3 VPS. Ensure Ollama/Llama3 VPS endpoint is reachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenInAppBrowser = async (url: string, title: string) => {
    setActiveUrl(url);
    setActiveTitle(title);
    setIsViewerLoading(true);
    setViewerError(null);
    setViewerMarkdown(null);
    
    try {
      const response = await fetch("/api/ai-browser/view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error("Unable to parse website content.");
      }

      const data = await response.json();
      if (data.error) {
        setViewerError(data.error);
      } else {
        setViewerMarkdown(data.markdown);
      }
    } catch (err: any) {
      console.error("In-app browser reader error:", err);
      setViewerError("This webpage blocks direct in-app reading. Try switching to the Live Page tab.");
    } finally {
      setIsViewerLoading(false);
    }
  };

  return (
    <div className="flex-grow bg-[#f8f9fa] text-[#202124] min-h-[calc(100vh-80px)] font-sans flex flex-col">
      
      {/* 1. GOOGLE SEARCH HOMEPAGE VIEW (BEFORE SEARCH) */}
      {!hasSearched && (
        <div className="flex-grow flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full -mt-10">
          <div className="text-center space-y-1 mb-8">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-[#1a0dab] font-serif">
              BizSearch<span className="text-[#ea4335]">24</span> <span className="text-[#fbc02d]">AI</span> <span className="text-[#34a853]">Browser</span>
            </h1>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Secure Llama3 Local VPS Agent
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full relative group">
            <div className="relative w-full shadow-md hover:shadow-lg focus-within:shadow-lg transition bg-white border border-slate-200 rounded-full flex items-center px-5 py-3.5">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search the entire web with AI..."
                className="w-full outline-none text-base text-slate-800 bg-transparent placeholder-slate-400 font-normal"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                type="submit"
                disabled={!query.trim()}
                className="px-6 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] rounded-lg text-sm font-medium text-[#3c4043] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                AI Web Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("Latest technology trends in South Africa");
                }}
                className="px-6 py-2.5 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] rounded-lg text-sm font-medium text-[#3c4043] transition"
              >
                I&apos;m Feeling Lucky
              </button>
            </div>
          </form>

          {/* Minimalist Footnote (No technical leaks, no credentials shown) */}
          <div className="mt-16 text-center space-y-2">
            <p className="text-xs text-slate-400 font-medium">
              BizSearch24 Safe AI Sandboxed Web Crawler. Uses standard secure local routing.
            </p>
          </div>
        </div>
      )}

      {/* 2. RESULTS AND DUAL-PANE VIEWPORT VIEW (AFTER SEARCH) */}
      {hasSearched && (
        <div className="flex-grow flex flex-col">
          
          {/* Top Search Bar Row (Google Style) */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center justify-between w-full md:w-auto shrink-0">
              <button
                onClick={() => {
                  setHasSearched(false);
                  setQuery("");
                  setSummary(null);
                  setLinks([]);
                }}
                className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-bold text-sm transition mr-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <h2 className="text-xl font-black text-[#1a0dab] font-serif select-none md:block hidden">
                BizSearch24 <span className="text-[#34a853] text-sm font-sans font-bold uppercase tracking-wider">Browser</span>
              </h2>
            </div>

            <form onSubmit={handleSearch} className="w-full max-w-3xl flex-grow">
              <div className="relative w-full shadow-sm hover:shadow-md focus-within:shadow-md transition bg-[#f1f3f4]/80 hover:bg-white focus-within:bg-white border border-transparent focus-within:border-slate-200 rounded-full flex items-center px-4 py-2">
                <Search className="w-4 h-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search live web with AI..."
                  className="w-full outline-none text-sm text-slate-800 bg-transparent placeholder-slate-400 font-normal"
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="p-1 text-slate-400 hover:text-indigo-600 transition"
                >
                  <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </form>
          </div>

          {/* Dual-Pane Viewport Wrapper */}
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-145px)]">
            
            {/* LEFT COLUMN: Google-Style Search List & Llama3 Summary (lg:col-span-5) */}
            <div className="lg:col-span-5 border-r border-slate-200 overflow-y-auto bg-white p-5 sm:p-6 space-y-6 scrollbar-thin">
              
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800">Llama3 is browsing the web...</p>
                    <p className="text-xs text-slate-400">Retrieving sources & facts</p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-700 leading-relaxed font-semibold">{errorMsg}</p>
                </div>
              )}

              {!isLoading && (summary || links.length > 0) && (
                <div className="space-y-6">
                  
                  {/* Clean direct answer from Llama3 */}
                  {summary && (
                    <div className="bg-[#f8f9fa] border border-slate-200 p-5 rounded-2xl shadow-sm relative overflow-hidden">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2.5 mb-3">
                        <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          AI Direct Answer
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">Llama3 VPS Agent</span>
                      </div>
                      <div className="prose prose-slate prose-sm max-w-none text-[#3c4043] leading-relaxed text-sm">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Classic Google-Style Results List */}
                  <div className="space-y-5">
                    <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Web Search Results
                    </h3>

                    {links.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No direct links crawled.</p>
                    ) : (
                      <div className="space-y-4">
                        {links.map((link, idx) => {
                          const isActive = activeUrl === link.url;
                          return (
                            <div
                              key={idx}
                              onClick={() => handleOpenInAppBrowser(link.url, link.title)}
                              className={`p-4 rounded-xl border transition-all text-left cursor-pointer group relative overflow-hidden ${
                                isActive
                                  ? "bg-indigo-50/50 border-indigo-200/80 shadow-sm"
                                  : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400 font-mono truncate block">
                                  {link.url}
                                </span>
                                <h4 className="font-bold text-sm sm:text-base text-[#1a0dab] group-hover:underline leading-snug">
                                  {link.title}
                                </h4>
                                <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                                  {link.snippet}
                                </p>
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                                <span className="text-indigo-600 flex items-center gap-1">
                                  Open Inside AI Browser
                                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                                {isActive && (
                                  <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                    <Check className="w-3 h-3" /> Loaded
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Interactive In-App Browser Window Frame (lg:col-span-7) */}
            <div className="lg:col-span-7 bg-[#1e1e1e] flex flex-col h-full overflow-hidden">
              
              {/* Virtual Browser Top Frame Bar */}
              <div className="bg-[#2d2d2d] px-4 py-2 border-b border-[#1a1a1a] flex items-center justify-between gap-3 shrink-0 select-none">
                
                {/* Simulated window circles */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>

                {/* Simulated URL Address Bar */}
                <div className="flex-grow max-w-xl mx-auto bg-[#1e1e1e] border border-[#3e3e3e] px-3.5 py-1.5 rounded-lg flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-300 truncate font-mono select-all">
                    {activeUrl || "about:blank"}
                  </span>
                </div>

                {/* Tab Switcher Mode buttons inside URL Bar frame */}
                {activeUrl && (
                  <div className="flex items-center gap-1 bg-[#1e1e1e] border border-[#3e3e3e] p-0.5 rounded-lg text-xs shrink-0">
                    <button
                      onClick={() => setActiveTab("reader")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                        activeTab === "reader"
                          ? "bg-[#2d2d2d] text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <BookOpen className="w-3 h-3" />
                      AI Reader View
                    </button>
                    <button
                      onClick={() => setActiveTab("live")}
                      className={`px-2.5 py-1 rounded-md font-bold transition flex items-center gap-1 ${
                        activeTab === "live"
                          ? "bg-[#2d2d2d] text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      Live Page
                    </button>
                  </div>
                )}
              </div>

              {/* Viewport Box Content */}
              <div className="flex-grow bg-[#121212] overflow-y-auto relative p-4 sm:p-6 scrollbar-thin">
                
                {!activeUrl && (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3">
                    <Compass className="w-12 h-12 text-slate-700 animate-spin" style={{ animationDuration: '8s' }} />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold">Virtual Browser Viewport</p>
                      <p className="text-xs text-slate-600">Click any web search result link on the left to browse inside this page!</p>
                    </div>
                  </div>
                )}

                {activeUrl && isViewerLoading && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                    <div className="w-8 h-8 border-3 border-slate-600 border-t-white rounded-full animate-spin" />
                    <p className="text-xs text-slate-400 font-mono">Parsing webpage elements & synthesizing text via Llama3 VPS...</p>
                  </div>
                )}

                {activeUrl && !isViewerLoading && (
                  <div className="h-full">
                    {activeTab === "reader" ? (
                      /* AI Reader Mode Render Pane */
                      <div className="max-w-3xl mx-auto bg-[#1c1c1e] text-slate-200 border border-[#2c2c2e] p-6 sm:p-8 rounded-2xl shadow-xl min-h-[90%] font-serif leading-relaxed">
                        <div className="border-b border-[#2c2c2e] pb-4 mb-6 flex flex-col gap-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest">
                            <BookOpen className="w-4 h-4 text-indigo-400" />
                            Llama3 AI Sandboxed Reader View
                          </div>
                          <h1 className="text-2xl sm:text-3xl font-black font-sans text-white">
                            {activeTitle || "Parsed Source Article"}
                          </h1>
                          <p className="text-xs text-slate-500 truncate">
                            Source: <a href={activeUrl} target="_blank" rel="noopener noreferrer" className="hover:underline text-indigo-400">{activeUrl}</a>
                          </p>
                        </div>

                        {viewerError ? (
                          <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl text-rose-300 text-xs leading-relaxed space-y-3 font-sans">
                            <p className="font-semibold">{viewerError}</p>
                            <button
                              onClick={() => setActiveTab("live")}
                              className="px-4 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-white rounded-lg text-[11px] font-bold transition border border-rose-800/40"
                            >
                              Force Load Live Page
                            </button>
                          </div>
                        ) : (
                          <div className="prose prose-invert prose-indigo prose-sm max-w-none text-slate-300 selection:bg-indigo-500/30">
                            <ReactMarkdown>{viewerMarkdown || ""}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Live Iframe Viewport Pane */
                      <div className="w-full h-full min-h-[500px] bg-white rounded-2xl overflow-hidden relative border border-[#2c2c2e]">
                        {/* Notice for X-Frame limitations */}
                        <div className="bg-[#f1f3f4] border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 font-sans shrink-0">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Globe className="w-3.5 h-3.5 text-slate-500" />
                            Live Iframe Renderer Sandbox
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            Note: Some domains block embedding. Use Reader View as fallback.
                          </span>
                        </div>
                        <iframe
                          src={activeUrl}
                          className="w-full h-[calc(100%-40px)] bg-white"
                          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
