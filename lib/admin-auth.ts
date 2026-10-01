import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PIN, getUserByEmail } from './db';

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET || 'super-secure-admin-secret-key-32-chars-minimum!'
);

export interface AdminSession {
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN_TIER_1' | 'ADMIN_TIER_2' | 'ADMIN_TIER_3';
}

export async function verifyAdminCredentials(email: string, pin: string): Promise<AdminSession | null> {
  const normalized = email.trim().toLowerCase();
  
  // 1. Check Super Admin
  if (normalized === SUPER_ADMIN_EMAIL.toLowerCase()) {
    if (pin === SUPER_ADMIN_PIN) {
      return { email: normalized, role: 'SUPER_ADMIN' };
    }
    return null;
  }

  // 2. Check subordinate admin in DB
  const user = await getUserByEmail(normalized);
  if (user && user.role.startsWith('ADMIN')) {
    // If admin PIN matches
    if (pin === SUPER_ADMIN_PIN) {
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
    if (!token) return null;

    const { payload } = await jwtVerify(token, ADMIN_SECRET);
    return {
      email: payload.email as string,
      role: payload.role as any,
    };
  } catch {
    return null;
  }
}
