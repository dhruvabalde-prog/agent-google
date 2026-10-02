import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET || 'super-secure-admin-secret-key-32-chars-minimum!'
);

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Session
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_session')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
    }

    try {
      await jwtVerify(adminToken, ADMIN_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin session' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not set' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Attempt to create ephemeral token for client-side live streaming if supported
    try {
      const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      const token = await ai.authTokens.create({
        config: {
          uses: 1,
          expireTime,
          newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
        }
      });

      return NextResponse.json({
        success: true,
        token: token.name,
        model: 'gemini-3.1-flash-live-preview',
        mode: 'live_websocket'
      });
    } catch (err: any) {
      console.warn('Ephemeral token creation fallback (using server-streaming mode):', err?.message);
      return NextResponse.json({
        success: true,
        mode: 'server_voice_stream',
        message: 'Live voice stream fallback ready'
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server error' }, { status: 500 });
  }
}
