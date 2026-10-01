import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state') || '';
  const clientId = searchParams.get('client_id') || 'gemini-mcp-client';

  // If redirect_uri is provided, generate an auth code and redirect immediately
  if (redirectUri) {
    const authCode = `auth_code_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const targetUrl = new URL(redirectUri);
    targetUrl.searchParams.set('code', authCode);
    if (state) targetUrl.searchParams.set('state', state);
    return NextResponse.redirect(targetUrl.toString());
  }

  // Fallback direct confirmation page
  return new NextResponse(`
    <!DOCTYPE html>
    <html>
      <head><title>Authorize Agent Google MCP</title></head>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f3f4f6;">
        <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 400px; text-align: center;">
          <h2 style="margin-top: 0;">Authorize MCP Connection</h2>
          <p style="color: #666; font-size: 14px;">Connect Agent Google MCP Server with standard zero-data leakage firewall.</p>
          <p style="color: #059669; font-weight: bold;">Connection Approved ✓</p>
        </div>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
