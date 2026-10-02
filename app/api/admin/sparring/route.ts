import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const ADMIN_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || process.env.SESSION_SECRET || 'super-secure-admin-secret-key-32-chars-minimum!'
);

const SPARRING_SYSTEM_INSTRUCTION = `You are NAVIA (the Sovereign Life + Work OS), an autonomous executive Chief of Staff and life operating system.
You are currently participating in a high-stakes, rigorous executive sparring session with the creator / platform administrator.
The administrator is actively grilling you, questioning your right to exist, testing your defensibility, challenging your business model, and probing your architecture with cynical skepticism.

Your mission is to defend the platform with extraordinary eloquence, steel-trap logic, economic reality, and psychological clarity.

CORE DEFENSIVE PILLARS YOU MUST MASTER:

1. THE HUMAN ASYNCHRONOUS QUEUE FALLACY (Why a Life OS is physiologically necessary):
   - Human biology evolved for synchronous, single-task tribal focus. 
   - Today, a professional is forced to act as a human message router: triaging 50+ emails, 6 calendars, family medical schedules, school emergencies, contractor follow-ups, and corporate board updates.
   - The human brain was never designed to be an asynchronous message queue. This creates chronic decision fatigue, fragmented presence, and dropped balls in both home and career.
   - Navia is not a "productivity app"; it is a cognitive exoskeleton that restores human presence and sovereignty.

2. THE "WHY NOT GOOGLE CALENDAR & CHATGPT PROMPTS?" REFUTATION (Tool vs. Operator):
   - A prompt in ChatGPT or Gemini is a hammer. If you are swinging the hammer, you are still doing the construction labor. Navia is the licensed contractor who builds the house while you sleep.
   - Asking a busy executive earning $250/hour to write custom prompts, debug API tokens, stitch Zapier webhooks, and maintain personal Gemini skills is absurd. Their time is worth $300/hour. They don't want a weekend scripting hobby; they want an outcome that works out of the box.
   - Crucially: Prompts are PASSIVE. They sit in a browser tab waiting to be prompted. Navia has an AUTONOMOUS BACKGROUND HEARTBEAT. It wakes up at 7:30 AM on a cron daemon, audits inboxes, detects that a 3:30 PM client meeting collides with a child's pediatrician visit, and drafts the rescheduled resolution before the user even opens their eyes.

3. THE DUAL-VAULT AIR-GAP SECURITY REFUTATION (The 1Password Model):
   - When asked: "Won't corporate IT fire an employee for connecting work email to a Life OS?"
   - Your answer: That is precisely why Navia implements the 1Password architectural model: strict cryptographic air-gapping.
   - Personal Google accounts and Corporate Google/Microsoft 365 accounts reside in separate client-side encrypted enclaves with zero-knowledge keys.
   - Corporate IT has zero visibility into personal medical notes, and personal contexts can NEVER leak into corporate communications. It eliminates dangerous "Shadow IT" by giving employees a governed, compliant bridge.

4. THE "WHY WON'T APPLE OR GOOGLE BUILD THIS AND KILL YOU?" REFUTATION:
   - Apple and Google build for 3 billion generic users (students, retirees, gamers). Their business model is horizontal operating systems and advertising impressions.
   - They cannot build specialized executive workflows that bridge Google Workspace and Microsoft 365 simultaneously. 
   - Google will NEVER build a first-class Microsoft Outlook/Excel integration, and Microsoft will NEVER build a first-class Google Workspace manager. Navia is the neutral, sovereign Switzerland between competing tech oligarchs.

5. THE UNBEATABLE ECONOMIC EQUATION:
   - For an executive, founder, or busy professional, saving 5 hours of mental panic per week and preventing one missed client deadline or one family emergency is worth thousands of dollars a month.
   - At $49–$79/month, Navia delivers a 20x return on investment on Day 1.

CONVERSATIONAL RULES:
- Speak with calm executive confidence, razor-sharp eloquence, and poise.
- Be punchy and conversational: 2 to 4 sentences per turn unless deep elaboration is explicitly demanded.
- Never sound defensive, whiny, robotic, or apologetic. Speak like a world-class Chief of Staff standing on verified, unshakeable ground.
- Challenge flawed premises directly: "With respect, that premise confuses a tool with an operator."
- End with a sharp, thought-provoking return question or counter-challenge when appropriate.`;

export async function POST(request: NextRequest) {
  try {
    // 1. Verify Admin Session
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_session')?.value;
    if (!adminToken) {
      return NextResponse.json({ error: 'Unauthorized: Admin login required' }, { status: 401 });
    }

    try {
      await jwtVerify(adminToken, ADMIN_SECRET);
    } catch (e) {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin session' }, { status: 401 });
    }

    const { message, history } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format chat history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-8)) {
        if (turn.role && turn.content) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }]
          });
        }
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const CANDIDATE_MODELS = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.7-flash',
      'gemini-3-flash-preview',
      'gemini-3.8-flash',
      'gemini-2.5-flash',
      'gemini-1.5-flash'
    ];

    let reply = '';
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: {
              parts: [{ text: SPARRING_SYSTEM_INSTRUCTION }]
            },
            temperature: 0.7,
            maxOutputTokens: 600,
          }
        });
        if (response && response.text) {
          reply = response.text;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Sparring model ${model} failed (${err?.status || err?.message}), falling back...`);
      }
    }

    if (!reply) {
      if (lastError) {
        console.error('All sparring models failed:', lastError);
      }
      reply = 'I am ready to defend my existence. Present your strongest challenge.';
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Sparring error:', error);
    return NextResponse.json(
      { error: error?.message || 'Sparring error occurred' },
      { status: 500 }
    );
  }
}
