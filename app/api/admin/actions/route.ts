import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import { updateUserTier, toggleSkill, toggleDepartmentSkills, addApiKey, logAdminAction } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      case 'UPDATE_USER_TIER':
        await updateUserTier(payload.email, payload.tier, payload.role);
        await logAdminAction(session.email, 'UPDATE_USER_TIER', payload.email, `Tier changed to ${payload.tier}`);
        return NextResponse.json({ success: true });

      case 'TOGGLE_SKILL':
        await toggleSkill(payload.skillId, payload.enabled);
        await logAdminAction(session.email, 'TOGGLE_SKILL', payload.skillId, `Enabled: ${payload.enabled}`);
        return NextResponse.json({ success: true });

      case 'TOGGLE_DEPARTMENT':
        await toggleDepartmentSkills(payload.department, payload.enabled);
        await logAdminAction(session.email, 'TOGGLE_DEPARTMENT', payload.department, `Enabled: ${payload.enabled}`);
        return NextResponse.json({ success: true });

      case 'ADD_API_KEY':
        const newKey = await addApiKey(payload.provider, payload.key, payload.tier || 'ALL');
        await logAdminAction(session.email, 'ADD_API_KEY', payload.provider, `Added key for tier ${payload.tier}`);
        return NextResponse.json({ success: true, key: newKey });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
