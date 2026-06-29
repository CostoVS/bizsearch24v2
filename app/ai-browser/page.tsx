"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Bot,
  Globe,
  Settings,
  Terminal,
  ExternalLink,
  ChevronRight,
  Server,
  Sparkles,
  Info,
  Layers,
  CheckCircle,
  AlertCircle,
  Link as LinkIcon,
  X,
  Play
} from "lucide-react";
import { safeLocalStorage } from "@/lib/data";

interface SearchLink {
  title: string;
  url: string;
  snippet: string;
}

export default function AIBrowserPage() {
  const [query, setQuery] = useState("");
  const [useModel, setUseModel] = useState<"llama3" | "gemini">("llama3");
  const [llama3Url, setLlama3Url] = useState("http://localhost:11434");
  const [llama3ApiKey, setLlama3ApiKey] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  
  // States for search execution
  const [isLoading, setIsLoading] = useState(false);
  const [currentLogs, setCurrentLogs] = useState<string[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [links, setLinks] = useState<SearchLink[]>([]);
  const [activeEngine, setActiveEngine] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize from localStorage on load
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
    
    if (typeof window !== "undefined") {
      const storedUrl = safeLocalStorage.getItem("bizsearch24_vps_url");
      const storedKey = safeLocalStorage.getItem("bizsearch24_vps_key");
      const storedEngine = safeLocalStorage.getItem("bizsearch24_vps_engine");
      
      /* eslint-disable react-hooks/set-state-in-effect */
      if (storedUrl) setLlama3Url(storedUrl);
      if (storedKey) setLlama3ApiKey(storedKey);
      if (storedEngine === "llama3" || storedEngine === "gemini") {
        setUseModel(storedEngine);
      }
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, []);

  // Save configurations to localStorage
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      safeLocalStorage.setItem("bizsearch24_vps_url", llama3Url);
      safeLocalStorage.setItem("bizsearch24_vps_key", llama3ApiKey);
      safeLocalStorage.setItem("bizsearch24_vps_engine", useModel);
    }
    setShowSettings(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSummary(null);
    setLinks([]);
    setCurrentLogs(["Initializing Agentic Browser Router..."]);

    try {
      const response = await fetch("/api/ai-browser/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query.trim(),
          useModel,
          llama3Url: useModel === "llama3" ? llama3Url : undefined,
          llama3ApiKey: useModel === "llama3" ? llama3ApiKey : undefined
        })
      });

      if (!response.ok) {
        throw new Error("Local backend query dispatch failed.");
      }

      const data = await response.json();
      
      // Update states gracefully
      setCurrentLogs(data.logs || ["Search finished with fallback routing."]);
      setSummary(data.summary || "");
      setLinks(data.links || []);
      setActiveEngine(data.engine || "Gemini Core");
    } catch (err: any) {
      console.error("AI Browser Search Error:", err);
      setErrorMsg("Failed to complete AI Browser execution. Verify your network or VPS local settings.");
      setCurrentLogs(prev => [...prev, `CRITICAL ERROR: Connection interrupted.`]);
    } finally {
      setIsLoading(false);
    }
  };

  // Preset queries for quick-access searching
  const PRESETS = [
    "Latest tech news in South Africa 2026",
    "Best co-working spaces in Cape Town",
    "Requirements to register .co.za domains",
    "How to claim a business listing on BizSearch24"
  ];

  return (
    <div className="flex-grow bg-slate-900 text-slate-100 min-h-[calc(100vh-80px)] font-sans flex flex-col">
      {/* Top Futuristic Browser Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-400">
              <Globe className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
              AGENTIC REAL-TIME INTERNET BROWSER
            </div>
            <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight text-white">
              AI Web <span className="text-indigo-400">Browser</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-xl">
              Powered by local VPS Llama3 & Search Grounding. Surf the entire live web instantly and retrieve summarized facts straight to the point.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setUseModel("llama3");
                if (typeof window !== "undefined") safeLocalStorage.setItem("bizsearch24_vps_engine", "llama3");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                useModel === "llama3"
                  ? "bg-purple-600/20 border-purple-500 text-purple-300 shadow-lg shadow-purple-600/10"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <Server className="w-3.5 h-3.5 text-purple-400" />
              Llama3 (VPS Local Agent)
            </button>

            <button
              onClick={() => {
                setUseModel("gemini");
                if (typeof window !== "undefined") safeLocalStorage.setItem("bizsearch24_vps_engine", "gemini");
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${
                useModel === "gemini"
                  ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-600/10"
                  : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Gemini Web Engine
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 hover:border-slate-700 transition"
              title="Configure VPS Llama3 API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Modal Component inside page */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-lg text-white">Llama3 VPS Configuration</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    VPS Llama3 API Base Endpoint URL
                  </label>
                  <input
                    type="url"
                    value={llama3Url}
                    onChange={(e) => setLlama3Url(e.target.value)}
                    required
                    placeholder="e.g. http://your-vps-ip:11434"
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-100 placeholder-slate-600"
                  />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Specify your VPS IP/port (for Ollama, default is port 11434; for OpenAI compatibility, point to your `/v1` endpoint). Server-side routing handles queries to bypass browser CORS.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                    VPS Access Bearer Token / API Key <span className="text-slate-600 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={llama3ApiKey}
                    onChange={(e) => setLlama3ApiKey(e.target.value)}
                    placeholder="Enter API key or password if VPS is secured"
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-100 placeholder-slate-600"
                  />
                </div>

                <div className="bg-indigo-950/30 border border-indigo-800/20 p-3 rounded-xl flex gap-2.5 items-start">
                  <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-indigo-300/90 leading-relaxed">
                    Configurations are saved securely inside your browser&apos;s private local storage and are never logged or transmitted elsewhere.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/10"
                  >
                    Save & Apply
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Sandbox Interactive Workspace */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 flex-grow flex flex-col gap-8">
        
        {/* Mock Browser Interface Bar */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-1.5 mb-3.5">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600 ml-2 font-mono">Agent Web Explorer v2.6.0</span>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="flex-grow relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your search query to crawl the web (e.g., 'Gauteng business tax benefits 2026')..."
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 pl-11 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-white placeholder-slate-500 transition shadow-inner"
                disabled={isLoading}
              />
              <Search className="w-5 h-5 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
            
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 text-white text-sm font-bold rounded-xl transition cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/10 disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Browsing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white text-white" />
                  Execute
                </>
              )}
            </button>
          </form>

          {/* Quick-select helper presets */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-slate-900">
            <span className="text-xs text-slate-500 font-medium mr-1.5">Suggested Queries:</span>
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setQuery(p)}
                disabled={isLoading}
                className="text-[11px] bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-indigo-300 border border-slate-850 hover:border-indigo-900/40 px-3 py-1.5 rounded-lg transition"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Content results & Terminal layout logs split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Agent execution console logs terminal */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
              <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-indigo-400 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-500" />
                  Crawler Console Logs
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="p-4 font-mono text-xs space-y-2.5 min-h-[160px] max-h-[400px] overflow-y-auto bg-[#080d1a] text-slate-400 scrollbar-thin scrollbar-thumb-slate-800">
                {currentLogs.length === 0 ? (
                  <p className="text-slate-600 italic">No search executed yet. Ready to parse URLs...</p>
                ) : (
                  currentLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 items-start leading-relaxed text-slate-300">
                      <span className="text-indigo-500 select-none">&gt;</span>
                      <span>{log}</span>
                    </div>
                  ))
                )}
                
                {isLoading && (
                  <div className="flex gap-2 items-center text-indigo-400 font-semibold italic animate-pulse pt-1">
                    <span className="text-indigo-500">&gt;</span>
                    <span>Synthesizing browser payload...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick stats / Information widget */}
            <div className="bg-slate-900/60 rounded-2xl border border-slate-800/70 p-5 space-y-3.5">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-slate-400" />
                How the Browser Works
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our AI Agent executes web grounding calls. It parses direct source links, aggregates up-to-date descriptions, and compiles a comprehensive, factual overview directly via your local VPS Llama3.
              </p>
              <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Core Framework: Next.js 15+</span>
                <span>Port: 3000 Standard</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Straight-to-the-point response container */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Primary summarized direct response */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 sm:p-8 min-h-[300px] shadow-xl flex flex-col justify-between relative overflow-hidden">
              {/* Soft futuristic background details */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Bot className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h3 className="font-bold text-sm text-white uppercase tracking-wider">Browser Summary Response</h3>
                      {activeEngine && (
                        <span className="text-[10px] text-emerald-400 font-mono font-semibold bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                          Synthesized by {activeEngine}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* State responses */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-200">Browsing and analyzing internet sources...</p>
                      <p className="text-xs text-slate-500">Retrieving real-time details from live index</p>
                    </div>
                  </div>
                )}

                {!isLoading && !summary && !errorMsg && (
                  <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 space-y-3">
                    <Globe className="w-12 h-12 text-slate-700 stroke-[1.5]" />
                    <p className="text-sm">Enter a search query in the toolbar above to browse the live web.</p>
                  </div>
                )}

                {errorMsg && (
                  <div className="bg-rose-950/30 border border-rose-900/50 text-rose-300 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <p className="text-xs leading-relaxed">{errorMsg}</p>
                  </div>
                )}

                {/* The actual markdown/text compiled response */}
                {!isLoading && summary && (
                  <div className="prose prose-invert prose-xs leading-relaxed max-w-none text-slate-300 whitespace-pre-line text-sm sm:text-base selection:bg-indigo-500/30">
                    {summary}
                  </div>
                )}
              </div>
            </div>

            {/* Compiled source hyperlinks and descriptions */}
            {!isLoading && links.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-base text-white tracking-tight flex items-center gap-2 pl-1">
                  <LinkIcon className="w-4 h-4 text-slate-400" />
                  Direct Source Links & References ({links.length})
                </h3>

                <div className="grid grid-cols-1 gap-3.5">
                  {links.map((link, idx) => {
                    const isExternal = link.url.startsWith("http");
                    return (
                      <div
                        key={idx}
                        className="bg-slate-950 border border-slate-800/80 hover:border-slate-700/80 p-5 rounded-2xl shadow-md transition flex flex-col justify-between gap-3 group relative overflow-hidden"
                      >
                        <div className="space-y-1.5 relative z-10">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/40 px-2.5 py-1 rounded border border-indigo-900/40">
                              Source #{idx + 1}
                            </span>
                            <span className="text-[11px] font-mono text-slate-500 font-semibold group-hover:text-slate-400 transition-colors">
                              {new URL(isExternal ? link.url : "https://bizsearch24.co.za" + link.url).hostname}
                            </span>
                          </div>
                          
                          <a
                            href={link.url}
                            target={isExternal ? "_blank" : "_self"}
                            rel="noopener noreferrer"
                            className="font-bold text-sm sm:text-base text-white hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                          >
                            {link.title}
                            <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-colors inline-block" />
                          </a>

                          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed font-normal">
                            {link.snippet}
                          </p>
                        </div>

                        <div className="border-t border-slate-900 pt-3 flex justify-between items-center text-[11px] text-slate-500 font-mono">
                          <span className="truncate max-w-[250px] sm:max-w-[400px]">
                            {link.url}
                          </span>
                          <a
                            href={link.url}
                            target={isExternal ? "_blank" : "_self"}
                            className="text-indigo-400 font-bold hover:underline flex items-center gap-1 shrink-0"
                          >
                            Browse Source
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
