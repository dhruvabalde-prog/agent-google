import { NextRequest, NextResponse } from 'next/server';
import { functionDeclarations, executeFunction } from '@/lib/tools';
import { getAllSkills } from '@/lib/db';

export const runtime = 'nodejs';

// MCP JSON-RPC 2.0 handler
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    // Basic API Key check
    const apiKey = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : request.nextUrl.searchParams.get('key');
    if (!apiKey) {
      return NextResponse.json({
        jsonrpc: '2.0',
        error: { code: -32001, message: 'Unauthorized: API key required' },
        id: null
      }, { status: 401 });
    }

    const body = await request.json();
    const { jsonrpc, method, params, id } = body;

    if (jsonrpc !== '2.0') {
      return NextResponse.json({
        jsonrpc: '2.0',
        error: { code: -32600, message: 'Invalid Request: jsonrpc must be 2.0' },
        id: id || null
      }, { status: 400 });
    }

    // List available tools via MCP
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
        result: { tools: mcpTools },
        id
      });
    }

    // Call a tool via MCP
    if (method === 'tools/call') {
      const { name, arguments: toolArgs } = params || {};
      if (!name) {
        return NextResponse.json({
          jsonrpc: '2.0',
          error: { code: -32602, message: 'Missing tool name' },
          id
        }, { status: 400 });
      }

      // Execute tool using server access token if provided in header
      const googleToken = request.headers.get('x-google-access-token') || '';
      const result = await executeFunction(name, toolArgs || {}, googleToken);

      return NextResponse.json({
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result.data, null, 2),
            }
          ]
        },
        id
      });
    }

    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32601, message: `Method not found: ${method}` },
      id
    }, { status: 404 });

  } catch (error: any) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: { code: -32603, message: 'Internal MCP Error' },
      id: null
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    protocol: 'mcp-2024-11-05',
    capabilities: {
      tools: true
    },
    info: {
      name: 'Agent Google MCP Server',
      version: '1.0.0'
    }
  });
}
