import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dbDir = path.join(process.cwd(), '.data');
const dbPath = path.join(dbDir, 'db.json');

// Core seed ads to ensure the app never looks empty if data is wiped
const SEED_DATA_ADS = [
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
      ads: SEED_DATA_ADS, 
      banners: [], 
      customPartners: [], 
      community_posts: [],
      slugs: [], 
      messages: [], 
      deletedMessages: [],
      deletedAds: []
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
      console.warn("db.json was read as empty, not wiping to avoid data loss.");
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
    // If ads are missing or definitely truncated/emptied accidentally, restore seeds
    if (!data.ads || !Array.isArray(data.ads) || (data.ads.length === 0 && (!data.messages || data.messages.length === 0))) {
      // We re-seed if it's genuinely empty of everything important
      data.ads = SEED_DATA_ADS;
      modified = true;
    }
    
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
    // Fallback to seeds rather than breaking the whole UI or showing 0 items
    return NextResponse.json({ ads: SEED_DATA_ADS, messages: [], community_posts: [], slugs: [], banners: [] }, { 
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
      
      currentData.ads = Array.from(adMap.values());
      delete body.ads;
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
