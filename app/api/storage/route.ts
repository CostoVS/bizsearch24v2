import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const dbDir = path.join(process.cwd(), '.data');
const dbPath = path.join(dbDir, 'db.json');

const SEED_ADS: any[] = [];

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
      ads: SEED_ADS, 
      banners: [], 
      customPartners: [], 
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
      console.warn("Retrying file read once for robustness...");
      try {
        dataStr = fs.readFileSync(dbPath, 'utf8').trim();
      } catch (err2) {
        console.error("Critical failure reading dbPath:", err2);
        return; // Return instead of wiping out the database!
      }
    }

    if (!dataStr) {
      // Empty file could be a transient read state
      console.warn("db.json was read as empty, not wiping to avoid data loss.");
      return;
    }

    let data: any;
    try {
      data = JSON.parse(dataStr);
    } catch (err) {
      console.error("Critical: failed to parse JSON in initDB. Not overwriting to preserve backup data:", err);
      return; // Return instead of wiping out!
    }

    let modified = false;
    if (!data.ads || !Array.isArray(data.ads)) {
      data.ads = [];
      modified = true;
    } else {
      const originalCount = data.ads.length;
      data.ads = data.ads.filter((ad: any) => ad && ad.id && !ad.id.startsWith("seed-ad-") && !['ad1', 'ad2', 'ad3', 'ad4', 'custom-ad-1', 'custom-ad-2'].includes(ad.id));
      if (data.ads.length !== originalCount) {
        modified = true;
      }
    }
    if (!data.messages || !Array.isArray(data.messages)) {
      data.messages = [];
      modified = true;
    }
    if (!data.deletedMessages || !Array.isArray(data.deletedMessages)) {
      data.deletedMessages = [];
      modified = true;
    }
    if (!data.deletedAds || !Array.isArray(data.deletedAds)) {
      data.deletedAds = [];
      modified = true;
    }
    if (!data.banners) {
      data.banners = [];
      modified = true;
    }
    if (!data.customPartners) {
      data.customPartners = [];
      modified = true;
    }
    if (!data.slugs) {
      data.slugs = [];
      modified = true;
    }

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
    try {
      fileContents = fs.readFileSync(dbPath, 'utf8');
    } catch (readErr) {
      return NextResponse.json({
        ads: SEED_ADS,
        banners: [],
        customPartners: [],
        slugs: [],
        messages: [],
        deletedMessages: [],
        deletedAds: []
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
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
    return NextResponse.json({ ads: SEED_ADS, deletedAds: [] }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const body = await req.json();
    let currentData = { 
      ads: SEED_ADS, 
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
