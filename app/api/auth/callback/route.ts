import { NextResponse } from 'next/server';
import { encryptSession } from '@/lib/auth';
import { UserSession } from '@/lib/types';
import { upsertUser } from '@/lib/db';

function getAppOrigin(request: Request, url: URL): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  return url.origin;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const { searchParams } = url;
  const origin = getAppOrigin(request, url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  if (error || !code) {
    const errorType = error === 'access_denied' ? 'access_denied' : 'auth_failed';
    return NextResponse.redirect(`${origin}/connect?error=${errorType}`);
  }

  const redirectUri = `${origin}/api/auth/callback`;

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokenData = await tokenRes.json();

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userRes.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userRes.json();

    // Auto-register user in DB as authenticated test user
    try {
      await upsertUser({
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
        is_oauth_tester: true,
      });
    } catch (dbErr) {
      console.warn('DB upsert error in OAuth callback:', dbErr);
    }

    const session: UserSession = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + tokenData.expires_in * 1000,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    };

    const encryptedSession = await encryptSession(session);

    const targetPath = state ? decodeURIComponent(state) : '/';
    const safeTarget = targetPath.startsWith('/') ? `${origin}${targetPath}` : `${origin}/`;

    const response = NextResponse.redirect(safeTarget);
    response.cookies.set('session', encryptedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (err) {
    console.error('OAuth callback error:', err);
    return NextResponse.redirect(`${origin}/connect?error=auth_failed`);
  }
}
