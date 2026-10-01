import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSession, refreshTokenIfNeeded, encryptSession } from '@/lib/auth';
import { functionDeclarations, executeFunction } from '@/lib/tools';
import { ActionResult, DraftInfo } from '@/lib/types';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are Agent Google, an expert AI assistant that helps users manage their Google Workspace and daily productivity.
You have tools to:
- Search the internet for real-time information, news, websites, and research using search_internet.
- Create, read, update, list, and delete Google Docs, Spreadsheets, and Slides.
- Manage Google Tasks and create notes in Google Tasks.
- Query, create, update, and delete Google Calendar events.
- Read Gmail messages, list emails, and create draft replies.
When drafting email replies, ALWAYS use the draft_reply tool so the user can review and approve before sending.
Format responses in clean Markdown with clickable links when available. Be proactive, concise, and helpful.`;

const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.7-flash',
  'gemini-3-flash-preview',
  'gemini-3.8-flash',
];

async function callGemini(ai: GoogleGenAI, contents: any[]) {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          tools: [{ functionDeclarations }],
          systemInstruction: SYSTEM_PROMPT,
        },
      });
      return response;
    } catch (err: any) {
      console.warn(`Model ${model} failed (${err?.status || err?.message}), trying next...`);
      lastError = err;
    }
  }
  throw lastError || new Error('All Gemini model candidates failed to respond.');
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Please sign in with Google to chat with Agent Google.' }, { status: 401 });
    }

    const refreshedSession = await refreshTokenIfNeeded(session);
    
    if (refreshedSession.accessToken !== session.accessToken) {
      const encryptedSession = await encryptSession(refreshedSession);
      (await cookies()).set('session', encryptedSession, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    const { messages } = (await request.json()) as { messages: { role: 'user' | 'assistant'; content: string }[] };
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const convertedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    let actions: ActionResult[] = [];
    let pendingDraft: DraftInfo | undefined;
    let loopCount = 0;
    const MAX_LOOPS = 10;
    
    let currentContents: any[] = [...convertedMessages];

    let response = await callGemini(ai, currentContents);

    while (response.functionCalls && response.functionCalls.length > 0 && loopCount < MAX_LOOPS) {
      loopCount++;
      const functionResponses = [];
      
      for (const fc of response.functionCalls) {
        const result = await executeFunction(fc.name!, (fc.args || {}) as Record<string, any>, refreshedSession.accessToken);
        actions.push(result.action);
        if (result.draft) {
          pendingDraft = result.draft;
        }
        functionResponses.push({
          name: fc.name,
          response: result.data,
        });
      }
      
      currentContents = [
        ...currentContents,
        { 
          role: 'model', 
          parts: response.functionCalls.map(fc => ({ functionCall: { name: fc.name!, args: fc.args } })), 
        },
        { 
          role: 'user', 
          parts: functionResponses.map(fr => ({ functionResponse: fr })), 
        },
      ];
      
      response = await callGemini(ai, currentContents);
    }

    return NextResponse.json({
      content: response.text || '',
      actions,
      pendingDraft,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
