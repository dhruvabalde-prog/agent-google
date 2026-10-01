import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import * as googleServices from '@/lib/google-services';

export async function POST(
  request: NextRequest,
  { params }: { params: { draftId: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { draftId } = params;
    const res = await googleServices.sendDraft(session.accessToken, draftId);
    
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: res.messageId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
