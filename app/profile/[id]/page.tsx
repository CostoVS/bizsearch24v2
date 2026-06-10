'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  User, ShieldCheck, Phone, Mail, MapPin, Building2, ListTodo, Lock, 
  MessageSquare, AlertCircle, ArrowLeft, Send, AlertTriangle, Sparkles, Check, ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from "@/lib/auth";
import { getLocalProfile, UserProfile } from '@/lib/profile-utils';

interface Message {
  id: string;
  threadId: string;
  adId: string;
  adTitle: string;
  senderEmail: string;
  senderName: string;
  recipientEmail: string;
  content: string;
  timestamp: string;
  reported?: boolean;
  reportedBy?: string;
  reportReason?: string;
}

// Module-level pure generator to prevent react-hooks/purity errors
function generateId(prefix: string): string {
  return `${prefix}_${Math.floor(Math.random() * 10000000)}`;
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const profileId = params?.id as string;
  const { user: currentUser } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Messaging States
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // Direct Message Composer (for other users checking this profile)
  const [showDirectComposer, setShowDirectComposer] = useState(false);
  const [directSubject, setDirectSubject] = useState("");
  const [directContent, setDirectContent] = useState("");
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  // Report bad-actor modal states
  const [reportingMessage, setReportingMessage] = useState<Message | null>(null);
  const [reportReasonText, setReportReasonText] = useState("");

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Load profile data and messages
  useEffect(() => {
    if (profileId) {
      const data = getLocalProfile(profileId);
      Promise.resolve().then(() => {
        setProfile(data);
        setLoading(false);
      });
    }

    // Load messages database safely using microtasks
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bizsearch24_messages_v1");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          Promise.resolve().then(() => {
            setMessages(parsed);
          });
        } catch (e) {}
      }
    }
  }, [profileId]);

  const refreshMessages = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("bizsearch24_messages_v1");
      if (stored) {
        try {
          setMessages(JSON.parse(stored));
        } catch (e) {}
      }
    }
  };

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

  // Check if profile is empty or private
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
                : "This user profile hasn't been completed or published yet."}
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

  const profileEmail = profile.email?.trim().toLowerCase();
  const currentUserEmail = currentUser?.email?.trim().toLowerCase();
  
  // Decide if current user owns this profile page
  const isOwnProfile = currentUser && (
    currentUserEmail === profileEmail || 
    currentUser.id === profileId
  );

  // Group messages related to current user into conversational threads
  const userMessages = messages.filter(msg => {
    if (!currentUserEmail) return false;
    const sender = msg.senderEmail?.trim().toLowerCase();
    const recipient = msg.recipientEmail?.trim().toLowerCase();
    return sender === currentUserEmail || recipient === currentUserEmail;
  });

  // Collect unique threads
  const threadsMap: Record<string, Message[]> = {};
  userMessages.forEach(msg => {
    if (!threadsMap[msg.threadId]) {
      threadsMap[msg.threadId] = [];
    }
    threadsMap[msg.threadId].push(msg);
  });

  // Sort messages inside each thread chronologically
  Object.keys(threadsMap).forEach(tid => {
    threadsMap[tid].sort((a,b) => b.id.localeCompare(a.id)); // latest first list
  });

  const activeThreadMessages = selectedThreadId ? threadsMap[selectedThreadId] || [] : [];
  // Sort for active chat pane chronologically
  const chatPaneMessages = [...activeThreadMessages].reverse(); 

  // Send Direct Message Compose
  const handleSendDirectMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      triggerToast("Please log in to message this user.");
      return;
    }
    if (!directContent.trim()) return;

    setIsSendingDirect(true);
    setTimeout(() => {
      const recipientEmail = profile.email || "john.smith@example.co.za";
      const senderPre = currentUser.email.split('@')[0];
      const senderName = senderPre.charAt(0).toUpperCase() + senderPre.slice(1);
      
      const newDirect: Message = {
        id: generateId("msg"),
        threadId: [currentUserEmail, recipientEmail.trim().toLowerCase(), "direct"].sort().join("_"),
        adId: "direct",
        adTitle: directSubject.trim() || `Chat with ${profile.fullName || 'Business'}`,
        senderEmail: currentUserEmail || "",
        senderName: senderName,
        recipientEmail: recipientEmail.trim().toLowerCase(),
        content: directContent.trim(),
        timestamp: new Date().toLocaleString()
      };

      try {
        const storedStr = localStorage.getItem("bizsearch24_messages_v1");
        let existing = [];
        if (storedStr) {
          existing = JSON.parse(storedStr);
        }
        existing.push(newDirect);
        localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(existing));
        
        // Refresh local messages state
        setMessages(existing);
        setDirectContent("");
        setDirectSubject("");
        setShowDirectComposer(false);
        triggerToast("Direct Message delivered successfully!");
      } catch (err) {
        triggerToast("Failed to send message.");
      }
      setIsSendingDirect(false);
    }, 600);
  };

  // Reply in Chat Thread
  const handleSendReply = () => {
    if (!currentUserEmail || !selectedThreadId || !replyText.trim()) return;

    const matchedThread = threadsMap[selectedThreadId];
    if (!matchedThread || matchedThread.length === 0) return;

    // Determine the partner email in the thread
    const headMsg = matchedThread[0];
    const partnerEmail = headMsg.senderEmail.trim().toLowerCase() === currentUserEmail 
      ? headMsg.recipientEmail.trim().toLowerCase()
      : headMsg.senderEmail.trim().toLowerCase();

    const senderPre = currentUserEmail.split('@')[0];
    const senderName = senderPre.charAt(0).toUpperCase() + senderPre.slice(1);

    const replyMsg: Message = {
      id: generateId("msg"),
      threadId: selectedThreadId,
      adId: headMsg.adId,
      adTitle: headMsg.adTitle,
      senderEmail: currentUserEmail,
      senderName: senderName,
      recipientEmail: partnerEmail,
      content: replyText.trim(),
      timestamp: new Date().toLocaleString()
    };

    const updated = [...messages, replyMsg];
    localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(updated));
    setMessages(updated);
    setReplyText("");
    triggerToast("Reply delivered!");
  };

  // Report bad actor to admin
  const handleReportBadActor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingMessage || !reportReasonText.trim() || !currentUserEmail) return;

    const accusedUser = reportingMessage.senderEmail.trim().toLowerCase() === currentUserEmail
      ? reportingMessage.recipientEmail
      : reportingMessage.senderEmail;

    const reportItem = {
      id: generateId("report"),
      reporterEmail: currentUserEmail,
      accusedEmail: accusedUser,
      accusedName: reportingMessage.senderEmail === accusedUser ? reportingMessage.senderName : "Advertiser/User",
      reason: reportReasonText.trim(),
      contextMessageId: reportingMessage.id,
      contextContent: reportingMessage.content,
      timestamp: new Date().toLocaleString(),
      status: "PENDING"
    };

    try {
      const storedReportsStr = localStorage.getItem("bizsearch24_reports_v1");
      let reports = [];
      if (storedReportsStr) {
        reports = JSON.parse(storedReportsStr);
      }
      reports.push(reportItem);
      localStorage.setItem("bizsearch24_reports_v1", JSON.stringify(reports));

      triggerToast(`Bad Actor reported to security admin! Ref: ${reportItem.id}`);
      
      // Update message flags
      const updatedMessages = messages.map(m => {
        if (m.id === reportingMessage.id) {
          return { ...m, reported: true, reportedBy: currentUserEmail, reportReason: reportReasonText };
        }
        return m;
      });
      localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(updatedMessages));
      setMessages(updatedMessages);

      setReportingMessage(null);
      setReportReasonText("");
    } catch (err) {
      triggerToast("Failed to submit report.");
    }
  };

  const showPersonal = profile.isPersonalInfoPublic === true;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Back Panel */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest transition shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>

        {/* Master Cover & Profile Card Block */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden relative">
          
          {/* Cover Header Graphic */}
          <div className="h-44 sm:h-52 bg-gradient-to-tr from-slate-950 to-emerald-950 px-8 py-6 relative flex items-end">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-transparent pointer-events-none" />
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED LOCAL PARTNER
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-10 pt-1 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-20 sm:-mt-24 mb-6 gap-6 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-slate-200 border-4 border-white shadow-lg overflow-hidden relative shrink-0">
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

                <div className="space-y-1 pt-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-none">
                    {showPersonal ? `${profile.fullName} ${profile.surname}`.trim() : "Confidential Account"}
                  </h1>
                  {profile.businessName && profile.isBusinessInfoPublic && (
                    <p className="text-emerald-700 font-bold text-sm sm:text-base flex items-center gap-1.5 uppercase tracking-wider">
                      <Building2 className="w-4 h-4" /> {profile.businessName}
                    </p>
                  )}
                </div>
              </div>

              {profile.logoUrl && profile.isBusinessInfoPublic && (
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

            {/* Profile Contents & Messaging tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
              
              {/* Left sidebar: Direct Contact and DM Composers */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Physical Location */}
                {profile.address && showPersonal && (
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 space-y-2">
                    <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block font-sans">Business Location</span>
                    <div className="flex gap-2 text-slate-700">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="text-sm font-semibold">{profile.address}</span>
                    </div>
                  </div>
                )}

                {/* Direct Message composers (for guests/logged in visiting clients) */}
                {!isOwnProfile && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Secure Communication</h3>
                    
                    {!showDirectComposer ? (
                      <button 
                        onClick={() => {
                          if (!currentUser) {
                            triggerToast("Log in to open direct channels.");
                            return;
                          }
                          setShowDirectComposer(true);
                        }}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-4 rounded-2xl transition shadow-lg shadow-emerald-700/10 inline-flex items-center justify-center gap-2"
                      >
                        <MessageSquare className="w-4 h-4" /> Message Professional
                      </button>
                    ) : (
                      <form onSubmit={handleSendDirectMessage} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                          <span className="text-xs font-black text-slate-600 uppercase">New Message</span>
                          <button type="button" onClick={() => setShowDirectComposer(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">Cancel</button>
                        </div>
                        
                        <div>
                          <input 
                            type="text" 
                            placeholder="Subject / Inquiry Topic" 
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500" 
                            value={directSubject}
                            onChange={(e) => setDirectSubject(e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <textarea 
                            rows={3}
                            placeholder="Type your secure message here..." 
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-emerald-500 resize-none" 
                            value={directContent}
                            onChange={(e) => setDirectContent(e.target.value)}
                            required
                          />
                        </div>

                        <button 
                          type="submit"
                          disabled={isSendingDirect || !directContent.trim()}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition inline-flex items-center justify-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" /> {isSendingDirect ? "Sending secure..." : "Deliver Direct"}
                        </button>
                      </form>
                    )}

                    {profile.phoneNumber && showPersonal && (
                      <a href={`tel:${profile.phoneNumber}`} className="flex items-center gap-3 p-4 bg-white border border-slate-100 hover:border-emerald-200 rounded-2xl text-slate-700 font-semibold transition hover:bg-slate-50 shadow-sm group">
                        <Phone className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                        <span className="text-xs sm:text-sm truncate">{profile.phoneNumber}</span>
                      </a>
                    )}

                    {profile.whatsappNumber && showPersonal && (
                      <a 
                        href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-4 bg-emerald-50/50 border border-emerald-100 hover:bg-emerald-100/60 text-emerald-800 font-bold transition rounded-2xl shadow-sm group"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        <span className="text-xs sm:text-sm truncate">WhatsApp Business Chat</span>
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Right panel: Information Sections & Secure Messages Center */}
              <div className="lg:col-span-2 space-y-7">
                
                {/* 1. SECURE MESSAGES CENTER INBOX (Visible only on YOUR OWN profile) */}
                {isOwnProfile && (
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center clarify justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-emerald-600" />
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Security Messages Inbox</h2>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-200">
                        {userMessages.length} Messages
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-inner p-4 md:p-6">
                      {userMessages.length === 0 ? (
                        <div className="text-center py-10">
                          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                          <p className="text-sm font-bold text-slate-500">Your Communication Inbox is empty.</p>
                          <p className="text-xs text-slate-400 mt-1">Inquiries sent from your listing page and chats will appear here.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          
                          {/* Thread List Sidebar */}
                          <div className="md:col-span-5 space-y-2 border-r border-slate-200/50 pr-0 md:pr-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Conversations</span>
                            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                              {Object.keys(threadsMap).map(tid => {
                                const msgs = threadsMap[tid];
                                const lastm = msgs[0];
                                const isCurrent = selectedThreadId === tid;

                                const partnerName = lastm.senderEmail === currentUserEmail ? "To: " + lastm.recipientEmail.split('@')[0] : lastm.senderName;

                                return (
                                  <button
                                    key={tid}
                                    onClick={() => setSelectedThreadId(tid)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col ${
                                      isCurrent 
                                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md'
                                        : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    <div className="flex justify-between items-center w-full mb-1">
                                      <span className="font-bold text-xs truncate max-w-[110px] block">{partnerName}</span>
                                      <span className={`text-[8px] font-semibold ${isCurrent ? 'text-emerald-100' : 'text-slate-400'}`}>
                                        {lastm.timestamp.split(',')[0]}
                                      </span>
                                    </div>
                                    <span className={`text-[9px] font-medium uppercase font-mono tracking-tighter ${isCurrent ? 'text-emerald-100' : 'text-slate-400'} truncate block w-full mb-1`}>
                                      {lastm.adTitle}
                                    </span>
                                    <p className={`text-xs truncate block w-full ${isCurrent ? 'text-emerald-50' : 'text-slate-500 font-medium'}`}>
                                      {lastm.content}
                                    </p>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Chat Pane */}
                          <div className="md:col-span-7 flex flex-col justify-between bg-white rounded-2xl border border-slate-100 min-h-[300px] overflow-hidden">
                            {!selectedThreadId ? (
                              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <MessageSquare className="w-10 h-10 text-slate-200 stroke-1 mb-2" />
                                <p className="text-xs text-slate-400 font-semibold">Select a conversation thread to start communicating</p>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col justify-between h-full">
                                {/* Thread Info Header */}
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                  <p className="text-xs font-black text-slate-700 uppercase tracking-tight truncate max-w-[180px]">
                                    Topic: {threadsMap[selectedThreadId][0].adTitle}
                                  </p>
                                  <span className="text-[9px] font-bold text-slate-400">Secure AES Pipe</span>
                                </div>

                                {/* Message bubble list scroll */}
                                <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[220px]">
                                  {chatPaneMessages.map(msg => {
                                    const isSender = msg.senderEmail?.trim().toLowerCase() === currentUserEmail;
                                    
                                    return (
                                      <div key={msg.id} className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs font-medium ${
                                          isSender 
                                            ? 'bg-emerald-600 text-white rounded-tr-none' 
                                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                                        }`}>
                                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[8px] text-slate-400 font-semibold uppercase font-mono tracking-tighter shrink-0">{msg.senderName} • {msg.timestamp}</span>
                                          
                                          {!isSender && (
                                            msg.reported ? (
                                              <span className="text-[8px] bg-red-100 text-red-700 font-black uppercase px-1.5 rounded">REPORTED</span>
                                            ) : (
                                              <button 
                                                onClick={() => setReportingMessage(msg)}
                                                className="text-[8px] text-red-500 hover:text-red-700 font-bold uppercase transition flex items-center gap-0.5"
                                                title="Flag this system participant"
                                              >
                                                <AlertTriangle className="w-2.5 h-2.5 shrink-0" /> Report Bad Actor
                                              </button>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* Reply Input Container */}
                                <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Type a communication reply..." 
                                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs outline-none focus:border-emerald-400"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") handleSendReply();
                                    }}
                                  />
                                  <button 
                                    onClick={handleSendReply}
                                    disabled={!replyText.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 md:px-3 rounded-xl text-xs font-black transition shadow-sm inline-flex items-center gap-1 shrink-0 disabled:opacity-50"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Send</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* About Profile Section */}
                {profile.aboutThem && (profile.isAboutMePublic || isOwnProfile) && (
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

                {/* Business Information, SARS TAX, CIPC Numbers */}
                {profile.isBusinessInfoPublic && (profile.aboutBusiness || profile.cipcNumber || profile.sarsNumber) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-600" /> Professional entity profile
                    </h3>
                    
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 relative shadow-sm space-y-4">
                      {profile.aboutBusiness && (
                        <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
                          {profile.aboutBusiness}
                        </p>
                      )}

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

                {/* Services metadata */}
                {profile.servicesOffered && (profile.isServicesPublic || isOwnProfile) && (
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

      {/* Dynamic Report Bad Actor modal popup */}
      {reportingMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setReportingMessage(null)} />
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl relative max-w-md w-full shrink-0 z-10 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
               <AlertTriangle className="w-8 h-8 font-black" />
               <div>
                  <h3 className="font-bold text-lg text-slate-900">Report Bad Actor</h3>
                  <p className="text-xs text-slate-500">File a flag directly with the Security Administrator</p>
               </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">Offending Message:</span>
              <p className="text-xs text-slate-600 font-mono italic leading-relaxed">&ldquo;{reportingMessage.content}&rdquo;</p>
              <div className="text-[9px] font-bold text-slate-400 mt-2">
                Accused Actor: {reportingMessage.senderEmail}
              </div>
            </div>

            <form onSubmit={handleReportBadActor} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reason for Report</label>
                <textarea 
                  rows={3} 
                  required
                  placeholder="e.g. Offensive language, harassment, scam attempt, spam advertising..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-red-500 resize-none"
                  value={reportReasonText}
                  onChange={(e) => setReportReasonText(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  type="button" 
                  onClick={() => setReportingMessage(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs transition"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating alert/success toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl z-[250] flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
