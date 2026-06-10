'use client';

import React, { useState } from 'react';
import { X, MapPin, Briefcase, BadgeCheck, Phone, Mail, Send, CheckCircle, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { VerificationBadge } from './ui-extras';

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
}

interface AdDetailModalProps {
  ad: Ad | null;
  onClose: () => void;
}

export default function AdDetailModal({ ad, onClose }: AdDetailModalProps) {
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!ad) return null;

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMessage) return;

    setSubmitting(true);
    
    // Save message to simulated central messaging database
    setTimeout(() => {
      let recipientEmail = "john.smith@example.co.za"; // Default listing owner u2
      if (ad.userId === "u1") {
        recipientEmail = "nicholauscostochetty@gmail.com";
      } else if (ad.userId === "u2") {
        recipientEmail = "john.smith@example.co.za";
      } else if (ad.userId === "u3") {
        recipientEmail = "sarah.jones@example.co.za";
      } else if (ad.userId && ad.userId.includes("@")) {
        recipientEmail = ad.userId;
      }

      const newMessage = {
        id: "msg_" + Date.now(),
        threadId: [inquiryEmail.trim().toLowerCase(), recipientEmail.trim().toLowerCase(), ad.id].sort().join("_"),
        adId: ad.id,
        adTitle: ad.title,
        senderEmail: inquiryEmail.trim().toLowerCase(),
        senderName: inquiryName,
        recipientEmail: recipientEmail.trim().toLowerCase(),
        content: inquiryMessage,
        timestamp: new Date().toLocaleString()
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
        localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(existing));
      } catch (err) {
        console.error("Failed to store ad inquiry message:", err);
      }

      setSuccess(true);
      setSubmitting(false);
      setInquiryName('');
      setInquiryEmail('');
      setInquiryMessage('');
    }, 800);
  };

  // Deterministic pure generation based on ad ID to satisfy React rule of purity
  const idHash = ad.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mockPhone = `+27 (0) 11 ${600 + (idHash % 200)} ${1000 + (idHash % 8900)}`;
  const mockEmail = `contact@${ad.title.toLowerCase().replace(/[^a-z0-9]/g, '') || 'business'}.co.za`;

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
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${ad.isSponsor ? 'bg-indigo-600 text-white' : ad.isPremium ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                    {ad.isSponsor ? 'Featured Partner' : ad.isPremium ? 'Premium Directory' : 'Standard Ad'}
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
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Location</span>
                  <span className="text-sm font-bold text-slate-700 capitalize">{ad.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl">
                <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400">Industry Sector</span>
                  <span className="text-sm font-semibold text-slate-700 truncate block max-w-full">{ad.category}</span>
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">About This Entity</h3>
              <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line font-medium">
                {ad.description}
              </p>
            </div>

            {/* Contact Details & Inquiry Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              {/* Left Column: Direct channels */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Direct Verified Channels</h4>
                
                <div className="space-y-2.5">
                  <Link 
                    href={`/profile/${ad.userId}`} 
                    className="flex items-center gap-3 p-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl transition border border-transparent shadow-sm group"
                  >
                    <User className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase font-black text-slate-300">BizSearch24 ID CARD</span>
                      <span className="text-xs font-bold font-sans">View Representative Profile &rarr;</span>
                    </div>
                  </Link>

                  <a href={`tel:${mockPhone}`} className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-2xl transition border border-transparent hover:border-emerald-100 group">
                    <Phone className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Phone Support</span>
                      <span className="text-sm font-bold font-mono">{mockPhone}</span>
                    </div>
                  </a>

                  <a href={`mailto:${mockEmail}`} className="flex items-center gap-3 p-3.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-2xl transition border border-transparent hover:border-emerald-100 group">
                    <Mail className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    <div>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">Email Direct</span>
                      <span className="text-sm font-bold break-all">{mockEmail}</span>
                    </div>
                  </a>
                </div>
              </div>

              {/* Right Column: Instant mailer form */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Send Secured Dispatch</h4>
                  
                  {success ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-6 space-y-3"
                    >
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-900">Inquiry Dispatched!</p>
                        <p className="text-xs text-slate-500">Your message has been secure-routed directly to the listing administrator.</p>
                      </div>
                      <button 
                        onClick={() => setSuccess(false)}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Send another dispatch
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleInquirySubmit} className="space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Your Full Name"
                          required
                          value={inquiryName}
                          onChange={(e) => setInquiryName(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Your Email Address"
                          required
                          value={inquiryEmail}
                          onChange={(e) => setInquiryEmail(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="What would you like to ask or request?"
                          required
                          rows={3}
                          value={inquiryMessage}
                          onChange={(e) => setInquiryMessage(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                      >
                        {submitting ? 'Sending...' : 'Send Message'}
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer controls */}
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase">AD ID: {ad.id}</span>
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
