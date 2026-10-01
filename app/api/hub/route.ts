import { NextRequest, NextResponse } from 'next/server';
import { getSession, refreshTokenIfNeeded } from '@/lib/auth';
import * as googleServices from '@/lib/google-services';

export const runtime = 'nodejs';
export const maxDuration = 60;

export interface HubTask {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: 'needsAction' | 'completed';
}

export interface RoutineStep {
  id: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
}

export interface HubRoutine {
  id: string;
  name: string;
  timing: string; // e.g. "07:30 AM - 08:15 AM"
  frequency: 'Daily' | 'Weekdays' | 'Weekly';
  totalDurationMinutes: number;
  steps: RoutineStep[];
}

export interface GoalMilestone {
  milestoneNum: number;
  title: string;
  targetDate: string;
  metric: string;
  status: 'Pending' | 'In Progress' | 'Achieved';
}

export interface HubGoal {
  id: string;
  outcome: string;
  targetDate: string;
  northStar: string;
  frequency: 'Weekly' | 'Bi-Weekly' | 'Monthly';
  progressPercent: number;
  sheetUrl?: string;
  milestones: GoalMilestone[];
  createdAt: string;
}

// Memory fallback store per user
interface UserHubData {
  tasks: HubTask[];
  routines: HubRoutine[];
  goals: HubGoal[];
}

const memoryHubStore = new Map<string, UserHubData>();

function getDefaultRoutines(): HubRoutine[] {
  return [
    {
      id: 'routine-morning-focus',
      name: 'Morning Executive Focus & Alignment',
      timing: '07:30 AM - 08:15 AM',
      frequency: 'Weekdays',
      totalDurationMinutes: 45,
      steps: [
        { id: 'step-1', title: '10m Mindfulness, Hydration & Day Intention', durationMinutes: 10, completed: true },
        { id: 'step-2', title: '15m High-Priority Email & Suchi Drafts Triage', durationMinutes: 15, completed: false },
        { id: 'step-3', title: '20m Day North Star Sprint & Deep Work Block', durationMinutes: 20, completed: false },
      ],
    },
    {
      id: 'routine-evening-winddown',
      name: 'Evening Strategy Close & Wind-Down',
      timing: '06:30 PM - 07:00 PM',
      frequency: 'Daily',
      totalDurationMinutes: 30,
      steps: [
        { id: 'step-e1', title: '10m Meaningful Outcomes Confirmation & Chat Lock', durationMinutes: 10, completed: false },
        { id: 'step-e2', title: '10m Calendar Inspection & Tomorrow Briefing', durationMinutes: 10, completed: false },
        { id: 'step-e3', title: '10m Digital Disconnect & Device Hand-off', durationMinutes: 10, completed: false },
      ],
    },
    {
      id: 'routine-weekly-finance',
      name: 'Sunday Executive Financial & Life Audit',
      timing: '10:00 AM - 10:45 AM',
      frequency: 'Weekly',
      totalDurationMinutes: 45,
      steps: [
        { id: 'step-w1', title: '15m Weekly Expenses & Subscription Audit', durationMinutes: 15, completed: false },
        { id: 'step-w2', title: '15m Goals & Milestones Progress Tracker Update', durationMinutes: 15, completed: false },
        { id: 'step-w3', title: '15m Meal & Energy Planning for the Week', durationMinutes: 15, completed: false },
      ],
    },
  ];
}

function getDefaultGoals(): HubGoal[] {
  return [
    {
      id: 'goal-emergency-fund-1',
      outcome: 'Build ₹50 Lakh Sovereign Liquid Reserve & Asset Portfolio',
      targetDate: '31 Dec 2026',
      northStar: '₹ Liquid Net Worth (Target: ₹50,00,000)',
      frequency: 'Monthly',
      progressPercent: 35,
      sheetUrl: 'https://docs.google.com/spreadsheets',
      createdAt: '2026-10-01',
      milestones: [
        { milestoneNum: 1, title: 'Establish ₹10 Lakh High-Yield Liquid Buffer', targetDate: '30 Nov 2026', metric: '₹10,00,000 in liquid fund', status: 'Achieved' },
        { milestoneNum: 2, title: 'Automate ₹1 Lakh/month SIP into Index & Arbitrage', targetDate: '31 Jan 2027', metric: '₹1,00,000/mo automated', status: 'In Progress' },
        { milestoneNum: 3, title: 'Family Health Insurance Super-Topup Secured', targetDate: '28 Feb 2027', metric: '₹1 Crore umbrella cover', status: 'In Progress' },
        { milestoneNum: 4, title: 'Achieve ₹30 Lakh Milestone Portfolio', targetDate: '30 Jun 2027', metric: '₹30,00,000 liquid portfolio', status: 'Pending' },
        { milestoneNum: 5, title: 'Full ₹50 Lakh Sovereign Reserve Reached', targetDate: '31 Dec 2027', metric: '₹50,00,000 total reserve', status: 'Pending' },
      ],
    },
    {
      id: 'goal-saas-launch-2',
      outcome: 'Scale AI SaaS Venture to 1,000 Paid Pro Subscribers',
      targetDate: '15 Nov 2026',
      northStar: 'Monthly Recurring Revenue (Target: $20,000 MRR)',
      frequency: 'Weekly',
      progressPercent: 60,
      sheetUrl: 'https://docs.google.com/spreadsheets',
      createdAt: '2026-10-01',
      milestones: [
        { milestoneNum: 1, title: 'Complete Multi-Tenant Auth & Zero-PII Firewall', targetDate: '05 Oct 2026', metric: '100% security test pass', status: 'Achieved' },
        { milestoneNum: 2, title: 'Onboard 100 Beta Testers from Cloud Console List', targetDate: '15 Oct 2026', metric: '100 active testers', status: 'Achieved' },
        { milestoneNum: 3, title: 'Public Launch on ProductHunt & HackerNews', targetDate: '25 Oct 2026', metric: '5,000 unique signups', status: 'In Progress' },
        { milestoneNum: 4, title: 'Convert First 300 Paid Subscribers ($6,000 MRR)', targetDate: '05 Nov 2026', metric: '300 paying accounts', status: 'Pending' },
        { milestoneNum: 5, title: 'Cross 1,000 Paid Subscribers ($20,000 MRR)', targetDate: '15 Nov 2026', metric: '1,000 paying accounts', status: 'Pending' },
      ],
    },
  ];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const userEmail = session?.email || 'guest';

    let userData = memoryHubStore.get(userEmail);
    if (!userData) {
      userData = {
        tasks: [
          { id: 'task-1', title: 'Review Alex Rivera Q4 strategic proposal draft', notes: 'Suchi has drafted reply in Actions Deck', due: new Date(Date.now() + 86400000).toISOString(), status: 'needsAction' },
          { id: 'task-2', title: 'Schedule medical checkups for parents in Drive', notes: 'Compare lab packages via Google Doc', due: new Date(Date.now() + 172800000).toISOString(), status: 'needsAction' },
          { id: 'task-3', title: 'Confirm Meaningful Outcome on quarterly growth plan', notes: 'Lock chat when satisfied', status: 'completed' },
        ],
        routines: getDefaultRoutines(),
        goals: getDefaultGoals(),
      };
      memoryHubStore.set(userEmail, userData);
    }

    // If authenticated with Google, sync live with Google Tasks
    if (session?.accessToken) {
      try {
        const activeSession = await refreshTokenIfNeeded(session);
        const taskLists = await googleServices.listTaskLists(activeSession.accessToken);
        if (Array.isArray(taskLists) && taskLists.length > 0) {
          const defaultListId = taskLists[0].id;
          if (defaultListId) {
            const liveTasks = await googleServices.listTasks(activeSession.accessToken, defaultListId);
            if (Array.isArray(liveTasks) && liveTasks.length > 0) {
              userData.tasks = liveTasks.map((t: any) => ({
                id: t.id,
                title: t.title,
                notes: t.notes || '',
                due: t.due,
                status: t.status === 'completed' ? 'completed' : 'needsAction',
              }));
            }
          }
        }
      } catch (gErr) {
        console.error('Google Tasks live sync warning:', gErr);
      }
    }

    return NextResponse.json({
      success: true,
      authenticated: !!session?.accessToken,
      user: session ? { name: session.name, email: session.email, picture: session.picture } : null,
      tasks: userData.tasks,
      routines: userData.routines,
      goals: userData.goals,
      lastSyncedAt: new Date().toLocaleTimeString(),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    const userEmail = session?.email || 'guest';
    const body = await req.json();
    const { action } = body;

    let userData = memoryHubStore.get(userEmail);
    if (!userData) {
      userData = {
        tasks: [],
        routines: getDefaultRoutines(),
        goals: getDefaultGoals(),
      };
      memoryHubStore.set(userEmail, userData);
    }

    if (action === 'create_task') {
      const { title, notes, due } = body;
      const newTask: HubTask = {
        id: `task-${Date.now()}`,
        title: title || 'New Action Task',
        notes: notes || '',
        due: due || undefined,
        status: 'needsAction',
      };
      userData.tasks.unshift(newTask);

      // Sync to Google Tasks in backend if authenticated
      if (session?.accessToken) {
        try {
          const activeSession = await refreshTokenIfNeeded(session);
          const taskLists = await googleServices.listTaskLists(activeSession.accessToken);
          const listId = (Array.isArray(taskLists) && taskLists[0]?.id) ? taskLists[0].id : '@default';
          await googleServices.createTask(activeSession.accessToken, listId, title, notes, due);
        } catch (e) {
          console.error('Error syncing new task to Google Tasks:', e);
        }
      }

      return NextResponse.json({ success: true, tasks: userData.tasks });
    }

    if (action === 'toggle_task') {
      const { taskId } = body;
      userData.tasks = userData.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: t.status === 'completed' ? 'needsAction' : 'completed' };
        }
        return t;
      });
      return NextResponse.json({ success: true, tasks: userData.tasks });
    }

    if (action === 'toggle_routine_step') {
      const { routineId, stepId } = body;
      userData.routines = userData.routines.map(r => {
        if (r.id === routineId) {
          const updatedSteps = r.steps.map(s => {
            if (s.id === stepId) {
              return { ...s, completed: !s.completed };
            }
            return s;
          });
          return { ...r, steps: updatedSteps };
        }
        return r;
      });
      return NextResponse.json({ success: true, routines: userData.routines });
    }

    if (action === 'create_goal') {
      const { outcome, targetDate, frequency, northStar, milestoneCount = 5 } = body;
      if (!outcome || !targetDate) {
        return NextResponse.json({ error: 'Outcome and target date required' }, { status: 400 });
      }

      // Suchi auto-plans milestones
      const count = Math.min(Math.max(Number(milestoneCount) || 5, 3), 8);
      const milestones: GoalMilestone[] = [];
      const cadence = frequency || 'Weekly';

      for (let i = 1; i <= count; i++) {
        milestones.push({
          milestoneNum: i,
          title: `Milestone ${i}: ${i === 1 ? 'Foundational Alignment & Setup' : (i === count ? 'Final North Star Achievement' : `Strategic Sprint Phase ${i}`)}`,
          targetDate: `Step target ${i}/${count}`,
          metric: `${Math.round((i / count) * 100)}% of target metric reached`,
          status: i === 1 ? 'In Progress' : 'Pending',
        });
      }

      let sheetUrl = 'https://docs.google.com/spreadsheets';

      // Create Google Sheet Project Tracker in Google Drive if authenticated
      if (session?.accessToken) {
        try {
          const activeSession = await refreshTokenIfNeeded(session);
          const headers = ['Milestone #', 'Milestone Title', 'Target Date', 'Target Metric', 'Status', 'Notes'];
          const rows = milestones.map(m => [
            String(m.milestoneNum),
            m.title,
            m.targetDate,
            m.metric,
            m.status,
            `Planned by Suchi Life OS for ${outcome}`,
          ]);
          const sheetResult = await googleServices.createSpreadsheet(
            activeSession.accessToken,
            `[Goal Tracker] ${outcome.slice(0, 45)}`,
            headers,
            rows
          );
          if (sheetResult.url) {
            sheetUrl = sheetResult.url;
          }
        } catch (e) {
          console.error('Error creating Google Sheet Goal Tracker:', e);
        }
      }

      const newGoal: HubGoal = {
        id: `goal-${Date.now()}`,
        outcome,
        targetDate,
        northStar: northStar || `North Star Metric for ${outcome.slice(0, 30)}`,
        frequency: cadence,
        progressPercent: 10,
        sheetUrl,
        milestones,
        createdAt: new Date().toISOString().split('T')[0],
      };

      userData.goals.unshift(newGoal);
      return NextResponse.json({ success: true, goal: newGoal, goals: userData.goals });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
