import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { toggleChatStar } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { chatId: string } }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const isStarred = await toggleChatStar(params.chatId);
  return NextResponse.json({ is_starred: isStarred });
}
