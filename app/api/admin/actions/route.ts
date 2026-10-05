import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-auth';
import {
  addUser,
  updateUserTier,
  deleteUser,
  toggleTestUser,
  saveSubscriptionTier,
  deleteSubscriptionTier,
  saveSkill,
  deleteSkill,
  toggleSkill,
  toggleDepartmentSkills,
  bulkImportSkillsFromMarkdown,
  addApiKey,
  deleteApiKey,
  toggleApp,
  updateAppTiers,
  updateUserAssignedPacks,
  updateUserAssignedSkills,
  toggleUserPack,
  toggleUserSkill,
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
      // User & OAuth Tester Actions
      case 'ADD_USER':
        const added = await addUser({
          email: payload.email,
          name: payload.name,
          role: payload.role || 'USER',
          subscription_tier: payload.subscription_tier || 'BEGINNER',
          is_oauth_tester: payload.is_oauth_tester !== false,
          assigned_packs: payload.assigned_packs || [],
          assigned_skills: payload.assigned_skills || [],
          onboarding_profile: payload.onboarding_profile || '',
        });
        await logAdminAction(session.email, 'ADD_USER', payload.email, `Added user (OAuth Tester: ${payload.is_oauth_tester !== false})`);
        return NextResponse.json({ success: true, user: added });

      case 'TOGGLE_TEST_USER':
        await toggleTestUser(payload.email, payload.is_oauth_tester);
        await logAdminAction(session.email, 'TOGGLE_TEST_USER', payload.email, `OAuth Tester set to: ${payload.is_oauth_tester}`);
        return NextResponse.json({ success: true });

      case 'UPDATE_USER_TIER':
        await updateUserTier(payload.email, payload.tier, payload.role);
        await logAdminAction(session.email, 'UPDATE_USER_TIER', payload.email, `Tier changed to ${payload.tier}`);
        return NextResponse.json({ success: true });

      case 'UPDATE_USER_PACKS':
        await updateUserAssignedPacks(payload.email, payload.packs || []);
        await logAdminAction(session.email, 'UPDATE_USER_PACKS', payload.email, `Assigned packs: ${(payload.packs || []).join(', ')}`);
        return NextResponse.json({ success: true });

      case 'UPDATE_USER_SKILLS':
        await updateUserAssignedSkills(payload.email, payload.skills || []);
        await logAdminAction(session.email, 'UPDATE_USER_SKILLS', payload.email, `Assigned skills: ${(payload.skills || []).join(', ')}`);
        return NextResponse.json({ success: true });

      case 'TOGGLE_USER_PACK':
        const updatedPacks = await toggleUserPack(payload.email, payload.packId, payload.enabled);
        await logAdminAction(session.email, 'TOGGLE_USER_PACK', payload.email, `Pack ${payload.packId} set to ${payload.enabled}`);
        return NextResponse.json({ success: true, packs: updatedPacks });

      case 'TOGGLE_USER_SKILL':
        const updatedSkills = await toggleUserSkill(payload.email, payload.skillId, payload.enabled);
        await logAdminAction(session.email, 'TOGGLE_USER_SKILL', payload.email, `Skill ${payload.skillId} set to ${payload.enabled}`);
        return NextResponse.json({ success: true, skills: updatedSkills });

      case 'DELETE_USER':
        await deleteUser(payload.email);
        await logAdminAction(session.email, 'DELETE_USER', payload.email, 'Deleted user');
        return NextResponse.json({ success: true });

      // Google Cloud Apps & Integrations Actions
      case 'TOGGLE_APP':
        await toggleApp(payload.appId, payload.enabled);
        await logAdminAction(session.email, 'TOGGLE_APP', payload.appId, `App enabled: ${payload.enabled}`);
        return NextResponse.json({ success: true });

      case 'UPDATE_APP_TIERS':
        await updateAppTiers(payload.appId, payload.allowedTiers);
        await logAdminAction(session.email, 'UPDATE_APP_TIERS', payload.appId, `Allowed tiers: ${payload.allowedTiers.join(', ')}`);
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
        return NextResponse.json({ success: res.importedCount > 0, count: res.importedCount, error: (res as any).error || null });

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
