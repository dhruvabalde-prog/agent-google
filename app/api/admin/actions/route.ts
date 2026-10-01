import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import {
  updateUserTier,
  deleteUser,
  saveSubscriptionTier,
  deleteSubscriptionTier,
  saveSkill,
  deleteSkill,
  toggleSkill,
  toggleDepartmentSkills,
  bulkImportSkillsFromMarkdown,
  addApiKey,
  deleteApiKey,
  logAdminAction,
} from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, payload } = body;

    switch (action) {
      // User Actions
      case 'UPDATE_USER_TIER':
        await updateUserTier(payload.email, payload.tier, payload.role);
        await logAdminAction(session.email, 'UPDATE_USER_TIER', payload.email, `Tier changed to ${payload.tier}`);
        return NextResponse.json({ success: true });

      case 'DELETE_USER':
        await deleteUser(payload.email);
        await logAdminAction(session.email, 'DELETE_USER', payload.email, 'Deleted user');
        return NextResponse.json({ success: true });

      // Subscription Tier Actions
      case 'SAVE_TIER':
        await saveSubscriptionTier({
          id: payload.id,
          name: payload.name,
          description: payload.description || '',
          dailyTokenLimit: Number(payload.dailyTokenLimit) || 50000,
        });
        await logAdminAction(session.email, 'SAVE_TIER', payload.id, `Saved tier ${payload.name}`);
        return NextResponse.json({ success: true });

      case 'DELETE_TIER':
        await deleteSubscriptionTier(payload.tierId);
        await logAdminAction(session.email, 'DELETE_TIER', payload.tierId, 'Deleted subscription tier');
        return NextResponse.json({ success: true });

      // Skill Actions
      case 'SAVE_SKILL':
        await saveSkill({
          id: payload.id,
          name: payload.name,
          department: payload.department,
          description: payload.description || '',
          enabled: payload.enabled !== false,
          allowedTiers: payload.allowedTiers || ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'],
        });
        await logAdminAction(session.email, 'SAVE_SKILL', payload.id, `Saved skill ${payload.name}`);
        return NextResponse.json({ success: true });

      case 'DELETE_SKILL':
        await deleteSkill(payload.skillId);
        await logAdminAction(session.email, 'DELETE_SKILL', payload.skillId, 'Deleted skill');
        return NextResponse.json({ success: true });

      case 'TOGGLE_SKILL':
        await toggleSkill(payload.skillId, payload.enabled);
        await logAdminAction(session.email, 'TOGGLE_SKILL', payload.skillId, `Enabled: ${payload.enabled}`);
        return NextResponse.json({ success: true });

      case 'TOGGLE_DEPARTMENT':
        await toggleDepartmentSkills(payload.department, payload.enabled);
        await logAdminAction(session.email, 'TOGGLE_DEPARTMENT', payload.department, `Department enabled: ${payload.enabled}`);
        return NextResponse.json({ success: true });

      case 'BULK_IMPORT_SKILLS':
        const res = await bulkImportSkillsFromMarkdown(payload.markdownContent, payload.mode || 'merge');
        await logAdminAction(session.email, 'BULK_IMPORT_SKILLS', `${res.importedCount} skills`, `Mode: ${payload.mode}`);
        return NextResponse.json({ success: true, count: res.importedCount });

      // API Key Pool Actions
      case 'ADD_API_KEY':
        const newKey = await addApiKey(payload.provider, payload.key, payload.tier || 'ALL');
        await logAdminAction(session.email, 'ADD_API_KEY', payload.provider, `Added key for tier ${payload.tier}`);
        return NextResponse.json({ success: true, key: newKey });

      case 'DELETE_API_KEY':
        await deleteApiKey(payload.keyId);
        await logAdminAction(session.email, 'DELETE_API_KEY', payload.keyId, 'Deleted API key from pool');
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
