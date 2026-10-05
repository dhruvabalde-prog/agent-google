import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllBugReports, saveBugReport, updateBugReportStatus } from '@/lib/db';

export interface BugReport {
  id: string;
  createdAt: string;
  userEmail: string;
  userName?: string;
  issueType: 'tool_failure' | 'wrong_answer' | 'infinite_loading' | 'auth_error' | 'ui_glitch' | 'other';
  summary: string;
  userDescription?: string;
  lastUserMessage?: string;
  lastAssistantResponse?: string;
  failedAction?: any;
  diagnostics: {
    userAgent: string;
    platform: string;
    screenSize: string;
    url: string;
    helpOptIn: boolean;
    systemStatus?: string;
  };
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED';
}

const memoryBugReports: BugReport[] = [];

export async function GET(request: NextRequest) {
  try {
    const dbReports = await getAllBugReports();
    const reports = dbReports.length > 0 ? dbReports : memoryBugReports;

    return NextResponse.json({
      success: true,
      reports: reports,
      totalCount: reports.length,
      openCount: reports.filter((r: any) => r.status === 'OPEN').length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const body = await request.json();

    const newReport: BugReport = {
      id: `bug-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      userEmail: session?.email || body.userEmail || 'anonymous@suchi.ai',
      userName: session?.name || body.userName || 'Anonymous User',
      issueType: body.issueType || 'other',
      summary: body.summary || 'User encountered an unexpected issue while using Suchi',
      userDescription: body.userDescription || '',
      lastUserMessage: body.lastUserMessage || '',
      lastAssistantResponse: body.lastAssistantResponse || '',
      failedAction: body.failedAction || null,
      diagnostics: {
        userAgent: body.diagnostics?.userAgent || 'Unknown Agent',
        platform: body.diagnostics?.platform || 'Unknown Platform',
        screenSize: body.diagnostics?.screenSize || 'Unknown Screen',
        url: body.diagnostics?.url || '/',
        helpOptIn: body.diagnostics?.helpOptIn ?? true,
        systemStatus: body.diagnostics?.systemStatus || 'Online',
      },
      status: 'OPEN',
    };

    await saveBugReport(newReport);
    memoryBugReports.unshift(newReport);

    return NextResponse.json({
      success: true,
      reportId: newReport.id,
      message: 'Bug report received successfully. Engineering has been notified.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, status } = body;

    if (status && ['OPEN', 'INVESTIGATING', 'RESOLVED'].includes(status)) {
      await updateBugReportStatus(reportId, status);
      const memReport = memoryBugReports.find(r => r.id === reportId);
      if (memReport) memReport.status = status;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
