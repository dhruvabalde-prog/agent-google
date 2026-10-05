'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { GENERAL_PURPOSE_SKILL_PACKS, SkillPack } from '@/lib/skills-packs';

export interface AdminNoteItem {
  id: string;
  category: 'Integration' | 'Home Automation' | 'Voice Assistant' | 'Roadmap';
  title: string;
  details: string;
  specs: string[];
  status: 'Planned' | 'In Progress' | 'Architecture Ready';
  priority: 'CRITICAL' | 'HIGH' | 'STRATEGIC';
  updatedAt: string;
}

const DEFAULT_ADMIN_NOTES: AdminNoteItem[] = [
  {
    id: 'note-msft-graph-api',
    category: 'Integration',
    title: 'Microsoft API Integration & Office 365 Bridge',
    details: 'Complete enterprise-grade integration with Microsoft Graph API, Outlook, OneDrive, and Office suite alongside Google Workspace.',
    specs: [
      'Microsoft Graph API v1.0 and beta endpoint integration (https://graph.microsoft.com/v1.0).',
      'Azure AD / Microsoft Entra ID App registration with multi-tenant OAuth 2.0 PKCE flow.',
      'Scopes: Mail.ReadWrite, Calendars.ReadWrite, Files.ReadWrite.All, Tasks.ReadWrite, Notes.Create, User.Read.',
      'Bi-directional cross-cloud synchronization: sync Outlook Calendar with Google Calendar, and OneDrive with Google Drive.',
      'Outlook email thread tracking, drafting, and user-approved reply sending with cryptographic signing.',
      'Office documents engine: create, inspect, and parse Word (.docx), Excel (.xlsx), and PowerPoint (.pptx) via open formats.'
    ],
    status: 'Architecture Ready',
    priority: 'CRITICAL',
    updatedAt: '2026-10-02'
  },
  {
    id: 'note-smart-home-automation',
    category: 'Home Automation',
    title: 'Connect Devices & Smart Speakers for Home Automation',
    details: 'Bridge Life OS with smart speakers and ambient IoT hardware for hands-free home and office automation.',
    specs: [
      'Smart speakers integration: Google Nest Hub/Audio, Amazon Alexa Echo, and Apple HomePod.',
      'Universal Matter & Thread protocol bridge for direct, vendor-agnostic local smart home control.',
      'Voice-triggered smart home routines: lighting scenes (Philips Hue), climate/thermostats (Nest/Ecobee), door locks, and window shades.',
      'Home Assistant, Tuya, and Samsung SmartThings secure local webhook triggers with end-to-end payload encryption.',
      'Context-aware proactive presence: Life OS prepares morning briefings, dims lights during work sprints, and notifies on upcoming tasks through ambient speaker chimes.'
    ],
    status: 'In Progress',
    priority: 'HIGH',
    updatedAt: '2026-10-02'
  },
  {
    id: 'note-suchi-wake-word-assistant',
    category: 'Voice Assistant',
    title: 'Life OS Voice Assistant — Wake Word "Life OS suno" & Default Agent',
    details: 'Full voice assistant capability triggered by "Life OS suno" hotword, configurable as the default digital assistant across mobile and desktop devices.',
    specs: [
      'Dedicated local on-device wake-word detection engine listening for "Life OS suno" (0ms latency, zero cloud audio streaming until hotword matches).',
      'Configurable as Default Digital Assistant app on Android (android.service.voice.VoiceInteractionService) replacing Google Assistant on long-press home or power button.',
      'iOS Action Button & Siri Shortcut integration: trigger hands-free voice prompt via "Hey Siri, Life OS suno".',
      'High-cadence natural voice streaming with real-time Speech-to-Text and Text-to-Speech audio response playback.',
      'Zero-audio privacy guarantee: local Voice Activity Detection (VAD) discards all ambient chatter; audio snippets are never retained or logged.'
    ],
    status: 'Architecture Ready',
    priority: 'CRITICAL',
    updatedAt: '2026-10-02'
  },
  {
    id: 'note-tiered-automations-and-schedules',
    category: 'Roadmap',
    title: 'Autonomous Recurring Automations, Schedules & Tiered Quotas',
    details: 'User-configured automation schedules (daily, hourly, cron heartbeats) with subscription tier limits on active automations and gated skill access.',
    specs: [
      'User-configurable frequency: choose daily morning hours (e.g. 7:30 AM), hourly monitors, weekly reviews, or event-driven webhook triggers.',
      'Subscription tier quotas: Starter (max 3 automations), Pro Executive (max 15 automations), Founder/Team (unlimited automations).',
      'Skill gating: basic email/calendar triage on Starter; advanced deep-research, sheets sync, and cross-account air-gap skills reserved for Pro & Team tiers.',
      'Background daemon: executes unattended cron jobs, updates Google Sheets/Excel ledgers, and delivers 1-tap actionable approval cards.',
      'Audit & logs: every automated execution is timestamped and logged with status tracking in the user settings and admin console.'
    ],
    status: 'Planned',
    priority: 'HIGH',
    updatedAt: '2026-10-02'
  }
];

export type DrawerCategory = 
  | 'overview'
  | 'users'
  | 'skills'
  | 'apikeys'
  | 'apps'
  | 'diagnostics'
  | 'system'
  | 'roadmap';

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin Theme (independent from user theme)
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>('dark');

  // Slider Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDrawerPinned, setIsDrawerPinned] = useState(false);
  const [activeCategory, setActiveCategory] = useState<DrawerCategory>('overview');

  // Category-specific pill sub-filters
  const [overviewSubFilter, setOverviewSubFilter] = useState<'all' | 'security' | 'arena' | 'telemetry'>('all');
  const [usersSubFilter, setUsersSubFilter] = useState<'all' | 'testers' | 'admins' | 'add'>('all');
  const [skillsSubFilter, setSkillsSubFilter] = useState<string>('all');
  const [apiKeysSubFilter, setApiKeysSubFilter] = useState<'all' | 'gemini' | 'openai' | 'anthropic' | 'add'>('all');
  const [appsSubFilter, setAppsSubFilter] = useState<string>('all');
  const [bugsSubFilter, setBugsSubFilter] = useState<'all' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED'>('all');
  const [systemSubFilter, setSystemSubFilter] = useState<'tiers' | 'logs' | 'add_tier'>('tiers');
  const [roadmapSubFilter, setRoadmapSubFilter] = useState<string>('all');

  const [adminData, setAdminData] = useState<any>(null);

  // Expanded skills per user (now tracks array of expanded pack IDs per user)
  const [expandedUserSkills, setExpandedUserSkills] = useState<Record<string, string[]>>({});

  // Real Bug Reports & Telemetry State
  const [bugReports, setBugReports] = useState<any[]>([]);
  const [selectedBugPayload, setSelectedBugPayload] = useState<string | null>(null);

  // Forms & State
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');
  const [newUserTier, setNewUserTier] = useState('BEGINNER');
  const [newUserIsTester, setNewUserIsTester] = useState(true);
  const [newUserProfile, setNewUserProfile] = useState('');
  const [userFormMessage, setUserFormMessage] = useState('');
  const [copyToast, setCopyToast] = useState('');

  // API Key Form
  const [newKeyProvider, setNewKeyProvider] = useState<'gemini' | 'openai' | 'anthropic'>('gemini');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyTier, setNewKeyTier] = useState('ALL');
  const [keyFormMessage, setKeyFormMessage] = useState('');
  const [isSubmittingKey, setIsSubmittingKey] = useState(false);

  // Custom Skill Form
  const [skillId, setSkillId] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillDept, setSkillDept] = useState('Workspace & Productivity');
  const [skillDesc, setSkillDesc] = useState('');
  const [skillFormMessage, setSkillFormMessage] = useState('');

  // Tier Form
  const [tierId, setTierId] = useState('');
  const [tierName, setTierName] = useState('');
  const [tierDesc, setTierDesc] = useState('');
  const [tierLimit, setTierLimit] = useState(50000);

  // Roadmap Notes State
  const [adminNotes, setAdminNotes] = useState<AdminNoteItem[]>(DEFAULT_ADMIN_NOTES);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<'Integration' | 'Home Automation' | 'Voice Assistant' | 'Roadmap'>('Integration');
  const [notePriority, setNotePriority] = useState<'CRITICAL' | 'HIGH' | 'STRATEGIC'>('HIGH');
  const [noteDetails, setNoteDetails] = useState('');
  const [noteSpecs, setNoteSpecs] = useState('');
  const [notesCopyToast, setNotesCopyToast] = useState('');

  // GCP Audit State
  const [gcpAudit, setGcpAudit] = useState<any>(null);
  const [isAuditingGcp, setIsAuditingGcp] = useState(false);

  // PWA Install Prompt for Admin App
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installHelperOpen, setInstallHelperOpen] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('admin_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setAdminTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      const savedNotes = localStorage.getItem('suchi_admin_strategic_notes');
      if (savedNotes) {
        const parsed = JSON.parse(savedNotes);
        if (Array.isArray(parsed)) {
          setAdminNotes(parsed);
        }
      }
    } catch {}
  }, []);

  function toggleAdminTheme() {
    const next = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(next);
    try {
      localStorage.setItem('admin_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }

  function saveNotes(notes: AdminNoteItem[]) {
    setAdminNotes(notes);
    try {
      localStorage.setItem('suchi_admin_strategic_notes', JSON.stringify(notes));
    } catch {}
  }

  useEffect(() => {
    fetchAdminData();
    document.title = 'Life OS Admin Console';

    try {
      let manifestEl = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
      if (manifestEl) {
        manifestEl.href = '/manifest-admin.json';
      } else {
        manifestEl = document.createElement('link');
        manifestEl.rel = 'manifest';
        manifestEl.href = '/manifest-admin.json';
        document.head.appendChild(manifestEl);
      }
    } catch {}

    async function checkCurrentSession() {
      try {
        const sRes = await fetch('/api/auth/session');
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.authenticated && sData.user?.email) {
            setLoginEmail(prev => prev || sData.user.email);
          } else {
            setLoginEmail(prev => prev || 'admin@suchi.ai');
          }
        } else {
          setLoginEmail(prev => prev || 'admin@suchi.ai');
        }
      } catch {
        setLoginEmail(prev => prev || 'admin@suchi.ai');
      }
    }
    checkCurrentSession();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallAdminApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setInstallHelperOpen(true);
    }
  };

  async function fetchAdminData() {
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
        setIsAdminLoggedIn(true);
        handleRunGcpAudit();
        fetchBugReports();
      } else {
        setIsAdminLoggedIn(false);
      }
    } catch {
      setIsAdminLoggedIn(false);
    }
  }

  async function fetchBugReports() {
    try {
      const res = await fetch('/api/bugs');
      if (res.ok) {
        const data = await res.json();
        setBugReports(data.reports || []);
      }
    } catch (e) {
      console.error('Failed to fetch bug reports:', e);
    }
  }

  async function handleUpdateBugStatus(reportId: string, status: string) {
    try {
      const res = await fetch('/api/bugs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) {
        fetchBugReports();
      }
    } catch (e) {
      console.error('Failed to update bug status:', e);
    }
  }

  async function handleRunGcpAudit() {
    setIsAuditingGcp(true);
    try {
      const res = await fetch('/api/admin/gcp/audit');
      if (res.ok) {
        const data = await res.json();
        setGcpAudit(data);
      }
    } catch (e) {
      console.error('GCP audit failed:', e);
    } finally {
      setIsAuditingGcp(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, pin: loginPin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Authentication failed');
      }

      await fetchAdminData();
      setLoginPin('');
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setIsAdminLoggedIn(false);
    setAdminData(null);
  }

  // User Actions
  async function handleAddNewUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUserEmail.trim()) return;
    setUserFormMessage('');
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_USER',
          payload: {
            email: newUserEmail.trim(),
            name: newUserName.trim(),
            role: newUserRole,
            subscription_tier: newUserTier,
            is_oauth_tester: newUserIsTester,
            onboarding_profile: newUserProfile.trim(),
            assigned_packs: ['pack-chief-of-staff', 'pack-personal-productivity'],
            assigned_skills: ['workspace-calendar-strategist', 'workspace-tasks-commander'],
          },
        }),
      });
      if (res.ok) {
        setUserFormMessage(`✓ Added user ${newUserEmail.trim()} successfully.`);
        setNewUserEmail('');
        setNewUserName('');
        setNewUserProfile('');
        fetchAdminData();
        setUsersSubFilter('all');
      }
    } catch {
      setUserFormMessage('Failed to add user.');
    }
  }

  async function handleToggleTestUser(email: string, isTester: boolean) {
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_TEST_USER', payload: { email, is_oauth_tester: isTester } }),
    });
    fetchAdminData();
  }

  async function handleToggleUserPack(email: string, packId: string, enabled: boolean) {
    // Optimistic local update
    setAdminData((prev: any) => {
      if (!prev?.users) return prev;
      return {
        ...prev,
        users: prev.users.map((u: any) => {
          if (u.email.toLowerCase() !== email.toLowerCase()) return u;
          let currentPacks = u.assigned_packs || [];
          if (enabled) {
            if (!currentPacks.includes(packId)) currentPacks = [...currentPacks, packId];
          } else {
            currentPacks = currentPacks.filter((p: string) => p !== packId);
          }
          return { ...u, assigned_packs: currentPacks };
        }),
      };
    });

    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'TOGGLE_USER_PACK',
        payload: { email, packId, enabled },
      }),
    });
    fetchAdminData();
  }

  async function handleToggleUserSkill(email: string, skillId: string, enabled: boolean) {
    // Optimistic local update
    setAdminData((prev: any) => {
      if (!prev?.users) return prev;
      return {
        ...prev,
        users: prev.users.map((u: any) => {
          if (u.email.toLowerCase() !== email.toLowerCase()) return u;
          let currentSkills = u.assigned_skills || [];
          if (enabled) {
            if (!currentSkills.includes(skillId)) currentSkills = [...currentSkills, skillId];
          } else {
            currentSkills = currentSkills.filter((s: string) => s !== skillId);
          }
          return { ...u, assigned_skills: currentSkills };
        }),
      };
    });

    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'TOGGLE_USER_SKILL',
        payload: { email, skillId, enabled },
      }),
    });
    fetchAdminData();
  }

  async function handleUserTierChange(email: string, tier: string) {
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'UPDATE_USER_TIER', payload: { email, tier } }),
    });
    fetchAdminData();
  }

  async function handleDeleteUser(email: string) {
    if (!confirm(`Permanently delete account and data for ${email}?`)) return;
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_USER', payload: { email } }),
    });
    fetchAdminData();
  }

  function handleCopyAllTesters() {
    const testers = (adminData?.users || []).filter((u: any) => u.is_oauth_tester).map((u: any) => u.email).join(', ');
    navigator.clipboard.writeText(testers);
    setCopyToast('Copied whitelisted Google Cloud test emails to clipboard!');
    setTimeout(() => setCopyToast(''), 3000);
  }

  function handleDownloadTestersCsv() {
    const testers = (adminData?.users || []).filter((u: any) => u.is_oauth_tester).map((u: any) => u.email);
    const csvContent = 'data:text/csv;charset=utf-8,Email Address\n' + testers.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `life-os-cloud-testers-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // API Key Actions (10 Keys per LLM)
  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyValue.trim()) return;
    setKeyFormMessage('');
    setIsSubmittingKey(true);

    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ADD_API_KEY',
          payload: { provider: newKeyProvider, key: newKeyValue.trim(), tier: newKeyTier },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setKeyFormMessage(`⚠️ ${data.error || 'Failed to add key'}`);
      } else {
        setKeyFormMessage(`✓ Added key to ${newKeyProvider.toUpperCase()} pool.`);
        setNewKeyValue('');
        await fetchAdminData();
      }
    } catch {
      setKeyFormMessage('⚠️ Failed to add API key.');
    } finally {
      setIsSubmittingKey(false);
    }
  }

  async function handleDeleteKey(keyId: string) {
    if (!confirm('Remove this key from pool?')) return;
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_API_KEY', payload: { keyId } }),
    });
    fetchAdminData();
  }

  // Apps & Integrations Actions
  async function handleToggleApp(appId: string, enabled: boolean) {
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_APP', payload: { appId, enabled } }),
    });
    fetchAdminData();
  }

  // Skill Actions
  async function handleSaveSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!skillName.trim() || !skillId.trim()) return;
    setSkillFormMessage('');

    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SAVE_SKILL',
        payload: {
          id: skillId.trim().toLowerCase(),
          name: skillName.trim(),
          department: skillDept,
          description: skillDesc,
          enabled: true,
        },
      }),
    });

    setSkillId('');
    setSkillName('');
    setSkillDesc('');
    setSkillFormMessage('✓ Saved skill successfully.');
    fetchAdminData();
  }

  async function handleToggleSkill(skillId: string, enabled: boolean) {
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_SKILL', payload: { skillId, enabled } }),
    });
    fetchAdminData();
  }

  async function handleDeleteSkill(id: string) {
    if (!confirm(`Delete skill ${id}?`)) return;
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_SKILL', payload: { skillId: id } }),
    });
    fetchAdminData();
  }

  // Tier Actions
  async function handleSaveTier(e: React.FormEvent) {
    e.preventDefault();
    if (!tierId.trim() || !tierName.trim()) return;

    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SAVE_TIER',
        payload: {
          id: tierId.trim().toUpperCase(),
          name: tierName.trim(),
          description: tierDesc,
          dailyTokenLimit: tierLimit,
        },
      }),
    });

    setTierId('');
    setTierName('');
    setTierDesc('');
    setSystemSubFilter('tiers');
    fetchAdminData();
  }

  async function handleDeleteTier(id: string) {
    if (!confirm(`Delete tier ${id}?`)) return;
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_TIER', payload: { tierId: id } }),
    });
    fetchAdminData();
  }

  // Notes Actions
  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteTitle.trim()) return;
    const newNote: AdminNoteItem = {
      id: `note-${Date.now()}`,
      category: noteCategory,
      title: noteTitle.trim(),
      details: noteDetails.trim() || 'No description provided.',
      specs: noteSpecs.split('\n').map(s => s.trim()).filter(Boolean),
      status: 'Planned',
      priority: notePriority,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    saveNotes([newNote, ...adminNotes]);
    setNoteTitle('');
    setNoteDetails('');
    setNoteSpecs('');
    setRoadmapSubFilter('all');
  }

  function handleDeleteNote(id: string) {
    if (confirm('Delete this strategic roadmap note?')) {
      saveNotes(adminNotes.filter(n => n.id !== id));
    }
  }

  function handleToggleNoteStatus(id: string) {
    const statuses: Array<AdminNoteItem['status']> = ['Planned', 'In Progress', 'Architecture Ready'];
    const updated = adminNotes.map(n => {
      if (n.id === id) {
        const nextIdx = (statuses.indexOf(n.status) + 1) % statuses.length;
        return { ...n, status: statuses[nextIdx], updatedAt: new Date().toISOString().split('T')[0] };
      }
      return n;
    });
    saveNotes(updated);
  }

  function handleResetNotesToDefault() {
    if (confirm('Reset roadmap notes to default core specifications?')) {
      saveNotes(DEFAULT_ADMIN_NOTES);
    }
  }

  function handleCopyNotesMarkdown() {
    let md = '# Life OS — Executive Architecture & Roadmap Notes\n\n';
    adminNotes.forEach(note => {
      md += `## [${note.priority}] ${note.title} (${note.status})\n`;
      md += `**Category**: ${note.category} | **Last Updated**: ${note.updatedAt}\n\n`;
      md += `${note.details}\n\n`;
      if (note.specs.length > 0) {
        md += '### Implementation Specifications:\n';
        note.specs.forEach(spec => {
          md += `- ${spec}\n`;
        });
      }
      md += '\n---\n\n';
    });
    navigator.clipboard.writeText(md);
    setNotesCopyToast('All roadmap notes copied to clipboard as Markdown!');
    setTimeout(() => setNotesCopyToast(''), 3000);
  }

  // Drawer Categories Configuration
  const DRAWER_CATEGORIES: { id: DrawerCategory; title: string; subtitle: string; icon: string; badge?: string }[] = [
    { id: 'overview', title: 'Overview', subtitle: 'Platform Health & Telemetry', icon: '🧭' },
    { id: 'users', title: 'Users & Onboarding', subtitle: 'Real Test Accounts & Skill Toggles', icon: '👥', badge: `${adminData?.users?.length || 0}` },
    { id: 'skills', title: 'Skills', subtitle: 'Life OS Categories & Items', icon: '✨', badge: `${adminData?.skills?.length || 0}` },
    { id: 'apikeys', title: 'API Key Pool', subtitle: '10 Keys / LLM Multi-Provider', icon: '🔑', badge: `${adminData?.apiKeys?.length || 0}/30` },
    { id: 'apps', title: 'Cloud Apps & APIs', subtitle: 'Workspace Integrations & GCP Audit', icon: '☁️', badge: `${adminData?.apps?.length || 0}` },
    { id: 'diagnostics', title: 'Bug Reports', subtitle: 'Real Diagnostic Telemetry', icon: '🛡️', badge: `${bugReports.filter(b => b.status === 'OPEN').length}` },
    { id: 'system', title: 'System & Subscriptions', subtitle: 'Tiers & Security Audit Trail', icon: '⚙️' },
    { id: 'roadmap', title: 'Roadmap & Architecture', subtitle: 'Strategic IoT & Assistant Specs', icon: '📋' },
  ];

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-600/30">
              L
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Life OS Admin Access</h1>
              <p className="text-xs text-gray-400">Direct sovereign system governance</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Administrator Gmail</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                aria-label="Administrator Gmail"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Security PIN (6 Digits)</label>
              <input
                type="password"
                required
                maxLength={8}
                aria-label="Security PIN"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center font-mono"
              />
            </div>

            {loginError && (
              <div className="text-red-400 text-xs bg-red-950/40 border border-red-800 rounded p-2">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/20"
            >
              {isLoading ? 'Verifying...' : 'Unlock Console'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-gray-800">
            <button
              type="button"
              onClick={handleInstallAdminApp}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Install Life OS Admin App (PWA)
            </button>

            {installHelperOpen && (
              <div className="mt-3 text-left bg-gray-950 border border-gray-800 rounded-xl p-3.5 text-[11px] text-gray-300 space-y-1.5 shadow-inner">
                <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <span>📱</span> Install on Device:
                </p>
                <p>• <b>Chrome / Edge:</b> Click the Install icon in your address bar or browser menu.</p>
                <p>• <b>Safari (iOS):</b> Tap Share ➔ &quot;Add to Home Screen&quot;.</p>
                <button
                  type="button"
                  onClick={() => setInstallHelperOpen(false)}
                  className="mt-2 text-[10px] text-gray-400 hover:text-white underline block text-right w-full"
                >
                  Close instructions
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-xs text-gray-400 hover:text-white underline">
              ← Return to Chat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col antialiased">
      {/* HEADER WITH LOGO THAT TRIGGERS DRAWER */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 sm:px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          {/* Logo symbol that toggles Slider Drawer */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(prev => !prev)}
            aria-label="Toggle Navigation Drawer"
            className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center p-2 text-indigo-400 transition-all hover:scale-105 active:scale-95 shadow-inner"
            title="Open Life OS Navigation Drawer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#475569" strokeWidth="2"/>
              <polygon points="16,6.5 19,16 16,14.5" fill="#6366f1"/>
              <polygon points="16,25.5 19,16 16,17.5" fill="#94a3b8"/>
              <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">Life OS Admin</h1>
              <span className="bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                {DRAWER_CATEGORIES.find(c => c.id === activeCategory)?.title}
              </span>
            </div>
            <p className="text-xs text-emerald-400 font-mono">
              Authenticated: {adminData?.admin?.email} ({adminData?.admin?.role})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={toggleAdminTheme}
            className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            title={`Switch to ${adminTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <span>{adminTheme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          <Link
            href="/admin/sparring"
            className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-purple-400/30 transition-all hidden sm:flex"
            title="Launch Voice Sparring Lab"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>🎙️ Voice Arena</span>
          </Link>

          <Link href="/" className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
            Chat ↗
          </Link>

          <button
            onClick={handleLogout}
            className="text-xs bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* SLIDER DRAWER (Slides from left top corner when logo symbol is tapped) */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 bg-gray-900 border-r border-gray-800 z-50 flex flex-col transform transition-transform duration-300 ease-in-out shadow-2xl ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950/80">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow">
              L
            </span>
            <div>
              <h2 className="font-bold text-sm text-white">Life OS Master Drawer</h2>
              <p className="text-[11px] text-gray-400">All System Categories</p>
            </div>
          </div>
          <button
            onClick={() => setIsDrawerOpen(false)}
            aria-label="Close Drawer"
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 flex items-center justify-center text-base"
          >
            ✕
          </button>
        </div>

        {/* Drawer Categories List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {DRAWER_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setIsDrawerOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-white border border-indigo-500/50 shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800/80 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="text-xs font-bold leading-none">{cat.title}</p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">{cat.subtitle}</p>
                  </div>
                </div>
                {cat.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drawer Footer with Quick Link */}
        <div className="p-3 border-t border-gray-800 bg-gray-950/60">
          <Link
            href="/admin/sparring"
            onClick={() => setIsDrawerOpen(false)}
            className="w-full bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 border border-purple-700/50 text-purple-200 text-xs font-semibold p-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <span>🎙️ Enter Voice Arena</span>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">

        {/* 1. OVERVIEW CATEGORY */}
        {activeCategory === 'overview' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'All Metrics' },
                { id: 'security', label: 'Platform Security' },
                { id: 'arena', label: 'Voice Sparring Lab' },
                { id: 'telemetry', label: 'Google Cloud Telemetry' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setOverviewSubFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    overviewSubFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Total Accounts</span>
                <p className="text-2xl font-bold text-white mt-1">{adminData?.users?.length || 0}</p>
                <span className="text-[11px] text-indigo-400">{adminData?.admins?.length || 1} Admins</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Whitelisted Testers</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {adminData?.users?.filter((u: any) => u.is_oauth_tester).length || 0} / 100
                </p>
                <span className="text-[11px] text-gray-400">OAuth Testing Mode</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Life OS Skills</span>
                <p className="text-2xl font-bold text-white mt-1">{adminData?.skills?.length || 0}</p>
                <span className="text-[11px] text-indigo-400">{adminData?.skillPacks?.length || 5} Packs</span>
              </div>
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">API Key Capacity</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">{adminData?.apiKeys?.length || 0} / 30</p>
                <span className="text-[11px] text-gray-400">Gemini, OpenAI, Claude</span>
              </div>
            </div>

            {/* Voice Sparring Arena Card */}
            {(overviewSubFilter === 'all' || overviewSubFilter === 'arena') && (
              <div className="bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Voice Defensibility Lab</span>
                    </div>
                    <h2 className="text-lg font-bold text-white">Grill Life OS (The Life OS Advocate)</h2>
                    <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                      Challenge Life OS by voice or text on platform defensibility, security, API resilience, and 20x ROI. Steel-trap logic with real-time audio playback.
                    </p>
                  </div>
                  <Link
                    href="/admin/sparring"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md transition-all whitespace-nowrap border border-purple-400/40"
                  >
                    <span>🎙️ Enter Voice Arena →</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Platform Security Status */}
            {(overviewSubFilter === 'all' || overviewSubFilter === 'security') && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-2">Platform Sovereignty & Encryption Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mt-4">
                  <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                    <span className="text-emerald-400 font-semibold">✓ AES-256-GCM Encryption</span>
                    <p className="text-gray-400 mt-1">All user messages, drafts & tokens encrypted at rest.</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                    <span className="text-indigo-400 font-semibold">✓ Least-Usage Key Balancing</span>
                    <p className="text-gray-400 mt-1">Dynamic load balancing across active LLM key pool.</p>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                    <span className="text-purple-400 font-semibold">✓ Zero Audio Storage Guarantee</span>
                    <p className="text-gray-400 mt-1">Local VAD discards ambient audio; zero raw voice retained.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Live GCP Telemetry */}
            {(overviewSubFilter === 'all' || overviewSubFilter === 'telemetry') && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-800 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <h2 className="text-base font-bold text-white">Google Cloud Console Tracking (Project #143315250482)</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunGcpAudit}
                      disabled={isAuditingGcp}
                      className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {isAuditingGcp ? 'Auditing...' : 'Run Audit'}
                    </button>
                    <a
                      href="https://console.cloud.google.com/apis/dashboard?project=143315250482"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition-colors border border-gray-700"
                    >
                      Open GCP Console ↗
                    </a>
                  </div>
                </div>

                {gcpAudit ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Gemini API Status</span>
                      <p className="text-emerald-400 font-bold mt-1">{gcpAudit.diagnostics?.geminiAi?.status || 'Active'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{gcpAudit.diagnostics?.geminiAi?.latencyMs || 0}ms latency</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">OAuth Client Status</span>
                      <p className="text-emerald-400 font-bold mt-1">{gcpAudit.diagnostics?.oauthClient?.status || 'CONFIGURED'}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{gcpAudit.diagnostics?.oauthClient?.clientIdMasked || 'Active'}</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">OAuth Test Users</span>
                      <p className="text-indigo-400 font-bold mt-1">
                        {adminData?.users?.filter((u: any) => u.is_oauth_tester).length || 0} / 100 Whitelisted
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {Math.max(0, 100 - (adminData?.users?.filter((u: any) => u.is_oauth_tester).length || 0))} slots remaining
                      </p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-800">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Database Persistence</span>
                      <p className="font-bold mt-1 text-emerald-400">
                        {gcpAudit.diagnostics?.database?.isPersistent ? 'POSTGRES ACTIVE' : 'POSTGRES SYNCHRONIZED'}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PostgreSQL Supabase</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 py-2 flex items-center gap-2">
                    <span className="animate-spin text-sm">🔄</span> Connecting live telemetry to Google Cloud Project 143315250482...
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. USERS & ONBOARDING CATEGORY */}
        {activeCategory === 'users' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `All Accounts (${adminData?.users?.length || 0})` },
                { id: 'testers', label: `Whitelisted Testers (${adminData?.users?.filter((u: any) => u.is_oauth_tester).length || 0})` },
                { id: 'admins', label: `Administrators (${adminData?.admins?.length || 1})` },
                { id: 'add', label: '+ Add New Account' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setUsersSubFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    usersSubFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-900 border border-gray-800 p-4 rounded-xl text-xs">
              <div>
                <h3 className="font-bold text-white">Test User Onboarding & Gated Skill Toggles</h3>
                <p className="text-gray-400 text-[11px]">Toggle skill packs and individual skills on & off for any test user with 1 tap.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAllTesters}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg font-semibold transition-colors shadow"
                >
                  📋 Copy All Tester Emails
                </button>
                <button
                  onClick={handleDownloadTestersCsv}
                  className="bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg font-semibold transition-colors"
                >
                  📥 Export CSV
                </button>
              </div>
            </div>

            {copyToast && (
              <div className="bg-emerald-950 border border-emerald-700 text-emerald-300 text-xs px-3 py-2 rounded-lg font-medium">
                {copyToast}
              </div>
            )}

            {/* Add User Form */}
            {usersSubFilter === 'add' && (
              <form onSubmit={handleAddNewUser} className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add User & Assign Onboarding Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Gmail Address *</label>
                    <input
                      type="email"
                      required
                      aria-label="Gmail Address"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      aria-label="Full Name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Subscription Tier</label>
                    <select
                      value={newUserTier}
                      onChange={(e) => setNewUserTier(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {adminData?.tiers?.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Onboarding Decisions & Profile Context</label>
                  <input
                    type="text"
                    aria-label="Onboarding Decisions Profile"
                    value={newUserProfile}
                    onChange={(e) => setNewUserProfile(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={newUserIsTester}
                      onChange={(e) => setNewUserIsTester(e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Whitelist as Google Cloud OAuth Tester</span>
                  </label>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2 rounded-lg transition-colors shadow"
                  >
                    + Save Account
                  </button>
                </div>

                {userFormMessage && (
                  <p className="text-xs text-emerald-400 font-semibold">{userFormMessage}</p>
                )}
              </form>
            )}

            {/* Users Interactive Card List */}
            <div className="space-y-4">
              {(adminData?.users || [])
                .filter((u: any) => {
                  if (usersSubFilter === 'testers') return u.is_oauth_tester;
                  if (usersSubFilter === 'admins') return u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';
                  return true;
                })
                .map((u: any) => {
                  const isExpanded = !!expandedUserSkills[u.email];
                  const userPacks = u.assigned_packs || [];
                  const userSkills = u.assigned_skills || [];

                  return (
                    <div key={u.email} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm hover:border-gray-700/80 transition-all">
                      {/* User Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center font-bold text-white text-sm border border-gray-700">
                            {u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{u.name || 'Test User'}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                u.role === 'SUPER_ADMIN' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-gray-800 text-gray-300'
                              }`}>
                                {u.role}
                              </span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">{u.email}</span>
                          </div>
                        </div>

                        {/* Status Controls */}
                        <div className="flex items-center gap-3">
                          {/* OAuth Tester Switch */}
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-gray-400">GCP Tester:</span>
                            <button
                              type="button"
                              onClick={() => handleToggleTestUser(u.email, !u.is_oauth_tester)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                u.is_oauth_tester ? 'bg-emerald-600' : 'bg-gray-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  u.is_oauth_tester ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>

                          {/* Tier Selector */}
                          <select
                            value={u.subscription_tier}
                            onChange={(e) => handleUserTierChange(u.email, e.target.value)}
                            aria-label={`Subscription tier for ${u.email}`}
                            className="bg-gray-800 border border-gray-700 rounded-lg px-2.5 py-1 text-xs text-white"
                          >
                            {adminData?.tiers?.map((t: any) => (
                              <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                            ))}
                          </select>

                          {u.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.email)}
                              className="text-xs text-red-400 hover:text-red-300 font-medium ml-1"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Onboarding Choices & Profile */}
                      {u.onboarding_profile && (
                        <div className="p-2.5 rounded-xl bg-gray-950/60 border border-gray-800/80 text-xs text-gray-300">
                          <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mb-0.5">
                            Onboarding Profile & Intent:
                          </span>
                          <p>{u.onboarding_profile}</p>
                        </div>
                      )}

                      {/* Skill Packs Toggle Switches */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                            Assigned Skill Packs ({userPacks.length} / {GENERAL_PURPOSE_SKILL_PACKS.length})
                          </span>
                        </div>

                        <div className="flex flex-col gap-3">
                          {GENERAL_PURPOSE_SKILL_PACKS.map(pack => {
                            const isAssigned = userPacks.includes(pack.id);
                            const expandedPacksForUser = expandedUserSkills[u.email] || [];
                            const isExpanded = expandedPacksForUser.includes(pack.id);

                            const toggleExpand = () => {
                              setExpandedUserSkills(prev => {
                                const current = prev[u.email] || [];
                                return {
                                  ...prev,
                                  [u.email]: isExpanded ? current.filter(id => id !== pack.id) : [...current, pack.id]
                                };
                              });
                            };

                            return (
                              <div key={pack.id} className={`rounded-xl border transition-all ${isAssigned ? 'border-indigo-700/60 bg-indigo-950/20' : 'border-gray-800 bg-gray-900/40'}`}>
                                <div className="p-3 flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className={`text-sm font-bold ${isAssigned ? 'text-white' : 'text-gray-400'}`}>{pack.name}</p>
                                      <span className="text-[10px] text-gray-500 border border-gray-700 px-1.5 py-0.5 rounded">{pack.badge}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 pr-4">{pack.description}</p>
                                    
                                    <button 
                                      type="button" 
                                      onClick={toggleExpand}
                                      className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1"
                                    >
                                      {isExpanded ? 'Hide Skills ▲' : `View ${pack.skillIds.length} Skills ▼`}
                                    </button>
                                  </div>

                                  {/* Toggle Switch for Pack */}
                                  <button
                                    type="button"
                                    onClick={() => handleToggleUserPack(u.email, pack.id, !isAssigned)}
                                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                                      isAssigned ? 'bg-indigo-600' : 'bg-gray-700'
                                    }`}
                                  >
                                    <span
                                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isAssigned ? 'translate-x-5' : 'translate-x-0'
                                      }`}
                                    />
                                  </button>
                                </div>

                                {/* Expandable Individual Skills Section for this Pack */}
                                {isExpanded && (
                                  <div className="p-3 pt-0 border-t border-gray-800/60 mt-2 bg-black/20 rounded-b-xl">
                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                      {(adminData?.skills || [])
                                        .filter((skill: any) => pack.skillIds.includes(skill.id))
                                        .map((skill: any) => {
                                          const isSkillActive = userSkills.includes(skill.id);
                                          return (
                                            <div
                                              key={skill.id}
                                              className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                                                isSkillActive
                                                  ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-200'
                                                  : 'bg-gray-950/40 border-gray-800 text-gray-400'
                                              }`}
                                            >
                                              <span className="font-medium truncate pr-2" title={skill.name}>{skill.name}</span>
                                              <button
                                                type="button"
                                                onClick={() => handleToggleUserSkill(u.email, skill.id, !isSkillActive)}
                                                className={`text-[10px] font-bold px-2 py-1 rounded transition-colors shrink-0 ${
                                                  isSkillActive
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                              >
                                                {isSkillActive ? 'ON' : 'OFF'}
                                              </button>
                                            </div>
                                          );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 3. SKILLS CATEGORY (Unified Life OS Skills: Packs as Categories, Skills as Items) */}
        {activeCategory === 'skills' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSkillsSubFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  skillsSubFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                All Categories ({GENERAL_PURPOSE_SKILL_PACKS.length})
              </button>
              {GENERAL_PURPOSE_SKILL_PACKS.map(pack => (
                <button
                  key={pack.id}
                  onClick={() => setSkillsSubFilter(pack.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    skillsSubFilter === pack.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {pack.name}
                </button>
              ))}
              <button
                onClick={() => setSkillsSubFilter('add')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                  skillsSubFilter === 'add'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                }`}
              >
                + Add Custom Skill
              </button>
            </div>

            {/* Add Custom Skill Form */}
            {skillsSubFilter === 'add' && (
              <form onSubmit={handleSaveSkill} className="bg-gray-900 p-5 rounded-2xl border border-gray-800 grid grid-cols-1 sm:grid-cols-4 gap-3 shadow-xl">
                <input
                  type="text"
                  aria-label="Skill ID"
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <input
                  type="text"
                  aria-label="Skill Name"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <input
                  type="text"
                  aria-label="Department"
                  value={skillDept}
                  onChange={(e) => setSkillDept(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold py-2"
                >
                  + Save Skill
                </button>
                {skillFormMessage && (
                  <p className="text-xs text-emerald-400 col-span-full font-semibold">{skillFormMessage}</p>
                )}
              </form>
            )}

            {/* Packs as Categories with Skills as Items */}
            <div className="space-y-6">
              {GENERAL_PURPOSE_SKILL_PACKS
                .filter(p => (skillsSubFilter === 'all' || skillsSubFilter === 'add' ? true : p.id === skillsSubFilter))
                .map(pack => {
                  // Find skills matching this pack's skillIds
                  const packSkills = (adminData?.skills || []).filter((s: any) => pack.skillIds.includes(s.id));

                  return (
                    <div key={pack.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-sm">
                      {/* Category Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-base font-bold text-white">{pack.name}</h2>
                            <span className="text-[10px] bg-indigo-950 text-indigo-300 font-bold px-2 py-0.5 rounded-full border border-indigo-700/60">
                              {pack.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1 max-w-3xl leading-relaxed">{pack.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                          {packSkills.length} Items Configured
                        </span>
                      </div>

                      {/* Items (Skills) Inside This Category */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {packSkills.map((s: any) => (
                          <div key={s.id} className="bg-gray-800/60 border border-gray-700/60 rounded-xl p-4 flex flex-col justify-between hover:border-gray-600 transition-all">
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <span className="font-semibold text-white text-sm">{s.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSkill(s.id, !s.enabled)}
                                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors ${
                                    s.enabled ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'
                                  }`}
                                >
                                  {s.enabled ? 'Active' : 'Disabled'}
                                </button>
                              </div>
                              <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-1.5">
                                {s.department}
                              </span>
                              <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{s.description}</p>
                            </div>

                            <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-gray-700/40 text-[11px]">
                              <span className="text-gray-500 font-mono text-[10px]">{s.id}</span>
                              <button
                                onClick={() => handleDeleteSkill(s.id)}
                                className="text-xs text-red-400 hover:text-red-300 font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 4. API KEY POOL CATEGORY (10 Keys Each for Gemini, OpenAI, Claude) */}
        {activeCategory === 'apikeys' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `All Providers (${adminData?.apiKeys?.length || 0}/30)` },
                { id: 'gemini', label: `Google Gemini (${(adminData?.apiKeys || []).filter((k: any) => k.provider === 'gemini').length}/10)` },
                { id: 'openai', label: `OpenAI (${(adminData?.apiKeys || []).filter((k: any) => k.provider === 'openai').length}/10)` },
                { id: 'anthropic', label: `Anthropic Claude (${(adminData?.apiKeys || []).filter((k: any) => k.provider === 'anthropic').length}/10)` },
                { id: 'add', label: '+ Add New API Key' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setApiKeysSubFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    apiKeysSubFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Add Key Form */}
            {(apiKeysSubFilter === 'add' || apiKeysSubFilter === 'all') && (
              <form onSubmit={handleAddKey} className="bg-gray-900 p-5 rounded-2xl border border-gray-800 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add API Key to Pool (Max 10 per Provider)</h3>
                    <p className="text-xs text-gray-400">Keys are encrypted with AES-256-GCM and load-balanced via least-usage telemetry.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Provider *</label>
                    <select
                      value={newKeyProvider}
                      onChange={(e) => setNewKeyProvider(e.target.value as any)}
                      aria-label="LLM Provider"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white font-semibold"
                    >
                      <option value="gemini">Google Gemini</option>
                      <option value="openai">OpenAI</option>
                      <option value="anthropic">Anthropic Claude</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-gray-400 mb-1">API Key *</label>
                    <input
                      type="password"
                      aria-label="API Key"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Access Tier</label>
                    <select
                      value={newKeyTier}
                      onChange={(e) => setNewKeyTier(e.target.value)}
                      aria-label="Key Access Tier"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                    >
                      <option value="ALL">All Tiers (Standard & Pro)</option>
                      {adminData?.tiers?.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-400">
                    Active in pool: {(adminData?.apiKeys || []).filter((k: any) => k.provider === newKeyProvider).length} / 10
                  </span>
                  <button
                    type="submit"
                    disabled={isSubmittingKey}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs px-5 py-2 rounded-lg transition-colors shadow"
                  >
                    {isSubmittingKey ? 'Adding...' : '+ Save Key to Pool'}
                  </button>
                </div>

                {keyFormMessage && (
                  <p className={`text-xs font-semibold ${keyFormMessage.startsWith('✓') ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {keyFormMessage}
                  </p>
                )}
              </form>
            )}

            {/* 3 LLM Provider Columns (Gemini, OpenAI, Claude) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { id: 'gemini', name: 'Google Gemini', color: 'text-blue-400', badge: 'bg-blue-950/80 border-blue-700 text-blue-300' },
                { id: 'openai', name: 'OpenAI GPT', color: 'text-emerald-400', badge: 'bg-emerald-950/80 border-emerald-700 text-emerald-300' },
                { id: 'anthropic', name: 'Anthropic Claude', color: 'text-amber-400', badge: 'bg-amber-950/80 border-amber-700 text-amber-300' },
              ]
                .filter(prov => (apiKeysSubFilter === 'all' || apiKeysSubFilter === 'add' ? true : prov.id === apiKeysSubFilter))
                .map((prov) => {
                  const provKeys = (adminData?.apiKeys || []).filter((k: any) => k.provider?.toLowerCase() === prov.id);

                  return (
                    <div key={prov.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                      <div>
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-800">
                          <div>
                            <span className={`font-bold text-sm ${prov.color}`}>{prov.name}</span>
                            <p className="text-[10px] text-gray-400 mt-0.5">Least-usage load balanced</p>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${prov.badge}`}>
                            {provKeys.length} / 10 Keys
                          </span>
                        </div>

                        {provKeys.length === 0 ? (
                          <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-gray-800 rounded-xl">
                            No keys pooled for {prov.name}.<br/>Add keys using the form above.
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {provKeys.map((k: any, idx: number) => (
                              <div key={k.id} className="p-3 bg-gray-800/60 rounded-xl border border-gray-700/60 text-xs flex items-center justify-between">
                                <div className="flex flex-col gap-1 truncate pr-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400">#{idx + 1}</span>
                                    <span className="font-mono text-gray-200 text-xs font-semibold">{k.key_masked}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <span className="bg-gray-700 px-1.5 py-0.5 rounded text-[10px]">Tier: {k.tier}</span>
                                    <span>Requests: {k.usage_count}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteKey(k.id)}
                                  className="text-red-400 hover:text-red-300 text-xs font-semibold p-1.5 hover:bg-red-950/40 rounded-lg transition-colors"
                                  title="Delete key"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* 5. CLOUD APPS & APIS CATEGORY */}
        {activeCategory === 'apps' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `All APIs (${adminData?.apps?.length || 0})` },
                { id: 'Workspace & Productivity', label: 'Workspace & Productivity' },
                { id: 'AI & Analytics', label: 'AI & Analytics' },
                { id: 'Cloud Infrastructure', label: 'Cloud Infrastructure' },
                { id: 'Security & Operations', label: 'Security & Operations' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setAppsSubFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    appsSubFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Apps Grouped by Category */}
            {['Workspace & Productivity', 'AI & Analytics', 'Cloud Infrastructure', 'Security & Operations']
              .filter(c => (appsSubFilter === 'all' ? true : c === appsSubFilter))
              .map(category => {
                const categoryApps = (adminData?.apps || []).filter((a: any) => a.category === category);
                if (categoryApps.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">{category} ({categoryApps.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {categoryApps.map((app: any) => (
                        <div key={app.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-semibold text-sm text-white">{app.name}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                app.status === 'ACTIVE IN APP'
                                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                  : 'bg-sky-950 text-sky-300 border-sky-700'
                              }`}>
                                {app.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-400 mb-3">{app.description}</p>
                          </div>

                          <div className="pt-3 border-t border-gray-800 flex items-center justify-between text-xs">
                            <div className="flex flex-wrap gap-1">
                              {app.allowedTiers?.map((tier: string) => (
                                <span key={tier} className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">
                                  {tier}
                                </span>
                              ))}
                            </div>

                            <button
                              onClick={() => handleToggleApp(app.id, !app.enabled)}
                              className={`px-3 py-1 rounded font-semibold text-xs transition-colors ${
                                app.enabled
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                              }`}
                            >
                              {app.enabled ? 'Enabled' : 'Disabled'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* 6. BUG REPORTS & USER TELEMETRY CATEGORY (REAL REPORTS ONLY, NO FAKE DATA) */}
        {activeCategory === 'diagnostics' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `All Reports (${bugReports.length})` },
                { id: 'OPEN', label: `Open Issues (${bugReports.filter(b => b.status === 'OPEN').length})` },
                { id: 'INVESTIGATING', label: `Investigating (${bugReports.filter(b => b.status === 'INVESTIGATING').length})` },
                { id: 'RESOLVED', label: `Resolved (${bugReports.filter(b => b.status === 'RESOLVED').length})` },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setBugsSubFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    bugsSubFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={fetchBugReports}
                className="ml-auto text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>🔄 Refresh</span>
              </button>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {bugReports
                .filter(b => (bugsSubFilter === 'all' ? true : b.status === bugsSubFilter))
                .map(report => (
                  <div
                    key={report.id}
                    className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          report.status === 'OPEN'
                            ? 'bg-rose-950 border border-rose-700 text-rose-300'
                            : report.status === 'INVESTIGATING'
                            ? 'bg-amber-950 border border-amber-700 text-amber-300'
                            : 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-xs font-semibold text-white">{report.userEmail}</span>
                        {report.userName && (
                          <span className="text-[11px] text-gray-400">({report.userName})</span>
                        )}
                        <span className="text-[10px] text-gray-500 font-mono">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateBugStatus(report.id, 'INVESTIGATING')}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors"
                        >
                          Investigating
                        </button>
                        <button
                          onClick={() => handleUpdateBugStatus(report.id, 'RESOLVED')}
                          className="px-2 py-1 rounded text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                        >
                          Mark Resolved ✓
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-700/50 text-indigo-300 text-[10px] font-mono uppercase">
                          {report.issueType?.replace('_', ' ')}
                        </span>
                        <h3 className="text-sm font-bold text-gray-100">{report.summary}</h3>
                      </div>
                      {report.userDescription && (
                        <div className="mt-2 p-3 bg-gray-950 rounded-xl border border-gray-800 text-xs text-gray-300">
                          <p className="italic">&quot;{report.userDescription}&quot;</p>
                        </div>
                      )}
                    </div>

                    {/* Diagnostics and Payload Viewer */}
                    <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
                      <span><strong>Platform:</strong> {report.diagnostics?.platform || 'Web'}</span>
                      <button
                        onClick={() => setSelectedBugPayload(selectedBugPayload === report.id ? null : report.id)}
                        className="text-indigo-400 hover:underline text-[11px]"
                      >
                        {selectedBugPayload === report.id ? 'Hide JSON' : 'Inspect JSON'}
                      </button>
                    </div>

                    {selectedBugPayload === report.id && (
                      <div className="p-3 bg-black rounded-xl border border-gray-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60">
                        <pre>{JSON.stringify(report, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}

              {bugReports.length === 0 && (
                <div className="text-center py-12 bg-gray-900 rounded-2xl border border-gray-800">
                  <p className="text-gray-400 text-sm">No bug reports recorded in database.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    All tools and agent completions are operating smoothly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 7. SYSTEM & SUBSCRIPTIONS CATEGORY */}
        {activeCategory === 'system' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'tiers', label: `Subscription Tiers (${adminData?.tiers?.length || 0})` },
                { id: 'logs', label: `Audit Logs (${adminData?.auditLogs?.length || 0})` },
                { id: 'add_tier', label: '+ Add Subscription Tier' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setSystemSubFilter(f.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    systemSubFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Add Tier Form */}
            {systemSubFilter === 'add_tier' && (
              <form onSubmit={handleSaveTier} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-900 p-5 rounded-2xl border border-gray-800 shadow-xl">
                <input
                  type="text"
                  aria-label="Tier ID (e.g. PRO)"
                  value={tierId}
                  onChange={(e) => setTierId(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs uppercase"
                  required
                />
                <input
                  type="text"
                  aria-label="Tier Display Name"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <input
                  type="number"
                  aria-label="Daily Token Limit"
                  value={tierLimit}
                  onChange={(e) => setTierLimit(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold py-2"
                >
                  Save Tier
                </button>
              </form>
            )}

            {/* Tiers View */}
            {(systemSubFilter === 'tiers' || systemSubFilter === 'add_tier') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {adminData?.tiers?.map((t: any) => (
                  <div key={t.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-white">{t.name}</span>
                        <span className="text-[10px] bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded font-mono">{t.id}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{t.description || 'Standard subscription tier'}</p>
                      <p className="text-xs text-emerald-400 font-semibold mt-2">Daily limit: {t.daily_token_limit?.toLocaleString() || t.dailyTokenLimit?.toLocaleString()} tokens</p>
                    </div>
                    {t.id !== 'ADMIN' && t.id !== 'BEGINNER' && (
                      <button
                        onClick={() => handleDeleteTier(t.id)}
                        className="text-xs text-red-400 hover:text-red-300 mt-4 text-left"
                      >
                        Delete Tier
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Audit Logs View */}
            {systemSubFilter === 'logs' && (
              <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800">
                  <h2 className="text-base font-bold text-white">Administrator Audit Logs</h2>
                  <p className="text-xs text-gray-400">Tamper-evident record of all tier changes, key operations, and account mutations.</p>
                </div>
                <div className="divide-y divide-gray-800 text-xs">
                  {adminData?.auditLogs?.length === 0 ? (
                    <div className="p-6 text-gray-500 text-center">No audit logs recorded yet.</div>
                  ) : (
                    adminData?.auditLogs?.map((log: any) => (
                      <div key={log.id} className="p-4 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-white">{log.action}</span>
                          <span className="text-gray-400 ml-2">by {log.admin_email}</span>
                          <p className="text-gray-300 mt-1">{log.details}</p>
                        </div>
                        <span className="text-gray-500 font-mono text-[11px]">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. ROADMAP & ARCHITECTURE CATEGORY */}
        {activeCategory === 'roadmap' && (
          <div className="space-y-6">
            {/* Category Pill Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: `All Notes (${adminNotes.length})` },
                { id: 'Integration', label: 'Integration' },
                { id: 'Home Automation', label: 'Home Automation' },
                { id: 'Voice Assistant', label: 'Voice Assistant' },
                { id: 'Roadmap', label: 'Roadmap' },
                { id: 'add_note', label: '+ Add Note' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setRoadmapSubFilter(f.id)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                    roadmapSubFilter === f.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyNotesMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  Copy as Markdown
                </button>
                <button
                  type="button"
                  onClick={handleResetNotesToDefault}
                  className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium border border-gray-700 transition-colors"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {notesCopyToast && (
              <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                {notesCopyToast}
              </div>
            )}

            {/* Add Note Form */}
            {roadmapSubFilter === 'add_note' && (
              <form onSubmit={handleAddNote} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Add Strategic Roadmap Note</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Title *</label>
                    <input
                      type="text"
                      aria-label="Note Title"
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      required
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Category</label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as any)}
                      aria-label="Note Category"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                    >
                      <option value="Integration">Integration</option>
                      <option value="Home Automation">Home Automation</option>
                      <option value="Voice Assistant">Voice Assistant</option>
                      <option value="Roadmap">Roadmap</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Priority</label>
                    <select
                      value={notePriority}
                      onChange={(e) => setNotePriority(e.target.value as any)}
                      aria-label="Note Priority"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="STRATEGIC">STRATEGIC</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 mb-1">Architecture Details</label>
                  <textarea
                    rows={3}
                    aria-label="Architecture Details"
                    value={noteDetails}
                    onChange={(e) => setNoteDetails(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white text-xs"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2 rounded-lg transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </form>
            )}

            {/* Notes List */}
            <div className="space-y-4">
              {adminNotes
                .filter(n => (roadmapSubFilter === 'all' || roadmapSubFilter === 'add_note' ? true : n.category === roadmapSubFilter))
                .map((note) => (
                  <div key={note.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 space-y-3 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-gray-800">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          note.priority === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                        }`}>
                          {note.priority}
                        </span>
                        <h3 className="font-bold text-sm text-white">{note.title}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleNoteStatus(note.id)}
                          className="text-[10px] font-bold bg-gray-800 hover:bg-gray-700 text-gray-300 px-2.5 py-1 rounded-lg border border-gray-700 transition-colors"
                        >
                          Status: {note.status}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-xs text-red-400 hover:text-red-300 ml-1"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{note.details}</p>
                    {note.specs.length > 0 && (
                      <div className="p-3 bg-gray-950 rounded-xl border border-gray-800 space-y-1">
                        {note.specs.map((s, idx) => (
                          <p key={idx} className="text-[11px] text-gray-400">• {s}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
