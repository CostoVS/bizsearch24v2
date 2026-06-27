'use client';

import React from 'react';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-sans font-extrabold tracking-tight text-slate-900">
          Terms &amp; Conditions
        </h1>
        <p className="text-slate-500 font-sans mt-2">
          Last revised: June 2026. Official directory listing policies.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-slate-600 text-sm leading-relaxed font-sans">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 font-sans">1. Scope of Service</h2>
          <p>
            BizSearch24 provides an online business directory mapping local South African trade services, construction professionals, digital design agencies, and hospitality outlets. All listed ads are subject to administrative background verification.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 font-sans">2. Premium Subscription Mandate</h2>
          <p>
            The Verified Base Premium Plan is priced at R199.00 per month, billed recurringly via South African debit card mandate. Extra ads are charged at R49.00/month each. co.za domain registrations are R99.00/year. All subscriptions carry a 30-day cancellation notification period.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-slate-900 font-sans">3. POPIA &amp; Data Security</h2>
          <p>
            In compliance with the Protection of Personal Information Act (POPIA), BizSearch24 only publishes authorized business telephone numbers, corporate email addresses, and verified websites. No sensitive personal information is cataloged or exposed.
          </p>
        </section>
      </div>
    </div>
  );
}
