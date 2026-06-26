'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 font-sans min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-sm" id="global-error-card">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 border border-rose-100">
            🚨
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">A critical error occurred</h2>
          <p className="text-slate-500 mb-6 text-sm leading-relaxed">
            The application failed to load a critical layout component. Let&apos;s try reloading the interactive session components.
          </p>
          <button
            onClick={() => reset()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
            id="global-error-reset-btn"
          >
            Reset Application
          </button>
        </div>
      </body>
    </html>
  );
}
