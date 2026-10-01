import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSession, refreshTokenIfNeeded, encryptSession } from '@/lib/auth';
import { functionDeclarations, executeFunction } from '@/lib/tools';
import { ChatMessage, ActionResult, DraftInfo } from '@/lib/types';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = 'You are Agent Google, an AI assistant that helps users manage their Google Workspace. You can search the internet, create and edit Google Docs, Sheets, and Slides, manage Google Tasks and Calendar events, and read and draft Gmail replies. When the user asks you to do something, use the available tools. Be concise and helpful. When drafting email replies, always use the draft_reply tool so the user can approve before sending. Format your responses in markdown when appropriate. When you create or modify content, always confirm what you did and provide links when available.';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const { messages } = await request.json() as { messages: { role: 'user' | 'assistant', content: string }[] };
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const convertedMessages = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    let response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: convertedMessages,
      config: {
        tools: [{ googleSearch: {} }, { functionDeclarations }],
        systemInstruction: SYSTEM_PROMPT
      }
    });

    let actions: ActionResult[] = [];
    let pendingDraft: DraftInfo | undefined;
    let loopCount = 0;
    const MAX_LOOPS = 10;
    
    let currentContents: any[] = [...convertedMessages];

    while (response.functionCalls && response.functionCalls.length > 0 && loopCount < MAX_LOOPS) {
      loopCount++;
      const functionResponses = [];
      
      for (const fc of response.functionCalls) {
        const result = await executeFunction(fc.name!, fc.args as Record<string, any>, refreshedSession.accessToken);
        actions.push(result.action);
        if (result.draft) pendingDraft = result.draft;
        functionResponses.push({
          name: fc.name,
          response: result.data
        });
      }
      
      currentContents = [
        ...currentContents,
        { 
          role: 'model', 
          parts: response.functionCalls.map(fc => ({ functionCall: { name: fc.name!, args: fc.args } })) 
        },
        { 
          role: 'user', 
          parts: functionResponses.map(fr => ({ functionResponse: fr })) 
        }
      ];
      
      response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: currentContents,
        config: {
          tools: [{ googleSearch: {} }, { functionDeclarations }],
          systemInstruction: SYSTEM_PROMPT
        }
      });
    }

    return NextResponse.json({
      content: response.text || '',
      actions,
      pendingDraft
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
