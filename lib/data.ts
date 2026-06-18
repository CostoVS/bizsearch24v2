import { SA_PROVINCES } from './locations';
import { CATEGORIES as ALL_CATS } from './categories';

export const PROVINCES = SA_PROVINCES;
export const CATEGORIES = ALL_CATS;

// A robust, exception-safe localStorage wrapper that falls back to in-memory cache if localStorage is blocked or throws
const memoryStorage: Record<string, string> = {};

export const safeLocalStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn("Storage item fetch failed/blocked", e);
    }
    return memoryStorage[key] !== undefined ? memoryStorage[key] : null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn("Storage item save failed/blocked", e);
    }
    memoryStorage[key] = value;
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn("Storage item removal failed/blocked", e);
    }
    delete memoryStorage[key];
  },

  clear(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn("Storage clear failed/blocked", e);
    }
    for (const key in memoryStorage) {
      delete memoryStorage[key];
    }
  }
};

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

export const MOCK_ADS: any[] = [];

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

export const INITIAL_BANNERS: Banner[] = [];

export function getStoredBanners(): Banner[] {
  if (typeof window === "undefined") {
    return INITIAL_BANNERS;
  }
  
  const stored = safeLocalStorage.getItem("bizsearch24_all_banners");
  if (stored) {
    try {
      let parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed = parsed.filter(b => b.id !== 'b1' && b.id !== 'b2');
        safeLocalStorage.setItem("bizsearch24_all_banners", JSON.stringify(parsed));
        return parsed;
      }
    } catch(e) {}
  }
  
  safeLocalStorage.setItem("bizsearch24_all_banners", JSON.stringify(INITIAL_BANNERS));
  return INITIAL_BANNERS;
}

export function saveStoredBanners(banners: Banner[]): void {
  if (typeof window !== "undefined") {
    safeLocalStorage.setItem("bizsearch24_all_banners", JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent("bizsearch24_banner_updated"));
  }
}

export function getDeletedAdIds(): string[] {
  if (typeof window === "undefined") return [];
  const stored = safeLocalStorage.getItem("bizsearch24_deleted_ads");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
  }
  return [];
}

export const SEED_DATA_ADS = [
  {
    id: "ad-seed-1",
    userId: "u1",
    isActive: true,
    title: "Elite Pretoria Plumbers",
    category: "Plumbers",
    location: "pretoria",
    province: "gauteng",
    description: "24/7 Professional plumbing services in Pretoria. We handle everything from leaky taps to full industrial installations. Our team is fully certified and insured. Fast response times and competitive rates guaranteed.",
    tradingHours: "Mon-Sun: 24 Hours",
    servicesOffered: "Drain Cleaning, Pipe Burst Repairs, Geyser Installations, Leak Detection",
    preferredContact: "WhatsApp",
    showCallOption: true,
    verified: true,
    isPremium: true,
    isSponsor: false,
    isClaimed: true,
    image: "https://picsum.photos/seed/plumbing/800/600",
    address: "42 Jan Shoba St, Hatfield, Pretoria",
    phone: "+27 12 345 6789",
    whatsapp: "+27 82 123 4567",
    email: "contact@elitelumbing.co.za",
    createdAt: "2026-06-01T10:00:00.000Z"
  },
  {
    id: "ad-seed-2",
    userId: "u1",
    isActive: true,
    title: "Cape Town Digital Agency",
    category: "Web Design",
    location: "cape town",
    province: "western-cape",
    description: "Premium digital solutions for South African businesses. We specialize in Next.js development, SEO, and social media management. Grow your online presence with verified experts.",
    tradingHours: "Mon-Fri: 9am - 5pm",
    servicesOffered: "Web Development, SEO, Digital Marketing, Brand Design",
    preferredContact: "Email",
    showCallOption: true,
    verified: true,
    isPremium: false,
    isSponsor: true,
    isClaimed: true,
    image: "https://picsum.photos/seed/agency/800/600",
    address: "123 Bree St, Cape Town",
    phone: "+27 21 987 6543",
    whatsapp: "",
    email: "hello@ctdigital.co.za",
    createdAt: "2026-06-05T14:30:00.000Z"
  }
];

// Unified global advertisements client register with localStorage persistence
export function getStoredAds(): any[] {
  if (typeof window === "undefined") {
    return SEED_DATA_ADS;
  }
  
  const stored = safeLocalStorage.getItem("bizsearch24_all_ads");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(ad => ad && ad.id);
      }
    } catch (e) {
      console.error("Error parsing bizsearch24_all_ads:", e);
    }
  }
  return SEED_DATA_ADS;
}

export async function fetchAndStoreAds(): Promise<any[]> {
  if (typeof window === "undefined") return SEED_DATA_ADS;
  try {
    const res = await fetch('/api/storage', { cache: 'no-store' });
    if (!res.ok) return getStoredAds();
    const data = await res.json();
    if (data && Array.isArray(data.ads)) {
      const serverAds = data.ads.filter((a: any) => a && a.id);
      
      // Smart merge locally to not lose unsynced creations
      const localStored = safeLocalStorage.getItem("bizsearch24_all_ads");
      let finalAds = serverAds;
      let hasLocalOnly = false;

      if (localStored) {
        try {
          const localAds = JSON.parse(localStored);
          if (Array.isArray(localAds)) {
            const serverIds = new Set(serverAds.map((a: any) => a.id));
            const localOnly = localAds.filter((a: any) => a && a.id && !serverIds.has(a.id));
            if (localOnly.length > 0) {
              finalAds = [...localOnly, ...serverAds];
              hasLocalOnly = true;
            }
          }
        } catch(e) {}
      }

      // If local only items are found, push them to the server immediately
      if (hasLocalOnly) {
         fetch('/api/storage', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ads: finalAds })
         }).catch(() => null);
      }

      if (finalAds.length === 0) {
        finalAds = SEED_DATA_ADS; // Never allow zero ads if we fail to get data
      }

      safeLocalStorage.setItem("bizsearch24_all_ads", JSON.stringify(finalAds));
      
      if (data.customPartners) {
        safeLocalStorage.setItem("bizsearch24_custom_partners", JSON.stringify(data.customPartners));
      }

      window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));
      return finalAds;
    }
  } catch (e) {
    console.error("fetchAndStoreAds failed:", e);
  }
  return getStoredAds();
}

export function saveStoredAds(ads: any[]): void {
  if (typeof window !== "undefined") {
    const validAds = ads.filter(ad => ad && ad.id);

    safeLocalStorage.setItem("bizsearch24_all_ads", JSON.stringify(validAds));
    
    // Also sync the custom ads key for any legacy code
    const customOnly = validAds.filter(ad => ad.id.startsWith("custom_") || !ad.id.startsWith("ad"));
    safeLocalStorage.setItem("bizsearch24_custom_ads", JSON.stringify(customOnly));

    // Dispatch custom event to notify all components on the same page
    window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));

    // Sync back up to the server database (merged server-side now)
    fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ads: validAds
      })
    }).then(async (r) => {
      if (r.ok) {
        const res = await r.json();
        // If server returned a merged list, sync it back to local storage
        if (res.data && Array.isArray(res.data.ads)) {
          safeLocalStorage.setItem("bizsearch24_all_ads", JSON.stringify(res.data.ads));
          window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));
        }
      }
    }).catch(console.error);
  }
}

export function deleteAd(id: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredAds();
  const updated = current.filter(ad => ad.id !== id);
  saveStoredAds(updated);
}


export function sortAdsWithPositions(ads: any[]): any[] {
  const topAds = ads.filter(a => a.fixedPosition === 'top');
  const middleAds = ads.filter(a => a.fixedPosition === 'middle');
  const bottomAds = ads.filter(a => a.fixedPosition === 'bottom');
  const standardAds = ads.filter(a => !['top', 'middle', 'bottom'].includes(a.fixedPosition));

  const sortByPriority = (arr: any[]) => {
    return [...arr].sort((a, b) => {
      const score = (item: any) => {
        if (item.isSponsor) return 100;
        if (item.isSpotlight) return 80;
        if (item.isBannerPlacement) return 60;
        if (item.isVideoPromo) return 50;
        if (item.isPremium) return 40;
        return 0;
      };
      return score(b) - score(a);
    });
  };

  const sortedStandard = sortByPriority(standardAds);
  const sortedTop = sortByPriority(topAds);
  const sortedMiddle = sortByPriority(middleAds);
  const sortedBottom = sortByPriority(bottomAds);

  const halfStandardLen = Math.floor(sortedStandard.length / 2);
  const standardFirstHalf = sortedStandard.slice(0, halfStandardLen);
  const standardSecondHalf = sortedStandard.slice(halfStandardLen);

  return [
    ...sortedTop,
    ...standardFirstHalf,
    ...sortedMiddle,
    ...standardSecondHalf,
    ...sortedBottom
  ];
}

