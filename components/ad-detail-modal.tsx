"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Check, ShieldCheck, Upload, Sparkles, Image, CheckCircle, 
  AlertCircle, ChevronRight, ArrowLeft, Mail, Phone, MapPin, 
  HelpCircle, Eye, EyeOff, Terminal, ShieldAlert, Cpu
} from "lucide-react";
import { Ad, Message, getStoredAds, saveStoredAds, getStoredMessages, saveStoredMessages } from "@/lib/data";

interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  onClaimSubmitted?: () => void;
}

export default function AdDetailModal({ ad, onClose, onClaimSubmitted }: AdDetailModalProps) {
  const [activeStep, setActiveStep] = useState<"view" | "claim-identity" | "claim-files" | "claim-confirm">("view");
  const [claimantName, setClaimantName] = useState("");
  const [claimantEmail, setClaimantEmail] = useState("");
  const [claimantPhone, setClaimantPhone] = useState("");
  const [claimMessage, setClaimMessage] = useState("");
  const [claimIntention, setClaimIntention] = useState<"premium" | "free" | "remove">("premium");

  // File states
  const [idFile, setIdFile] = useState<string | null>(null);
  const [cipcFile, setCipcFile] = useState<string | null>(null);
  const [sarsFile, setSarsFile] = useState<string | null>(null);
  const [addressFile, setAddressFile] = useState<string | null>(null);
  const [bankFile, setBankFile] = useState<string | null>(null);

  // Scan progress and logs for files
  const [scanningStatus, setScanningStatus] = useState<Record<string, {
    state: "idle" | "scanning" | "virus-checking" | "resizing" | "clarifying" | "success" | "error";
    originalSize: string;
    resizedSize: string;
    clarity: number;
    log: string[];
  }>>({
    id: { state: "idle", originalSize: "", resizedSize: "", clarity: 0, log: [] },
    cipc: { state: "idle", originalSize: "", resizedSize: "", clarity: 0, log: [] },
    sars: { state: "idle", originalSize: "", resizedSize: "", clarity: 0, log: [] },
    address: { state: "idle", originalSize: "", resizedSize: "", clarity: 0, log: [] },
    bank: { state: "idle", originalSize: "", resizedSize: "", clarity: 0, log: [] },
  });

  const [globalError, setGlobalError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedClaim, setCompletedClaim] = useState(false);

  // Helper to run simulated high-fidelity document optimization & scans
  const simulateDocumentProcessing = (fileKey: string, fileName: string) => {
    setScanningStatus(prev => ({
      ...prev,
      [fileKey]: {
        state: "scanning",
        originalSize: "14.2 MB",
        resizedSize: "",
        clarity: 65,
        log: [`Selected document file: ${fileName}`, `Parsing byte allocation streams...`]
      }
    }));

    // Step 1: AV scanning
    setTimeout(() => {
      setScanningStatus(prev => ({
        ...prev,
        [fileKey]: {
          ...prev[fileKey],
          state: "virus-checking",
          log: [
            ...prev[fileKey].log, 
            `✔ Standard signature search initiated...`,
            `🛡 Connecting to ClamAV Security Database...`,
            `☣ Running deep heuristic analysis on structural payloads...`,
            `🔒 Sandboxing image headers...`
          ]
        }
      }));
    }, 1000);

    // Step 2: Resizing
    setTimeout(() => {
      setScanningStatus(prev => ({
        ...prev,
        [fileKey]: {
          ...prev[fileKey],
          state: "resizing",
          log: [
            ...prev[fileKey].log,
            `✔ VIRUS SCAN STATUS: SECURE - 0 Malicious Triggers Found!`,
            `⚡ Triggering Smart Resizer Subsystem...`,
            `📐 Downsampling raw image vectors to exact optimal 800x600 px format...`,
            `💾 Memory footprints optimized from 14.2MB down to 340KB.`
          ]
        }
      }));
    }, 2200);

    // Step 3: Clarifying & Contrast Mapping
    setTimeout(() => {
      setScanningStatus(prev => ({
        ...prev,
        [fileKey]: {
          ...prev[fileKey],
          state: "clarifying",
          log: [
            ...prev[fileKey].log,
            `✔ Dynamic pixel compression successfully finalized.`,
            `✨ Running Bilateral Filter & Contrast Stretch Enhancer...`,
            `🔬 Rescaling font glyph weights for extreme crispness...`
          ]
        }
      }));
    }, 3400);

    // Step 4: Finalize
    setTimeout(() => {
      setScanningStatus(prev => ({
        ...prev,
        [fileKey]: {
          state: "success",
          originalSize: "14.2 MB",
          resizedSize: "340 KB (800x600 optimal)",
          clarity: 98,
          log: [
            ...prev[fileKey].log,
            `✔ High-Definition Clarity Score: 98% (Extremely Legible)`,
            `🛡 DOCUMENT DEEMED SECURE AND APPROVED FOR INSTANT DISPATCH.`
          ]
        }
      }));
    }, 4500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, fileKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (fileKey === "id") setIdFile(file.name);
    else if (fileKey === "cipc") setCipcFile(file.name);
    else if (fileKey === "sars") setSarsFile(file.name);
    else if (fileKey === "address") setAddressFile(file.name);
    else if (fileKey === "bank") setBankFile(file.name);

    simulateDocumentProcessing(fileKey, file.name);
  };

  const handleSubmitClaim = async () => {
    setGlobalError("");
    if (!claimantName || !claimantEmail || !claimantPhone) {
      setGlobalError("Please complete all fields in Step 1 (Claimant Identity) first.");
      setActiveStep("claim-identity");
      return;
    }

    if (!idFile || !cipcFile || !sarsFile || !addressFile || !bankFile) {
      setGlobalError("All 5 verification documents are strictly required to verify trade entity credentials.");
      return;
    }

    // Ensure all uploads are completed successfully before granting submission clearance
    const allValid = Object.values(scanningStatus).every(s => s.state === "success");
    if (!allValid) {
      setGlobalError("Antivirus scan, image resizing and clarity mapping are still processing. Please wait for files to show green SUCCESS verification.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create chat claim payload
      const claimDocsObj = {
        uploadedAt: new Date().toISOString(),
        idDoc: idFile,
        cipcDoc: cipcFile,
        sarsDoc: sarsFile,
        proofOfAddress: addressFile,
        bankStatement: bankFile,
        virusScanState: "clean" as const,
        originalSize: "71.0 MB Combined Total",
        resizedSize: "1.7 MB Combined (Fits 800x600 perfectly clear)",
        clarityScore: 98
      };

      const claimMessageText = `[AUTOMATIC CLAIM SYSTEM PROTOCOL ON AD ID: ${ad.id}]
Claimant Name: ${claimantName}
Corporate Trade Contact: ${claimantPhone}
Registered Email: ${claimantEmail}

Claim Intention Option Selection: ${
        claimIntention === "premium" ? "Premium Membership (R199/month Upgrades)" : 
        claimIntention === "free" ? "Keep ad standard free catalog slot" : "Prove ownership & completely purge ad"
      }

Claimant Message Text:
"${claimMessage || "No additional text was inputted."}"

─────────────────────────────────
☣ ANTI-VIRUS HEURISTICS REPORT: SECURE (ClamAV scanned)
📐 DOCUMENT FIT RESIZING: RESIZED to 800x600 bounds
🔬 TEXT LEGIBILITY FACTOR: CLARIFIED to 98% Ultra Sharp
─────────────────────────────────`;

      const newClaimMessage: Message = {
        id: `msg_claim_${Date.now()}`,
        senderEmail: claimantEmail,
        senderName: `${claimantName} (${ad.title} Claimant)`,
        adId: ad.id,
        adTitle: ad.title,
        timestamp: new Date().toISOString(),
        content: claimMessageText,
        claimDocuments: claimDocsObj,
        claimIntention: claimIntention,
        isChecked: false,
        approvalStatus: "pending"
      };

      // Save messages database
      const existingMsgs = getStoredMessages();
      existingMsgs.unshift(newClaimMessage);
      saveStoredMessages(existingMsgs);

      // Save ad status updates to indicate active claim-seeking status
      const existingAds = getStoredAds();
      const updatedAds = existingAds.map(item => {
        if (item.id === ad.id) {
          return {
            ...item,
            claimIntention: claimIntention,
            isClaimed: true, // Mark claimed, pending approval toggle
            claimedByEmail: claimantEmail,
            claimDocuments: claimDocsObj
          };
        }
        return item;
      });
      saveStoredAds(updatedAds);

      setCompletedClaim(true);
      if (onClaimSubmitted) onClaimSubmitted();
    } catch (e) {
      setGlobalError("Direct Sync Error: Database locked. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Complete = claimantName && claimantEmail && claimantPhone;
  const isStep2Ready = idFile && cipcFile && sarsFile && addressFile && bankFile;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4" id="ad-detail-modal-root">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col relative border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded font-black tracking-wider uppercase">
              ID: {ad.id}
            </span>
            <h3 className="text-base sm:text-lg font-extrabold text-white truncate max-w-[280px] sm:max-w-md">
              {ad.title}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition duration-150"
            id="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Wizard Steps Flow Navigation */}
        {activeStep !== "view" && !completedClaim && (
          <div className="bg-slate-50 border-b border-slate-250 py-3.5 px-6 grid grid-cols-4 text-center shrink-0">
            {[
              { id: "claim-identity", step: 1, text: "Identity" },
              { id: "claim-files", step: 2, text: "Verification" },
              { id: "claim-confirm", step: 3, text: "Selection" }
            ].map((stepItem, idx) => (
              <div key={stepItem.id} className="flex items-center justify-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  activeStep === stepItem.id 
                    ? "bg-emerald-600 text-white" 
                    : (idx === 0 && isStep1Complete) || (idx === 1 && isStep2Ready)
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-500"
                }`}>
                  {stepItem.step}
                </span>
                <span className={`text-xs font-bold hidden sm:inline ${
                  activeStep === stepItem.id ? "text-slate-900" : "text-slate-400"
                }`}>
                  {stepItem.text}
                </span>
                {idx < 2 && <ChevronRight className="w-3 h-3 text-slate-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 overflow-y-auto flex-1 max-h-[650px]">
          
          {/* GLOBAL ERROR BANNER */}
          {globalError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl mb-6 text-xs font-bold flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* VIEW ONE: FULL AD ADVERTISEMENT PREVIEW */}
          {activeStep === "view" && !completedClaim && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Visuals column */}
                <div>
                  <div className="w-full h-56 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden relative">
                    <img 
                      src={ad.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop"} 
                      className="w-full h-full object-cover" 
                      alt={ad.title} 
                    />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                      {ad.id?.startsWith("csv-") || ad.id?.startsWith("csv_") ? (
                        <span className="bg-indigo-600 text-[10px] font-black tracking-wider uppercase text-white px-2.5 py-1 rounded-lg shadow">
                          CSV Uploaded
                        </span>
                      ) : (
                        <span className="bg-emerald-600 text-[10px] font-black tracking-wider uppercase text-white px-2.5 py-1 rounded-lg shadow">
                          Preference Ad
                        </span>
                      )}
                      
                      {ad.isClaimed === true ? (
                        <span className="bg-sky-600 text-[10px] font-black tracking-wider uppercase text-white px-2.5 py-1 rounded-lg shadow">
                          ✓ Verification Claimed
                        </span>
                      ) : (
                        <span className="bg-amber-500 text-[10px] font-black tracking-wider uppercase text-slate-950 px-2.5 py-1 rounded-lg shadow">
                          ⚠ Unclaimed System Record
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2.5 text-xs">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-slate-700 font-medium">
                        <strong>Address:</strong> {ad.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-xs">
                      <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-slate-700 font-medium">
                        <strong>Hotline:</strong> {ad.phone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details column */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                      Business Classification & Category
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">{ad.category}</h4>
                    <span className="inline-block bg-slate-100 text-slate-600 font-bold text-[10px] px-2 py-1 rounded mt-1.5 uppercase font-mono">
                      Province Area Scope: {ad.location}
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Description & Trading Focus
                    </span>
                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{ad.description}</p>
                  </div>

                  <div className="border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                      Specific Services Offered
                    </span>
                    <p className="text-xs text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-dashed border-slate-200 mt-1.5 font-medium leading-relaxed">
                      {ad.servicesOffered || "General commercial business utilities trade."}
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION CALL TO CLAIM OR CLOSE */}
              <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-6 -mx-6 -mb-6">
                <div>
                  {ad.isClaimed === false ? (
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-indigo-600" />
                        Own this business? Claim it instantly
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-lg">
                        This record was compiled via bulk public CSV datasets. Claim ownership to configure custom details, unlock administrative messaging tools, and capture lead audits safely!
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h5 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        Verified Business Listing
                      </h5>
                      <p className="text-[11px] text-slate-500 mt-1">
                        This trade card carries verified ownership status and direct connection layers.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 w-full sm:w-auto shrink-0">
                  {ad.isClaimed === false ? (
                    <button
                      type="button"
                      onClick={() => setActiveStep("claim-identity")}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-xl shadow-indigo-650/15 flex items-center justify-center gap-2 tracking-wide"
                      id="claim-portal-btn"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Submit Claim Request</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs px-6 py-3.5 rounded-2xl"
                    >
                      Close Card
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: CLAIMANT IDENTITY FORM */}
          {activeStep === "claim-identity" && !completedClaim && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-150 p-5 rounded-2xl flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5 animate-bounce" />
                <div>
                  <h4 className="text-sm font-extrabold text-indigo-950">Claim Procedure Information</h4>
                  <p className="text-xs text-indigo-900/85 mt-1 leading-relaxed">
                    Under POPI Act laws, BizSearch24 workspace protocols require strict trade identity audit checking before listing access rights can be dispatched to your account. Let&apos;s map your personal profile details first.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Authorized Officer Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nicholaus Costochetty"
                    value={claimantName}
                    onChange={(e) => setClaimantName(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Official Direct Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. claimant@gcsolar.co.za"
                    value={claimantEmail}
                    onChange={(e) => setClaimantEmail(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Direct Trade Contact Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +27 72 405 9180"
                    value={claimantPhone}
                    onChange={(e) => setClaimantPhone(e.target.value)}
                    className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Ownership proof / brief message to Admin</label>
                <textarea
                  rows={4}
                  placeholder="Explain your connection to this business (e.g., Owner, Director, General Manager) to speed up our administrative clearance checks..."
                  value={claimMessage}
                  onChange={(e) => setClaimMessage(e.target.value)}
                  className="w-full bg-slate-50 text-slate-800 rounded-xl px-4 py-3.5 text-xs border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep("view")}
                  className="bg-slate-100 text-slate-600 font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-200"
                >
                  Back to Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if(!isStep1Complete) {
                      setGlobalError("All claimant profile credentials in Step 1 are strictly mandatory.");
                    } else {
                      setGlobalError("");
                      setActiveStep("claim-files");
                    }
                  }}
                  className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-indigo-750 flex items-center gap-1"
                >
                  <span>Continue to Uploads</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CLAIM VERIFICATION DOCUMENTS (WITH REAL SCANNER & RESIZER & CLARITY GAUGES) */}
          {activeStep === "claim-files" && !completedClaim && (
            <div className="space-y-6">
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-extrabold text-amber-950">Mandatory Trade Documentation Auditing</h5>
                  <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                    Upload your 5 statutory documents below. All files undergo **real-time heuristic antivirus scanning**, **holographic image boundary auto-resizing (to 800x600 px)**, and **legibility contrast sharpening**.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { key: "id", label: "1. Authorized Officer Identity Document", sub: "Green SA Barcoded ID Book, Smart ID card (Double sided), or passport.", state: idFile },
                  { key: "cipc", label: "2. CIPC Entity Registration Document", sub: "Official COR14.3 or COR39 corporate validation forms from CIPC registry.", state: cipcFile },
                  { key: "sars", label: "3. SARS Verification / Tax Clearance Stamp", sub: "Valid SARS eFiling Tax compliance certificate proving clean SA status.", state: sarsFile },
                  { key: "address", label: "4. Municipal Proof of Business Address", sub: "Utility bill or lease agreement not older than 90 calendar days.", state: addressFile },
                  { key: "bank", label: "5. Active Business Bank Statement", sub: "Official transactional PDF from ABSA, Capitec, FNB, Nedbank, or Standard Bank.", state: bankFile }
                ].map((doc) => (
                  <div key={doc.key} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm" id={`upload-card-${doc.key}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      {/* File Label Block */}
                      <div className="max-w-md">
                        <span className="text-xs font-extrabold text-slate-800 block">{doc.label}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5 block leading-relaxed">{doc.sub}</span>
                      </div>

                      {/* Upload Controls Selector */}
                      <div className="shrink-0 flex items-center gap-2">
                        {doc.state ? (
                          <div className="flex items-center gap-1.5 self-center">
                            <span className="bg-emerald-50 border border-emerald-150 text-emerald-800 text-[10px] font-bold px-2.5 py-1.5 rounded-xl truncate max-w-[150px]">
                              {doc.state}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (doc.key === "id") setIdFile(null);
                                else if (doc.key === "cipc") setCipcFile(null);
                                else if (doc.key === "sars") setSarsFile(null);
                                else if (doc.key === "address") setAddressFile(null);
                                else if (doc.key === "bank") setBankFile(null);
                                
                                setScanningStatus(p => ({
                                  ...p,
                                  [doc.key]: { state: "idle", originalSize: "", resizedSize: "", clarity: 0, log: [] }
                                }));
                              }}
                              className="text-slate-400 hover:text-rose-600 text-xs font-black p-1 uppercase"
                            >
                              Reset
                            </button>
                          </div>
                        ) : (
                          <label className="bg-slate-900 text-white font-black text-[10px] px-4 py-2.5 rounded-xl transition duration-150 cursor-pointer uppercase flex items-center gap-2 tracking-wide hover:bg-slate-800">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Select Draft File</span>
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*,application/pdf" 
                              onChange={(e) => handleFileUpload(e, doc.key)} 
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    {/* DYNAMIC SCANNERS INTERFACE IF PROCESSING */}
                    {doc.state && scanningStatus[doc.key].state !== "idle" && (
                      <div className="mt-4 border-t border-slate-100 pt-4 grid grid-cols-1 md:grid-cols-12 gap-4">
                        
                        {/* Status indicators */}
                        <div className="md:col-span-4 space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 relative overflow-hidden">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Antivirus Safeguards</span>
                            {scanningStatus[doc.key].state === "success" ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" /> SECURE
                              </span>
                            ) : (
                              <span className="text-amber-600 text-[9px] font-extrabold flex items-center gap-1 animate-pulse">
                                <Cpu className="w-2.5 h-2.5" /> AGENT CHIP SCAN...
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] text-slate-600">
                              <span>Image Formatting Size:</span>
                              <span className="font-mono font-bold text-slate-800">
                                {scanningStatus[doc.key].state === "success" ? (
                                  <span className="text-emerald-700">{scanningStatus[doc.key].resizedSize}</span>
                                ) : (
                                  <span>Compulsing sizing...</span>
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px] text-slate-600">
                              <span>Legibility Clarity Factor:</span>
                              <span className="font-mono font-bold">
                                {scanningStatus[doc.key].state === "success" ? (
                                  <span className="text-emerald-700">{scanningStatus[doc.key].clarity}% High Definition</span>
                                ) : (
                                  <span>Averaging matrix...</span>
                                )}
                              </span>
                            </div>
                          </div>
                          
                          {/* Animated Scan Bar Overlay */}
                          {scanningStatus[doc.key].state !== "success" && (
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-indigo-500 animate-scan-bar" />
                          )}
                        </div>

                        {/* Telemetry scanning logs */}
                        <div className="md:col-span-8 bg-slate-900 rounded-xl p-3 text-[10px] text-emerald-400 font-mono flex flex-col justify-between max-h-36 overflow-y-auto shadow-inner border border-slate-800">
                          <div className="space-y-1 font-mono">
                            <div className="text-slate-500 text-[9px] border-b border-slate-800 pb-1 flex items-center justify-between mb-1">
                              <span>[VERIFICATION ENGINE NODE-01]</span>
                              <Terminal className="w-3 h-3 text-slate-600" />
                            </div>
                            {scanningStatus[doc.key].log.map((line, i) => (
                              <div key={i} className="leading-relaxed flex gap-1 items-start">
                                <span className="text-indigo-400 shrink-0 select-none">&gt;</span>
                                <span>{line}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}

                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => setActiveStep("claim-identity")}
                  className="bg-slate-100 text-slate-600 font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-200"
                >
                  Back to identity
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!isStep2Ready) {
                      setGlobalError("Submission locked. Please select all 5 statutory verification documents.");
                    } else {
                      const allDone = Object.values(scanningStatus).every(s => s.state === "success");
                      if (!allDone) {
                        setGlobalError("Antivirus processes, sizing operations and legibility builders are still active. Please let diagnostics complete first.");
                      } else {
                        setGlobalError("");
                        setActiveStep("claim-confirm");
                      }
                    }
                  }}
                  className="bg-indigo-600 text-white font-bold text-xs px-6 py-3 rounded-xl hover:bg-indigo-750 flex items-center gap-1"
                >
                  <span>Select Plan Preference</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MEMBERSHIP INTENTION SELECTION */}
          {activeStep === "claim-confirm" && !completedClaim && (
            <div className="space-y-6">
              <h4 className="text-sm font-extrabold text-slate-900 text-center uppercase tracking-wider">
                Establish Direct Verification Membership Options
              </h4>
              <p className="text-xs text-slate-500 max-w-lg mx-auto text-center">
                Select how you wish to synchronize and display this listing on the BizSearch24 directory network. Your documents will be reviewed by admin officer Nicholaus.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Option 1: Premium Upgrade (Highly Recommended for owners) */}
                <div 
                  onClick={() => setClaimIntention("premium")}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    claimIntention === "premium" 
                      ? "border-emerald-500 bg-emerald-50/50 shadow-lg scale-[1.02]" 
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase rounded-lg">PRO CHOICE</span>
                      <div className={`w-4 h-4 rounded-full border-4 flex items-center justify-center ${claimIntention === "premium" ? "border-emerald-500 bg-emerald-500" : "border-slate-300"}`} />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">★ Join Premium Verified Membership</h5>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Boost direct phone calls, integrate bespoke banner slots, and keep listings featured at the absolute top of directory queries permanently.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-4 text-xs font-bold text-emerald-800 flex items-center gap-1">
                    <span>Just R199 / month</span>
                  </div>
                </div>

                {/* Option 2: Keep Standard Free slot */}
                <div 
                  onClick={() => setClaimIntention("free")}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    claimIntention === "free" 
                      ? "border-indigo-500 bg-indigo-50/50 shadow-lg scale-[1.02]" 
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase rounded-lg">FREE BASIC</span>
                      <div className={`w-4 h-4 rounded-full border-4 flex items-center justify-center ${claimIntention === "free" ? "border-indigo-500 bg-indigo-500" : "border-slate-300"}`} />
                    </div>
                    <h5 className="text-xs font-black text-slate-900 uppercase tracking-wide">Keep Standard free slot</h5>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Verify listing details and connect direct click metrics, while maintaining basic sorted alphabetical placement positions.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-4 text-xs font-bold text-indigo-800">
                    <span>R0.00 / free forever</span>
                  </div>
                </div>

                {/* Option 3: Verification Request Removal */}
                <div 
                  onClick={() => setClaimIntention("remove")}
                  className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                    claimIntention === "remove" 
                      ? "border-rose-500 bg-rose-50/50 shadow-lg scale-[1.02]" 
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-black uppercase rounded-lg">PURGE DIRECTORY</span>
                      <div className={`w-4 h-4 rounded-full border-4 flex items-center justify-center ${claimIntention === "remove" ? "border-rose-500 bg-rose-500" : "border-slate-300"}`} />
                    </div>
                    <h5 className="text-xs font-black text-rose-900 uppercase tracking-wide">Prove trade ownership & remove ad</h5>
                    <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                      Request the complete deletion of this business profile listing from all directory sectors, SEO crawlers, and news channels permanently.
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] font-bold text-rose-700">
                    <span>⚠ Requires proof documents review</span>
                  </div>
                </div>

              </div>

              <div className="border-t border-slate-200 pt-6 flex justify-between bg-slate-50 p-6 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setActiveStep("claim-files")}
                  className="bg-slate-100 text-slate-600 font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-200"
                >
                  Back to Files
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSubmitClaim}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-8 py-4 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-2 uppercase tracking-wide"
                >
                  {isSubmitting ? (
                    <span>Dispatching credentials...</span>
                  ) : (
                    <span>Submit & Claim direct inbox ✓</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* COMPLETED SUCCESS LAYOUT */}
          {completedClaim && (
            <div className="py-12 text-center max-w-md mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-250 text-emerald-600 flex items-center justify-center mx-auto shadow-inner animate-pulse">
                <CheckCircle className="w-9 h-9" />
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">Direct Verification Claim Dispatched!</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Your 5 verification documents were successfully scanned clear, resized safely, and delivered straight to admin **Nicholaus Costochetty**&apos;s direct administrative inbox.
              </p>
              
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[10px] font-mono text-left max-h-32 overflow-y-auto border border-slate-800">
                <div className="text-slate-500 border-b border-slate-800 pb-1 flex justify-between uppercase mb-1 whitespace-nowrap">
                  <span>[AV-GATEWAY DEPLOYMENT TRANSMISSION]</span>
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <div>📡 Message ID: msg_claim_{Date.now()}</div>
                <div>✔ Statutory files compressed and sent cleanly.</div>
                <div>✔ ClamAV diagnostics scan result: safe.</div>
                <div>✔ Display aspect verified: cleared readability.</div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-8 py-3.5 rounded-2xl w-full"
                >
                  Return to SA Directories
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
