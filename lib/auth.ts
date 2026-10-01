import { cookies } from 'next/headers';
import { CompactEncrypt, compactDecrypt } from 'jose';
import { UserSession } from './types';

const SECRET = process.env.SESSION_SECRET || 'fallback_secret_must_be_64_chars_for_production_use_please_change_it';
const getSecretKey = () => new TextEncoder().encode(SECRET.padEnd(32, '0').slice(0, 32));

export async function encryptSession(session: UserSession): Promise<string> {
  const enc = new TextEncoder().encode(JSON.stringify(session));
  return await new CompactEncrypt(enc)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .encrypt(getSecretKey());
}

export async function decryptSession(token: string): Promise<UserSession | null> {
  try {
    const { plaintext } = await compactDecrypt(token, getSecretKey());
    const sessionStr = new TextDecoder().decode(plaintext);
    return JSON.parse(sessionStr) as UserSession;
  } catch (error) {
    return null;
  }
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  if (!sessionCookie?.value) {
    return null;
  }
  return decryptSession(sessionCookie.value);
}

export async function refreshTokenIfNeeded(session: UserSession): Promise<UserSession> {
  if (Date.now() < session.expiresAt - 5 * 60 * 1000) {
    return session;
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        refresh_token: session.refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await res.json();
    const newSession: UserSession = {
      ...session,
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    if (data.refresh_token) {
      newSession.refreshToken = data.refresh_token;
    }

    return newSession;
  } catch (error) {
    console.error('Error refreshing token', error);
    return session;
  }
}
