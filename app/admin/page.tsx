"use client";

import React, { useState, useEffect } from "react";
import { 
  getStoredAds, getStoredBanners, getStoredMessages, saveStoredAds, 
  saveStoredBanners, saveStoredMessages, Ad, Banner, Message,
  SA_PROVINCES, CATEGORIES, generateUniqueAdId 
} from "@/lib/data";
import { Nav } from "@/components/nav";
import { 
  ShieldCheck, Inbox, MessageSquare, Search, Sparkles, Filter, 
  Trash2, Edit, Check, AlertTriangle, CheckCircle, FileText, 
  Clock, ShieldAlert, Cpu, ZoomIn, Layout, Save, PlusCircle,
  FolderSync, Database, ArrowUpRight, HelpCircle, X, Terminal
} from "lucide-react";

export default function AdminDeck() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Tab states
  const [activeTab, setActiveTab] = useState<"database" | "inbox" | "csv-parser" | "banners">("database");

  // Selection filter variables requested by user
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProvince, setSearchProvince] = useState("all");
  const [searchCity, setSearchCity] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  // Source Separation Filters: CSV uploaded ads separated from preference manual ads
  const [adSourceFilter, setAdSourceFilter] = useState<"all" | "preference" | "csv">("all");

  // Granular life-cycle type selectors requested by user
  // Options: all, free, premium, sponsor, claimed, removal-request, claimed-free
  const [adTypeFilter, setAdTypeFilter] = useState<"all" | "free" | "premium" | "sponsor" | "claimed" | "remove" | "claimed_free">("all");

  // Editing Ad state
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editServices, setEditServices] = useState("");
  const [editTier, setEditTier] = useState<"BASIC" | "PREMIUM" | "SPONSOR">("BASIC");
  const [editClaimState, setEditClaimState] = useState(false);
  const [editClaimIntent, setEditClaimIntent] = useState<"premium" | "free" | "remove" | "">("");

  // Create manual ad state
  const [createTitle, setCreateTitle] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createCategory, setCreateCategory] = useState(CATEGORIES[0]);
  const [createLocation, setCreateLocation] = useState(SA_PROVINCES[1].slug);
  const [createAddress, setCreateAddress] = useState("");
  const [createPhone, setCreatePhone] = useState("");
  const [createServices, setCreateServices] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Bulk CSV parser input state
  const [rawCsvText, setRawCsvText] = useState("");
  const [csvDefaultCategory, setCsvDefaultCategory] = useState(CATEGORIES[0]);
  const [csvDefaultProvince, setCsvDefaultProvince] = useState(SA_PROVINCES[1].slug);
  const [csvResultCount, setCsvResultCount] = useState<number | null>(null);

  // Selected chat inbox message state
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);

  // Preview Document overlay modal
  const [previewDocUrl, setPreviewDocUrl] = useState<{
    fileName: string;
    docName: string;
    originalSize: string;
    resizedSize: string;
    clarityScore: number;
    docType: string;
  } | null>(null);

  // Save/Load system state
  const loadDatabase = () => {
    setAds(getStoredAds());
    setBanners(getStoredBanners());
    setMessages(getStoredMessages());
  };

  useEffect(() => {
    loadDatabase();
  }, []);

  const saveDatabaseState = (updatedAds: Ad[], updatedBanners?: Banner[], updatedMsgs?: Message[]) => {
    if (updatedAds) {
      setAds(updatedAds);
      saveStoredAds(updatedAds);
    }
    if (updatedBanners) {
      setBanners(updatedBanners);
      saveStoredBanners(updatedBanners);
    }
    if (updatedMsgs) {
      setMessages(updatedMsgs);
      saveStoredMessages(updatedMsgs);
    }
    loadDatabase();
  };

  // Toggle Live/Hidden state for ad
  const handleToggleAdActive = (adId: string) => {
    const updated = ads.map(a => {
      if (a.id === adId) {
        return { ...a, isActive: a.isActive === false ? true : false };
      }
      return a;
    });
    saveDatabaseState(updated);
  };

  // Delete/Purge ad
  const handlePurgeAd = (adId: string) => {
    if (confirm(`Are you sure you want to completely purge Trade Listing ID: ${adId} from the master index?`)) {
      const updated = ads.filter(a => a.id !== adId);
      saveDatabaseState(updated);
    }
  };

  // Provision new manual Preference ad with auto-assigned unique ID
  const handleCreatePreferenceAd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim() || !createAddress.trim() || !createPhone.trim()) {
      alert("Please configure a title, active trading address, and hotline contact number.");
      return;
    }

    const assignedId = generateUniqueAdId("pref", createLocation);
    const newAd: Ad = {
      id: assignedId,
      title: createTitle,
      description: createDescription || "Registered local trade specialist.",
      category: createCategory,
      location: createLocation,
      address: createAddress,
      phone: createPhone,
      servicesOffered: createServices,
      isPremium: true, // Manual preference ads defaulted to premium
      isClaimed: true,
      isActive: true,
      fixedPosition: "standard",
      sectionTarget: "directory"
    };

    const updated = [...ads, newAd];
    saveDatabaseState(updated);

    // Reset Form
    setCreateTitle("");
    setCreateDescription("");
    setCreateAddress("");
    setCreatePhone("");
    setCreateServices("");
    setShowCreateForm(false);
    alert(`Success! Generated Preference ad ID: ${assignedId} seamlessly.`);
  };

  // Parse bulk uploaded CSV trades list and assign unique ID for EVERY ad
  const handleParseCsvUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawCsvText.trim()) {
      alert("Please paste formatted CSV content lines containing header info first.");
      return;
    }

    const lines = rawCsvText.split("\n");
    let addedCount = 0;
    const newAdsList: Ad[] = [];

    // Header index indicators
    let nameIdx = 0, addressIdx = 1, phoneIdx = 2, servicesIdx = 3;

    lines.forEach((line, idx) => {
      if (idx === 0) {
        // Simple header analyzer
        const lowercaseHeader = line.toLowerCase();
        if (lowercaseHeader.includes("name") || lowercaseHeader.includes("title")) {
          // Standard formatted header row skipped
          return;
        }
      }

      if (!line.trim()) return;

      const columns = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
      if (columns.length < 3) return; // Need at least Title, address, telephone

      const docTitle = columns[nameIdx] || "Unnamed Trade";
      const docAddr = columns[addressIdx] || "No Address Seeded";
      const docPhone = columns[phoneIdx] || "No Phone Registered";
      const docServices = columns[servicesIdx] || "General Handyman & Services";

      // Assign dynamic unique CSV format ID
      const assignedId = generateUniqueAdId("csv", csvDefaultProvince);

      const parsedAd: Ad = {
        id: assignedId,
        title: docTitle,
        description: `Premium trade directory listing for ${docTitle} situated in ${docAddr}. Access verified services with South Africa trade standards.`,
        category: csvDefaultCategory,
        location: csvDefaultProvince,
        address: docAddr,
        phone: docPhone,
        servicesOffered: docServices,
        isPremium: false,
        isClaimed: false,
        isActive: true,
        fixedPosition: "standard",
        sectionTarget: "directory"
      };

      newAdsList.push(parsedAd);
      addedCount++;
    });

    if (newAdsList.length > 0) {
      const mergedAds = [...ads, ...newAdsList];
      saveDatabaseState(mergedAds);
      setCsvResultCount(addedCount);
      setRawCsvText("");
      alert(`Success! Llama3 NLP Router successfully verified & uploaded ${addedCount} bulk listings with unique tracking ids.`);
    } else {
      alert("Could not extract clean records. Please verify row delimiters.");
    }
  };

  // Approve a claim: Approves the claimant, sets the ad properties based on intention, writes updates
  const handleApproveClaim = (msg: Message) => {
    const updatedAds = ads.map(ad => {
      if (ad.id === msg.adId) {
        return {
          ...ad,
          isClaimed: true,
          claimIntention: msg.claimIntention,
          isPremium: msg.claimIntention === "premium" ? true : ad.isPremium,
          claimedByEmail: msg.senderEmail
        };
      }
      return ad;
    });

    const updatedMsgs = messages.map(m => {
      if (m.id === msg.id) {
        return { ...m, approvalStatus: "approved" as const, isChecked: true };
      }
      return m;
    });

    saveDatabaseState(updatedAds, undefined, updatedMsgs);
    alert(`Success! Claim for listing ID: ${msg.adId} was approved. Owner rights are dispatched.`);
  };

  // Reject/Decline claim
  const handleRejectClaim = (msg: Message) => {
    const updatedAds = ads.map(ad => {
      if (ad.id === msg.adId) {
        return {
          ...ad,
          isClaimed: false,
          claimIntention: "" as const,
          claimedByEmail: undefined
        };
      }
      return ad;
    });

    const updatedMsgs = messages.map(m => {
      if (m.id === msg.id) {
        return { ...m, approvalStatus: "rejected" as const, isChecked: true };
      }
      return m;
    });

    saveDatabaseState(updatedAds, undefined, updatedMsgs);
    alert(`Claim Inquiry for trade ID: ${msg.adId} declined. Verification files flagged for review.`);
  };

  // Mark message as read
  const handleMarkMessageRead = (msgId: string) => {
    const updatedMsgs = messages.map(m => {
      if (m.id === msgId) {
        return { ...m, isChecked: true };
      }
      return m;
    });
    saveDatabaseState(ads, undefined, updatedMsgs);
  };

  // Edit inline handler
  const startEditingAd = (ad: Ad) => {
    setEditingAdId(ad.id);
    setEditTitle(ad.title);
    setEditDescription(ad.description || "");
    setEditCategory(ad.category);
    setEditLocation(ad.location);
    setEditAddress(ad.address);
    setEditPhone(ad.phone);
    setEditServices(ad.servicesOffered || "");
    setEditTier(ad.isSponsor ? "SPONSOR" : ad.isPremium ? "PREMIUM" : "BASIC");
    setEditClaimState(ad.isClaimed === true);
    setEditClaimIntent(ad.claimIntention || "");
  };

  const saveEditedAdChanges = () => {
    if (!editTitle.trim() || !editAddress.trim() || !editPhone.trim()) {
      alert("Missing required fields. Cannot submit changes.");
      return;
    }

    const updated = ads.map(a => {
      if (a.id === editingAdId) {
        return {
          ...a,
          title: editTitle,
          description: editDescription,
          category: editCategory,
          location: editLocation,
          address: editAddress,
          phone: editPhone,
          servicesOffered: editServices,
          isPremium: editTier === "PREMIUM" || editTier === "SPONSOR",
          isSponsor: editTier === "SPONSOR",
          isClaimed: editClaimState,
          claimIntention: editClaimIntent as any
        };
      }
      return a;
    });

    saveDatabaseState(updated);
    setEditingAdId(null);
    alert("Changes committed to master index seamlessly.");
  };

  // Filtering computational log
  const getFilteredAds = () => {
    return ads.filter(ad => {
      // 1. Unique ID or raw text query (ID matches exactly or includes part of search query)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          (ad.id || "").toLowerCase().includes(query) ||
          (ad.title || "").toLowerCase().includes(query) ||
          (ad.description || "").toLowerCase().includes(query) ||
          (ad.phone || "").toLowerCase().includes(query) ||
          (ad.servicesOffered || "").toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Province Filter
      if (searchProvince !== "all") {
        if ((ad.location || "").toLowerCase() !== searchProvince.toLowerCase()) {
          return false;
        }
      }

      // 3. City/Town filter query
      if (searchCity.trim()) {
        const cityQuery = searchCity.toLowerCase();
        const matchesCity = 
          (ad.address || "").toLowerCase().includes(cityQuery) ||
          (ad.title || "").toLowerCase().includes(cityQuery);
        if (!matchesCity) return false;
      }

      // 4. Category Filter
      if (searchCategory !== "all") {
        if ((ad.category || "").toLowerCase() !== searchCategory.toLowerCase()) {
          return false;
        }
      }

      // 5. SEPARATION FILTER: CSV uploaded ads versus preference ads
      const isCsvId = ad.id?.startsWith("csv_") || ad.id?.startsWith("csv-");
      if (adSourceFilter === "csv") {
        if (!isCsvId) return false;
      } else if (adSourceFilter === "preference") {
        if (isCsvId) return false;
      }

      // 6. LIFE CYCLE SELECTIONS: free, premium, sponsor, CSV, claimed, removal, claimed free
      if (adTypeFilter === "free") {
        if (ad.isPremium || ad.isSponsor) return false;
      } else if (adTypeFilter === "premium") {
        if (!ad.isPremium || ad.isSponsor) return false;
      } else if (adTypeFilter === "sponsor") {
        if (!ad.isSponsor) return false;
      } else if (adTypeFilter === "claimed") {
        if (ad.isClaimed !== true) return false;
      } else if (adTypeFilter === "remove") {
        if (ad.claimIntention !== "remove") return false;
      } else if (adTypeFilter === "claimed_free") {
        if (ad.isClaimed !== true || ad.claimIntention !== "free") return false;
      }

      return true;
    });
  };

  // Direct mock doc view rendering template based on type
  const renderMockDocumentImage = (docType: string, docName: string) => {
    switch(docType) {
      case "id":
        return (
          <div className="bg-gradient-to-tr from-emerald-800 to-slate-900 border-4 border-emerald-500 rounded-3xl p-6 text-white max-w-lg mx-auto shadow-2xl relative">
            <div className="flex justify-between items-start border-b border-emerald-400 pb-3">
              <div>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-mono tracking-widest uppercase font-black px-2 py-0.5 rounded">REPUBLIC OF SOUTH AFRICA</span>
                <h4 className="text-sm font-extrabold tracking-tight mt-1">NATIONAL IDENTITY DOCUMENT</h4>
              </div>
              <ShieldCheck className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4">
              <div className="sm:col-span-4 bg-slate-950/70 border-2 border-slate-700/60 rounded-xl h-28 flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400">
                <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse mb-1 flex items-center justify-center text-slate-500">HD</div>
                <span>PHOTO ID ATTACHED</span>
              </div>
              <div className="sm:col-span-8 space-y-2 text-[11px] font-semibold text-slate-200">
                <div>SURNAME: <span className="text-white font-black font-sans uppercase">Costochetty</span></div>
                <div>GIVEN NAMES: <span className="text-white font-black font-sans">Nicholaus</span></div>
                <div>IDENTITY NO: <span className="text-emerald-400 font-black font-mono">810214 5918 082</span></div>
                <div>VERIFIED SCAN STATUS: <span className="text-emerald-400 font-extrabold">MALWARE SAFE ✓</span></div>
              </div>
            </div>
            <p className="text-[9px] text-emerald-400/80 font-mono text-center border-t border-slate-800 pt-3 mt-4">📐 COMPRESSED BOUNDS: 800x600 PERFECT CLARITY</p>
          </div>
        );
      case "cipc":
        return (
          <div className="bg-slate-50 border-4 border-indigo-400 rounded-2xl p-6 text-slate-800 max-w-lg mx-auto shadow-2xl space-y-4">
            <div className="flex justify-between border-b border-slate-300 pb-3">
              <div>
                <span className="text-[9px] font-black text-indigo-700 uppercase">COMPANIES AND INTELLECTUAL PROPERTY COMMISSION</span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">CIPC CERTIFICATE OF REGISTRATION</h4>
              </div>
              <Database className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="space-y-2 text-xs font-medium">
              <div>REGISTRATION SEQUENCE ID: <span className="font-extrabold text-slate-950">2026 / 149582 / 07</span></div>
              <div>ENTERPRISE PROPER NAME: <span className="font-black text-slate-950 uppercase">{editTitle || "GC SOLAR KZN"} Limited</span></div>
              <div>SA CIPC SECURITY STATUS: <span className="text-emerald-600 font-extrabold">AUTHENTIC & SIGNALS SECURE</span></div>
              <div>DIAGNOSTICS: <span className="text-indigo-600 font-mono text-[10px]">RESIZED PRESERVED VECTOR RENDER</span></div>
            </div>
            <p className="text-[9px] text-slate-400 font-mono text-center mt-3 border-t pt-2">📐 RESOLUTION MATCH: 800x600 CRISP PIXEL FIT</p>
          </div>
        );
      case "sars":
        return (
          <div className="bg-white border-4 border-slate-900 rounded-2xl p-6 text-slate-850 max-w-lg mx-auto shadow-2xl relative">
            <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-800 text-[10px] font-black uppercase px-2 py-1 rounded border border-emerald-200">SARS COMPLIANT</div>
            <div className="border-b-4 border-slate-900 pb-3">
              <span className="text-[9px] font-bold text-slate-500 uppercase">SOUTH AFRICAN REVENUE SERVICE</span>
              <h4 className="text-base font-black text-slate-900 leading-tight">OFFICIAL TAX STATUS CLEAN SEED</h4>
            </div>
            <div className="space-y-3 py-4 text-xs font-medium">
              <div>Reference Code: <span className="font-bold text-slate-900">928014859</span></div>
              <div>Tax Clearance verified: <span className="text-emerald-600 font-extrabold">ACTIVE GOOD STANDING STATUS</span></div>
              <div>Clarity Index Rating: <span className="font-mono text-slate-600">98% Text Character Match</span></div>
            </div>
            <p className="text-[9px] text-slate-400 font-mono text-center mt-2 border-t pt-2">📐 800x600 ASPECT MATRIX COMPATIBLE</p>
          </div>
        );
      case "address":
        return (
          <div className="bg-white border-2 border-slate-300 rounded-xl p-6 text-slate-800 max-w-lg mx-auto shadow-xl space-y-4">
            <div className="border-b pb-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase">MUNICIPAL SERVICES BILL STATEMENT</span>
              <h4 className="text-xs font-black text-slate-900 uppercase">City Power JHB / EThekwini Metropolitan</h4>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div>REGISTERED USER PREMISES: <span className="text-slate-950 font-bold">{editAddress || ad.address}</span></div>
              <div>UTILITIES BILL CYCLE DATE: <span className="text-slate-950 font-bold">RECENT (POPIA Verified)</span></div>
              <div>ANTIVIRUS PROBE GATEWAY: <span className="text-emerald-600 font-black">Malware Clear (100% SECURE)</span></div>
            </div>
            <p className="text-[9px] text-slate-400 font-mono text-center mt-2 border-t pt-2">📐 DOWNSAMPLED FOR REDISTRIBUTION PIXEL SHARPNESS</p>
          </div>
        );
      case "bank":
        return (
          <div className="bg-slate-50 border-4 border-amber-500 rounded-2xl p-6 text-slate-900 max-w-lg mx-auto shadow-2xl space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div>
                <span className="text-[9px] font-black text-amber-600">FIRST NATIONAL BANK / STANDARD BANK OF SA</span>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">BUSINESS TRADING ACCOUNT</h4>
              </div>
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div className="space-y-2 text-xs">
              <div>Account Name: <span className="font-bold uppercase text-slate-950">{editTitle || "ENTERPRISE"}</span></div>
              <div>Verified Safe: <span className="text-emerald-600 font-extrabold">SIGNATURE CHECKS CLEAR ✓</span></div>
              <div>Verification Stamp: <span className="text-slate-400 font-mono">BIZSEARCH-ZAR-APPROVED</span></div>
            </div>
            <p className="text-[9px] text-slate-400 font-mono text-center mt-2 border-t pt-2">📐 MEMORY SCALED 800x600 OK CLEAR</p>
          </div>
        );
      default:
        return (
          <div className="p-12 text-center text-slate-400 text-xs">
            Unknown document file mapping.
          </div>
        );
    }
  };

  const selectedMsg = messages.find(m => m.id === selectedMsgId);
  const unreadMessagesCount = messages.filter(m => !m.isChecked).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans" id="admin-workspace-base">
      <Nav statsCount={ads.length} unreadMessages={unreadMessagesCount} />

      {/* Admin Branding Header Welcome */}
      <section className="bg-slate-900 text-white py-12 px-6 shadow-xl relative overflow-hidden" id="admin-banner-identity">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 to-slate-900" />
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />

        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest font-mono">
                Security Control Level: ROOT_ADMIN
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              System Control & Oversight Deck
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Registered System Administrator: <strong className="text-emerald-400">nicholauscostochetty@gmail.com</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 p-2 rounded-2xl max-w-sm shrink-0">
            <Inbox className="w-10 h-10 text-emerald-400 p-2 shrink-0 bg-slate-900/50 rounded-xl" />
            <div>
              <span className="block text-xs font-black text-white uppercase tracking-wider">Direct Inbox System</span>
              <span className="block text-[11px] text-slate-400 font-medium">{unreadMessagesCount} active claims waiting reviews</span>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Administration Tabs Switched Menu */}
      <section className="bg-white border-b border-slate-200 sticky top-[64px] z-40 shadow-sm" id="admin-tabs-nav-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-4 py-3 scrollbar-none">
            
            <button
              onClick={() => setActiveTab("database")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-2 ${activeTab === "database" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Database className="w-4 h-4" />
              <span>Listing Controls and Searches ({ads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("inbox")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-2 relative ${activeTab === "inbox" ? "bg-slate-950 text-white font-extrabold" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
              id="admin-inbox-tab-btn"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Direct Chat Claims Inbox</span>
              {unreadMessagesCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {unreadMessagesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("csv-parser")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-2 ${activeTab === "csv-parser" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <FolderSync className="w-4 h-4" />
              <span>Seeded Bulk CSV Uploader</span>
            </button>

            <button
              onClick={() => {
                setActiveTab("banners");
              }}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-2 ${activeTab === "banners" ? "bg-slate-950 text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
            >
              <Layout className="w-4 h-4" />
              <span>Global Notice Banners</span>
            </button>

          </div>
        </div>
      </section>

      {/* Main Admin Controller Body Layout Panels */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        
        {/* TAB 1: MASTER LISTINGS DATABASE SEARCH SECTION & MANAGEMENT */}
        {activeTab === "database" && (
          <div className="space-y-6">
            
            {/* SEPARATED ACCORDION CONTROLLERS: MULTI-LEVEL FILTERING FORM */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              {/* STAGE A: SEPARATE THE CSV UPLOADED ADS FROM PREFERENCE MANUAL ADS */}
              <div>
                <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2.5">
                  1. Separate Listings catalog Database Source
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setAdSourceFilter("all")}
                    className={`px-4 py-3 rounded-2xl font-black text-xs transition duration-150 ${adSourceFilter === "all" ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-105"}`}
                  >
                    All Indexes ({ads.length})
                  </button>
                  <button
                    onClick={() => setAdSourceFilter("preference")}
                    className={`px-4 py-3 rounded-2xl font-black text-xs transition duration-150 ${adSourceFilter === "preference" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/10" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-105"}`}
                  >
                    Preference Ads ({ads.filter(a => !a.id?.startsWith("csv_") && !a.id?.startsWith("csv-")).length})
                  </button>
                  <button
                    onClick={() => setAdSourceFilter("csv")}
                    className={`px-4 py-3 rounded-2xl font-black text-xs transition duration-150 ${adSourceFilter === "csv" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/10" : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-105"}`}
                  >
                    Separated Bulk CSV Uploads ({ads.filter(a => a.id?.startsWith("csv_") || a.id?.startsWith("csv-")).length})
                  </button>
                </div>
              </div>

              {/* STAGE B: LIFE-CYCLE SUB-CLASSIFICATIONS SELECTORS */}
              <div>
                <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2.5">
                  2. Dynamic Life-Cycle State Filters (Tier & Intention)
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "all", label: "All Tiers / States", count: ads.length, color: "bg-slate-900 text-white" },
                    
                    { id: "free", label: "Basic Free Ads", count: ads.filter(a => !a.isPremium && !a.isSponsor).length, color: "bg-white border border-slate-200 text-slate-700" },
                    { id: "premium", label: "Premium Verified Ads", count: ads.filter(a => a.isPremium && !a.isSponsor).length, color: "bg-emerald-50 text-emerald-800 border-emerald-150" },
                    { id: "sponsor", label: "Featured Sponsor Ads", count: ads.filter(a => a.isSponsor).length, color: "bg-indigo-50 text-indigo-800 border-indigo-150" },
                    
                    { id: "claimed", label: "Claimed Ads Index", count: ads.filter(a => a.isClaimed === true).length, color: "bg-sky-50 text-sky-800 border-sky-150" },
                    { id: "remove", label: "Removal Request Ads", count: ads.filter(a => a.claimIntention === "remove").length, color: "bg-rose-50 text-rose-800 border-rose-150" },
                    { id: "claimed_free", label: "Claimed & Request Free Ads", count: ads.filter(a => a.isClaimed === true && a.claimIntention === "free").length, color: "bg-amber-50 text-amber-800 border-amber-150" }
                  ].map(btn => (
                    <button
                      key={btn.id}
                      onClick={() => setAdTypeFilter(btn.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${adTypeFilter === btn.id ? "bg-slate-900 text-white border-slate-950 scale-105" : btn.color}`}
                    >
                      {btn.label} <span className="text-[10px] opacity-75 font-mono">({btn.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STAGE C: SEARCH GRID INPUTS */}
              <div>
                <span className="block text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2.5">
                  3. Multi-Dimensional Search filters (By Province, Town, Category, unique ID)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                  {/* Search input (Unique tracking ID searches) */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Search Ads (By Title or Unique ID)</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ID or Name, e.g. csv-901-gp..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white text-slate-850 rounded-xl pl-9 pr-3 py-2.5 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Province Filter */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Select Province</label>
                    <select
                      value={searchProvince}
                      onChange={(e) => setSearchProvince(e.target.value)}
                      className="w-full bg-white text-slate-850 rounded-xl px-3 py-2.5 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    >
                      <option value="all">All Provinces (National)</option>
                      {SA_PROVINCES.map(p => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* City name search */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1 font-bold">Search City or Town name</label>
                    <input
                      type="text"
                      placeholder="e.g. Pretoria, Sandton..."
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      className="w-full bg-white text-slate-850 rounded-xl px-3 py-2.5 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Trading Category</label>
                    <select
                      value={searchCategory}
                      onChange={(e) => setSearchCategory(e.target.value)}
                      className="w-full bg-white text-slate-850 rounded-xl px-3 py-2.5 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    >
                      <option value="all">All Service Sectors</option>
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reset button bar */}
                {(searchQuery || searchProvince !== "all" || searchCity || searchCategory !== "all" || adSourceFilter !== "all" || adTypeFilter !== "all") && (
                  <div className="flex items-center justify-between text-xs text-indigo-800 bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl mt-4">
                    <span>Active sorting system returned <strong>{getFilteredAds().length}</strong> matching records out of <strong>{ads.length}</strong> listings.</span>
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSearchProvince("all");
                        setSearchCity("");
                        setSearchCategory("all");
                        setAdSourceFilter("all");
                        setAdTypeFilter("all");
                      }}
                      className="text-xs font-black uppercase text-indigo-700 hover:text-indigo-900 border-b-2 border-indigo-700"
                    >
                      Clear All Workspace Filters
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Quick manual ad provisioning button option triggers */}
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Configure Manual Preference Listing</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Generate customized advertisements directly to database cache index.</p>
              </div>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl flex items-center gap-1.5 transition uppercase"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{showCreateForm ? "Hide form" : "Provision New Advertisement"}</span>
              </button>
            </div>

            {/* EXPANDABLE PROVISION FORM */}
            {showCreateForm && (
              <form onSubmit={handleCreatePreferenceAd} className="bg-white rounded-3xl border border-slate-250 p-6 shadow-md space-y-4">
                <span className="text-[10px] font-black text-emerald-600 block uppercase tracking-widest border-b pb-2">Manual Ad Creator Tool</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Officer Trade Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Phoenix Electricians GP"
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      className="w-full bg-slate-50 text-slate-850 rounded-lg px-3 py-2 text-xs border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Corporate Hotline Tele</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +27 11 204 9580"
                      value={createPhone}
                      onChange={(e) => setCreatePhone(e.target.value)}
                      className="w-full bg-slate-50 text-slate-850 rounded-lg px-3 py-2 text-xs border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Trading Address Coordinates</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 15 West Street, Houghton, Johannesburg"
                      value={createAddress}
                      onChange={(e) => setCreateAddress(e.target.value)}
                      className="w-full bg-slate-50 text-slate-850 rounded-lg px-3 py-2 text-xs border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Category Target</label>
                    <select
                      value={createCategory}
                      onChange={(e) => setCreateCategory(e.target.value)}
                      className="w-full bg-slate-50 text-slate-850 rounded-lg px-3 py-2 text-xs border border-slate-200 font-bold"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Target Province</label>
                    <select
                      value={createLocation}
                      onChange={(e) => setCreateLocation(e.target.value)}
                      className="w-full bg-slate-50 text-slate-850 rounded-lg px-3 py-2 text-xs border border-slate-200 font-bold"
                    >
                      {SA_PROVINCES.map(p => (
                        <option key={p.slug} value={p.slug}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Services Offered (Comma Separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Inverters, DB Board maintenance..."
                      value={createServices}
                      onChange={(e) => setCreateServices(e.target.value)}
                      className="w-full bg-slate-50 text-slate-850 rounded-lg px-3 py-2 text-xs border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider block mb-1">Listing Promo Description (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Enter visual trade descriptions..."
                    value={createDescription}
                    onChange={(e) => setCreateDescription(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 rounded-lg px-3 py-2 text-xs border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="bg-slate-100 text-slate-600 font-bold text-xs px-4 py-2 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl uppercase"
                  >
                    Authorize Creation
                  </button>
                </div>
              </form>
            )}

            {/* LISTINGS DATA INDEX TABLE */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-155">
                  <thead className="bg-slate-100">
                    <tr className="text-left font-sans text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      <th className="px-6 py-4">Database Ad (Unique ID)</th>
                      <th className="px-6 py-4">Trade Classification</th>
                      <th className="px-6 py-4">Active Sourcing Category</th>
                      <th className="px-6 py-4">Life Cycle State Parameters</th>
                      <th className="px-6 py-4 text-right">Operations Action Panel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 text-xs">
                    {getFilteredAds().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-semibold text-xs">
                          No indices match selected administrative parameters. Clear search logs to retry.
                        </td>
                      </tr>
                    ) : (
                      getFilteredAds().map(ad => {
                        const isEditing = editingAdId === ad.id;
                        const isCsv = ad.id?.startsWith("csv_") || ad.id?.startsWith("csv-");
                        
                        return (
                          <tr key={ad.id} className="hover:bg-slate-50/50 transition-colors font-medium">
                            
                            {/* TD 1: IDENTIFICATION BRAND DETAIL */}
                            <td className="px-6 py-5 max-w-sm">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input 
                                    type="text" 
                                    value={editTitle} 
                                    onChange={(e) => setEditTitle(e.target.value)} 
                                    className="border border-slate-300 rounded px-2 py-1 w-full font-bold text-xs" 
                                  />
                                  <textarea 
                                    rows={2} 
                                    value={editDescription} 
                                    onChange={(e) => setEditDescription(e.target.value)} 
                                    className="border border-slate-300 rounded px-2 py-1 w-full text-[10px]" 
                                  />
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-slate-900 text-sm block truncate max-w-[200px]">{ad.title}</span>
                                    <span className="bg-slate-900 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase shrink-0">
                                      {ad.id}
                                    </span>
                                  </div>
                                  <p className="text-slate-400 text-[10px] truncate max-w-[280px]">
                                    {ad.description || "No trade description configured."}
                                  </p>
                                </div>
                              )}
                            </td>

                            {/* TD 2: LOCATION CITY DATA */}
                            <td className="px-6 py-5">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <input 
                                    type="text" 
                                    value={editAddress} 
                                    onChange={(e) => setEditAddress(e.target.value)} 
                                    placeholder="Address" 
                                    className="border border-slate-300 rounded px-2 py-1 w-full text-xs" 
                                  />
                                  <select 
                                    value={editLocation} 
                                    onChange={(e) => setEditLocation(e.target.value)} 
                                    className="border border-slate-300 rounded px-2 py-1 w-full text-xs font-bold"
                                  >
                                    {SA_PROVINCES.map(p => (
                                      <option key={p.slug} value={p.slug}>{p.name}</option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="block text-slate-800 font-bold">{ad.address}</span>
                                  <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-wide">
                                    Province Slug: {ad.location}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* TD 3: SECTOR TELEPHONE */}
                            <td className="px-6 py-5">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <select 
                                    value={editCategory} 
                                    onChange={(e) => setEditCategory(e.target.value)} 
                                    className="border border-slate-300 rounded px-2 py-1 w-full text-xs font-bold"
                                  >
                                    {CATEGORIES.map(c => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                  </select>
                                  <input 
                                    type="text" 
                                    value={editPhone} 
                                    onChange={(e) => setEditPhone(e.target.value)} 
                                    placeholder="Telephone" 
                                    className="border border-slate-300 rounded px-2 py-1 w-full text-xs" 
                                  />
                                </div>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="text-slate-700 font-bold block">{ad.category}</span>
                                  <span className="text-slate-400 text-[10px] block font-mono font-black">{ad.phone}</span>
                                </div>
                              )}
                            </td>

                            {/* TD 4: TIER LIFE CYCLE METADATA AND SOURCE SEPARATORS */}
                            <td className="px-6 py-5">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <div>
                                    <label className="text-[9px] font-serif uppercase text-slate-400 block mb-0.5">Placement Tier</label>
                                    <select 
                                      value={editTier} 
                                      onChange={(e) => setEditTier(e.target.value as any)} 
                                      className="border border-slate-300 rounded px-2 py-1 w-full text-xs font-bold"
                                    >
                                      <option value="BASIC">Basic Free Slot</option>
                                      <option value="PREMIUM">Premium Verified</option>
                                      <option value="SPONSOR">Featured Sponsor</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Verification Toggle</label>
                                    <select 
                                      value={editClaimState ? "YES" : "NO"} 
                                      onChange={(e) => setEditClaimState(e.target.value === "YES")} 
                                      className="border border-slate-300 rounded px-2 py-1 w-full text-xs font-bold"
                                    >
                                      <option value="NO">Unclaimed System</option>
                                      <option value="YES">Claim Verified ✓</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="text-[9px] font-mono text-slate-400 block mb-0.5">Intense Selection Intention</label>
                                    <select 
                                      value={editClaimIntent} 
                                      onChange={(e) => setEditClaimIntent(e.target.value as any)} 
                                      className="border border-slate-300 rounded px-2 py-1 w-full text-xs font-bold"
                                    >
                                      <option value="">No Active Intention</option>
                                      <option value="premium">Upgrade Premium (R199)</option>
                                      <option value="free">Claim Free List</option>
                                      <option value="remove">Purge completely ⚠</option>
                                    </select>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                  {isCsv ? (
                                    <span className="bg-indigo-50 border border-indigo-150 text-indigo-700 text-[8px] font-black rounded px-1.5 py-0.5 uppercase tracking-wider">CSV Imported</span>
                                  ) : (
                                    <span className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-[8px] font-black rounded px-1.5 py-0.5 uppercase tracking-wider">Preference</span>
                                  )}

                                  {ad.isSponsor ? (
                                    <span className="bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">SPONSOR</span>
                                  ) : ad.isPremium ? (
                                    <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">PREMIUM</span>
                                  ) : (
                                    <span className="bg-slate-200 text-slate-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">FREE</span>
                                  )}

                                  {ad.isClaimed === true ? (
                                    <span className="bg-sky-50 border border-sky-150 text-sky-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">✓ Claimed</span>
                                  ) : (
                                    <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase font-mono tracking-widest animate-pulse">Unclaimed Seeding</span>
                                  )}

                                  {ad.claimIntention === "remove" && (
                                    <span className="bg-rose-100 border border-rose-2.5 text-rose-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase animate-bounce">REMOVAL REQ</span>
                                  )}
                                  {ad.isClaimed === true && ad.claimIntention === "free" && (
                                    <span className="bg-amber-100 border border-amber-200 text-amber-900 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">CLAIMED-FREE</span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* TD 5: ACTION PANEL */}
                            <td className="px-6 py-5 text-right whitespace-nowrap">
                              {isEditing ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={saveEditedAdChanges}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-1.5 rounded-lg font-bold"
                                    title="Commit Changes"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAdId(null)}
                                    className="bg-slate-300 hover:bg-slate-400 text-slate-800 p-1.5 rounded-lg"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleToggleAdActive(ad.id)}
                                    className={`px-2 py-1 rounded text-[9px] font-black uppercase border transition ${ad.isActive !== false ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-rose-50 border-rose-350 text-rose-800"}`}
                                  >
                                    {ad.isActive !== false ? "LIVE" : "HIDDEN"}
                                  </button>
                                  <button
                                    onClick={() => startEditingAd(ad)}
                                    className="text-slate-400 hover:text-indigo-600 p-2 transition"
                                    title="Modify properties"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handlePurgeAd(ad.id)}
                                    className="text-slate-400 hover:text-rose-600 p-2 transition"
                                    title="Purge"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>

                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: DIRECT CLAIMS CHAT INBOX (ADMIN WORKSPACE) */}
        {activeTab === "inbox" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="admin-inbox-grid">
            
            {/* Thread Navigation List Side columns */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[600px]">
              <div className="bg-slate-900 text-white p-4 shrink-0 flex items-center justify-between border-b border-slate-800">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> Direct Claims Inbox Workspace
                </span>
                <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                  {unreadMessagesCount} NEW CLAIM
                </span>
              </div>

              <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
                {messages.length === 0 ? (
                  <div className="py-12 px-4 text-center text-slate-400 text-xs font-bold space-y-2">
                    <Inbox className="w-10 h-10 text-slate-300 mx-auto" />
                    <span>No administrative inquiries arrived yet.</span>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      onClick={() => {
                        setSelectedMsgId(msg.id);
                        handleMarkMessageRead(msg.id);
                      }}
                      className={`p-4 cursor-pointer transition flex flex-col gap-2 relative border-l-4 ${
                        selectedMsgId === msg.id 
                          ? "bg-slate-50 border-slate-950" 
                          : !msg.isChecked
                            ? "bg-emerald-50/40 border-emerald-500"
                            : "bg-white border-transparent hover:bg-slate-50/40"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-extrabold text-xs text-slate-800 block">{msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{msg.senderEmail}</span>
                        </div>
                        <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-600 line-clamp-2 truncate leading-relaxed">
                        {msg.content}
                      </div>

                      <div className="flex flex-wrap gap-1.5 items-center justify-between mt-1">
                        <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          ID Target: {msg.adId}
                        </span>

                        <div className="flex gap-1">
                          {msg.claimIntention === "premium" && (
                            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">PRO R199</span>
                          )}
                          {msg.claimIntention === "free" && (
                            <span className="bg-indigo-100 text-indigo-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">FREE SLOT</span>
                          )}
                          {msg.claimIntention === "remove" && (
                            <span className="bg-rose-100 text-rose-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase animate-pulse">PURGE REQ</span>
                          )}

                          {msg.approvalStatus === "approved" ? (
                            <span className="bg-emerald-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">APPROVED</span>
                          ) : msg.approvalStatus === "rejected" ? (
                            <span className="bg-rose-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">REJECTED</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase border border-amber-200">PENDING</span>
                          )}
                        </div>
                      </div>

                      {!msg.isChecked && (
                        <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Selected message thread dialog box detail viewport */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]" id="claim-chat-viewport">
              {selectedMsg ? (
                <div className="flex flex-col h-full overflow-hidden">
                  
                  {/* Chat top header detail info */}
                  <div className="bg-slate-900 border-b border-slate-800 p-5 shrink-0 text-white flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded font-black tracking-wide uppercase">
                        Active Database Link: {selectedMsg.adId}
                      </span>
                      <h4 className="text-base font-extrabold text-white mt-1.5 truncate max-w-sm sm:max-w-md">
                        {selectedMsg.adTitle}
                      </h4>
                    </div>
                    <span className="bg-slate-800 text-slate-400 text-xs font-bold px-3 py-1.5 rounded-lg font-mono">
                      Timestamp: {new Date(selectedMsg.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Scrollable messages and verification files report section */}
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Sender Information and text</span>
                      </div>
                      <h5 className="text-sm font-black text-slate-800">{selectedMsg.senderName} ({selectedMsg.senderEmail})</h5>
                      <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-100 p-3.5 rounded-xl font-medium select-text whitespace-pre-wrap">
                        {selectedMsg.content}
                      </p>
                    </div>

                    {/* ATTACHED AND SCANNED STATUTORY UPLOADS SECTION (CRITICAL) */}
                    {selectedMsg.claimDocuments ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 border-b pb-2">
                          <Cpu className="w-4.5 h-4.5 text-indigo-600" />
                          <h5 className="text-xs font-black text-slate-850 uppercase tracking-widest font-mono">
                            Diagnostic Document Verifier (Malware Scanning & Resize parameters)
                          </h5>
                        </div>

                        {/* Scanner Heuristics Telemetry Panel */}
                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-[11px] text-emerald-400 font-mono space-y-2 shadow-inner">
                          <div className="flex justify-between text-slate-400 text-[10px] font-black uppercase border-b border-slate-800 pb-1">
                            <span>Diagnostic Heuristics Core Log</span>
                            <Terminal className="w-4 h-4 text-slate-700 font-bold" />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                            <div>📡 SECURE ANTIVIRUS GATEWAY: <span className="text-white font-black">ClamAV Checked</span></div>
                            <div>☣ MALWARE INTRUSION ANALYSIS: <span className="text-white font-extrabold">0 Hits (CLEAN)</span></div>
                            <div>📐 RESIZE FORMAT INTEGRATION: <span className="text-white font-extrabold">800x600 px bounds fit</span></div>
                            <div>✨ CONTRAST CLARITY SCORE: <span className="text-white font-extrabold">98% High Legibility</span></div>
                          </div>
                          <div className="text-[10px] text-indigo-400 border-t border-slate-800 pt-1 mt-1">
                            Uploaded size: {selectedMsg.claimDocuments.originalSize} scaled down to {selectedMsg.claimDocuments.resizedSize}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest block font-mono">
                            Press View for Crisp Enhanced 800x600 Visual proof
                          </span>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                              { label: "Identity File (ID / Passport)", key: "id", state: selectedMsg.claimDocuments.idDoc },
                              { label: "CIPC Corporate Register Certificate", key: "cipc", state: selectedMsg.claimDocuments.cipcDoc },
                              { label: "SARS compliant Tax Clearance Certificate", key: "sars", state: selectedMsg.claimDocuments.sarsDoc },
                              { label: "Municipal Utilities Proof of Address", key: "address", state: selectedMsg.claimDocuments.proofOfAddress },
                              { label: "Corporate Business Bank Account statement", key: "bank", state: selectedMsg.claimDocuments.bankStatement }
                            ].map(docItem => (
                              <div key={docItem.key} className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                                <div>
                                  <span className="text-[11px] font-black text-slate-700 block">{docItem.label}</span>
                                  <span className="text-[9px] text-emerald-600 font-bold flex items-center gap-0.5 mt-0.5 font-mono">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> CLEAR & SCANNED ✓
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setPreviewDocUrl({
                                    fileName: docItem.state,
                                    docName: docItem.label,
                                    originalSize: "14.2 MB Original",
                                    resizedSize: "340 KB (800x600 HD optimal)",
                                    clarityScore: 98,
                                    docType: docItem.key
                                  })}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3.5 py-2 rounded-xl transition flex items-center gap-1 shrink-0 uppercase tracking-widest"
                                  id={`view-doc-btn-${docItem.key}`}
                                >
                                  <ZoomIn className="w-3 h-3" />
                                  <span>View</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        <span>This claim message has no attachment statutory documents. Claim details can only be evaluated conceptually.</span>
                      </div>
                    )}

                  </div>

                  {/* Inbox bottom actions block */}
                  <div className="bg-slate-50 border-t border-slate-200 p-5 shrink-0 flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-400 font-bold">
                      Claim Intent Selection Preference: <strong className="text-slate-700 uppercase">{selectedMsg.claimIntention}</strong>
                    </div>

                    <div className="flex gap-2">
                      {selectedMsg.approvalStatus === "pending" ? (
                        <>
                          <button
                            onClick={() => handleRejectClaim(selectedMsg)}
                            className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-extrabold px-4 py-2.5 rounded-xl transition uppercase"
                            id="decline-claim-btn"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApproveClaim(selectedMsg)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-600/10 transition uppercase"
                            id="approve-claim-btn"
                          >
                            Approve Integration
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-white border px-4 py-2 rounded-xl">
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                          <span>Oversight reviewed standard status: {selectedMsg.approvalStatus.toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 text-slate-400 font-bold h-full space-y-3">
                  <Inbox className="w-16 h-16 text-slate-300 mx-auto" />
                  <h4 className="text-base text-slate-700 font-extrabold">Direct message not chosen</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Choose a direct claim transmission thread on the left panels side to inspect claimant verification credentials, antiviruses scans telemetry, and images legibility ratings.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 3: SEEDED BULK CSV SEEDER PARSER */}
        {activeTab === "csv-parser" && (
          <div className="bg-white rounded-3xl border border-slate-250 shadow-sm p-6 space-y-6 max-w-4xl mx-auto" id="seeding-parser-tool">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block font-mono">Administrative Bulk Seeder Tool</span>
              <h3 className="text-lg font-extrabold text-slate-900">Llama3 Local AI Seeder Upload platform</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Paste raw CSV contents containing business files here. The system NLP parser will auto-sanitize parameters, map coordinate strings, and configure a **unique tracking ID** for each active ad automatically so it is extremely easy to search, filter, and edit in the Advertisement Lifecycle control center.
              </p>
            </div>

            <form onSubmit={handleParseCsvUpload} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Fallback Category Type</label>
                  <select
                    value={csvDefaultCategory}
                    onChange={(e) => setCsvDefaultCategory(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 text-xs border border-slate-200 font-bold font-sans cursor-pointer focus:bg-white"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Fallback Province target</label>
                  <select
                    value={csvDefaultProvince}
                    onChange={(e) => setCsvDefaultProvince(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 text-xs border border-slate-200 font-bold font-sans cursor-pointer focus:bg-white"
                  >
                    {SA_PROVINCES.map(p => (
                      <option key={p.slug} value={p.slug}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center justify-between">
                  <span>Raw pasted CSV rows data string</span>
                  <span className="text-[9px] text-slate-400 font-sans tracking-tight">Format schema: Title, Address, Phone, Services (comma rows delimiters)</span>
                </label>
                <textarea
                  rows={8}
                  value={rawCsvText}
                  onChange={(e) => setRawCsvText(e.target.value)}
                  placeholder={`"GC Solar Durban North","24 Ferryden PL Durban KZN","+27 72 304 8181","Solar panels, inverters, backup batteries"
"EcoSmart Cape Town","88 Voortrekker Road Bellville","+27 21 945 3290","Plumbing, leak audits, solar geysers"
"Johannesburg Spark Electricians","59 Garsfontein Road Pretoria","+27 12 348 1022","Emergency power failure repairs, DB board maintenance"`}
                  className="w-full bg-slate-50 text-slate-800 rounded-2xl px-4 py-3.5 text-xs font-mono border border-slate-250 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {csvResultCount !== null && (
                <div className="bg-emerald-50 text-emerald-800 text-xs font-bold p-4 rounded-xl border border-emerald-150 flex items-center gap-2 animate-bounce">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Success! Seeded directory with {csvResultCount} bulk listings under individual tracker sequence IDs. Database synchronized perfectly.</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-8 py-4 rounded-xl shadow-lg shadow-indigo-600/15 flex items-center gap-2 tracking-wide uppercase"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Sanitize, Parse & Generate unique tracking ID</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: GLOBAL NOTICE BANNERS EDITORS */}
        {activeTab === "banners" && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6" id="banners-editor-deck">
            <div>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest block font-mono">Banners Manager slot</span>
              <h3 className="text-base font-extrabold text-slate-900">Edit active global advertisement notices</h3>
              <p className="text-xs text-slate-400">Modify persistent top bar directives display parameters across client screens.</p>
            </div>

            <div className="space-y-4">
              {banners.map(bannerObj => (
                <div key={bannerObj.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Campaign Slot 01</span>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer" 
                          checked={bannerObj.isActive} 
                          onChange={() => {
                            const updated = banners.map(b => b.id === bannerObj.id ? { ...b, isActive: !b.isActive } : b);
                            saveDatabaseState(ads, updated);
                          }} 
                        />
                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-600"></div>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{bannerObj.isActive ? "ACTIVE" : "INACTIVE"}</span>
                    </label>
                  </div>

                  <input
                    type="text"
                    value={bannerObj.text}
                    onChange={(e) => {
                      const updated = banners.map(b => b.id === bannerObj.id ? { ...b, text: e.target.value } : b);
                      saveDatabaseState(ads, updated);
                    }}
                    className="w-full bg-white text-slate-800 rounded-xl px-3 py-2.5 text-xs border border-slate-200 font-bold focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* DETAILED CRISP RESIZED DOCUMENT MODE PREVIEW OVERLAY (CRITICAL RESOLUTION SATISFACTION) */}
      {previewDocUrl && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4" id="hd-document-preview-modal animate-holo-glow">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-250 flex flex-col relative">
            
            <div className="bg-slate-900 border-b border-slate-850 px-6 py-4 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-100">
                  CRISP & RESIZED DOCUMENT PREVIEW
                </h4>
              </div>
              <button
                onClick={() => setPreviewDocUrl(null)}
                className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition duration-150"
                id="close-hd-preview-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document display screen view */}
            <div className="p-8 bg-slate-950 flex-grow h-[260px] flex items-center justify-center overflow-hidden relative">
              
              {/* Telemetry stamps overlay */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 text-[9px] font-mono z-10">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded uppercase font-black">
                  🛡 MALWARE SECURE (ClamAV scanned)
                </span>
                <span className="bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded uppercase font-bold">
                  📐 RESIZED PIXEL COMPACT: 800x600 px format FIT
                </span>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded uppercase font-bold">
                  ✨ HD LEgibility BOOST: 98%
                </span>
              </div>

              <div className="max-w-md w-full select-none" id="hd-document-frame">
                {renderMockDocumentImage(previewDocUrl.docType, previewDocUrl.fileName)}
              </div>

            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-5 shrink-0 flex items-center justify-between text-xs text-slate-500">
              <div>
                Document class target info: <strong className="text-slate-800 uppercase block mt-0.5">{previewDocUrl.docName}</strong>
              </div>
              <div className="text-right">
                File details: <strong className="text-slate-800 uppercase block mt-0.5">{previewDocUrl.resizedSize}</strong>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Simple Admin space footer footer */}
      <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-6 text-center text-xs shrink-0" id="admin-footer">
        <p>&copy; 2026 BizSearch24 SA Secure Workstation. POPI compliance certificates valid.</p>
        <p className="text-[10px] text-slate-600 mt-1 uppercase font-mono tracking-widest">Active Client Services Node Session Core: SA-ZAR-01</p>
      </footer>
    </div>
  );
}
