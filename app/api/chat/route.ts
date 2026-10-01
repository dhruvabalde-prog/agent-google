import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getSession, refreshTokenIfNeeded, encryptSession } from '@/lib/auth';
import { functionDeclarations, executeFunction } from '@/lib/tools';
import { ActionResult, DraftInfo } from '@/lib/types';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const maxDuration = 60;

const SYSTEM_PROMPT = `You are Agent Google, a high-efficiency autonomous AI assistant for Google Workspace.

CRITICAL RULES:

1. TOKEN EFFICIENCY & CONCISE CHAT REPLIES:
- Keep your chat responses extremely short and direct (1-3 sentences).
- Do NOT output huge walls of text, regurgitate user prompts, or recite lengthy explanations.
- Never write filler intros like "Sure, I can help with that!" or "Here is what I found...".
- When creating Docs, Sheets, or Slides, confirm what was created with its direct link. Do NOT dump the whole document text into the chat.

2. AUTHENTIC, HUMAN-GRADE CONTENT (NO ROBOTIC AI CLICHES):
- When generating content for Google Docs or Google Slides:
  * Write like a seasoned human professional.
  * NEVER use robotic AI tropes ("In today's fast-paced world", "delve into", "a testament to", "crucial aspect", "in conclusion", "it is important to remember").
  * Use natural, punchy, insightful phrasing with actual substance and clean structure.
  * For Slides: Provide a compelling title and 3-4 structured, bullet points per slide. Never create blank or empty slides.

3. ERROR TRANSPARENCY (ZERO MASKING):
- If ANY tool fails, encounters an API error, or returns { error }, DO NOT mask, gloss over, or pretend it worked.
- Report the exact error message and tool name directly in your chat response so the user has 100% visibility.

4. WORKSPACE TOOLS:
- Web Search: Use search_internet for live web research and current data.
- Docs/Sheets/Slides: Call appropriate tools and return clickable links.
- Gmail: ALWAYS use draft_reply so the user can review and approve before sending.`;

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
          id: fc.id,
          name: fc.name,
          response: result.data,
        });
      }
      
      // Critical for Gemini Thinking models: preserve the exact model content with thoughtSignature
      const modelContent = response.candidates?.[0]?.content;
      
      currentContents = [
        ...currentContents,
        modelContent || { 
          role: 'model', 
          parts: response.functionCalls.map(fc => ({ functionCall: { id: fc.id, name: fc.name!, args: fc.args } })), 
        },
        { 
          role: 'user', 
          parts: functionResponses.map(fr => ({ functionResponse: fr })), 
        },
      ];
      
      response = await callGemini(ai, currentContents);
    }

    // Extract text, excluding thought parts for clean presentation
    let finalText = response.text || '';
    if (!finalText && response.candidates?.[0]?.content?.parts) {
      finalText = response.candidates[0].content.parts
        .filter((p: any) => p.text && !p.thought)
        .map((p: any) => p.text)
        .join('');
    }

    return NextResponse.json({
      content: finalText,
      actions,
      pendingDraft,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
