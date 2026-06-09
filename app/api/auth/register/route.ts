import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/lib/auth-service';

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
