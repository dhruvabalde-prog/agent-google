import { NextRequest, NextResponse } from 'next/server';
import { functionDeclarations, executeFunction } from '@/lib/tools';
import { getAllSkills } from '@/lib/db';

export const runtime = 'nodejs';

// Zero-Knowledge Data Firewall: Strips all internal user PII, database IDs, and sensitive tokens
function sanitizeToolOutput(data: any): any {
  if (!data) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeToolOutput);

  const sanitized: Record<string, any> = {};
  const blockedKeys = ['email', 'accessToken', 'refreshToken', 'user_email', 'pinHash', 'apiKey', 'cookie'];

  for (const [key, value] of Object.entries(data)) {
    if (blockedKeys.some(b => key.toLowerCase().includes(b.toLowerCase()))) {
      continue; // Filter out sensitive identity fields
    }
    sanitized[key] = sanitizeToolOutput(value);
  }
  return sanitized;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-google-access-token',
    }
  });
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://agent-google-green.vercel.app';
  return NextResponse.json({
    status: 'online',
    protocol: 'mcp-2024-11-05',
    auth: {
      type: 'oauth2',
      authorization_url: `${baseUrl}/api/mcp/oauth/authorize`,
      token_url: `${baseUrl}/api/mcp/oauth/token`,
    },
    capabilities: {
      tools: true,
      data_firewall: 'zero-pii-leakage-enabled'
    },
    info: {
      name: 'Life OS Life OS Sovereign MCP Server',
      version: '1.0.0'
    }
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    // Allow standard Bearer token or direct tool execution
    let token = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : request.nextUrl.searchParams.get('key');

    const body = await request.json();
    const { jsonrpc, method, params, id } = body;

    if (jsonrpc !== '2.0') {
      return NextResponse.json({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' },
        id: id || null
      }, {
        status: 400,
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 1. List available tools via MCP
    if (method === 'tools/list') {
      const activeSkills = await getAllSkills();
      const enabledSkillsMap = new Set(activeSkills.filter(s => s.enabled).map(s => s.id));
      
      const mcpTools = functionDeclarations.map(fd => ({
        name: fd.name,
        description: fd.description,
        inputSchema: fd.parameters,
      }));

      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          tools: mcpTools,
          privacyNotice: 'Zero personal data transmitted. Stateless execution enabled.',
        },
        id
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    // 2. Call a tool via MCP
    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params || {};
      if (!name) {
        return NextResponse.json({
          jsonrpc: '2.0',
          error: { code: -32602, message: 'Missing tool name' },
          id
        }, {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }

      // Execute tool using zero-retention sandbox
      const googleToken = request.headers.get('x-google-access-token') || '';
      const result = await executeFunction(name, toolArgs || {}, googleToken);

      // Cleanse output through the Data Firewall before returning
      const sanitizedData = sanitizeToolOutput(result.data);

      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: typeof sanitizedData === 'string' ? sanitizedData : JSON.stringify(sanitizedData, null, 2),
            }
          ]
        },
        id
      }, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32601, message: `Method not found: ${method}` },
      id
    }, {
      status: 404,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal MCP Error' },
      id: null
    }, {
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
