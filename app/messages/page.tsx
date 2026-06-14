"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Mail, ArrowLeft, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  read?: boolean;
}

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/");
    } else if (user) {
      const stored = localStorage.getItem("bizsearch24_messages_v1");
      let allMsgs: Message[] = [];
      if (stored) {
        try { allMsgs = JSON.parse(stored); } catch(e) {}
      }
      if (user.role === "ADMIN") {
        setMessages(allMsgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      } else {
        const myMsgs = allMsgs.filter(m => m.recipientEmail.toLowerCase() === user.email.toLowerCase() || m.senderEmail.toLowerCase() === user.email.toLowerCase());
        setMessages(myMsgs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      }
    }
  }, [user, isLoading, router]);

  const handleDelete = (id: string, adTitle?: string) => {
    if (confirm(`Permanently delete this secure message?`)) {
      const stored = localStorage.getItem("bizsearch24_messages_v1");
      if (stored) {
        let allMsgs: Message[] = JSON.parse(stored);
        allMsgs = allMsgs.filter(m => m.id !== id);
        localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(allMsgs));
        setMessages(prev => prev.filter(m => m.id !== id));
      }
    }
  };

  const handleMarkRead = (id: string) => {
    const stored = localStorage.getItem("bizsearch24_messages_v1");
    if (stored) {
      let allMsgs: Message[] = JSON.parse(stored);
      allMsgs = allMsgs.map(m => m.id === id ? { ...m, read: true } : m);
      localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(allMsgs));
      setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m));
    }
  };

  if (isLoading || !user) return <div className="p-20 text-center text-slate-500 text-sm">Authenticating Secure Session...</div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-slate-200 gap-4">
        <div className="flex items-center">
          <Link href="/dashboard" className="mr-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="bg-indigo-600 p-3 rounded-xl mr-4 shadow-sm shrink-0">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display tracking-tight">Direct Chat</h1>
            <p className="text-slate-500 text-sm mt-1">Direct Private Communications with Verified Businesses & Customers</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-16 bg-slate-50 border border-slate-100 rounded-2xl">
            <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Messages Found</h3>
            <p className="text-slate-500 text-sm mt-2">Your inbox is currently empty.</p>
          </div>
        ) : (
          messages.map(msg => {
            const isReceived = msg.recipientEmail.toLowerCase() === user.email.toLowerCase() || user.role === "ADMIN";
            return (
              <div key={msg.id} className={`p-6 rounded-2xl border transition-all ${!msg.read && isReceived ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black uppercase text-indigo-600 tracking-wider">
                        {user.role === "ADMIN" ? (
                          `Admin View: ${msg.senderName} ➝ ${msg.recipientEmail}`
                        ) : isReceived && msg.senderEmail.toLowerCase() !== user.email.toLowerCase() ? `From: ${msg.senderName}` : `Sent To: ${msg.recipientEmail}`}
                      </span>
                      {user.role === "ADMIN" && <ShieldAlert className="w-4 h-4 text-rose-500" />}
                    </div>
                    {msg.adTitle && (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                        Re: {msg.adTitle}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">{new Date(msg.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-slate-700 text-sm whitespace-pre-line mb-4">
                  {msg.content}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  {isReceived && !msg.read && msg.senderEmail.toLowerCase() !== user.email.toLowerCase() && (
                    <button 
                      onClick={() => handleMarkRead(msg.id)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                    >
                      Mark as Read
                    </button>
                  )}
                  {msg.senderEmail.toLowerCase() !== user.email.toLowerCase() && isReceived && user.role !== "ADMIN" && (
                    <button
                      onClick={() => {
                        const reply = window.prompt(`Reply to ${msg.senderName}:`);
                        if (reply && reply.trim()) {
                            // reply logic
                            const newMsg = {
                              id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                              threadId: msg.threadId,
                              adId: msg.adId,
                              adTitle: msg.adTitle,
                              senderEmail: user.email.toLowerCase(),
                              senderName: user.email.split('@')[0], 
                              recipientEmail: msg.senderEmail.toLowerCase(),
                              content: reply.trim(),
                              timestamp: new Date().toLocaleString(),
                              read: false
                            };
                            
                            const storedStr = localStorage.getItem("bizsearch24_messages_v1");
                            let existing: Message[] = [];
                            if (storedStr) {
                              try { existing = JSON.parse(storedStr); } catch (e) {}
                            }
                            existing.push(newMsg);
                            localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(existing));
                            console.log("Reply sent securely!");
                            window.location.reload();
                        }
                      }}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
                    >
                      Reply
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(msg.id, msg.adTitle)}
                    className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
