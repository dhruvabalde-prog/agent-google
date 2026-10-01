import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getAllUsers, getAllSkills, getAllSubscriptionTiers, getAllApiKeys, getAuditLogs } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [users, skills, tiers, apiKeys, auditLogs] = await Promise.all([
    getAllUsers(),
    getAllSkills(),
    getAllSubscriptionTiers(),
    getAllApiKeys(),
    getAuditLogs(),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agent-google-green.vercel.app';
  const mcpEndpoint = `${appUrl}/api/mcp`;

  return NextResponse.json({
    admin: session,
    users,
    skills,
    tiers,
    apiKeys,
    auditLogs,
    mcpEndpoint,
    stats: {
      totalUsers: users.length,
      activeSkills: skills.filter(s => s.enabled).length,
      totalTiers: tiers.length,
      totalKeys: apiKeys.length,
    }
  });
}
