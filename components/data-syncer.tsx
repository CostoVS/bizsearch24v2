"use client";
import { useEffect } from 'react';

export function DataSyncer() {
  useEffect(() => {
    // Basic sync loop running on app boot
    fetch('/api/storage')
      .then(r => r.json())
      .then(data => {
        if (data && data.ads && data.ads.length > 0) {
          const stored = localStorage.getItem("bizsearch24_all_ads");
          const localAds = stored ? JSON.parse(stored) : [];
          
          // Merge local and server prioritizing server, but keeping pure local if offline
          const serverIds = data.ads.map((a: any) => a.id);
          const uniqueLocal = localAds.filter((a: any) => !serverIds.includes(a.id));
          const finalAds = [...data.ads, ...uniqueLocal];
          
          localStorage.setItem("bizsearch24_all_ads", JSON.stringify(finalAds));
          window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));
        }
        if (data.customPartners) {
          localStorage.setItem("bizsearch24_custom_partners", JSON.stringify(data.customPartners));
        }
        if (data.deletedPartners) {
          localStorage.setItem("bizsearch24_deleted_partners", JSON.stringify(data.deletedPartners));
        }

      })
      .catch(console.error);
  }, []);

  return null;
}
