import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminToken } from '@/lib/admin-auth';
import { logAdminAction } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, pin } = await request.json();
    if (!email || !pin) {
      return NextResponse.json({ error: 'Email and PIN required' }, { status: 400 });
    }

    const session = await verifyAdminCredentials(email, pin);
    if (!session) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createAdminToken(session);
    const cookieStore = await cookies();
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours
    });

    await logAdminAction(session.email, 'ADMIN_LOGIN', 'admin_panel', 'Successful PIN login');

    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: 'Login error' }, { status: 500 });
  }
}
