import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { sendPasswordResetEmail } from '@/lib/utils/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 1. Check if user exists in profiles to get their name
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('email', email.trim())
      .single();

    if (profileError || !profile) {
      // Security: Don't reveal if user exists or not
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    // 2. Generate recovery link
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo: `${new URL(req.url).origin}/auth/reset-password`,
      }
    });

    if (linkError) {
      console.error('Link Generation Error:', linkError);
      return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 });
    }

    // 3. Send email via Resend
    const emailResponse = await sendPasswordResetEmail(
      email.trim(),
      profile.name || 'Valued Customer',
      data.properties.action_link
    );

    if (!emailResponse.success) {
      console.error('Email Send Error:', emailResponse.error);
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Reset link sent successfully!' });
  } catch (error: any) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
