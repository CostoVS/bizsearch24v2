import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dbDir = path.join(process.cwd(), '.data');
const dbPath = path.join(dbDir, 'db.json');

// Atomic write file helper to prevent truncated file reads when concurrent requests hit db.json
function safeWriteFileSync(filePath: string, content: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const tempPath = filePath + '.' + Math.random().toString(36).substring(2) + '.tmp';
  fs.writeFileSync(tempPath, content, 'utf8');
  fs.renameSync(tempPath, filePath);
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
    for (let i = 0; i < 3; i++) {
        try {
          if (fs.existsSync(dbPath)) {
            fileContents = fs.readFileSync(dbPath, 'utf8').trim();
            if (fileContents) break;
          }
        } catch (e) {
          if (i === 2) throw e;
          await new Promise(r => setTimeout(r, 50));
        }
    }

    if (!fileContents) {
      throw new Error("Database file is empty or missing");
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
        currentData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      }
    } catch (e) {}

    // Smart merge for ads to prevent multi-user overwrites
    if (body.ads && Array.isArray(body.ads)) {
      const existingAds = Array.isArray(currentData.ads) ? currentData.ads : [];
      const adMap = new Map();
      
      // Load existing ads
      existingAds.forEach((a: any) => {
        if (a && a.id) adMap.set(a.id, a);
      });
      
      // Merge/Update with incoming ads
      body.ads.forEach((a: any) => {
        if (a && a.id) adMap.set(a.id, a);
      });
      
      // Handle explicit deletions if requested
      if (body.deleteAdId) {
        adMap.delete(body.deleteAdId);
        if (!Array.isArray(currentData.deletedAds)) currentData.deletedAds = [];
        if (!currentData.deletedAds.includes(body.deleteAdId)) {
          currentData.deletedAds.push(body.deleteAdId);
        }
      }

      // Check if this is a "force sync" from a client that wants its list to be the source of truth
      if (body.forceSyncAds) {
        currentData.ads = body.ads;
      } else {
        currentData.ads = Array.from(adMap.values());
      }
      
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
    
    safeWriteFileSync(dbPath, JSON.stringify(newData, null, 2));
    return NextResponse.json({ success: true, data: newData }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("POST /api/storage failed:", error);
    return NextResponse.json({ error: 'Failed to write data' }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
