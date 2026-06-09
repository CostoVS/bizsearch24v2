import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth-service';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await getUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json({ error: 'This email account is not registered. Please register first.' }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Incorrect password. Please verify and try again.' }, { status: 401 });
    }

    // Success: Return user details and 2FA status (Never expose secretKey if hasSetup2FA is true for security)
    return NextResponse.json({
      success: true,
      user: {
        email: user.email,
        role: user.role,
        plan: user.plan,
        hasSetup2FA: user.hasSetup2FA,
        // Only return secret key to setup if they have not yet enrolled
        secretKey: user.hasSetup2FA ? undefined : user.secretKey,
      }
    });

  } catch (error: any) {
    console.error('Server Login Error:', error);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}
