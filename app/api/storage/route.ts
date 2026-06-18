import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), '.data');
const dbPath = path.join(dbDir, 'db.json');

// Seeding standard, premium, and sponsor ads so there is never a blank screen for guest visits
const SEED_ADS = [
  {
    id: "seed-ad-1",
    userId: "admin-1",
    title: "Sandton Gourmet Caterers",
    category: "Catering",
    province: "Gauteng",
    location: "Sandton",
    description: "Bespoke corporate catering, wedding banquet food design, and custom buffet services for Gauteng events of all magnitudes.",
    verified: true,
    isPremium: true,
    isSponsor: true,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "seed-ad-2",
    userId: "admin-1",
    title: "KZN Sparky Electrics",
    category: "Electrician",
    province: "KwaZulu-Natal",
    location: "Durban",
    description: "Professional domestic and industrial electrical installations, certificate of compliance (CoC) registry, and 24/7 fault finding.",
    verified: true,
    isPremium: false,
    isSponsor: true,
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "seed-ad-3",
    userId: "admin-1",
    title: "Cape Flats Plumbing & Drainage",
    category: "Plumbing",
    province: "Western Cape",
    location: "Cape Town",
    description: "Your local trusted emergency plumbers operating across Cape Town and surrounding suburbs. 30+ years of quality service.",
    verified: true,
    isPremium: true,
    isSponsor: false,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "seed-ad-4",
    userId: "admin-1",
    title: "Pretoria Accounting & Tax Solutions",
    category: "Accounting Services",
    province: "Gauteng",
    location: "Pretoria",
    description: "SME monthly tax bookkeeping, annual financial statement compilation, and SARS compliant tax returns made simple and secure.",
    verified: true,
    isPremium: true,
    isSponsor: false,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "seed-ad-5",
    userId: "admin-1",
    title: "Pinetown Auto Repairs",
    category: "Mechanic",
    province: "KwaZulu-Natal",
    location: "Pinetown",
    description: "Affordable and speedy vehicle servicing, diagnostics, and engine builds. Drive-ins welcome.",
    verified: false,
    isPremium: false,
    isSponsor: false,
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?q=80&w=600&auto=format&fit=crop"
  }
];

// Initialize local JSON DB
function initDB() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(
      dbPath, 
      JSON.stringify({ 
        ads: SEED_ADS, 
        banners: [], 
        customPartners: [], 
        slugs: [], 
        messages: [], 
        deletedMessages: [] 
      }, null, 2), 
      'utf8'
    );
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      let modified = false;
      if (!data.ads || !Array.isArray(data.ads) || data.ads.length === 0) {
        data.ads = SEED_ADS;
        modified = true;
      }
      if (!data.messages) {
        data.messages = [];
        modified = true;
      }
      if (!data.deletedMessages) {
        data.deletedMessages = [];
        modified = true;
      }
      if (modified) {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {
      console.error("Failed to migrate database to include messages and deletedMessages:", e);
    }
  }
}

export async function GET(req: Request) {
  try {
    initDB();
    const data = fs.readFileSync(dbPath, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to read data' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    initDB();
    const body = await req.json();
    const currentData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const newData = { ...currentData, ...body };
    fs.writeFileSync(dbPath, JSON.stringify(newData, null, 2), 'utf8');
    return NextResponse.json({ success: true, data: newData });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to write data' }, { status: 500 });
  }
}
