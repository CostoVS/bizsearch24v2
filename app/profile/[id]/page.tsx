'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  User, ShieldCheck, Phone, Mail, MapPin, Briefcase, Globe, Info, 
  ExternalLink, ArrowLeft, Image as ImageIcon, Sparkles, Building2, ListTodo, Lock, MessageSquare, AlertCircle
} from 'lucide-react';
import Image from 'next/image';
import { getLocalProfile, UserProfile } from '@/lib/profile-utils';

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.id as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      // Load user profile details from localStorage (simulated backend lookup)
      const data = getLocalProfile(profileId);
      Promise.resolve().then(() => {
        setProfile(data);
        setLoading(false);
      });
    }
  }, [profileId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Verifying Security Safeguards...</p>
        </div>
      </div>
    );
  }

  // If profile is empty (no name configured) or explicitly set to private, display a highly polished blocked state
  const isProfileEmpty = !profile || (!profile.fullName && !profile.businessName);
  const isPrivate = profile?.isProfilePublic === false;

  if (isProfileEmpty || isPrivate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-8 md:p-10 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center border border-rose-100 text-rose-500">
            <Lock className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Access Restricted</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              {isPrivate 
                ? "This professional directory profile has been configured as hidden or private by its administrator." 
                : "This user profile hasn't been complete or published yet."}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-sm inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Helper safely checking visibility conditions
  const showSection = (isAllowed: boolean) => isAllowed === true;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Back Panel */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </button>

        {/* Master Cover & Profile Card Block */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
          
          {/* Cover Header Graphic with emerald tone */}
          <div className="h-44 sm:h-60 bg-gradient-to-tr from-slate-950 to-emerald-950 px-8 py-6 relative flex items-end">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> Direct Entity Profile
            </div>
          </div>

          {/* User Visual Layout (Aesthetic Overlap Grid) */}
          <div className="px-6 sm:px-10 pb-10 pt-1 relative">
            
            {/* Display Images Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 mb-6 gap-6 relative z-10">
              
              {/* Profile Avatar Frame (Clean scaled base64 / default placeholder) */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-slate-100 border-4 border-white shadow-lg overflow-hidden relative shrink-0">
                  {profile.avatarUrl ? (
                    <Image
                      src={profile.avatarUrl}
                      alt={profile.fullName || "User Avatar"}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                      <User className="w-16 h-16" />
                    </div>
                  )}
                </div>

                {/* Name & Title Summary info */}
                <div className="space-y-1 pt-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {showSection(profile.isPersonalInfoPublic) ? `${profile.fullName} ${profile.surname}`.trim() : "Confidential Account"}
                  </h1>
                  {profile.businessName && showSection(profile.isBusinessInfoPublic) && (
                    <p className="text-emerald-700 font-bold text-base flex items-center gap-1.5 uppercase tracking-wider text-xs">
                      <Building2 className="w-4 h-4" /> {profile.businessName}
                    </p>
                  )}
                </div>
              </div>

              {/* Company Logo Display Container */}
              {profile.logoUrl && showSection(profile.isBusinessInfoPublic) && (
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm p-2 flex items-center justify-center overflow-hidden shrink-0 relative">
                  <Image
                    src={profile.logoUrl}
                    alt="Company Logo"
                    fill
                    className="object-contain p-2"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            {/* Main content grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
              
              {/* Left sidebar: Direct Contact and Social links */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Physical Location Details */}
                {profile.address && showSection(profile.isPersonalInfoPublic) && (
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">Registered Location</span>
                    <div className="flex gap-2 text-slate-700">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold">{profile.address}</span>
                    </div>
                  </div>
                )}

                {/* Interactive Contact Drawer */}
                {showSection(profile.isPersonalInfoPublic) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Contact Channels</h3>
                    
                    {profile.phoneNumber && (
                      <a href={`tel:${profile.phoneNumber}`} className="flex items-center gap-3 p-4 bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl text-slate-700 font-semibold transition hover:bg-slate-50 shadow-sm group">
                        <Phone className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                        <span className="text-xs sm:text-sm truncate">{profile.phoneNumber}</span>
                      </a>
                    )}

                    {profile.whatsappNumber && (
                      <a 
                        href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-800 font-bold transition rounded-2xl shadow-sm group"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        <span className="text-xs sm:text-sm truncate">Chat on WhatsApp</span>
                      </a>
                    )}

                    {profile.email && (
                      <a href={`mailto:${profile.email}`} className="flex items-center gap-3 p-4 bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl text-slate-700 font-semibold transition hover:bg-slate-50 shadow-sm group">
                        <Mail className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                        <span className="text-xs sm:text-sm truncate block overflow-hidden">{profile.email}</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Social media profile channels */}
                {showSection(profile.isSocialLinksPublic) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Social Channels</h3>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {profile.tiktok && (
                        <a href={profile.tiktok} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition">
                          <span className="font-black text-rose-500">♬</span> TikTok
                        </a>
                      )}
                      {profile.instagram && (
                        <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition">
                          <span className="font-bold text-pink-500">📸</span> Instagram
                        </a>
                      )}
                      {profile.facebook && (
                        <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition">
                          <span className="font-bold text-blue-600">👤</span> Facebook
                        </a>
                      )}
                      {profile.x && (
                        <a href={profile.x} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 transition">
                          <span className="font-black">𝕏</span> Twitter / X
                        </a>
                      )}
                      {profile.youtube && (
                        <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="col-span-2 flex items-center justify-center gap-2 p-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-800 rounded-xl text-xs font-bold transition">
                          <span>🎥</span> YouTube Channel
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right panel: Information Sections */}
              <div className="lg:col-span-2 space-y-7">
                
                {/* Section: Personal About Me info */}
                {profile.aboutThem && showSection(profile.isAboutMePublic) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" /> About Professional Owner
                    </h3>
                    <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {profile.aboutThem}
                      </p>
                    </div>
                  </div>
                )}

                {/* Section: Business Info, CIPC & SARS details */}
                {showSection(profile.isBusinessInfoPublic) && (profile.aboutBusiness || profile.cipcNumber || profile.sarsNumber) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" /> Professional entity profile
                    </h3>
                    
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 relative shadow-sm space-y-4">
                      
                      {/* Business Bio copy */}
                      {profile.aboutBusiness && (
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                          {profile.aboutBusiness}
                        </p>
                      )}

                      {/* Corporate compliance metadata banner */}
                      {(profile.cipcNumber || profile.sarsNumber) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 bg-slate-50/40 p-4 rounded-2xl">
                          {profile.cipcNumber && (
                            <div>
                              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-widest">CIPC REG NO.</span>
                              <span className="text-xs font-bold text-slate-800 font-mono text-xs">{profile.cipcNumber}</span>
                            </div>
                          )}
                          {profile.sarsNumber && (
                            <div>
                              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-widest">SARS TAX NO.</span>
                              <span className="text-xs font-bold text-slate-800 font-mono text-xs">{profile.sarsNumber}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Section: Professional Services listed */}
                {profile.servicesOffered && showSection(profile.isServicesPublic) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <ListTodo className="w-4 h-4 text-emerald-600" /> Expertise & Services Provided
                    </h3>
                    <div className="bg-emerald-50/20 p-6 rounded-3xl border border-emerald-100/50">
                      <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-medium">
                        {profile.servicesOffered}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
