import { SA_PROVINCES } from './locations';
import { CATEGORIES as ALL_CATS } from './categories';

export const PROVINCES = SA_PROVINCES;
export const CATEGORIES = ALL_CATS;

export const MOCK_USERS = [
  {
    id: 'u1',
    email: 'nicholauscostochetty@gmail.com',
    role: 'ADMIN',
    plan: 'PREMIUM',
    joined: '2026-01-01',
    lastLoginIP: '102.132.89.44',
    device: 'MacBook Pro / Chrome',
    location: 'Durban, KZN'
  },
  {
    id: 'u2',
    email: 'john.smith@example.co.za',
    role: 'USER',
    plan: 'FREE',
    joined: '2026-05-12',
    lastLoginIP: '41.13.120.11',
    device: 'iPhone 14 / Safari',
    location: 'Umkomaas, KZN'
  },
  {
    id: 'u3',
    email: 'sarah.jones@example.co.za',
    role: 'USER',
    plan: 'PREMIUM',
    joined: '2026-06-01',
    lastLoginIP: '197.80.12.99',
    device: 'Windows 11 / Edge',
    location: 'Sandton, Gauteng'
  }
];

export const MOCK_ADS = [
  {
    id: 'ad1',
    userId: 'u2',
    title: 'Professional Plumbing Services Umkomaas',
    category: 'Plumbers',
    location: 'umkomaas',
    description: '24/7 plumbing services in Umkomaas area. Quality guaranteed.',
    verified: false,
    isPremium: false,
    isSponsor: false,
    image: null
  },
  {
    id: 'ad2',
    userId: 'u3',
    title: "Sarah's Digital Marketing Agency",
    category: 'Digital Marketing',
    location: 'sandton',
    description: 'Grow your business with specialized digital marketing. Over 10 years experience.',
    verified: true,
    isPremium: true,
    isSponsor: true,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ad3',
    userId: 'u1',
    title: "Eco Auto Solutions - Car Wash & Valet",
    category: 'Cleaning Services',
    location: 'durban',
    description: 'Mobile eco-friendly car wash. We come to you anywhere in Durban.',
    verified: true,
    isPremium: true,
    isSponsor: false,
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ad4',
    userId: 'u3',
    title: "Sandton Legal Consultants",
    category: 'Attorneys & Lawyers',
    location: 'sandton',
    description: 'Expert corporate legal advice and consultation.',
    verified: true,
    isPremium: true,
    isSponsor: false,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60'
  }
];

export interface Banner {
  id: string;
  name: string;
  placement: 'Top Sticky' | 'Interstitial' | 'Float';
  status: 'LIVE' | 'INACTIVE';
  reach: number;
  image?: string | null;
  text?: string;
  link?: string;
  visibility?: string;
}

export const INITIAL_BANNERS: Banner[] = [
  { id: 'b1', name: 'June Promo Banner', placement: 'Top Sticky', status: 'LIVE', reach: 4200, text: '🔥 PROMOTE YOUR BUSINESS TODAY! Get 50% off Premium Listings this June.', link: '/premium', visibility: 'All Pages' },
  { id: 'b2', name: 'Legal Disclaimer Float', placement: 'Float', status: 'INACTIVE', reach: 0 }
];

export function getStoredBanners(): Banner[] {
  if (typeof window === "undefined") {
    return INITIAL_BANNERS;
  }
  
  const stored = localStorage.getItem("bizsearch24_all_banners");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch(e) {}
  }
  
  localStorage.setItem("bizsearch24_all_banners", JSON.stringify(INITIAL_BANNERS));
  return INITIAL_BANNERS;
}

export function saveStoredBanners(banners: Banner[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("bizsearch24_all_banners", JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent("bizsearch24_banner_updated"));
  }
}

// Unified global advertisements client register with localStorage persistence
export function getStoredAds(): any[] {
  if (typeof window === "undefined") {
    return MOCK_ADS;
  }
  
  const stored = localStorage.getItem("bizsearch24_all_ads");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing bizsearch24_all_ads:", e);
    }
  }

  // First time initialization: check if we have legacy custom ads and merge them
  let custom: any[] = [];
  try {
    const legacyCustomStr = localStorage.getItem("bizsearch24_custom_ads");
    if (legacyCustomStr) {
      custom = JSON.parse(legacyCustomStr);
    }
  } catch (e) {}

  const merged = [...MOCK_ADS];
  if (Array.isArray(custom)) {
    custom.forEach((ad: any) => {
      if (!merged.some(item => item.id === ad.id)) {
        merged.push(ad);
      }
    });
  }

  localStorage.setItem("bizsearch24_all_ads", JSON.stringify(merged));
  return merged;
}

export function saveStoredAds(ads: any[]): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("bizsearch24_all_ads", JSON.stringify(ads));
    
    // Also sync the custom ads key for any legacy code
    const customOnly = ads.filter(ad => ad.id.startsWith("custom_") || !ad.id.startsWith("ad"));
    localStorage.setItem("bizsearch24_custom_ads", JSON.stringify(customOnly));

    // Dispatch custom event to notify all components on the same page
    window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));
  }
}

