"use client";
import { useEffect } from 'react';
import { getStoredAds } from '@/lib/data';

export function DataSyncer() {
  useEffect(() => {
    // Retrieve fully resolved local ads including legacy keys
    const localAds = getStoredAds();

    // Basic sync loop running on app boot
    fetch('/api/storage')
      .then(r => r.json())
      .then(data => {
        if (data && data.ads) {
          const serverAds = data.ads;
          
          // Identify any local ads not present on the server
          const serverIds = new Set(serverAds.map((a: any) => a.id));
          const clientOnlyAds = localAds.filter((a: any) => !serverIds.has(a.id));
          
          // Merge local and server-side ads
          const finalAds = [...serverAds, ...clientOnlyAds];
          
          localStorage.setItem("bizsearch24_all_ads", JSON.stringify(finalAds));
          window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));

          // If the client has ads that the server does not have, upload them to the server
          if (clientOnlyAds.length > 0) {
            fetch('/api/storage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ads: finalAds })
            })
            .then(res => res.json())
            .then(syncRes => {
              console.log("Database successfully populated with local ads", syncRes);
            })
            .catch(err => {
              console.error("Failed to sync client-only ads to database:", err);
            });
          }
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

