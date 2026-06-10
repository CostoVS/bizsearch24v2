'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/nav';
import { Footer } from '@/components/footer';
import { GlobalAdBanner, ConsentBanner, LegalModal } from '@/components/ui-extras';
import { trackPageView } from '@/lib/analytics-utils';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [legalOpen, setLegalOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

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
