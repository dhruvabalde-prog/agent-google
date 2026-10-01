import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Generate valid OAuth2 Bearer token
  const token = `mcp_token_${Date.now()}_${Math.random().toString(36).substring(2, 12)}`;
  
  return NextResponse.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 30 * 24 * 60 * 60, // 30 days
    scope: 'mcp:tools',
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
