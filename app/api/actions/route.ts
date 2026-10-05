import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export interface ServerActionCard {
  id: string;
  type: 'draft_reply' | 'document' | 'presentation' | 'spreadsheet' | 'calendar' | 'tasks' | 'image' | 'form' | 'notebook' | 'playlist' | 'places_list';
  title: string;
  subtitle: string;
  description: string;
  timestamp: string;
  status: 'NEEDS_APPROVAL' | 'COMPLETED' | 'IN_PROGRESS';
  priority?: 'HIGH' | 'NORMAL';
  link?: string;
  details?: {
    to?: string;
    subject?: string;
    draftBody?: string;
    draftId?: string;
    itemCount?: number;
    previewUrl?: string;
    prompt?: string;
    aspectRatio?: string;
  };
  options?: Array<{
    id: string;
    label: string;
    variant: 'primary' | 'secondary' | 'danger' | 'success';
    action: 'approve_draft' | 'reject_draft' | 'open_link' | 'mark_reviewed' | 'next';
  }>;
}

// In-memory persistent action store for the current runtime
const INITIAL_ACTION_CARDS: ServerActionCard[] = [
  {
    id: 'act-gmail-draft-1',
    type: 'draft_reply',
    title: 'Gmail Reply Drafted: Q4 Roadmap & Strategic Deliverables',
    subtitle: 'Email received from Alex Rivera (VP Product) • 12m ago',
    description: 'Alex requested the updated timeline for Q4 deliverables and presentation deck. Life OS analyzed your calendar, notes, and Drive files, and drafted a reply ready for your approval.',
    timestamp: 'While you were away • 12m ago',
    status: 'NEEDS_APPROVAL',
    priority: 'HIGH',
    details: {
      to: 'alex.rivera@acme.corp',
      subject: 'Re: Q4 Roadmap & Strategic Deliverables Review',
      draftId: 'r-draft-q4-alex',
      draftBody: 'Hi Alex,\n\nI have reviewed our quarterly milestones and cross-referenced with team velocity. The 5-slide strategic summary is complete and attached below. Let us convene tomorrow at 3:30 PM to finalize resource allocation.\n\nBest regards,\nSuchi Executive Office',
    },
    options: [
      { id: 'opt-approve', label: 'Approve & Send via Gmail', variant: 'success', action: 'approve_draft' },
      { id: 'opt-reject', label: 'Discard Draft', variant: 'danger', action: 'reject_draft' },
    ],
  },
  {
    id: 'act-slides-presentation-1',
    type: 'presentation',
    title: 'Presentation Created: 5-Slide Executive Strategy Deck',
    subtitle: 'Google Slides generated while you were away',
    description: 'Formatted with executive highlights, revenue targets, risk mitigation frameworks, and milestone tracking. One clean main link ready for your review.',
    timestamp: 'While you were away • 28m ago',
    status: 'COMPLETED',
    priority: 'HIGH',
    link: 'https://docs.google.com/presentation',
    options: [
      { id: 'opt-open', label: 'Open Presentation ↗', variant: 'primary', action: 'open_link' },
      { id: 'opt-done', label: 'Mark as Reviewed', variant: 'secondary', action: 'mark_reviewed' },
    ],
  },
  {
    id: 'act-doc-insurance-1',
    type: 'document',
    title: 'Document Created: Family Health Insurance Policy Audit',
    subtitle: 'Google Doc generated with 6 verified benchmarks',
    description: 'Comprehensive research comparing pre-existing condition clauses, claim settlement ratios, restoration benefits, and premium optimization for parents.',
    timestamp: 'While you were away • 45m ago',
    status: 'COMPLETED',
    link: 'https://docs.google.com/document',
    options: [
      { id: 'opt-open-doc', label: 'Open Google Doc ↗', variant: 'primary', action: 'open_link' },
      { id: 'opt-done-doc', label: 'Next Action', variant: 'secondary', action: 'mark_reviewed' },
    ],
  },
  {
    id: 'act-maps-list-1',
    type: 'places_list',
    title: 'Google Maps Guide: Top Quiet Executive Workspaces & Eateries',
    subtitle: 'Curated 8 locations with fast Wi-Fi & quiet corners',
    description: 'Location guide created with ratings, peak hours, parking availability, and direct navigation links for high-focus work sessions.',
    timestamp: 'While you were away • 1h ago',
    status: 'COMPLETED',
    link: 'https://maps.google.com',
    options: [
      { id: 'opt-view-maps', label: 'View in Google Maps ↗', variant: 'primary', action: 'open_link' },
      { id: 'opt-next-maps', label: 'Mark Reviewed', variant: 'secondary', action: 'mark_reviewed' },
    ],
  },
  {
    id: 'act-yt-playlist-1',
    type: 'playlist',
    title: 'YouTube Music Playlist: Deep Work Ambient Flow',
    subtitle: '35 tracks curated for flow-state concentration',
    description: 'Binaural beats, neoclassical piano, and ambient electronica with zero vocal distraction to maximize deep work throughput.',
    timestamp: 'While you were away • 2h ago',
    status: 'COMPLETED',
    link: 'https://music.youtube.com',
    options: [
      { id: 'opt-play-yt', label: 'Play on YouTube Music ↗', variant: 'primary', action: 'open_link' },
      { id: 'opt-next-yt', label: 'Done', variant: 'secondary', action: 'mark_reviewed' },
    ],
  },
];

let globalActions: ServerActionCard[] = [...INITIAL_ACTION_CARDS];

export async function GET(req: NextRequest) {
  return NextResponse.json({
    success: true,
    actions: globalActions,
    unreadCount: globalActions.filter(a => a.status === 'NEEDS_APPROVAL').length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (body.action === 'resolve' && body.cardId) {
      globalActions = globalActions.map(a => a.id === body.cardId ? { ...a, status: 'COMPLETED' } : a);
      return NextResponse.json({ success: true, actions: globalActions });
    }
    if (body.action === 'add' && body.card) {
      globalActions = [body.card, ...globalActions];
      return NextResponse.json({ success: true, actions: globalActions });
    }
    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
