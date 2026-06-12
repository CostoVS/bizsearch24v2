"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  MapPin,
  Briefcase,
  BadgeCheck,
  Phone,
  Mail,
  Send,
  CheckCircle,
  User,
  Settings,
  Edit,
  Trash2,
  Check,
  ShieldAlert,
  Sparkles,
  Lock,
  MessageCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { VerificationBadge } from "./ui-extras";
import { getLocalProfile } from "@/lib/profile-utils";
import { trackAdClick } from "@/lib/analytics-utils";
import { useAuth } from "@/lib/auth";
import { getStoredAds, saveStoredAds } from "@/lib/data";

interface Ad {
  id: string;
  userId: string;
  title: string;
  category: string;
  location: string;
  description: string;
  verified: boolean;
  isPremium: boolean;
  isSponsor: boolean;
  image: string | null;
  address?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  socialTikTok?: string;
  socialX?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
  tradingHours?: string;
  servicesOffered?: string;
}

interface AdDetailModalProps {
  ad: Ad | null;
  onClose: () => void;
}

export default function AdDetailModal({ ad, onClose }: AdDetailModalProps) {
  const { user } = useAuth();

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestWhatsapp, setGuestWhatsapp] = useState("");
  const [guestMessage, setGuestMessage] = useState("");
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Messaging State
  const [isMessaging, setIsMessaging] = useState(false);
  const [directMessageText, setDirectMessageText] = useState("");

  // Admin Override Editing States
  const [isAdminEditing, setIsAdminEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editWhatsapp, setEditWhatsapp] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editVerified, setEditVerified] = useState(false);
  const [editIsPremium, setEditIsPremium] = useState(false);
  const [editIsSponsor, setEditIsSponsor] = useState(false);

  useEffect(() => {
    if (ad) {
      setEditTitle(ad.title || "");
      setEditDescription(ad.description || "");
      setEditCategory(ad.category || "");
      setEditLocation(ad.location || "");
      setEditPhone(ad.phone || "");
      setEditEmail(ad.email || "");
      setEditWhatsapp(ad.whatsapp || "");
      setEditImage(ad.image || "");
      setEditVerified(ad.verified ?? false);
      setEditIsPremium(ad.isPremium ?? false);
      setEditIsSponsor(ad.isSponsor ?? false);
      setIsAdminEditing(false);
    }
  }, [ad]);

  // Check if owner has hidden their email
  const ownerProfile = ad ? getLocalProfile(ad.userId) : null;
  const isEmailHidden = ownerProfile ? ownerProfile.hideEmail : false;

  // Track ad click/view event
  useEffect(() => {
    if (ad && ad.id) {
      trackAdClick(
        ad.id,
        ad.title,
        ad.category,
        "South Africa",
        ad.location || "All Areas",
      );
    }
  }, [ad]);

  if (!ad) return null;

  const handleAdminSave = () => {
    const currentAds = getStoredAds();
    const updated = currentAds.map((item) => {
      if (item.id === ad.id) {
        return {
          ...item,
          title: editTitle,
          description: editDescription,
          category: editCategory,
          location: editLocation,
          phone: editPhone,
          email: editEmail,
          whatsapp: editWhatsapp,
          image: editImage || null,
          verified: editVerified,
          isPremium: editIsPremium,
          isSponsor: editIsSponsor,
        };
      }
      return item;
    });

    saveStoredAds(updated);
    alert("Listing database changes saved successfully!");
    setIsAdminEditing(false);
    onClose();
  };

  const handleAdminDelete = () => {
    if (
      confirm(
        `ADMIN ACTIONS WARNING: Are you sure you want to PERMANENTLY REMOVE AND PURGE "${ad.title}"?`,
      )
    ) {
      const currentAds = getStoredAds();
      const updated = currentAds.filter((item) => item.id !== ad.id);
      saveStoredAds(updated);
      alert("Modified successfully. PURGED from all directories.");
      onClose();
    }
  };

  const handleSendSecureMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const isRegistered =
      typeof window !== "undefined" &&
      !!localStorage.getItem("bizsearch24_session");

    if (isRegistered) {
      if (!directMessageText.trim()) return;
      const session = localStorage.getItem("bizsearch24_session");
      if (session) {
        const userSession = JSON.parse(session);
        if (userSession && userSession.id !== ad?.userId) {
          import("@/lib/profile-utils").then(({ getLocalProfile }) => {
            const profile = getLocalProfile(userSession.id, userSession.email);
            let senderName = userSession.email.split("@")[0];
            if (profile) {
              if (profile.displayName) senderName = profile.displayName;
              else if (profile.businessName) senderName = profile.businessName;
              else if (profile.fullName)
                senderName = `${profile.fullName} ${profile.surname}`.trim();
            }

            const recipientEmail =
              ad?.email || ad?.userId || "admin@bizsearch.co.za";

            const newMsg = {
              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              threadId: [
                userSession.email.toLowerCase(),
                recipientEmail.toLowerCase(),
                ad?.id,
              ]
                .sort()
                .join("_"),
              adId: ad?.id || "",
              adTitle: ad?.title || "",
              senderEmail: userSession.email.toLowerCase(),
              senderName: senderName,
              recipientEmail: recipientEmail.toLowerCase(),
              content: directMessageText.trim(),
              timestamp: new Date().toLocaleString(),
              read: false,
            };

            const storedStr = localStorage.getItem("bizsearch24_messages_v1");
            let existing = [];
            if (storedStr) {
              try {
                existing = JSON.parse(storedStr);
              } catch (e) {}
            }
            existing.push(newMsg);
            localStorage.setItem(
              "bizsearch24_messages_v1",
              JSON.stringify(existing),
            );
            setIsMessaging(false);
            setDirectMessageText("");
            alert("Secure message dispatched!");
          });
        } else {
          alert("You cannot send a message to yourself.");
          setIsMessaging(false);
        }
      }
    } else {
      // Guest logic
      if (!guestName || !guestPhone || !guestMessage) return;
      setSubmitting(true);

      let recipientEmail = "john.smith@example.co.za";
      if (ad?.userId === "u1") {
        recipientEmail = "nicholauscostochetty@gmail.com";
      } else if (ad?.userId === "u2") {
        recipientEmail = "john.smith@example.co.za";
      } else if (ad?.userId === "u3") {
        recipientEmail = "sarah.jones@example.co.za";
      } else if (ad?.userId && ad?.userId.includes("@")) {
        recipientEmail = ad?.userId;
      }

      const guestSndEmail = guestPhone.includes("@")
        ? guestPhone
        : `${guestPhone.replace(/[\s+()]/g, "")}@guest.bizsearch24.co.za`;

      const content = `[GUEST INQUIRY]\nName: ${guestName}\nPhone/Email: ${guestPhone}\nWhatsApp: ${guestWhatsapp || "Not provided"}\n\nMessage:\n${guestMessage}`;

      const newMessage = {
        id: "msg_" + Date.now(),
        threadId: [
          guestSndEmail.trim().toLowerCase(),
          recipientEmail.trim().toLowerCase(),
          ad?.id,
        ]
          .sort()
          .join("_"),
        adId: ad?.id || "",
        adTitle: ad?.title || "",
        senderEmail: guestSndEmail.trim().toLowerCase(),
        senderName: guestName,
        recipientEmail: recipientEmail.trim().toLowerCase(),
        content: content,
        timestamp: new Date().toLocaleString(),
      };

      try {
        const existingStr = localStorage.getItem("bizsearch24_messages_v1");
        let existing = [];
        if (existingStr) {
          existing = JSON.parse(existingStr);
        }
        if (!Array.isArray(existing)) {
          existing = [];
        }
        existing.push(newMessage);
        localStorage.setItem(
          "bizsearch24_messages_v1",
          JSON.stringify(existing),
        );
      } catch (err) {
        console.error("Failed to store ad inquiry message:", err);
      }

      setTimeout(() => {
        setSubmitting(false);
        setMsgSuccess(true);
        setGuestMessage("");
        setGuestName("");
        setGuestPhone("");
        setGuestWhatsapp("");

        setTimeout(() => {
          setMsgSuccess(false);
          setIsMessaging(false);
        }, 3000);
      }, 500);
    }
  };

  // Deterministic pure generation based on ad ID to satisfy React rule of purity
  const idHash = ad.id
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mockPhone = `+27 (0) 11 ${600 + (idHash % 200)} ${1000 + (idHash % 8900)}`;
  const mockEmail = `contact@${ad.title.toLowerCase().replace(/[^a-z0-9]/g, "") || "business"}.co.za`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[190] flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col my-auto max-h-[calc(100vh-2rem)] md:max-h-[90vh]"
        >
          {/* Header section with top band */}
          <div className="relative group bg-slate-900 text-white p-5 sm:p-6 md:p-8 shrink-0">
            {/* Background design */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-indigo-600/20 opacity-100 pointer-events-none" />

            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-2 max-w-[85%]">
                <div className="flex flex-wrap gap-2 items-center">
                  <span
                    className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${ad.isSponsor ? "bg-indigo-600 text-white" : ad.isPremium ? "bg-emerald-600 text-white" : "bg-slate-700 text-slate-200"}`}
                  >
                    {ad.isSponsor
                      ? "Featured Partner"
                      : ad.isPremium
                        ? "Premium Directory"
                        : "Standard Ad"}
                  </span>
                  <VerificationBadge verified={ad.verified} />
                </div>
                <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white leading-tight">
                  {ad.title}
                </h2>
              </div>

              {/* Back / Close button */}
              <button
                onClick={onClose}
                className="p-2 md:p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl md:rounded-2xl border border-slate-700 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal scroll area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
            {/* Admin Override Console */}
            {user?.role === "ADMIN" && (
              <div className="bg-gradient-to-r from-red-600/10 via-amber-500/10 to-emerald-600/10 p-5 rounded-2xl border border-rose-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-rose-600 animate-pulse" />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                        ADMINISTRATOR OVERRIDE CONSOLE
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Full read/write/delete privileges for this advertisement
                        registers.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setIsAdminEditing(!isAdminEditing)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        isAdminEditing
                          ? "bg-slate-700 text-white"
                          : "bg-emerald-600 hover:bg-emerald-700 text-white"
                      }`}
                    >
                      {isAdminEditing ? (
                        <>
                          <X className="w-3.5 h-3.5" /> Cancel Edit
                        </>
                      ) : (
                        <>
                          <Edit className="w-3.5 h-3.5" /> Edit Fields
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleAdminDelete}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Ad
                    </button>
                  </div>
                </div>

                {/* Sub-toggles for Verification & Tiers */}
                <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={editVerified}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setEditVerified(val);
                        const currentAds = getStoredAds();
                        saveStoredAds(
                          currentAds.map((item) =>
                            item.id === ad.id
                              ? { ...item, verified: val }
                              : item,
                          ),
                        );
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">
                      Verified Badge
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={editIsPremium}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setEditIsPremium(val);
                        const currentAds = getStoredAds();
                        saveStoredAds(
                          currentAds.map((item) =>
                            item.id === ad.id
                              ? {
                                  ...item,
                                  isPremium: val,
                                  verified: val ? true : item.verified,
                                }
                              : item,
                          ),
                        );
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">
                      Premium Tier
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={editIsSponsor}
                      onChange={(e) => {
                        const val = e.target.checked;
                        setEditIsSponsor(val);
                        const currentAds = getStoredAds();
                        saveStoredAds(
                          currentAds.map((item) =>
                            item.id === ad.id
                              ? {
                                  ...item,
                                  isSponsor: val,
                                  verified: val ? true : item.verified,
                                }
                              : item,
                          ),
                        );
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-[10px] sm:text-xs font-bold text-slate-700">
                      Featured Tier
                    </span>
                  </label>
                </div>
              </div>
            )}
            {isAdminEditing ? (
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 font-display">
                  <Edit className="w-3.5 h-3.5 text-indigo-500" /> Editing
                  Advertisement Metadata
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      Listing Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      Category / Sector
                    </label>
                    <input
                      type="text"
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      Location (slug / town)
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      Contact Phone
                    </label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      Inquiry Email
                    </label>
                    <input
                      type="text"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      WhatsApp Chat Link/Number
                    </label>
                    <input
                      type="text"
                      value={editWhatsapp}
                      onChange={(e) => setEditWhatsapp(e.target.value)}
                      placeholder="e.g. +27821234567"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      Image URL Address
                    </label>
                    <input
                      type="text"
                      value={editImage}
                      onChange={(e) => setEditImage(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1.5 ml-1">
                      Business Narrative / Description
                    </label>
                    <textarea
                      rows={5}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    onClick={() => setIsAdminEditing(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAdminSave}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Save Metadata Changes
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Main Visual Image */}
                {ad.image && (
                  <div className="relative w-full h-56 md:h-80 rounded-2xl overflow-hidden shadow-md">
                    <Image
                      src={ad.image}
                      alt={ad.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Quick Stats Metadata Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-slate-100 pb-5">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Location
                      </span>
                      <span className="text-sm font-bold text-slate-700 capitalize">
                        {ad.location}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400">
                        Industry Sector
                      </span>
                      <span className="text-sm font-semibold text-slate-700 block max-w-full break-words">
                        {ad.category}
                      </span>
                    </div>
                  </div>

                  {ad.address && (
                    <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl sm:col-span-2">
                      <div className="p-2 bg-slate-200 text-slate-700 rounded-xl">
                        <MapPin className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400">
                          Physical Address
                        </span>
                        <span className="text-sm font-bold text-slate-700">
                          {ad.address}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Business Description */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                    About This Entity
                  </h3>
                  <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line font-medium">
                    {ad.description}
                  </p>
                </div>

                {ad.servicesOffered && (
                  <div className="space-y-2 mt-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Services Offered
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {ad.servicesOffered}
                    </p>
                  </div>
                )}

                {ad.tradingHours && (
                  <div className="space-y-2 mt-6">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Trading Hours
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                      {ad.tradingHours}
                    </p>
                  </div>
                )}

                {ad.address && ad.address.length > 5 && (
                  <div className="mt-6 flex flex-col gap-2">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Location Map
                    </h3>
                    <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(ad.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Contact Details & Inquiry Panel */}
                <div className="pt-6 border-t border-slate-100 font-sans flex flex-col gap-6 max-w-2xl mx-auto w-full">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                      Direct Verified Channels
                    </h4>

                    {typeof window !== "undefined" && (
                      <div className="mb-4">
                        {!isMessaging ? (
                          <button
                            onClick={() => setIsMessaging(true)}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-sm shadow-indigo-200 transition-all border border-indigo-500"
                          >
                            <MessageCircle className="w-5 h-5" />
                            Send Secure Message
                          </button>
                        ) : (
                          <motion.div
                            initial={{ opacity: 0, height: 0, scale: 0.95 }}
                            animate={{ opacity: 1, height: "auto", scale: 1 }}
                            className="bg-indigo-50/50 border border-indigo-200 rounded-2xl p-4 sm:p-5 origin-top overflow-hidden"
                          >
                            <div className="flex items-center gap-2 mb-4 border-b border-indigo-100 pb-3">
                              <MessageCircle className="w-5 h-5 text-indigo-600" />
                              <h5 className="text-xs sm:text-sm font-black text-indigo-900 uppercase tracking-wide">
                                Secure Private Message
                              </h5>
                            </div>

                            {msgSuccess ? (
                              <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-6 space-y-3"
                              >
                                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-slate-900">
                                    Message Dispatched!
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    Your secure message has been
                                    securely-routed.
                                  </p>
                                </div>
                              </motion.div>
                            ) : (
                              <div className="space-y-3">
                                {typeof window !== "undefined" &&
                                  !localStorage.getItem(
                                    "bizsearch24_session",
                                  ) && (
                                    <>
                                      <input
                                        type="text"
                                        placeholder="Your Full Name *"
                                        value={guestName}
                                        onChange={(e) =>
                                          setGuestName(e.target.value)
                                        }
                                        className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
                                      />
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input
                                          type="tel"
                                          placeholder="Phone Number *"
                                          value={guestPhone}
                                          onChange={(e) =>
                                            setGuestPhone(e.target.value)
                                          }
                                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
                                        />
                                        <input
                                          type="tel"
                                          placeholder="WhatsApp Number (Optional)"
                                          value={guestWhatsapp}
                                          onChange={(e) =>
                                            setGuestWhatsapp(e.target.value)
                                          }
                                          className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
                                        />
                                      </div>
                                    </>
                                  )}

                                <textarea
                                  value={
                                    typeof window !== "undefined" &&
                                    !localStorage.getItem("bizsearch24_session")
                                      ? guestMessage
                                      : directMessageText
                                  }
                                  onChange={(e) => {
                                    if (
                                      !localStorage.getItem(
                                        "bizsearch24_session",
                                      )
                                    ) {
                                      setGuestMessage(e.target.value);
                                    } else {
                                      setDirectMessageText(e.target.value);
                                    }
                                  }}
                                  placeholder={
                                    typeof window !== "undefined" &&
                                    !localStorage.getItem("bizsearch24_session")
                                      ? "What would you like to ask or request?"
                                      : `Write your message to ${ad.title}...`
                                  }
                                  className="w-full bg-white border border-indigo-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-medium text-slate-700 shadow-inner min-h-[100px]"
                                  rows={4}
                                />

                                <div className="flex justify-end gap-2 pt-2 border-t border-indigo-100">
                                  <button
                                    onClick={() => {
                                      setIsMessaging(false);
                                      setDirectMessageText("");
                                      setGuestMessage("");
                                    }}
                                    className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={handleSendSecureMessage}
                                    disabled={
                                      submitting ||
                                      (typeof window !== "undefined" &&
                                      !localStorage.getItem(
                                        "bizsearch24_session",
                                      )
                                        ? !guestName ||
                                          !guestPhone ||
                                          !guestMessage
                                        : !directMessageText.trim())
                                    }
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {submitting
                                      ? "Sending..."
                                      : "Send Securely"}
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>
                    )}

                    <div className="space-y-3">
                      <Link
                        href={`/profile/${ad.userId}`}
                        className="flex items-center gap-4 p-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition shadow-sm group"
                      >
                        <div className="bg-slate-800/50 p-2 rounded-xl group-hover:scale-110 transition shrink-0">
                          <User className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase font-black text-slate-400">
                            BizSearch24 ID CARD
                          </span>
                          <span className="text-sm font-bold font-sans">
                            View Representative Profile &rarr;
                          </span>
                        </div>
                      </Link>

                      {ad.phone && (
                        <a
                          href={`tel:${ad.phone || mockPhone}`}
                          className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-2xl transition border border-slate-100 hover:border-emerald-100 group"
                        >
                          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-emerald-200 group-hover:scale-110 transition shrink-0">
                            <Phone className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              Phone Support
                            </span>
                            <span className="text-sm font-bold font-mono">
                              {ad.phone || mockPhone}
                            </span>
                          </div>
                        </a>
                      )}

                      {!isEmailHidden && ad.email && (
                        <a
                          href={`mailto:${ad.email || mockEmail}`}
                          className="flex items-center gap-4 p-4 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-2xl transition border border-slate-100 hover:border-emerald-100 group"
                        >
                          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 group-hover:border-emerald-200 group-hover:scale-110 transition shrink-0">
                            <Mail className="w-5 h-5 text-slate-500 group-hover:text-emerald-600" />
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-slate-400">
                              Email Direct
                            </span>
                            <span className="text-sm font-bold break-all">
                              {ad.email || mockEmail}
                            </span>
                          </div>
                        </a>
                      )}

                      {ad.whatsapp && (
                        <a
                          href={`https://wa.me/${ad.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-4 p-4 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-2xl transition shadow-sm group"
                        >
                          <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition shrink-0">
                            <span className="text-xl leading-none block">
                              💬
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] uppercase font-bold text-green-100">
                              WhatsApp Live Chat
                            </span>
                            <span className="text-sm font-mono font-bold">
                              {ad.whatsapp}
                            </span>
                          </div>
                        </a>
                      )}

                      {(ad.socialTikTok ||
                        ad.socialX ||
                        ad.socialInstagram ||
                        ad.socialFacebook ||
                        ad.socialYoutube) && (
                        <div className="pt-4 border-t border-slate-100 mt-2">
                          <span className="block text-[10px] uppercase font-bold text-slate-400 mb-3">
                            Connect via Social Channels
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {ad.socialTikTok && (
                              <a
                                href={ad.socialTikTok}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-black hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                TikTok
                              </a>
                            )}
                            {ad.socialX && (
                              <a
                                href={ad.socialX}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-slate-800 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                X / Twitter
                              </a>
                            )}
                            {ad.socialInstagram && (
                              <a
                                href={ad.socialInstagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                Instagram
                              </a>
                            )}
                            {ad.socialFacebook && (
                              <a
                                href={ad.socialFacebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-blue-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                Facebook
                              </a>
                            )}
                            {ad.socialYoutube && (
                              <a
                                href={ad.socialYoutube}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-rose-600 hover:opacity-90 text-white rounded-xl text-xs font-bold transition shadow-sm"
                              >
                                YouTube
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer controls */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase">
              AD ID: {ad.id}
            </span>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs text-slate-600 transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
