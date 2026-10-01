# Agent Google

AI-powered Google Workspace assistant built with Next.js, Gemini 2.0 Flash, and Google APIs.

## Features

- 🔍 **Internet Research** — Gemini Google Search grounding
- 📄 **Google Docs** — Create, read, edit, delete documents
- 📊 **Google Sheets** — Create, read, update spreadsheets
- 📽️ **Google Slides** — Create presentations, add slides
- ✅ **Google Tasks** — Full CRUD on task lists and tasks
- 📅 **Google Calendar** — List, create, update, delete events
- 📧 **Gmail** — Read emails, draft replies (with user approval before sending)
- 📝 **Notes** — Create notes via Google Tasks

## Setup

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd agent-google
npm install
```

### 2. Google Cloud Console

1. Create a project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable these APIs:
   - Google Docs API
   - Google Sheets API
   - Google Slides API
   - Google Drive API
   - Google Tasks API
   - Google Calendar API
   - Gmail API
3. Create OAuth 2.0 credentials (Web application)
4. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `https://your-app.vercel.app`
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-app.vercel.app/api/auth/callback`

### 3. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GEMINI_API_KEY=your_gemini_api_key
SESSION_SECRET=<64-char-hex-string>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Generate SESSION_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

1. Push to GitHub
2. Import in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GEMINI_API_KEY`
   - `SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL` → your Vercel URL
4. Update Google Cloud Console redirect URIs with your Vercel domain

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **@google/genai** (Gemini 2.0 Flash with function calling + Google Search)
- **googleapis** (Google Workspace APIs)
- **jose** (JWE session encryption)
