import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChatById, saveChat } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await getChatById(params.chatId);
  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const { markdownContent } = await request.json();
  chat.is_locked = true;
  chat.outcome_status = 'LOCKED';
  if (markdownContent) {
    chat.markdown_content = markdownContent;
  }

  const saved = await saveChat(chat);
  return NextResponse.json({ chat: saved });
}
