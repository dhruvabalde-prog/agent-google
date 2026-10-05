import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUri = `${url.origin}/api/auth/callback`;
  const toolsParam = url.searchParams.get('tools');

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
  authUrl.searchParams.set('prompt', 'consent');

  return NextResponse.redirect(authUrl.toString());
}
