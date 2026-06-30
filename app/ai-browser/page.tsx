"use client";

// Real High-Performance Embedded Sandbox Browser with VPS LLM Integration
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  BookOpen,
  ExternalLink,
  Lock,
  Compass,
  Search,
  Cpu,
  Sparkles,
  CheckCircle2,
  Clock,
  Eye,
  ChevronRight,
  GraduationCap,
  PenTool,
  MessageSquare,
  FolderSearch,
  AlertCircle,
  Info,
  RefreshCw,
  Terminal,
  Send
} from "lucide-react";

interface SearchLink {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResponse {
  summary: string;
  links: SearchLink[];
  logs: string[];
  engine: string;
}

const FOCUS_MODES = [
  { id: "all", label: "All Web", icon: Globe, desc: "Search across the entire internet" },
  { id: "academic", label: "Academic", icon: GraduationCap, desc: "Scholarly studies and research articles" },
  { id: "writing", label: "Writing Assist", icon: PenTool, desc: "Draft, write, or converse without web search" },
  { id: "discussions", label: "Discussions", icon: MessageSquare, desc: "Search Reddit, StackOverflow, and forums" },
  { id: "directory", label: "Directory", icon: FolderSearch, desc: "Verified South African business listings" },
];

export default function AiBrowserPage() {
  const [query, setQuery] = useState("");
  const [focus, setFocus] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [summary, setSummary] = useState("");
  const [links, setLinks] = useState<SearchLink[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [engine, setEngine] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // In-app Browser state variables
  const [activeTab, setActiveTab] = useState<"reader" | "live">("reader");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [viewerMarkdown, setViewerMarkdown] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  // Real Embedded Browser State & Refs
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [addressInput, setAddressInput] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as any });
  }, []);

  // Sync addressInput with activeUrl changes
  useEffect(() => {
    if (activeUrl) {
      setAddressInput(activeUrl);
    } else {
      setAddressInput("");
    }
  }, [activeUrl]);

  // Sync navigation events from within the iframe back to the address bar
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "IFRAME_NAVIGATED") {
        if (event.data.url && event.data.url !== activeUrl) {
          setActiveUrl(event.data.url);
          setActiveTab("live");
        }
      }
    };
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [activeUrl]);

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let target = addressInput.trim();
    if (!target) return;
    
    // Auto-prefix protocol if missing
    if (!/^https?:\/\//i.test(target)) {
      target = "https://" + target;
    }
    
    setActiveUrl(target);
    setActiveTitle(target);
    setActiveTab("live");
    setHasSearched(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setHasSearched(true);
    setLogs(["Initializing search sequence...", `Mode: ${focus.toUpperCase()}`]);
    setErrorMsg(null);
    setLinks([]);
    setSummary("");
    setEngine("");

    try {
      const response = await fetch("/api/ai-browser/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, focus }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      setSummary(data.summary || "");
      setLinks(data.links || []);
      setLogs(data.logs || []);
      setEngine(data.engine || "Llama3 (VPS Local Agent)");
    } catch (err: any) {
      console.error("Search error:", err);
      setErrorMsg("Failed to connect to your search engine service. Check your local API configurations.");
      setLogs((prev) => [...prev, "Error: Search sequence failed to execute."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadPage = async (url: string, title: string) => {
    setActiveUrl(url);
    setActiveTitle(title);
    setViewerMarkdown(null);
    setViewerError(null);
    setIsViewerLoading(true);
    setActiveTab("reader");

    try {
      const response = await fetch(`/api/ai-browser/view?url=${encodeURIComponent(url)}`);
      if (!response.ok) {
        throw new Error(`Failed to load page content: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.markdown) {
        setViewerMarkdown(data.markdown);
      } else if (data.error) {
        setViewerError(data.error);
      } else {
        setViewerError("No content could be extracted from this webpage.");
      }
    } catch (err: any) {
      setViewerError(err.message || "Failed to parse webpage.");
    } finally {
      setIsViewerLoading(false);
    }
  };

  // Custom link click handler inside Markdown to preview inside sandbox instead of breaking iframe
  const customLinkRenderer = {
    a: ({ href, children }: any) => {
      const isExternal = href && /^https?:\/\//i.test(href);
      if (isExternal) {
        return (
          <button
            onClick={() => handleLoadPage(href, children?.toString() || href)}
            className="text-emerald-400 hover:text-emerald-300 underline font-semibold transition cursor-pointer text-left inline-block"
          >
            {children}
          </button>
        );
      }
      return (
        <a href={href} className="text-emerald-400 hover:text-emerald-300 underline">
          {children}
        </a>
      );
    },
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col font-sans">
      
      {/* HEADER BAR */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-xl text-black">
            <Globe className="w-5 h-5 text-zinc-950" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-wide uppercase text-white">Secure AI Browser</span>
            <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>VPS Llama3 Connected</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500 hidden sm:inline-block font-mono">
            Focus: <span className="text-emerald-400 capitalize">{focus}</span>
          </span>
          <a
            href="/directory"
            className="text-xs px-3.5 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-300 font-medium transition"
          >
            Business Directory
          </a>
        </div>
      </header>

      {/* VIEWPORT CANVAS GRID */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-65px)]">
        
        {/* LEFT COLUMN: Search & Synthesis Console (lg:col-span-5) */}
        <div className={`lg:col-span-5 border-r border-zinc-800 flex flex-col h-full bg-[#0c0c0e] overflow-y-auto ${activeUrl ? "hidden lg:flex" : "flex"}`}>
          
          <div className="p-6 sm:p-8 space-y-8 flex-grow flex flex-col justify-start">
            
            {/* Minimalist Centered Welcomer/Header */}
            {!hasSearched && (
              <div className="space-y-3 py-6">
                <h1 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400">
                  Where knowledge begins.
                </h1>
                <p className="text-sm text-zinc-400 max-w-md leading-relaxed">
                  A high-performance interactive search interface running strictly on your local VPS Llama3 model.
                </p>
              </div>
            )}

            {/* SEARCH PANEL CARD */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl shadow-xl space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask anything or enter a search query..."
                  className="w-full bg-zinc-950/80 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500 rounded-xl pl-11 pr-12 py-3.5 text-sm text-white placeholder-zinc-500 outline-none transition shadow-inner"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 rounded-lg transition disabled:bg-zinc-800 disabled:text-zinc-600 cursor-pointer"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                </button>
              </form>

              {/* FOCUS MODE PILLS */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">
                  Search Focus
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {FOCUS_MODES.map((mode) => {
                    const Icon = mode.icon;
                    const isSelected = focus === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => setFocus(mode.id)}
                        title={mode.desc}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                            : "bg-zinc-950/40 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{mode.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RESULTS VIEWPORT */}
            <AnimatePresence mode="wait">
              {hasSearched && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 flex-grow flex flex-col justify-start"
                >
                  {/* REALTIME LOGS PANEL */}
                  <div className="bg-[#08080a] border border-zinc-800 rounded-xl p-4 font-mono text-[11px] text-zinc-400 space-y-1.5 shadow-md">
                    <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2 mb-2">
                      <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="font-bold uppercase text-[10px] tracking-wide">Search Agent Logs</span>
                    </div>
                    {logs.map((log, index) => (
                      <div key={index} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 select-none">›</span>
                        <p>{log}</p>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-emerald-400 pt-1.5 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>Llama3 executing synthesis model...</span>
                      </div>
                    )}
                  </div>

                  {/* SYNTHESIS MARKDOWN ANSWER CARD */}
                  {(summary || errorMsg) && (
                    <div className="bg-zinc-900/20 border border-zinc-800/80 p-6 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Answer</h3>
                        </div>
                        {engine && (
                          <span className="text-[10px] text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold">
                            {engine}
                          </span>
                        )}
                      </div>

                      {errorMsg ? (
                        <div className="flex items-start gap-2.5 text-xs text-rose-400 bg-rose-950/10 border border-rose-900/20 p-4 rounded-xl">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <p>{errorMsg}</p>
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-emerald prose-sm max-w-none text-zinc-300 leading-relaxed text-sm selection:bg-emerald-500/20">
                          <ReactMarkdown components={customLinkRenderer}>{summary}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MATCHING WEB SOURCES */}
                  {links.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                          Retrieved Sources ({links.length})
                        </h4>
                      </div>
                      <div className="grid grid-cols-1 gap-2.5">
                        {links.map((link, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleLoadPage(link.url, link.title)}
                            className="bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700/80 p-4 rounded-xl transition cursor-pointer flex flex-col gap-1 shadow-sm relative group"
                          >
                            <span className="absolute top-4 right-4 text-zinc-600 group-hover:text-emerald-400 transition">
                              <ChevronRight className="w-4 h-4" />
                            </span>
                            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 max-w-[90%] truncate">
                              <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                              <span className="truncate">{link.title}</span>
                            </div>
                            <p className="text-xs text-zinc-400 leading-relaxed font-mono line-clamp-1 max-w-[92%] select-all">
                              {link.url}
                            </p>
                            <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2 mt-1 pr-4">
                              {link.snippet}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* RIGHT COLUMN: Real High-Performance Embedded Sandbox Browser (lg:col-span-7) */}
        <div className={`lg:col-span-7 bg-[#1c1c1e] flex flex-col h-full overflow-hidden ${activeUrl ? "block" : "hidden lg:flex"}`}>
          
          {/* Native-style Interactive Browser Controls Header */}
          <div className="bg-[#2c2c2e] px-4 py-2 border-b border-[#1c1c1e] flex items-center justify-between gap-3 shrink-0 select-none">
            
            {/* Back button on mobile, or navigation arrows on desktop */}
            <div className="flex items-center gap-1 shrink-0">
              {activeUrl && (
                <button
                  onClick={() => setActiveUrl(null)}
                  className="lg:hidden flex items-center gap-1 text-xs text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg font-bold transition cursor-pointer border border-[#3c3c3e]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Exit
                </button>
              )}
              
              {/* Desktop Browser Navigation Keys */}
              <div className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                      try {
                        iframeRef.current.contentWindow.history.back();
                      } catch (e) {
                        console.error("Back navigation failed", e);
                      }
                    }
                  }}
                  title="Back"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                      try {
                        iframeRef.current.contentWindow.history.forward();
                      } catch (e) {
                        console.error("Forward navigation failed", e);
                      }
                    }
                  }}
                  title="Forward"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (iframeRef.current && iframeRef.current.contentWindow) {
                      try {
                        iframeRef.current.contentWindow.location.reload();
                      } catch (e) {
                        // If cross-origin block or iframe loading, re-force the activeUrl proxy
                        iframeRef.current.src = `/api/ai-browser/proxy?url=${encodeURIComponent(activeUrl || "")}`;
                      }
                    }
                  }}
                  title="Reload Page"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Secure Editable URL Address Bar */}
            <form onSubmit={handleAddressSubmit} className="flex-grow max-w-xl mx-auto">
              <div className="bg-[#1c1c1e] border border-[#3c3c3e] px-3.5 py-1.5 rounded-lg flex items-center gap-2 focus-within:border-emerald-500/50 transition">
                <Lock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => setAddressInput(e.target.value)}
                  className="w-full bg-transparent text-xs text-slate-200 outline-none font-mono"
                  placeholder="Enter web address or search..."
                />
              </div>
            </form>

            {/* View Mode & New Tab Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {activeUrl && (
                <div className="flex items-center gap-1 bg-[#1c1c1e] border border-[#3c3c3e] p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setActiveTab("reader")}
                    className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer ${
                      activeTab === "reader"
                        ? "bg-[#2c2c2e] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <BookOpen className="w-3 h-3" />
                    AI Reader
                  </button>
                  <button
                    onClick={() => setActiveTab("live")}
                    className={`px-2.5 py-1 rounded font-bold transition flex items-center gap-1 cursor-pointer ${
                      activeTab === "live"
                        ? "bg-[#2c2c2e] text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Globe className="w-3 h-3" />
                    Live Page
                  </button>
                </div>
              )}

              {activeUrl && (
                <a
                  href={activeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open page in a new native window"
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition border border-[#3c3c3e] bg-[#1c1c1e] cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

          </div>

          {/* Viewport Box Content */}
          <div className="flex-grow bg-[#121212] relative flex flex-col overflow-hidden">
            
            {!activeUrl && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-4 p-8">
                <Compass className="w-12 h-12 text-slate-700 animate-spin" style={{ animationDuration: '10s' }} />
                <div className="space-y-1.5">
                  <p className="text-sm font-semibold text-slate-300">Secure Web Sandbox</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Enter any website URL in the address bar above, or search on the left to explore resources live.
                  </p>
                </div>
              </div>
            )}

            {activeUrl && isViewerLoading && (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
                <div className="w-8 h-8 border-3 border-slate-600 border-t-white rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Rendering webpage sandbox content...</p>
              </div>
            )}

            {activeUrl && !isViewerLoading && (
              <div className="w-full h-full flex-grow flex flex-col overflow-hidden">
                {activeTab === "reader" ? (
                  /* AI Reader Mode Render Pane */
                  <div className="flex-grow overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-3xl mx-auto bg-[#1c1c1e] text-slate-200 border border-[#2c2c2e] p-6 sm:p-8 rounded-xl shadow-xl min-h-[90%] font-serif leading-relaxed">
                      <div className="border-b border-[#2c2c2e] pb-4 mb-6 flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                          <BookOpen className="w-4 h-4 text-blue-400" />
                          AI Reader View
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black font-sans text-white">
                          {activeTitle || "Parsed Source Article"}
                        </h1>
                        <p className="text-xs text-slate-500 truncate">
                          Source URL: <span className="text-slate-400 select-all font-mono">{activeUrl}</span>
                        </p>
                      </div>

                      {viewerError ? (
                        <div className="bg-rose-950/20 border border-rose-900/30 p-4 rounded-xl text-rose-300 text-xs leading-relaxed space-y-3 font-sans">
                          <p className="font-semibold">{viewerError}</p>
                          <button
                            onClick={() => setActiveTab("live")}
                            className="px-4 py-1.5 bg-rose-900/40 hover:bg-rose-900/60 text-white rounded-lg text-[11px] font-bold transition border border-rose-800/40 cursor-pointer"
                          >
                            Load Live Page View
                          </button>
                        </div>
                      ) : (
                        <div className="prose prose-invert prose-blue prose-sm max-w-none text-slate-300 selection:bg-blue-500/30">
                          <ReactMarkdown components={customLinkRenderer}>{viewerMarkdown || ""}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Live Iframe Viewport Pane powered by our server-side proxy */
                  <div className="w-full h-full flex-grow flex flex-col bg-white overflow-hidden relative">
                    {/* Notice for X-Frame bypass status */}
                    <div className="bg-[#f1f3f4] border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-[#3c4043] font-sans shrink-0 select-none">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        Live Secure Sandbox Browser (No-Block Enabled)
                      </span>
                      <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        ● SECURE PROXY ACTIVE
                      </span>
                    </div>
                    <iframe
                      ref={iframeRef}
                      src={`/api/ai-browser/proxy?url=${encodeURIComponent(activeUrl)}`}
                      className="w-full flex-grow bg-white border-none"
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
  );
}
