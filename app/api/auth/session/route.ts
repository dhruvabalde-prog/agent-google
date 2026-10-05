import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserByEmail, isSuperAdminEmail } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  
  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const dbUser = await getUserByEmail(session.email);
  const isAdmin = isSuperAdminEmail(session.email) || dbUser?.role === 'ADMIN' || dbUser?.role === 'SUPER_ADMIN';
  
  return NextResponse.json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      picture: session.picture,
      role: dbUser?.role || (isAdmin ? 'SUPER_ADMIN' : 'USER'),
      isAdmin,
    }
  });
}
