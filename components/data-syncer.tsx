"use client";
import { useEffect } from 'react';
import { getStoredAds, safeLocalStorage } from '@/lib/data';

export function DataSyncer() {
  useEffect(() => {
    // 1. Retrieve fully resolved local ads including legacy keys
    const localAds = getStoredAds();

    // Basic sync loop running on app boot
    const runAdsSync = () => {
      fetch('/api/storage', { cache: 'no-store' })
        .then(r => {
          if (!r.ok) {
            throw new Error(`Storage GET response not OK: ${r.status}`);
          }
          return r.json();
        })
        .then(data => {
          if (data && data.ads) {
            const serverAds = data.ads;
            
            // Identify any local ads not present on the server
            const serverIds = new Set(serverAds.map((a: any) => a.id));
            const clientOnlyAds = localAds.filter((a: any) => !serverIds.has(a.id));
            
            // Merge local and server-side ads
            const finalAds = [...serverAds, ...clientOnlyAds];
            
            safeLocalStorage.setItem("bizsearch24_all_ads", JSON.stringify(finalAds));
            window.dispatchEvent(new CustomEvent("bizsearch24_ads_updated"));

            // If the client has ads that the server does not have, upload them to the server
            if (clientOnlyAds.length > 0) {
              fetch('/api/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ads: finalAds })
              })
              .then(res => {
                if (!res.ok) throw new Error(`Storage POST response not OK: ${res.status}`);
                return res.json();
              })
              .then(syncRes => {
                console.log("Database successfully populated with local ads", syncRes);
              })
              .catch(err => {
                console.warn("Failed to sync client-only ads to database:", err.message || err);
              });
            }
          }
          if (data && data.customPartners) {
            safeLocalStorage.setItem("bizsearch24_custom_partners", JSON.stringify(data.customPartners));
          }
          if (data && data.deletedPartners) {
            safeLocalStorage.setItem("bizsearch24_deleted_partners", JSON.stringify(data.deletedPartners));
          }
        })
        .catch(err => {
          const msg = err?.message || String(err);
          if (msg.includes("Failed to fetch") || msg.includes("fetch failed") || msg.includes("Load failed")) {
            // Silence normal transient network bootup issues
            return;
          }
          console.warn("Ads sync notice:", msg);
        });
    };

    runAdsSync();

    // 2. High frequency message synchronizer (every 5 seconds)
    const syncMessages = () => {
      const storedStr = safeLocalStorage.getItem("bizsearch24_messages_v1");
      let localMsgs: any[] = [];
      if (storedStr) {
        try {
          localMsgs = JSON.parse(storedStr);
          if (!Array.isArray(localMsgs)) localMsgs = [];
        } catch (e) {}
      }

      const deletedStr = safeLocalStorage.getItem("bizsearch24_deleted_messages_v1");
      let localDeleted: string[] = [];
      if (deletedStr) {
        try {
          localDeleted = JSON.parse(deletedStr);
          if (!Array.isArray(localDeleted)) localDeleted = [];
        } catch (e) {}
      }

      fetch('/api/storage', { cache: 'no-store' })
        .then(r => {
          if (!r.ok) {
            throw new Error(`Storage GET response not OK: ${r.status}`);
          }
          return r.json();
        })
        .then(data => {
          if (!data) return;
          const serverMsgs = Array.isArray(data.messages) ? data.messages : [];
          const serverDeleted = Array.isArray(data.deletedMessages) ? data.deletedMessages : [];
          
          // Merge deleted arrays from local and server
          const mergedDeletedSet = new Set([...localDeleted, ...serverDeleted]);
          const finalDeletedList = Array.from(mergedDeletedSet);

          // Clean up both lists from deleted message IDs
          const filteredServerMsgs = serverMsgs.filter((m: any) => m && m.id && !mergedDeletedSet.has(m.id));
          const filteredLocalMsgs = localMsgs.filter((m: any) => m && m.id && !mergedDeletedSet.has(m.id));

          // Bidirectional merge based on message ID
          const mergedMap = new Map<string, any>();
          
          // Load filtered server messages first
          filteredServerMsgs.forEach((m: any) => {
            if (m && m.id) mergedMap.set(m.id, m);
          });
          
          // Merge filtered local messages, checking for newer updates or modified read status
          let changesDetected = false;
          filteredLocalMsgs.forEach((m: any) => {
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

          // Check if server is missing any messages or has incorrect count
          const hasNewDeleted = finalDeletedList.length !== serverDeleted.length;
          const hasMismatchedCount = filteredServerMsgs.length !== mergedMap.size;
          
          if (hasNewDeleted || hasMismatchedCount) {
            changesDetected = true;
          }

          const finalMsgsList = Array.from(mergedMap.values());
          
          // Save back to localStorage
          safeLocalStorage.setItem("bizsearch24_messages_v1", JSON.stringify(finalMsgsList));
          safeLocalStorage.setItem("bizsearch24_deleted_messages_v1", JSON.stringify(finalDeletedList));
          
          // Always dispatch custom events so unread badges update instantly across pages
          window.dispatchEvent(new CustomEvent("bizsearch24_messages_updated"));
          
          // Sync changes back up to server
          if (changesDetected) {
            fetch('/api/storage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                messages: finalMsgsList,
                deletedMessages: finalDeletedList 
              })
            })
            .then(res => {
              if (!res.ok) throw new Error(`Storage POST response not OK: ${res.status}`);
              return res.json();
            })
            .catch(err => console.warn("Failed to upload synced messages to server:", err.message || err));
          }
        })
        .catch(err => {
          const msg = err?.message || String(err);
          if (msg.includes("Failed to fetch") || msg.includes("fetch failed") || msg.includes("Load failed")) {
            // Silence normal transient network bootup issues
            return;
          }
          console.warn("Failed to sync messages with server:", msg);
        });
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

