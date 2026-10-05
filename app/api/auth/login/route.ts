import { NextResponse } from 'next/server';

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
  const origin = getAppOrigin(request, url);
  const redirectUri = `${origin}/api/auth/callback`;
  const toolsParam = url.searchParams.get('tools');
  const returnTarget = url.searchParams.get('redirect') || '/';

  // Base identity and sovereign scoped Drive access
  const requestedScopes: string[] = [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/drive.file', // Only files opened or created by Life OS
  ];

  // If specific tools requested, only include those
  if (toolsParam) {
    const selected = toolsParam.toLowerCase().split(',').map(s => s.trim());
    if (selected.includes('docs')) requestedScopes.push('https://www.googleapis.com/auth/documents');
    if (selected.includes('sheets')) requestedScopes.push('https://www.googleapis.com/auth/spreadsheets');
    if (selected.includes('slides')) requestedScopes.push('https://www.googleapis.com/auth/presentations');
    if (selected.includes('tasks')) requestedScopes.push('https://www.googleapis.com/auth/tasks');
    if (selected.includes('calendar')) requestedScopes.push('https://www.googleapis.com/auth/calendar');
    if (selected.includes('gmail')) {
      requestedScopes.push('https://www.googleapis.com/auth/gmail.readonly');
      requestedScopes.push('https://www.googleapis.com/auth/gmail.compose');
    }
  } else {
    // Default standard non-admin workspace scopes (NO gmail.modify)
    requestedScopes.push(
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/tasks',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.compose'
    );
  }

  const scopes = requestedScopes.join(' ');

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID || '');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', scopes);
  authUrl.searchParams.set('access_type', 'offline');
  const forceConsent = url.searchParams.get('consent') === 'true';
  authUrl.searchParams.set('prompt', forceConsent ? 'consent' : 'select_account');
  authUrl.searchParams.set('state', encodeURIComponent(returnTarget));

  return NextResponse.redirect(authUrl.toString());
}
