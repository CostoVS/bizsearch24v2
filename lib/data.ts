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

// Unified global advertisements client register with localStorage persistence
export function getStoredAds(): any[] {
  if (typeof window === "undefined") {
    return MOCK_ADS;
  }
  
  let merged = [...MOCK_ADS];
  const stored = safeLocalStorage.getItem("bizsearch24_all_ads");
  if (stored) {
    try {
      let parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        parsed.forEach((ad: any) => {
          if (!merged.some(item => item.id === ad.id)) {
            merged.push(ad);
          }
        });
      }
    } catch (e) {
      console.error("Error parsing bizsearch24_all_ads:", e);
    }
  }

  // legacy check
  try {
    const legacyCustomStr = safeLocalStorage.getItem("bizsearch24_custom_ads");
    if (legacyCustomStr) {
      const custom = JSON.parse(legacyCustomStr);
      if (Array.isArray(custom)) {
        custom.forEach((ad: any) => {
          if (!merged.some(item => item.id === ad.id)) {
            merged.push(ad);
          }
        });
      }
    }
  } catch (e) {}

  const deletedIds = getDeletedAdIds();
  const deletedSet = new Set(deletedIds);

  merged = merged.filter(a => a && a.id && !deletedSet.has(a.id) && !['ad1', 'ad2', 'ad3', 'ad4', 'custom-ad-1', 'custom-ad-2'].includes(a.id));
  safeLocalStorage.setItem("bizsearch24_all_ads", JSON.stringify(merged));
  return merged;
}

export function saveStoredAds(ads: any[]): void {
  if (typeof window !== "undefined") {
    const deletedIds = getDeletedAdIds();
    const deletedSet = new Set(deletedIds);
    const filteredAds = ads.filter(ad => ad && ad.id && !deletedSet.has(ad.id));

    safeLocalStorage.setItem("bizsearch24_all_ads", JSON.stringify(filteredAds));
    
    // Also sync the custom ads key for any legacy code
    const customOnly = filteredAds.filter(ad => ad.id.startsWith("custom_") || !ad.id.startsWith("ad"));
    safeLocalStorage.setItem("bizsearch24_custom_ads", JSON.stringify(customOnly));

    // Dispatch custom event to notify all components on the same page
    window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));

    // Sync back up to the pseudo cloud (to apply across users)
    fetch('/api/storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ads: filteredAds,
        deletedAds: deletedIds
      })
    }).catch(console.error);
  }
}

export function deleteAd(id: string): void {
  if (typeof window === "undefined") return;
  const current = getStoredAds();
  const updated = current.filter(ad => ad.id !== id);
  
  const deletedIds = getDeletedAdIds();
  if (!deletedIds.includes(id)) {
    deletedIds.push(id);
    safeLocalStorage.setItem("bizsearch24_deleted_ads", JSON.stringify(deletedIds));
  }

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

