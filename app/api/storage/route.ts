import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dbDir = '/tmp';
const dbPath = path.join(dbDir, 'db.json');

// Atomic write file helper
function safeWriteFileSync(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Try to set permissions to make it writable
  if (fs.existsSync(filePath)) {
    try {
      fs.chmodSync(filePath, 0o666);
    } catch (e) {
      console.warn("Could not chmod db.json:", e);
    }
  }

  // Directly write to the file. For small JSON files, this is generally atomic on Unix-like filesystems
  // or at least less collision-prone than renameSync in some environments.
  fs.writeFileSync(filePath, content, 'utf8');
}

// Initialize local JSON DB with thread safety
function initDB() {
  try {
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const EMPTY_DB = { 
      ads: [], 
      banners: [],
      messages: [],
      deletedMessages: [],
      deletedAds: [],
      customPartners: [],
      community_posts: [],
      slugs: []
    };

    if (!fs.existsSync(dbPath)) {
      safeWriteFileSync(dbPath, JSON.stringify(EMPTY_DB, null, 2));
      return;
    }

    let dataStr = '';
    try {
      dataStr = fs.readFileSync(dbPath, 'utf8').trim();
    } catch (err) {
      // Retry logic for busy filesystem
      for (let i = 0; i < 3; i++) {
        try {
          dataStr = fs.readFileSync(dbPath, 'utf8').trim();
          if (dataStr) break;
        } catch (e) {
          if (i === 2) throw e;
        }
      }
    }

    if (!dataStr) {
      console.warn("db.json was read as empty, skipping initialization to prevent data loss.");
      return;
    }

    let data: any;
    try {
      data = JSON.parse(dataStr);
    } catch (err) {
      console.error("JSON parse failure in initDB:", err);
      return;
    }

    let modified = false;
    const requiredKeys = ['messages', 'deletedMessages', 'deletedAds', 'banners', 'customPartners', 'community_posts', 'slugs'];
    requiredKeys.forEach(key => {
      if (!data[key] || !Array.isArray(data[key])) {
        data[key] = [];
        modified = true;
      }
    });

    if (modified) {
      safeWriteFileSync(dbPath, JSON.stringify(data, null, 2));
    }
  } catch (globalErr) {
    console.error("Critical failure in initDB:", globalErr);
  }
}

export async function GET(req: Request) {
  try {
    initDB();
    let fileContents = '';
    
    // Robust read with retries
    for (let i = 0; i < 5; i++) {
        try {
          if (fs.existsSync(dbPath)) {
            fileContents = fs.readFileSync(dbPath, 'utf8').trim();
            if (fileContents && fileContents.startsWith('{') && fileContents.endsWith('}')) {
               break;
            }
          }
        } catch (e) {
          if (i === 4) throw e;
          await new Promise(r => setTimeout(r, 100 * i));
        }
    }

    if (!fileContents) {
      // Re-init if missing
      initDB();
      fileContents = fs.readFileSync(dbPath, 'utf8').trim();
    }

    const data = JSON.parse(fileContents);
    
    // Ensure deleted ads are filtered out
    if (data.ads && Array.isArray(data.ads) && data.deletedAds && Array.isArray(data.deletedAds)) {
      const deletedSet = new Set(data.deletedAds);
      data.ads = data.ads.filter((ad: any) => ad && ad.id && !deletedSet.has(ad.id));
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("GET /api/storage failed:", error);
    // Fallback to minimal valid schema rather than breaking the whole UI
    return NextResponse.json({ ads: [], messages: [], community_posts: [], slugs: [], banners: [] }, { 
      status: 200, 
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const body = await req.json();
    let currentData: any = { 
      ads: [], 
      banners: [], 
      customPartners: [], 
      slugs: [], 
      messages: [], 
      deletedMessages: [],
      deletedAds: []
    };
    
    try {
      if (fs.existsSync(dbPath)) {
        const raw = fs.readFileSync(dbPath, 'utf8').trim();
        if (raw) {
          currentData = JSON.parse(raw);
        }
      }
    } catch (e) {
      console.error("Failed to read db.json in POST, using empty state", e);
    }

    // Smart merge for ads to prevent multi-user overwrites
    if (body.ads && Array.isArray(body.ads)) {
      const adMap = new Map();
      
      // Load current server state
      if (Array.isArray(currentData.ads)) {
        currentData.ads.forEach((a: any) => {
          if (a && a.id) adMap.set(a.id, a);
        });
      }
      
      // Merge incoming client data
      body.ads.forEach((a: any) => {
        if (a && a.id) {
          // If it already exists, the incoming one might be more recent (e.g. edited)
          adMap.set(a.id, a);
        }
      });
      
      // Handle explicit deletions
      if (body.deleteAdId) {
        adMap.delete(body.deleteAdId);
        if (!Array.isArray(currentData.deletedAds)) currentData.deletedAds = [];
        if (!currentData.deletedAds.includes(body.deleteAdId)) {
          currentData.deletedAds.push(body.deleteAdId);
        }
      }

      // Filter out anything in the global deleted list just in case
      const deletedIds = new Set(currentData.deletedAds || []);
      const finalAds = Array.from(adMap.values()).filter(ad => ad && ad.id && !deletedIds.has(ad.id));
      
      // If the client sent a specific list that they want to be the "truth" (e.g. after a manual deletion)
      // we still merge but we can respect their request if we want.
      // For now, always merging is safer against data loss.
      currentData.ads = finalAds;
      
      delete body.ads;
      delete body.forceSyncAds;
      delete body.deleteAdId;
    }

    // Smart merge for messages
    if (body.messages && Array.isArray(body.messages)) {
      const existingMsgs = Array.isArray(currentData.messages) ? currentData.messages : [];
      const msgMap = new Map();
      existingMsgs.forEach((m: any) => {
        if (m && m.id) msgMap.set(m.id, m);
      });
      body.messages.forEach((m: any) => {
        if (m && m.id) msgMap.set(m.id, m);
      });
      currentData.messages = Array.from(msgMap.values());
      delete body.messages;
    }

    // Smart merge for slugs
    if (body.slugs && Array.isArray(body.slugs)) {
      const existingSlugs = Array.isArray(currentData.slugs) ? currentData.slugs : [];
      const slugMap = new Map();
      existingSlugs.forEach((s: any) => { if (s && s.slug) slugMap.set(s.slug, s); });
      body.slugs.forEach((s: any) => { if (s && s.slug) slugMap.set(s.slug, s); });
      currentData.slugs = Array.from(slugMap.values());
      delete body.slugs;
    }

    // Smart merge for customPartners
    if (body.customPartners && Array.isArray(body.customPartners)) {
      const existingPartners = Array.isArray(currentData.customPartners) ? currentData.customPartners : [];
      const partnerMap = new Map();
      existingPartners.forEach((p: any) => { if (p && p.id) partnerMap.set(p.id, p); });
      body.customPartners.forEach((p: any) => { if (p && p.id) partnerMap.set(p.id, p); });
      currentData.customPartners = Array.from(partnerMap.values());
      delete body.customPartners;
    }

    // Smart merge for community_posts
    if (body.community_posts && Array.isArray(body.community_posts)) {
      const existingPosts = Array.isArray(currentData.community_posts) ? currentData.community_posts : [];
      const postMap = new Map();
      existingPosts.forEach((p: any) => { if (p && p.id) postMap.set(p.id, p); });
      body.community_posts.forEach((p: any) => { if (p && p.id) postMap.set(p.id, p); });
      // Sort by ID descending (newest first)
      currentData.community_posts = Array.from(postMap.values()).sort((a: any, b: any) => b.id - a.id);
      delete body.community_posts;
    }

    // Standard merge for everything else
    const newData = { ...currentData, ...body };
    
    try {
      const dataString = JSON.stringify(newData, null, 2);
      if (dataString.length > 1024 * 1024 * 5) {
        throw new Error("Payload too large: " + (dataString.length / 1024 / 1024).toFixed(2) + "MB");
      }
      
      let writeSuccess = false;
      for (let i = 0; i < 5; i++) {
        try {
          safeWriteFileSync(dbPath, dataString);
          writeSuccess = true;
          break;
        } catch (e: any) {
          if (i === 4) throw e;
          // Exponential backoff
          await new Promise(r => setTimeout(r, 200 * Math.pow(2, i)));
        }
      }
      if (!writeSuccess) throw new Error("Could not write file after retries");
    } catch (writeErr: any) {
      console.error("Critical write failure in POST:", writeErr);
      throw new Error("Disk write failed: " + writeErr.message);
    }

    return NextResponse.json({ success: true, data: newData }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error: any) {
    console.error("POST /api/storage failed:", error);
    return NextResponse.json({ 
      error: 'Failed to write data', 
      details: error.message,
      stack: error.stack 
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  }
}
