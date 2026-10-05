import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getAllUsers, getAllSkills, getAllSubscriptionTiers, getAllApiKeys, getAuditLogs, getAllApps } from '@/lib/db';
import { GENERAL_PURPOSE_SKILL_PACKS } from '@/lib/skills-packs';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [users, skills, tiers, apiKeys, auditLogs, apps] = await Promise.all([
    getAllUsers(),
    getAllSkills(),
    getAllSubscriptionTiers(),
    getAllApiKeys(),
    getAuditLogs(),
    getAllApps(),
  ]);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agent-google-green.vercel.app';
  const oauthTestUsers = users.filter((u: any) => u.is_oauth_tester);
  const realAdmins = users.filter((u: any) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN');

  return NextResponse.json({
    admin: session,
    admins: realAdmins,
    users,
    testUsers: oauthTestUsers,
    skills,
    skillPacks: GENERAL_PURPOSE_SKILL_PACKS,
    tiers,
    apiKeys,
    auditLogs,
    apps,
    cloudProject: {
      publishingStatus: 'Testing',
      maxTestUsers: 100,
      activeTestUsersCount: oauthTestUsers.length,
      oauthConsentUrl: 'https://console.cloud.google.com/apis/credentials/consent',
      apisDashboardUrl: 'https://console.cloud.google.com/apis/dashboard',
      credentialsUrl: 'https://console.cloud.google.com/apis/credentials',
    },
    stats: {
      totalUsers: users.length,
      testUsersCount: oauthTestUsers.length,
      activeSkills: skills.filter(s => s.enabled).length,
      totalTiers: tiers.length,
      totalKeys: apiKeys.length,
      activeApps: apps.filter(a => a.enabled).length,
    }
  });
}
