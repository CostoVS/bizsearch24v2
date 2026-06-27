'use client';

import React from 'react';
import { Newspaper, Calendar, ArrowRight, User } from 'lucide-react';

export default function News() {
  const articles = [
    {
      title: 'South African Small Business Grants & Funding in 2026',
      date: 'June 25, 2026',
      author: 'BizSearch24 Editorial',
      excerpt: 'Exploring active financial frameworks, government funding channels, and ESD grants tailored for South African SME trade services.'
    },
    {
      title: 'How co.za Domains Elevate Local Search Engine Optimization',
      date: 'May 14, 2026',
      author: 'SEO Technical Desk',
      excerpt: 'Local search engine algorithms favor local ccTLD domains. Secure your .co.za name to capture South African buyers.'
    }
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900">
          SME News &amp; Local Business Insights
        </h1>
        <p className="text-slate-500 font-sans mt-2">
          Weekly analysis, technology updates, and operational strategy for South African small business owners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {articles.map((art, idx) => (
          <article key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-4 text-xs font-mono text-slate-400">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{art.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{art.author}</span>
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight hover:text-emerald-600 transition-colors">
                {art.title}
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-sans">{art.excerpt}</p>
            </div>
            <button className="text-xs text-emerald-600 font-semibold uppercase tracking-wider hover:underline flex items-center space-x-1 pt-2">
              <span>Read Article</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
