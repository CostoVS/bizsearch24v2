"use client";
import { useEffect } from 'react';
import { getStoredAds, safeLocalStorage, fetchAndStoreAds } from '@/lib/data';

export function DataSyncer() {
  useEffect(() => {
    // Basic sync loop running on app boot
    const runAdsSync = async () => {
      await fetchAndStoreAds();
    };

    runAdsSync();
    const adsInterval = setInterval(runAdsSync, 10000);

    // Community Posts synchronizer
    const syncCommunityPosts = () => {
      const storedStr = safeLocalStorage.getItem("bizsearch24_community_posts_v1");
      let localPosts: any[] = [];
      if (storedStr) { try { localPosts = JSON.parse(storedStr); } catch (e) {} }

      fetch('/api/storage', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const serverPosts = Array.isArray(data.community_posts) ? data.community_posts : [];
          
          // Smart merge: prevent local-only posts from being lost, and handle server deletions/updates
          const serverIds = new Set(serverPosts.map((p: any) => p.id));
          const localOnly = localPosts.filter((p: any) => p && p.id && !serverIds.has(p.id));
          
          if (localOnly.length > 0) {
            const merged = [...localOnly, ...serverPosts].sort((a, b) => b.id - a.id);
            safeLocalStorage.setItem("bizsearch24_community_posts_v1", JSON.stringify(merged));
            // Sync up
            fetch('/api/storage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ community_posts: merged })
            }).catch(() => null);
          } else {
            safeLocalStorage.setItem("bizsearch24_community_posts_v1", JSON.stringify(serverPosts));
          }
          window.dispatchEvent(new CustomEvent("bizsearch24_posts_updated"));
        }).catch(() => null);
    };
    syncCommunityPosts();
    const postsInterval = setInterval(syncCommunityPosts, 15000);

    // Message synchronizer
    const syncMessages = () => {
      const storedStr = safeLocalStorage.getItem("bizsearch24_messages_v1");
      let localMsgs: any[] = [];
      if (storedStr) { try { localMsgs = JSON.parse(storedStr); } catch (e) {} }

      fetch('/api/storage', { cache: 'no-store' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return;
          const serverMsgs = Array.isArray(data.messages) ? data.messages : [];
          const mergedMap = new Map();
          serverMsgs.forEach((m: any) => m && m.id && mergedMap.set(m.id, m));
          if (Array.isArray(localMsgs)) {
            localMsgs.forEach((m: any) => {
              if (m && m.id && !mergedMap.has(m.id)) mergedMap.set(m.id, m);
            });
          }
          const final = Array.from(mergedMap.values());
          safeLocalStorage.setItem("bizsearch24_messages_v1", JSON.stringify(final));
          window.dispatchEvent(new CustomEvent("bizsearch24_messages_updated"));
        }).catch(() => null);
    };
    syncMessages();
    const messageInterval = setInterval(syncMessages, 7000);

    return () => {
      clearInterval(adsInterval);
      clearInterval(postsInterval);
      clearInterval(messageInterval);
    };
  }, []);



  return null;
}

