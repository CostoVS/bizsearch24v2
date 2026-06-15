import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dbDir = path.join(process.cwd(), '.data');
const dbPath = path.join(dbDir, 'db.json');

// Initialize local JSON DB
function initDB() {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ ads: [], banners: [], customPartners: [] }), 'utf8');
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
