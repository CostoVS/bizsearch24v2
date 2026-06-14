import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { LayoutWrapper } from '@/components/layout-wrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'BizSearch24 | Verified Local Businesses in South Africa',
  description: 'Easily search for verified local services, shops, and professionals near you in South Africa. Covering all provinces and major towns.',
  keywords: 'business directory, south africa, local services, plumbers, electricians, professionals, BizSearch24, verified businesses',
  metadataBase: new URL(process.env.APP_URL || 'https://bizsearch24.co.za'),
  openGraph: {
    title: 'BizSearch24 | Verified Local Businesses in South Africa',
    description: 'Find Verified Local Businesses in South Africa',
    siteName: 'BizSearch24',
    type: 'website',
    locale: 'en_ZA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" translate="no" className={`${inter.variable} ${spaceGrotesk.variable} overflow-x-hidden w-full max-w-[100vw]`}>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden w-full max-w-full" suppressHydrationWarning>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
        <div id="google_translate_element"></div>
        <Script src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="lazyOnload" />
        <Script id="google-translate-config" strategy="lazyOnload">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({pageLanguage: 'en', includedLanguages: 'en,af,zu,xh,st,nso,tn,ts,ve,nr,ss', layout: google.translate.TranslateElement.InlineLayout.SIMPLE, autoDisplay: false}, 'google_translate_element');
            }
          `}
        </Script>
      </body>
    </html>
  );
}
