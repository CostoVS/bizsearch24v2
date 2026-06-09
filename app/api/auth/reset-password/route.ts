import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Initialize nodemailer transporter
    // For a real app, users will need to add these environmental variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER || 'test@example.com',
        pass: process.env.SMTP_PASS || 'password',
      },
    });

    // We would normally generate a secure token and save it to the DB
    // e.g., const resetToken = crypto.randomBytes(32).toString('hex');
    const mockResetToken = 'xyz123-reset-token';

    const resetLink = `https://${req.headers.get('host')}/reset-password?email=${encodeURIComponent(email)}&token=${mockResetToken}`;

    const mailOptions = {
      from: '"BizSearch24" <no-reply@bizsearch24.co.za>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your BizSearch24 account.</p>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetLink}" style="background:#059669;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;display:inline-block;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    // If environment variables are missing, we don't actually send to avoid crashing without warning.
    if (process.env.SMTP_HOST) {
       await transporter.sendMail(mailOptions);
       return NextResponse.json({ success: true, message: 'Password reset link sent to your email.' });
    } else {
       // Mock response since SMTP isn't configured
       console.log("Mocking password reset email to: ", email);
       console.log("Mock Reset Link: ", resetLink);
       return NextResponse.json({ 
         success: true, 
         message: 'Password reset link sent to your email. (Note: Configuration required for actual delivery, check server logs for mock link)' 
       });
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
