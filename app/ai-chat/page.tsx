'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, User, ShieldAlert, Award, ArrowUpRight, HelpCircle } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your BizSearch24 AI Assistant, running our specialized LLaMA3-tuned local model. I can assist you with finding and verifying Premium & Sponsored services across South Africa. Please note that I am strictly authorized to provide detailed information about our premium and sponsored advertisers only, in compliance with our listing standards.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Are there any emergency plumbers in Pretoria?',
    'Can you recommend a web designer in Cape Town?',
    'Find a premium construction company in Johannesburg.',
    'What are the monthly service fees for premium listings?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: textToSend })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.text || 'I apologize, but I could not formulate a response at this time.',
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'System notification: Encountered a localized connection discrepancy with the LLaMA3 local gateway. Please ensure your configuration is active or try again shortly.',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="font-sans font-extrabold text-2xl sm:text-3xl text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-emerald-600 animate-pulse" />
            <span>AI LLaMA3 Assistant Portal</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-sans mt-1">
            Official localized directory knowledge base with integrated LLaMA3 intelligence.
          </p>
        </div>
        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 px-2.5 py-1 rounded-full uppercase font-bold tracking-wider">
          System: Active Local Node
        </span>
      </div>

      {/* Constraints Notification Bar */}
      <div className="bg-amber-50 border border-amber-200/60 rounded-xl p-4 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 space-y-1 leading-relaxed">
          <p className="font-semibold uppercase tracking-wide">Authorized Scope Restriction</p>
          <p>
            By design, this assistant responds strictly with knowledge regarding **Premium and Sponsored listings**. General or unverified standard listings are filtered out from the intelligent search response index.
          </p>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[550px] overflow-hidden">
        {/* Messages Stage */}
        <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.sender === 'user' 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-slate-800 text-emerald-400'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/10'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className={`block text-[9px] mt-2 font-mono ${
                  msg.sender === 'user' ? 'text-emerald-100/70 text-right' : 'text-slate-400'
                }`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="w-8 h-8 rounded-full bg-slate-800 text-emerald-400 flex items-center justify-center animate-spin">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm rounded-tl-none flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-100"></span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce delay-200"></span>
                <span className="text-xs text-slate-400 font-mono pl-1">LLaMA3 is thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts Grid */}
        <div className="bg-white border-t border-slate-100 p-4">
          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Suggested Inquiries</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-left bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-200 rounded-xl p-2.5 text-xs text-slate-600 hover:text-slate-900 transition-all font-sans flex items-center justify-between group disabled:opacity-50"
              >
                <span className="truncate mr-2">{q}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="bg-slate-50 border-t border-slate-200 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask me anything about Apex Plumbers, Cape Town Design, Joburg Contractors..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              className="flex-grow bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 text-slate-900"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="bg-slate-900 hover:bg-emerald-600 text-white p-3 rounded-xl transition-all shadow-sm flex items-center justify-center disabled:opacity-50 disabled:hover:bg-slate-900"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
