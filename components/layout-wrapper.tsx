'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/nav';
import { Footer } from '@/components/footer';
import { GlobalAdBanner, ConsentBanner, LegalModal } from '@/components/ui-extras';
import { trackPageView } from '@/lib/analytics-utils';
import { DataSyncer } from '@/components/data-syncer';
import { ArrowUp } from 'lucide-react';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [legalOpen, setLegalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <DataSyncer />
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

      {/* Floating Back to Top Arrow Button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-[99] bg-[#052e22] hover:bg-emerald-700 text-white p-3.5 rounded-full shadow-lg hover:shadow-2xl transition-all hover:scale-110 active:scale-95 duration-200 border border-emerald-800/40 focus:outline-none flex items-center justify-center group cursor-pointer"
          aria-label="Scroll back to top"
          id="scroll-to-top-btn"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </button>
      )}
    </>
  );
}
