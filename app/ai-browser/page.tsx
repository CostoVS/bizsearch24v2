"use client";

// Real High-Performance Embedded Sandbox Browser with VPS LLM Integration
import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import ReactMarkdown from "react-markdown";
import {
  Search,
  Globe,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Check,
  X,
  Compass,
  AlertCircle,
  Lock
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

  // In-app Browser state variables
  const [activeTab, setActiveTab] = useState<"reader" | "live">("reader");
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [isViewerLoading, setIsViewerLoading] = useState(false);
  const [viewerMarkdown, setViewerMarkdown] = useState<string | null>(null);
  const [viewerError, setViewerError] = useState<string | null>(null);

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
      setErrorMsg("Failed to connect to search service. Please check your network connection and try again.");
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

  // Intercept all markdown links to load them in-app instead of opening Chrome tabs
  const customLinkRenderer = {
    a: ({ href, children, ...props }: any) => {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (href) {
              handleOpenInAppBrowser(href, typeof children === "string" ? children : href);
            }
          }}
          className="text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer bg-transparent border-none p-0 inline font-semibold text-left align-baseline"
          {...props}
        >
          {children}
        </button>
      );
    }
  };

  const renderLogo = (size: "large" | "small" = "large") => {
    if (size === "large") {
      return (
        <h1 className="text-5xl sm:text-6xl font-sans font-bold tracking-tight select-none">
          <span className="text-slate-900">Biz</span>
          <span className="text-emerald-600">Search</span>
          <span className="text-slate-900">24</span>
        </h1>
      );
    }
    return (
      <span className="text-2xl font-sans font-bold tracking-tight select-none cursor-pointer" onClick={() => {
        setHasSearched(false);
        setQuery("");
        setSummary(null);
        setLinks([]);
        setActiveUrl(null);
        setActiveTitle(null);
      }}>
        <span className="text-slate-900">Biz</span>
        <span className="text-emerald-600">Search</span>
        <span className="text-slate-900">24</span>
      </span>
    );
  };

  return (
    <div className="flex-grow bg-white text-[#202124] min-h-[calc(100vh-80px)] font-sans flex flex-col">
      
      {/* 1. GOOGLE SEARCH HOMEPAGE VIEW (BEFORE SEARCH) */}
      {!hasSearched && (
        <div className="flex-grow flex flex-col items-center justify-between min-h-[calc(100vh-120px)] pt-20">
          
          <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center justify-center flex-grow -mt-20">
            {/* Logo */}
            <div className="mb-8 text-center">
              {renderLogo("large")}
              <p className="text-sm font-medium text-slate-400 tracking-wider uppercase mt-2">
                Secure AI-Powered Search Browser
              </p>
            </div>

            {/* Search Input Frame */}
            <form onSubmit={handleSearch} className="w-full relative group">
              <div className="relative w-full shadow-sm hover:shadow-md focus-within:shadow-md transition-shadow bg-white border border-[#dee2e6] hover:border-transparent focus-within:border-transparent rounded-full flex items-center px-5 py-3">
                <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search the web with AI..."
                  className="w-full outline-none text-base text-slate-800 bg-transparent placeholder-slate-400 font-normal"
                  autoFocus
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="px-6 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] rounded text-sm font-normal text-[#3c4043] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  AI Search
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("Latest business listings in South Africa");
                  }}
                  className="px-6 py-2 bg-[#f8f9fa] hover:bg-[#f1f3f4] border border-[#f8f9fa] hover:border-[#dadce0] rounded text-sm font-normal text-[#3c4043] transition cursor-pointer"
                >
                  I&apos;m Feeling Lucky
                </button>
              </div>
            </form>
          </div>

          {/* Clean Google-style Footer */}
          <div className="w-full bg-[#f2f2f2] border-t border-[#e4e4e4] text-[#70757a] text-xs">
            <div className="px-6 py-3 border-b border-[#e4e4e4]">
              <span>South Africa</span>
            </div>
            <div className="px-6 py-3 flex flex-wrap justify-between gap-y-2">
              <div className="flex gap-6">
                <span className="hover:underline cursor-pointer">About</span>
                <span className="hover:underline cursor-pointer">Advertising</span>
                <span className="hover:underline cursor-pointer">Business</span>
                <span className="hover:underline cursor-pointer">How Search works</span>
              </div>
              <div className="flex gap-6">
                <span className="hover:underline cursor-pointer">Privacy</span>
                <span className="hover:underline cursor-pointer">Terms</span>
                <span className="hover:underline cursor-pointer">Settings</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 2. RESULTS AND DUAL-PANE VIEWPORT VIEW (AFTER SEARCH) */}
      {hasSearched && (
        <div className="flex-grow flex flex-col h-screen overflow-hidden">
          
          {/* Top Search Bar Row (Google Style) */}
          <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-6 flex-grow max-w-4xl">
              {renderLogo("small")}

              <form onSubmit={handleSearch} className="flex-grow max-w-2xl">
                <div className="relative w-full shadow-sm hover:shadow-md focus-within:shadow-md transition bg-white border border-[#dee2e6] rounded-full flex items-center px-4 py-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search live web with AI..."
                    className="w-full outline-none text-sm text-slate-800 bg-transparent placeholder-slate-400 font-normal"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="p-1 text-slate-400 hover:text-slate-600 mr-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="p-1 text-emerald-600 hover:text-emerald-700 transition"
                  >
                    <Search className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </form>
            </div>

            <button
              onClick={() => {
                setHasSearched(false);
                setQuery("");
                setSummary(null);
                setLinks([]);
                setActiveUrl(null);
                setActiveTitle(null);
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 font-semibold text-xs transition border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>

          {/* Dual-Pane Viewport Wrapper */}
          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-80px)]">
            
            {/* LEFT COLUMN: Branded Search List & Summary (lg:col-span-5) */}
            <div className={`lg:col-span-5 border-r border-slate-200 overflow-y-auto bg-white p-5 sm:p-6 space-y-6 scrollbar-thin ${activeUrl ? "hidden lg:block" : "block"}`}>
              
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-8 h-8 border-3 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">AI is searching the web...</p>
                    <p className="text-xs text-slate-400">Retrieving resources & matching details</p>
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
                  
                  {/* Clean Direct AI Answer (Google "Featured Snippet" Style) */}
                  {summary && (
                    <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg shadow-sm">
                      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          AI Direct Answer
                        </span>
                      </div>
                      <div className="prose prose-slate prose-sm max-w-none text-[#3c4043] leading-relaxed text-sm">
                        <ReactMarkdown components={customLinkRenderer}>{summary}</ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* Classic Branded Results List */}
                  <div className="space-y-5">
                    <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400">
                      Search Results
                    </h3>

                    {links.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No matching details found.</p>
                    ) : (
                      <div className="space-y-6">
                        {links.map((link, idx) => {
                          const isActive = activeUrl === link.url;
                          return (
                            <div
                              key={idx}
                              onClick={() => handleOpenInAppBrowser(link.url, link.title)}
                              className={`p-1 rounded transition-all text-left cursor-pointer group relative overflow-hidden ${
                                isActive ? "bg-slate-50 border-l-4 border-emerald-600 pl-2" : ""
                              }`}
                            >
                              <div className="space-y-1">
                                <span className="text-xs text-[#202124] block truncate">
                                  {link.url}
                                </span>
                                <h4 className="font-medium text-lg text-emerald-600 group-hover:underline leading-snug">
                                  {link.title}
                                </h4>
                                <p className="text-[#4d5156] text-sm line-clamp-2 leading-relaxed">
                                  {link.snippet}
                                </p>
                              </div>

                              <div className="mt-2 flex items-center justify-between text-[11px] font-bold">
                                <span className="text-emerald-600 flex items-center gap-1">
                                  View Inside AI Browser
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
      )}

    </div>
  );
}
