'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/nav';
import { Footer } from '@/components/footer';
import { GlobalAdBanner, ConsentBanner, LegalModal } from '@/components/ui-extras';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [legalOpen, setLegalOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <GlobalAdBanner position="top" />
        <Navbar />
        <main className="flex-grow flex flex-col overflow-x-hidden w-full max-w-full">
          {children}
        </main>
        <Footer onShowLegal={() => setLegalOpen(true)} />
      </div>
      <ConsentBanner onShowTerms={() => setLegalOpen(true)} />
      <LegalModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
    </>
  );
}
