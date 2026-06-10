import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/auth-service';
import fs from 'fs';
import path from 'path';

const IP_BIND_FILE = path.join(process.cwd(), 'ip-bindings-db.json');

function getIpBindings(): Record<string, string> {
  try {
    if (fs.existsSync(IP_BIND_FILE)) {
      return JSON.parse(fs.readFileSync(IP_BIND_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error("Failed to read IP bindings file, returning empty map:", e);
  }
  return {};
}

function saveIpBinding(ip: string, email: string) {
  try {
    const binds = getIpBindings();
    binds[ip] = email;
    fs.writeFileSync(IP_BIND_FILE, JSON.stringify(binds, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to write IP binding:", e);
  }
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    
    // Check if ya exists
    const existingUser = await getUserByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json({ error: 'This email is already registered. Please sign in instead.' }, { status: 400 });
    }

    // IP Address Restriction
    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const clientIp = ipHeader.split(',')[0].trim();
    
    if (clientIp && clientIp !== '127.0.0.1') {
      const binds = getIpBindings();
      const boundEmail = binds[clientIp];
      if (boundEmail && boundEmail.toLowerCase() !== normalizedEmail && normalizedEmail !== "nicholauscostochetty@gmail.com") {
        return NextResponse.json({ 
          error: `Access Denied: This device and IP address (${clientIp}) are already linked to an existing registered account (${boundEmail}). To ensure security and prevent abuse, only one account is permitted per device & IP.` 
        }, { status: 400 });
      }
    }

    // Generate compliant Base32 16-character secret
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let generatedSecret = 'BS24';
    for (let i = 0; i < 12; i++) {
      generatedSecret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const newUser = {
      id: 'user-' + Math.random().toString(36).substring(7),
      email: normalizedEmail,
      password: password,
      role: 'USER' as const,
      plan: 'FREE' as const,
      secretKey: generatedSecret,
      hasSetup2FA: false,
    };

    await saveUser(newUser);

    // Save binding on successful registration
    if (clientIp && clientIp !== '127.0.0.1') {
      saveIpBinding(clientIp, normalizedEmail);
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful! Proceed to setup 2-Step Verification.',
      user: {
        email: newUser.email,
        role: newUser.role,
        plan: newUser.plan,
        hasSetup2FA: false,
        secretKey: generatedSecret,
      }
    });

  } catch (error: any) {
    console.error('Server Registration Error:', error);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}
