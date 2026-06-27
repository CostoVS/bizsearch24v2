'use client';

import React from 'react';
import { HelpCircle, ChevronRight } from 'lucide-react';

export default function QA() {
  const faqs = [
    {
      q: 'How does the LLaMA3 active search index work?',
      a: 'The BizSearch24 active AI index is powered by our custom local LLaMA3-tuned language model backend. It maps search intent to our verified list of sponsored and premium members, providing instant, conversational business summaries, emails, and phone matches.'
    },
    {
      q: 'Can general verified members be recommended by the AI Assistant?',
      a: 'No. In alignment with listing standards, the AI search index is strictly cleared to process and present detail regarding Gold, Platinum, and Elite Premium and Sponsored members only.'
    },
    {
      q: 'How do I cancel or modify my premium subscription?',
      a: 'All subscription changes, debit card updates, and cancellations are handled securely. Please contact support or utilize our dedicated billing tools.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-8 h-8 text-emerald-600" />
          <span>Frequently Asked Q&amp;A</span>
        </h1>
        <p className="text-slate-500 font-sans mt-2">
          Everything you need to know about the BizSearch24 index, AI integration, and membership tiers.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-start gap-2 font-sans">
              <ChevronRight className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>{faq.q}</span>
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-sans pl-7">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
