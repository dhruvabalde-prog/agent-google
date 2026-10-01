import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { generateSuchiImage } from '@/lib/google-services';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, aspectRatio } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const result = await generateSuchiImage(prompt, aspectRatio || '1:1');
    if ((result as any).error) {
      return NextResponse.json({ error: (result as any).error }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Image generation failed' }, { status: 500 });
  }
}
