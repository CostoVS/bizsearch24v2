"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Cpu, 
  CheckCircle, 
  MessageSquare, 
  AlertTriangle,
  ArrowRight,
  Info
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  { text: "Are there any Pretoria Plumbers registered?", label: "Search Plumbers" },
  { text: "What is the price of a Premium Listing plan?", label: "Pricing & Plans" },
  { text: "How does the business verification badge work?", label: "Verification Checks" },
  { text: "Who is Cape Town Digital Agency?", label: "Cape Town Agency" }
];

export default function LlamaChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
      sender: "bot",
      text: "Goeie dag! Dumelang! Hello! I am the local LLaMA3-8B Core NLP engine, compiled and running directly on our secure VPS node in Johannesburg, South Africa. \n\nI am connected to the real-time BizSearch24 database. I can help you search for registered tradesmen, find business contact numbers, or learn how to claim and verify your own directory listing.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setErrorMsg(null);
    const userMessage: Message = {
      id: `user-${messages.length}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/llama3/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(1) // Omit the initial bot welcome to save prompt space, but keep conversation thread
        })
      });

      if (!response.ok) {
        throw new Error("Local VPS NLP endpoint returned an error response.");
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: `bot-${messages.length + 1}`,
        sender: "bot",
        text: data.text || "I was unable to retrieve a response from the NLP system.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (e: any) {
      console.error("LLaMA3 Chat Frontend Error:", e);
      setErrorMsg("Failed to communicate with the local VPS LLaMA3 engine. Please check your internet connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    handleSendMessage(suggestionText);
  };

  return (
    <div className="flex-grow bg-slate-50 min-h-[calc(100vh-80px)] flex flex-col" id="llama3-chat-container">
      {/* Upper Status Header */}
      <div className="bg-emerald-950 text-white py-8 border-b border-emerald-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="inline-flex items-center bg-emerald-900/60 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-700/50 mb-3">
                <Cpu className="w-3.5 h-3.5 mr-1.5 animate-pulse text-emerald-400" />
                LOCAL VPS ENVIRONMENT • JOHANNESBURG
              </div>
              <h1 className="font-display font-black text-3xl tracking-tight text-white sm:text-4xl">
                LLaMA3 <span className="text-emerald-400">AI Assistant</span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-xl">
                A secure, local Large Language Model integrated with our live business database to answer all directory inquiries.
              </p>
            </div>

            <div className="flex flex-row sm:flex-col gap-2 bg-emerald-900/30 p-3.5 rounded-2xl border border-emerald-800/50 text-xs font-mono text-emerald-300 self-stretch sm:self-auto justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Model: LLaMA3-8B-SA</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live DB Synchronized</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 flex flex-col justify-between">
        {/* Messages Panel */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex-grow flex flex-col min-h-[400px] max-h-[550px] overflow-hidden mb-6">
          {/* Inner Header info */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between text-slate-500 text-xs">
            <span className="font-mono flex items-center gap-1.5 text-slate-600">
              <Info className="w-3.5 h-3.5 text-emerald-600" /> Grounded in Real Listings
            </span>
            <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-bold">100% Secure</span>
          </div>

          {/* Messages Scroller */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === "user" 
                        ? "bg-slate-100 border border-slate-200 text-slate-700" 
                        : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                    }`}>
                      {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-tr-none shadow-sm"
                        : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50"
                    }`}>
                      {msg.text}
                      <span className={`block text-[10px] mt-2 text-right ${
                        msg.sender === "user" ? "text-emerald-100" : "text-slate-400 font-mono"
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-100 border border-slate-200/50 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <span className="text-xs">{errorMsg}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(input);
            }}
            className="border-t border-slate-100 p-4 bg-slate-50 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me something about SA businesses or listing features..."
              className="flex-grow bg-white border border-slate-200 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl disabled:bg-slate-200 disabled:text-slate-400 transition-colors shadow-sm cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Suggestion Prompts Section */}
        <div>
          <h2 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Recommended Prompts
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSuggestionClick(sug.text)}
                className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-left p-3.5 rounded-2xl flex items-center justify-between transition-all group cursor-pointer shadow-sm text-sm text-slate-700"
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-emerald-600 font-bold mb-1 uppercase tracking-wider">
                    {sug.label}
                  </span>
                  <span className="font-medium text-slate-800 line-clamp-1">{sug.text}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
