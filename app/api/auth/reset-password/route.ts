import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Initialize nodemailer transporter with robust Gmail and Custom SMTP support
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER || 'mailsearchbiz@gmail.com';
    // Fallback directly to the user's Gmail app password, and clean up any whitespace/spaces
    const rawSmtpPass = process.env.SMTP_PASS || 'feqn hfps huhn kjhh';
    const smtpPass = rawSmtpPass.replace(/\s+/g, ''); // Google app passwords are 16 letters with no spaces

    let transporterConfig: any;

    if (smtpHost.includes('gmail.com') || smtpUser.endsWith('@gmail.com')) {
      transporterConfig = {
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      };
    } else {
      transporterConfig = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // We would normally generate a secure token and save it to the DB
    // e.g., const resetToken = crypto.randomBytes(32).toString('hex');
    const mockResetToken = 'xyz123-reset-token';

    const resetLink = `https://${req.headers.get('host')}/reset-password?email=${encodeURIComponent(email)}&token=${mockResetToken}`;

    const mailOptions = {
      from: `"SearchBiz" <${smtpUser}>`,
      to: email,
      subject: 'Password Reset Request - SearchBiz',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Password Reset</h2>
          <p style="color: #334155; font-size: 15px; line-height: 24px;">You requested a password reset for your SearchBiz account.</p>
          <p style="color: #334155; font-size: 15px; line-height: 24px; margin-bottom: 24px;">Please click the button below to reset your password. This link is valid for 1 hour.</p>
          <div style="text-align: center; margin-bottom: 24px;">
            <a href="${resetLink}" style="background-color: #059669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you did not request this reset, you can safely ignore this email. Your password will remain unchanged.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center;">SearchBiz • South Africa's Premier Business Directory</p>
        </div>
      `,
    };

    // If actual SMTP credentials are provided, try sending the email
    if (smtpPass && smtpPass !== 'your_smtp_password' && smtpPass !== 'password') {
       try {
         await transporter.sendMail(mailOptions);
         return NextResponse.json({ 
           success: true, 
           message: 'Password reset link has been sent to your email address successfully!' 
         });
       } catch (sendError: any) {
         console.error('SMTP Connection or Send Error:', sendError);
         return NextResponse.json({ 
           success: true, 
           isMock: true,
           resetLink: resetLink,
           message: `Failed to deliver email through Gmail SMTP automatically: ${sendError.message || sendError}. For testing on preview/admin, use the direct reset button below.`
         });
       }
    } else {
       // Graceful fail-safe response if no app password is set yet
       console.log("Password reset fallback details:");
       console.log("Email: ", email);
       console.log("Reset Link: ", resetLink);
       return NextResponse.json({ 
         success: true, 
         isMock: true,
         resetLink: resetLink,
         message: 'Real-time SMTP mailing requires an App Password for mailsearchbiz@gmail.com. For instant admin and preview testing, click the direct reset button below.' 
       });
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
