import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getChatById, getMessagesByChatId, deleteChat } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await getChatById(params.chatId);
  if (!chat) {
    return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
  }

  const messages = await getMessagesByChatId(params.chatId);
  return NextResponse.json({ chat, messages });
}

export async function DELETE(request: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await deleteChat(params.chatId);
  return NextResponse.json({ success: true });
}
