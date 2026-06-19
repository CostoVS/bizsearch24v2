import { NextResponse } from 'next/server';
import { db, initDb } from '@/lib/db';
import { storage } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

const DB_KEY = 'main';
const JSON_PATH = path.join(process.cwd(), '.data', 'db.json');

// Memory cache to flag if DB is known to be offline to avoid blocking connection timeouts
let isDbOffline = false;

function getLocalData() {
  try {
    if (fs.existsSync(JSON_PATH)) {
      const fileContent = fs.readFileSync(JSON_PATH, 'utf-8');
      return JSON.parse(fileContent);
    }
  } catch (e) {
    console.error("Failed to read local json data:", e);
  }
  return { 
    ads: [], 
    banners: [],
    messages: [],
    deletedMessages: [],
    deletedAds: [],
    customPartners: [],
    community_posts: [],
    slugs: []
  };
}

function saveLocalData(data: any) {
  try {
    const dir = path.dirname(JSON_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(JSON_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write local json data:", e);
  }
}

async function runWithTimeout<T>(promise: Promise<T>, timeoutMs: number = 1500): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Database operation timed out"));
    }, timeoutMs);
  });
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function getDbData(): Promise<any> {
  if (isDbOffline) {
    throw new Error("DB flagged as offline");
  }
  
  initDb();
  if (!db) {
    throw new Error("DB connection not initialized");
  }
  
  const record = await runWithTimeout(
    db.select().from(storage).where(eq(storage.key, DB_KEY)).limit(1), 
    1500
  );
  
  if (!record || record.length === 0) {
    const empty = { 
      ads: [], 
      banners: [],
      messages: [],
      deletedMessages: [],
      deletedAds: [],
      customPartners: [],
      community_posts: [],
      slugs: []
    };
    await runWithTimeout(
      db.insert(storage).values({ key: DB_KEY, data: JSON.stringify(empty, null, 2) }), 
      1500
    );
    return empty;
  }
  
  return JSON.parse(record[0].data);
}

async function saveDbData(data: any): Promise<void> {
  if (isDbOffline) {
    throw new Error("DB flagged as offline");
  }
  
  initDb();
  if (!db) {
    throw new Error("DB connection not initialized");
  }
  
  await runWithTimeout(
    db.update(storage).set({ data: JSON.stringify(data, null, 2) }).where(eq(storage.key, DB_KEY)), 
    1500
  );
}

export async function GET(req: Request) {
  try {
    let data;
    try {
      data = await getDbData();
      saveLocalData(data); // Keep local cache updated
    } catch (e) {
      console.warn("DB read failed on GET. Local db.json fallback:", (e as any).message);
      isDbOffline = true;
      setTimeout(() => { isDbOffline = false; }, 30000); // Retry DB after 30 seconds
      data = getLocalData();
    }
    
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
  } catch (error: any) {
    console.error("GET /api/storage failed:", error);
    return NextResponse.json(getLocalData(), { 
      status: 200, 
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let currentData;
    
    try {
      currentData = await getDbData();
    } catch (e) {
      console.warn("DB read failed on POST. Using local fallback.", (e as any).message);
      isDbOffline = true;
      setTimeout(() => { isDbOffline = false; }, 30000);
      currentData = getLocalData();
    }
    
    let newData = { ...currentData };
    
    if (body.deleteAdId) {
      const ads = Array.isArray(currentData.ads) ? currentData.ads : [];
      newData.ads = ads.filter((ad: any) => ad && ad.id !== body.deleteAdId);
      
      const deletedAds = Array.isArray(currentData.deletedAds) ? currentData.deletedAds : [];
      if (!deletedAds.includes(body.deleteAdId)) {
        newData.deletedAds = [...deletedAds, body.deleteAdId];
      }
    } else if (body.ads) {
      newData.ads = body.ads;
    } else {
      newData = { ...currentData, ...body };
    }
    
    // Save to local file first for absolute safety and direct speed
    saveLocalData(newData);
    
    // Then attempt to background sync value back up to the relational database
    try {
      await saveDbData(newData);
    } catch (e) {
      console.warn("DB write failed on POST. Local sync in db.json complete.", (e as any).message);
      isDbOffline = true;
      setTimeout(() => { isDbOffline = false; }, 30000);
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
      details: error.message
    }, { 
      status: 500
    });
  }
}
