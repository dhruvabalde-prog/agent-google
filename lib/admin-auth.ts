import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PIN, SUPER_ADMIN_EMAILS, SUPER_ADMIN_PINS, isSuperAdminEmail, isValidAdminPin, getUserByEmail } from './db';

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET || 'super-secure-admin-secret-key-32-chars-minimum!'
);

export interface AdminSession {
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN_TIER_1' | 'ADMIN_TIER_2' | 'ADMIN_TIER_3';
}

import { upsertUser } from './db';
import { getSession } from './auth';

export async function verifyAdminCredentials(email: string, pin: string): Promise<AdminSession | null> {
  const normalized = (email || '').trim().toLowerCase();
  const cleanPin = (pin || '').trim();
  
  // 1. Check Super Admin PIN: Master keys 687996, 210996, or env PIN
  if (isValidAdminPin(cleanPin) || cleanPin === '687996' || cleanPin === '210996') {
    const adminEmail = normalized || (isSuperAdminEmail(normalized) ? normalized : SUPER_ADMIN_EMAIL.toLowerCase());
    
    // Auto-elevate this account in database as SUPER_ADMIN
    try {
      await upsertUser({
        email: adminEmail,
        name: adminEmail.split('@')[0],
        role: 'SUPER_ADMIN',
        subscription_tier: 'ADMIN',
        is_oauth_tester: true,
      });
    } catch (e) {
      console.warn('Auto-elevating admin in DB failed:', e);
    }

    return { email: adminEmail, role: 'SUPER_ADMIN' };
  }

  // 2. Check subordinate admin in DB
  const user = await getUserByEmail(normalized);
  if (user && user.role.startsWith('ADMIN')) {
    if (isValidAdminPin(cleanPin)) {
      return { email: normalized, role: user.role };
    }
  }

  return null;
}

export async function createAdminToken(session: AdminSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('12h')
    .sign(ADMIN_SECRET);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    if (token) {
      const { payload } = await jwtVerify(token, ADMIN_SECRET);
      return {
        email: payload.email as string,
        role: payload.role as any,
      };
    }

    // Check if user is logged into Google Workspace with Super Admin email or elevated role
    const googleSession = await getSession();
    if (googleSession?.email) {
      const emailLower = googleSession.email.toLowerCase();
      if (isSuperAdminEmail(emailLower)) {
        return {
          email: emailLower,
          role: 'SUPER_ADMIN',
        };
      }
      const user = await getUserByEmail(emailLower);
      if (user && user.role === 'SUPER_ADMIN') {
        return {
          email: emailLower,
          role: 'SUPER_ADMIN',
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}
