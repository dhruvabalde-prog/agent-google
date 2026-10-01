import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChatsByUser, saveChat } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chats = await getChatsByUser(session.email);
  return NextResponse.json({ chats });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const chat = {
    id: body.id || crypto.randomUUID(),
    user_email: session.email,
    title: body.title || 'New Conversation',
    meaningful_outcome: body.meaningful_outcome || null,
    outcome_status: body.outcome_status || 'NONE',
    is_locked: body.is_locked || false,
    is_starred: body.is_starred || false,
    is_incognito: body.is_incognito || false,
    markdown_content: body.markdown_content || '',
    message_count: body.message_count || 0,
    duration: body.duration || '1m',
    has_files: body.has_files || false,
    has_voice: body.has_voice || false,
  };

  const saved = await saveChat(chat);
  return NextResponse.json({ chat: saved });
}
