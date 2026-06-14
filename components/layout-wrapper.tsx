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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanStyles = () => {
      // Force Google Translate shifting to be disabled
      if (document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.setProperty('top', '0px', 'important');
      }
      if (document.body.style.position && document.body.style.position !== 'static') {
        document.body.style.setProperty('position', 'static', 'important');
      }
      if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
        document.documentElement.style.setProperty('top', '0px', 'important');
      }

      // Hide active translation widgets if they bypass the CSS
      const widgets = document.querySelectorAll(
        '.skiptranslate, iframe[class*="goog"], iframe[id*="goog"], iframe[class*="VIpgJd"], div[class*="VIpgJd"]'
      );
      widgets.forEach((widget) => {
        const hEl = widget as HTMLElement;
        if (hEl.style.display !== 'none') {
          hEl.style.setProperty('display', 'none', 'important');
        }
      });
    };

    // Run clean sweep initially and on interval for extra safety
    cleanStyles();
    const interval = setInterval(cleanStyles, 300);

    const observer = new MutationObserver(() => {
      cleanStyles();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'class'],
      childList: true,
      subtree: true,
    });

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

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
      <GlobalAdBanner position="bottom" />
      <ConsentBanner onShowTerms={() => setLegalOpen(true)} />
      <LegalModal isOpen={legalOpen} onClose={() => setLegalOpen(false)} />
    </>
  );
}
