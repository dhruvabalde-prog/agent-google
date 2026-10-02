import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { getAllUsers, getAllApps, getAllApiKeys } from '@/lib/db';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 1. Google Client ID & Project Number Extraction
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
  const projectNumberMatch = clientId.match(/^(\d+)/);
  const projectNumber = projectNumberMatch ? projectNumberMatch[1] : '143315250482';

  // 2. Direct GCP Console Deep Links
  const gcpLinks = {
    projectNumber,
    consentScreen: `https://console.cloud.google.com/apis/credentials/consent?project=${projectNumber}`,
    credentials: `https://console.cloud.google.com/apis/credentials?project=${projectNumber}`,
    apisDashboard: `https://console.cloud.google.com/apis/dashboard?project=${projectNumber}`,
    apiLibrary: `https://console.cloud.google.com/apis/library?project=${projectNumber}`,
    serviceUsage: `https://console.cloud.google.com/apis/api/serviceusage.googleapis.com/overview?project=${projectNumber}`,
    auditLogs: `https://console.cloud.google.com/logs/viewer?project=${projectNumber}`,
  };

  // 3. Test Gemini API Key
  let geminiStatus = 'UNKNOWN';
  let geminiLatencyMs = 0;
  let geminiError: string | null = null;
  const apiKey = process.env.GEMINI_API_KEY || '';

  if (apiKey) {
    const startTime = Date.now();
    try {
      const ai = new GoogleGenAI({ apiKey });
      const testRes = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: 'Ping: reply with "PONG"' }] }],
      });
      geminiLatencyMs = Date.now() - startTime;
      if (testRes.text) {
        geminiStatus = 'OPERATIONAL (200 OK)';
      } else {
        geminiStatus = 'DEGRADED';
      }
    } catch (err: any) {
      geminiLatencyMs = Date.now() - startTime;
      geminiStatus = 'ERROR';
      geminiError = err?.message || String(err);
    }
  } else {
    geminiStatus = 'MISSING_API_KEY';
  }

  // 4. Test OAuth Client Configuration
  const oauthClientStatus = (clientId && clientSecret) ? 'CONFIGURED' : 'INCOMPLETE';

  // 5. Test Users Inventory
  const allUsers = await getAllUsers();
  const testUsers = allUsers.filter((u: any) => u.is_oauth_tester);
  const testUserEmails = testUsers.map((u: any) => u.email);
  const commaSeparatedTesters = testUserEmails.join(', ');

  // 6. Database Connection Status
  const rawDbUrl = process.env.DATABASE_URL || '';
  const isPostgresConfigured = Boolean(rawDbUrl && !rawDbUrl.includes('[YOUR-PASSWORD]') && !rawDbUrl.includes('YOUR-PASSWORD'));
  const dbStatus = isPostgresConfigured ? 'POSTGRES / SUPABASE CONNECTED' : 'IN-MEMORY RESILIENT FALLBACK (Password needed)';

  // 7. Workspace APIs Inventory
  const apps = await getAllApps();

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    gcpLinks,
    testUsers: {
      publishingStatus: 'Testing (Up to 100 users allowed)',
      count: testUsers.length,
      maxAllowed: 100,
      remainingSlots: Math.max(0, 100 - testUsers.length),
      commaSeparatedTesters,
      emails: testUserEmails,
    },
    diagnostics: {
      projectNumber,
      oauthClient: {
        status: oauthClientStatus,
        clientIdMasked: clientId ? clientId.substring(0, 12) + '...' + clientId.substring(clientId.length - 8) : 'Not configured',
        redirectUris: [
          'https://agent-google-green.vercel.app/api/auth/callback',
          'http://localhost:3000/api/auth/callback',
        ],
      },
      geminiAi: {
        status: geminiStatus,
        latencyMs: geminiLatencyMs,
        error: geminiError,
        model: 'gemini-2.0-flash',
      },
      database: {
        status: dbStatus,
        isPersistent: isPostgresConfigured,
      },
      testUsers: {
        publishingStatus: 'Testing (Up to 100 users allowed)',
        count: testUsers.length,
        maxAllowed: 100,
        remainingSlots: Math.max(0, 100 - testUsers.length),
        commaSeparatedTesters,
        emails: testUserEmails,
      },
      apis: apps.map(a => ({
        id: a.id,
        name: a.name,
        category: a.category,
        enabled: a.enabled,
        status: a.status,
      })),
    },
  });
}
