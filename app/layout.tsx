import React from 'react';
import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import LayoutWrapper from '@/components/layout-wrapper';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'BizSearch24 | Verified Local Businesses in South Africa',
  description: 'Easily search for verified local services, shops, and professionals near you in South Africa. Covering all provinces and major towns with premium, vetted business directory listings.',
  keywords: 'business directory, south africa, local services, plumbers, electricians, professionals, BizSearch24, verified businesses, pretoria plumbers, cape town designers, durban markets, johannesburg contractors, local business finders, co.za domains',
  metadataBase: new URL(process.env.APP_URL || 'https://bizsearch24.co.za'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'BizSearch24 | Verified Local Businesses in South Africa',
    description: 'Easily search for verified local services, shops, and professionals near you in South Africa.',
    siteName: 'BizSearch24',
    type: 'website',
    locale: 'en_ZA',
    images: [
      {
        url: '/icon.svg',
        width: 1200,
        height: 630,
        alt: 'BizSearch24 Directory South Africa',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BizSearch24 | Verified Local Businesses in South Africa',
    description: 'Find vetted, certified, and professional services near you in South Africa.',
    images: ['/icon.svg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'geo.region': 'ZA',
    'geo.placename': 'South Africa',
    'geo.position': '-30.559482;22.937506',
    'ICBM': '-30.559482, 22.937506',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'BizSearch24',
    'url': 'https://bizsearch24.co.za',
    'description': 'Verified Local Business Directory in South Africa',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://bizsearch24.co.za/directory?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'BizSearch24',
    'url': 'https://bizsearch24.co.za',
    'logo': 'https://bizsearch24.co.za/icon.svg',
    'description': 'Verified Local Business Directory for South African Services and Professionals.',
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'ZA'
    }
  };

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} overflow-x-hidden w-full max-w-[100vw] scroll-smooth`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col overflow-x-hidden w-full max-w-full" suppressHydrationWarning>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
