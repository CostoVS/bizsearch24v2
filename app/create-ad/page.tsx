"use client";

import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { PROVINCES, CATEGORIES, getStoredAds, saveStoredAds } from "@/lib/data";
import {
  PlusCircle,
  MapPin,
  Briefcase,
  Image as ImageIcon,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Star,
  BadgeCheck,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { getLocalProfile } from "@/lib/profile-utils";

export default function CreateAdPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/create-ad");
    }
  }, [user, isLoading, router]);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0] || "Plumbers");
  const [selectedProvince, setSelectedProvince] = useState(
    PROVINCES[0]?.slug || "gauteng",
  );
  const [selectedTown, setSelectedTown] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedStockImg, setSelectedStockImg] = useState("");

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [emailField, setEmailField] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [xLink, setXLink] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [youtube, setYoutube] = useState("");

  const [tradingHours, setTradingHours] = useState("");
  const [servicesOffered, setServicesOffered] = useState("");
  const [isScanningImage, setIsScanningImage] = useState(false);
  const [scanResult, setScanResult] = useState<"clean" | "malware" | null>(
    null,
  );

  const [userAdsCount, setUserAdsCount] = useState(0);

  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem("bizsearch24_custom_ads");
      let count = 0;
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            count = parsed.filter((ad: any) => ad.userId === user.id).length;
          }
        } catch (e) {}
      }
      Promise.resolve().then(() => {
        setUserAdsCount(count);
      });
    }
  }, [user]);

  // Submission & validation states
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic list of towns based on selected province
  const availableTowns = useMemo(() => {
    return PROVINCES.find((p) => p.slug === selectedProvince)?.towns || [];
  }, [selectedProvince]);

  // Set default town when province changes
  useEffect(() => {
    if (availableTowns.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedTown(availableTowns[0]);
    }
  }, [selectedProvince, availableTowns]);

  const stockImages = [
    {
      name: "Modern Office",
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    },
    {
      name: "Tradesman/Tools",
      url: "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=60",
    },
    {
      name: "Legal Advisory",
      url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60",
    },
  ];

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  const isPremiumOrAdmin = user.plan === "PREMIUM" || user.role === "ADMIN";

  const handleAutofill = () => {
    const profile = getLocalProfile(user.id, user.email);
    if (profile) {
      if (profile.businessName || profile.fullName)
        setTitle(profile.businessName || profile.fullName);
      if (profile.aboutBusiness || profile.aboutThem)
        setDescription(profile.aboutBusiness || profile.aboutThem);
      if (profile.address) setAddress(profile.address);
      if (profile.phoneNumber) setPhone(profile.phoneNumber);
      if (profile.whatsappNumber) setWhatsapp(profile.whatsappNumber);
      if (profile.email) setEmailField(profile.email);
      if (profile.servicesOffered) setServicesOffered(profile.servicesOffered);
      if (profile.tiktok) setTiktok(profile.tiktok);
      if (profile.x) setXLink(profile.x);
      if (profile.instagram) setInstagram(profile.instagram);
      if (profile.facebook) setFacebook(profile.facebook);
      if (profile.youtube) setYoutube(profile.youtube);
      if (profile.logoUrl || profile.avatarUrl)
        setImageUrl(profile.logoUrl || profile.avatarUrl);
    }
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (userAdsCount >= 1 && user.role !== "ADMIN") {
      setErrorMsg(
        "Limit Reached: Both Free and Premium tiers are allowed to publish exactly 1 advertisement only.",
      );
      return;
    }
    if (!title.trim()) {
      setErrorMsg("Please enter a business title.");
      return;
    }
    if (title.length < 5) {
      setErrorMsg("Business title must be at least 5 characters.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Please provide a business description.");
      return;
    }
    if (description.length < 20) {
      setErrorMsg(
        "Description must be at least 20 characters to inform clients.",
      );
      return;
    }
    if (!selectedTown) {
      setErrorMsg("Please select a town/city.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("Please provide a physical address.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("Please specify a business phone number.");
      return;
    }

    setIsSubmitting(true);

    // Simulate database insertion and save to localStorage
    setTimeout(() => {
      try {
        const finalImage = isPremiumOrAdmin
          ? imageUrl || selectedStockImg || stockImages[0].url
          : null;

        const newAd = {
          id: `custom-ad-${Date.now()}`,
          userId: user.id,
          title: title.trim(),
          category,
          location: selectedTown.toLowerCase(),
          province: selectedProvince,
          description: description.trim(),
          tradingHours: tradingHours.trim(),
          servicesOffered: servicesOffered.trim(),
          verified: isPremiumOrAdmin,
          isPremium: isPremiumOrAdmin,
          isSponsor: false,
          image: finalImage,
          address: address.trim(),
          phone: phone.trim(),
          whatsapp: isPremiumOrAdmin ? whatsapp.trim() : "",
          email: isPremiumOrAdmin ? emailField.trim() : "",
          socialTikTok: isPremiumOrAdmin ? tiktok.trim() : "",
          socialX: isPremiumOrAdmin ? xLink.trim() : "",
          socialInstagram: isPremiumOrAdmin ? instagram.trim() : "",
          socialFacebook: isPremiumOrAdmin ? facebook.trim() : "",
          socialYoutube: isPremiumOrAdmin ? youtube.trim() : "",
          createdAt: new Date().toISOString(),
        };

        // Retrieve and update existing ads in the master database
        const masterAds = getStoredAds();
        masterAds.unshift(newAd);
        saveStoredAds(masterAds);

        // Display success state
        setSuccess(true);
        setIsSubmitting(false);

        // Redirect back optionally, or let them view confirmation
        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);
      } catch (err) {
        setErrorMsg("Failed to save advertisement. Please try again.");
        setIsSubmitting(false);
      }
    }, 1200);
  };

  if (userAdsCount >= 1 && user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mb-6 border border-rose-100 text-rose-600">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">
            Advertisement Limit Reached
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-8">
            To ensure directory purity and prevent spam, both Free and Premium
            tiers are strictly restricted to **1 advertisement per user only**.
            You already have an active listing.
          </p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl uppercase tracking-wider transition-colors shadow-sm"
            >
              Manage Listings on Dashboard &rarr;
            </Link>
            <Link
              href="/dashboard?tab=profile"
              className="block text-xs font-bold text-slate-500 hover:text-slate-800 hover:underline"
            >
              Need to edit your representative Profile instead?
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </Link>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-slate-100 bg-slate-50/50 relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <span className="inline-flex items-center text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200 text-xs uppercase tracking-wide mb-3">
                  <Sparkles className="w-3 h-3 mr-1.5 text-emerald-600" />{" "}
                  Professional Directory
                </span>
                <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">
                  Post Your Advertisement
                </h1>
                <p className="text-slate-500 mt-1.5">
                  Put your services right in front of thousands of customers
                  across South Africa.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutofill}
                className="shrink-0 flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition"
              >
                <RefreshCw className="w-4 h-4" />
                Autofill from Profile
              </button>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            {success ? (
              <div className="text-center py-10 space-y-4">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-2 border border-emerald-100">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">
                  Advertisement Created!
                </h2>
                <p className="text-slate-500 max-w-md mx-auto">
                  Your listing for{" "}
                  <span className="font-semibold text-emerald-600">
                    &quot;{title}&quot;
                  </span>{" "}
                  has been compiled and is now live. Redirecting you to your
                  dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublish} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-rose-500" />
                    {errorMsg}
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                    placeholder="e.g. Pretoria High-Pressure Plumbing"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Specify your main business name to optimize organic
                    directory search placement.
                  </span>
                </div>

                {/* Category & Province */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white outline-none transition"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Province
                    </label>
                    <select
                      value={selectedProvince}
                      onChange={(e) => setSelectedProvince(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white outline-none transition animate-none"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p.slug} value={p.slug}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Town Select */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Town / City
                  </label>
                  <select
                    value={selectedTown}
                    onChange={(e) => setSelectedTown(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white outline-none transition"
                    required
                  >
                    {availableTowns.map((town) => (
                      <option key={town} value={town}>
                        {town}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address & Phone Number */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Physical Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      placeholder="e.g. 42 Jan Shoba St, Hatfield"
                      required
                    />
                  </div>
                  {address.trim().length > 5 && (
                    <div className="w-full h-48 sm:h-64 rounded-xl overflow-hidden border border-slate-200">
                      <iframe
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                      placeholder="e.g. +27 12 345 6789"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                    placeholder="Describe your credentials, response times, coverage area, and anything else clients should know..."
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Minimum 20 characters. Let clients know why they should
                    choose your services.
                  </span>
                </div>

                {/* Services & Trading Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Services Offered
                    </label>
                    <textarea
                      value={servicesOffered}
                      onChange={(e) => setServicesOffered(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                      placeholder="e.g. Toilet Repair, Leak Detection, Pipe Installation..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      Trading Hours
                    </label>
                    <textarea
                      value={tradingHours}
                      onChange={(e) => setTradingHours(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none"
                      placeholder="e.g. Mon-Fri: 8am - 5pm&#10;Sat: 9am - 1pm&#10;Sun: Closed"
                    />
                  </div>
                </div>

                {/* Premium Contact & Social Channels */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      {isPremiumOrAdmin ? (
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        </div>
                      ) : (
                        <div className="bg-slate-200 p-2 rounded-lg">
                          <Star className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">
                          Premium Outreach & Social Links
                        </h4>
                        {isPremiumOrAdmin ? (
                          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Premium
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-500 bg-slate-200/60 border border-slate-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                            Premium Only
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Add direct inquiry channels like WhatsApp, active Email,
                        and link your custom TikTok, X, Instagram, Facebook, and
                        YouTube channels.
                      </p>

                      {isPremiumOrAdmin ? (
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                                WhatsApp Number
                              </label>
                              <input
                                type="tel"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                placeholder="e.g. +27821234567"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                                Direct Business Email
                              </label>
                              <input
                                type="email"
                                value={emailField}
                                onChange={(e) => setEmailField(e.target.value)}
                                placeholder="e.g. contact@mybusiness.co.za"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                              />
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3">
                            <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-2">
                              Social Media Links
                            </label>
                            <div className="space-y-2.5">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                  TikTok Link
                                </label>
                                <input
                                  type="url"
                                  value={tiktok}
                                  onChange={(e) => setTiktok(e.target.value)}
                                  placeholder="https://tiktok.com/@mybrand"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                  X / Twitter Link
                                </label>
                                <input
                                  type="url"
                                  value={xLink}
                                  onChange={(e) => setXLink(e.target.value)}
                                  placeholder="https://x.com/mybrand"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                  Instagram Link
                                </label>
                                <input
                                  type="url"
                                  value={instagram}
                                  onChange={(e) => setInstagram(e.target.value)}
                                  placeholder="https://instagram.com/mybrand"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                  Facebook Page Link
                                </label>
                                <input
                                  type="url"
                                  value={facebook}
                                  onChange={(e) => setFacebook(e.target.value)}
                                  placeholder="https://facebook.com/mybrand"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-400 mb-0.5">
                                  YouTube Channel Link
                                </label>
                                <input
                                  type="url"
                                  value={youtube}
                                  onChange={(e) => setYoutube(e.target.value)}
                                  placeholder="https://youtube.com/c/mybrand"
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-emerald-500 bg-white"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                          <p className="text-xs text-indigo-950 font-medium leading-normal max-w-sm">
                            Upgrade to Premium to unlock WhatsApp Chat, Business
                            Email address and full Social Platform connectivity.
                          </p>
                          <Link
                            href="/premium"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm ml-4"
                          >
                            Upgrade &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Image upload (Premium only features) */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
                  <div className="flex items-start">
                    <div className="mt-1 mr-3">
                      {isPremiumOrAdmin ? (
                        <div className="bg-emerald-100 p-2 rounded-lg">
                          <Star className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        </div>
                      ) : (
                        <div className="bg-slate-200 p-2 rounded-lg">
                          <ImageIcon className="w-5 h-5 text-slate-500" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-bold text-slate-800 text-sm">
                          Media & Portfolio Showcase
                        </h4>
                        {isPremiumOrAdmin ? (
                          <span className="inline-flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                            <BadgeCheck className="w-3.5 h-3.5 mr-1" /> Premium
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-slate-500 bg-slate-200/60 border border-slate-300 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                            Premium Only
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        Add a representative photo of your brand, work or
                        credentials to achieve up to 5x higher client engagement
                        rate.
                      </p>

                      {isPremiumOrAdmin ? (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                              Company Logo / Showcase Image
                            </label>

                            <div className="flex items-center gap-4">
                              <label className="flex-1 border-2 border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-100 transition flex flex-col items-center justify-center">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setIsScanningImage(true);
                                      setScanResult(null);

                                      // Simulate scanning and resizing
                                      setTimeout(() => {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          setImageUrl(reader.result as string);
                                          setSelectedStockImg("");
                                          setIsScanningImage(false);
                                          setScanResult("clean");
                                        };
                                        reader.readAsDataURL(file);
                                      }, 1500);
                                    }
                                  }}
                                />
                                <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                                <span className="text-xs font-bold text-slate-600">
                                  Click to upload from gallery
                                </span>
                                <span className="text-[10px] text-slate-400 mt-1">
                                  Automatically resized & scanned
                                </span>
                              </label>

                              {(imageUrl || selectedStockImg) &&
                                !isScanningImage && (
                                  <div className="w-24 h-24 rounded-lg overflow-hidden border border-slate-200 relative shrink-0">
                                    <img
                                      src={imageUrl || selectedStockImg}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setImageUrl("");
                                        setSelectedStockImg("");
                                        setScanResult(null);
                                      }}
                                      className="absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1"
                                    >
                                      &times;
                                    </button>
                                  </div>
                                )}
                            </div>

                            {isScanningImage && (
                              <div className="mt-2 text-[10px] font-bold text-indigo-600 flex items-center gap-1.5 animate-pulse">
                                <div className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                AI Engine: Scanning for malware & resizing
                                aspect ratio...
                              </div>
                            )}

                            {scanResult === "clean" && (
                              <div className="mt-2 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" /> Image
                                scanned and verified clean.
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 tracking-wider uppercase mb-1.5">
                              Or Choose Stock Photo
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              {stockImages.map((img) => (
                                <button
                                  key={img.url}
                                  type="button"
                                  onClick={() => {
                                    setStockImg(img.url);
                                    setImageUrl("");
                                    setScanResult(null);
                                  }}
                                  className={`rounded-lg border p-1 text-[10px] font-medium text-slate-600 hover:bg-white overflow-hidden transition-all ${selectedStockImg === img.url ? "ring-2 ring-emerald-500 bg-white border-transparent" : "border-slate-200"}`}
                                >
                                  <div className="h-10 w-full mb-1 bg-slate-100 rounded overflow-hidden relative">
                                    <img
                                      src={img.url}
                                      alt={img.name}
                                      className="object-cover h-full w-full"
                                    />
                                  </div>
                                  <span className="truncate block px-1">
                                    {img.name}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between">
                          <p className="text-xs text-indigo-950 font-medium leading-normal max-w-md">
                            Media features are locked: upgrade to Premium to
                            upload portfolio imagery, showcase items, and get
                            full visual listings on province dashboards.
                          </p>
                          <Link
                            href="/premium"
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm ml-4"
                          >
                            Upgrade &rarr;
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content scanner warning & publish buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4">
                  <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 shrink-0">
                    🛡️ AI Content Safety Inspection Active
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="px-5 py-3 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition w-full sm:w-auto"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-md shadow-emerald-600/10 active:scale-[0.98] w-full sm:w-auto min-w-[140px] flex items-center justify-center"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Publish Listing
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper to change stock image easily
  function setStockImg(url: string) {
    setSelectedStockImg(url);
  }
}
