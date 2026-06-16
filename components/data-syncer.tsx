"use client";
import { useEffect } from 'react';
import { getStoredAds } from '@/lib/data';

export function DataSyncer() {
  useEffect(() => {
    // 1. Retrieve fully resolved local ads including legacy keys
    const localAds = getStoredAds();

    // Basic sync loop running on app boot
    const runAdsSync = () => {
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
    };

    runAdsSync();

    // 2. High frequency message synchronizer (every 5 seconds)
    const syncMessages = () => {
      const storedStr = localStorage.getItem("bizsearch24_messages_v1");
      let localMsgs: any[] = [];
      if (storedStr) {
        try {
          localMsgs = JSON.parse(storedStr);
          if (!Array.isArray(localMsgs)) localMsgs = [];
        } catch (e) {}
      }

      fetch('/api/storage')
        .then(r => r.json())
        .then(data => {
          if (!data) return;
          const serverMsgs = Array.isArray(data.messages) ? data.messages : [];
          
          // Bidirectional merge based on message ID
          const mergedMap = new Map<string, any>();
          
          // Load server messages first
          serverMsgs.forEach((m: any) => {
            if (m && m.id) mergedMap.set(m.id, m);
          });
          
          // Merge local messages, checking for newer updates or modified read status
          let changesDetected = false;
          localMsgs.forEach((m: any) => {
            if (!m || !m.id) return;
            const existing = mergedMap.get(m.id);
            if (!existing) {
              mergedMap.set(m.id, m);
              changesDetected = true;
            } else {
              // If read status is true on either client or server, mark as read
              const finalRead = existing.read || m.read || false;
              if (existing.read !== finalRead || m.read !== finalRead) {
                existing.read = finalRead;
                m.read = finalRead;
                changesDetected = true;
              }
            }
          });

          // Check if server is missing any messages that are in mergedMap
          if (serverMsgs.length !== mergedMap.size) {
            changesDetected = true;
          }

          const finalMsgsList = Array.from(mergedMap.values());
          
          // Save back to localStorage
          localStorage.setItem("bizsearch24_messages_v1", JSON.stringify(finalMsgsList));
          
          // Always dispatch custom events so unread badges update instantly across pages
          window.dispatchEvent(new CustomEvent("bizsearch24_messages_updated"));
          
          // Sync changes back up to server
          if (changesDetected) {
            fetch('/api/storage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ messages: finalMsgsList })
            })
            .catch(err => console.error("Failed to upload synced messages to server:", err));
          }
        })
        .catch(err => console.error("Failed to sync messages with server:", err));
    };

    // Run message sync immediately and then on interval
    syncMessages();
    const messageInterval = setInterval(syncMessages, 5000);

    return () => {
      clearInterval(messageInterval);
    };
  }, []);

  return null;
}

