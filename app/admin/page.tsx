'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
    details: 'Bridge Suchi with smart speakers and ambient IoT hardware for hands-free home and office automation.',
    specs: [
      'Smart speakers integration: Google Nest Hub/Audio, Amazon Alexa Echo, and Apple HomePod.',
      'Universal Matter & Thread protocol bridge for direct, vendor-agnostic local smart home control.',
      'Voice-triggered smart home routines: lighting scenes (Philips Hue), climate/thermostats (Nest/Ecobee), door locks, and window shades.',
      'Home Assistant, Tuya, and Samsung SmartThings secure local webhook triggers with end-to-end payload encryption.',
      'Context-aware proactive presence: Suchi prepares morning briefings, dims lights during work sprints, and notifies on upcoming tasks through ambient speaker chimes.'
    ],
    status: 'In Progress',
    priority: 'HIGH',
    updatedAt: '2026-10-02'
  },
  {
    id: 'note-suchi-wake-word-assistant',
    category: 'Voice Assistant',
    title: 'Suchi Voice Assistant — Wake Word "Suchi suno" & Default Agent',
    details: 'Full voice assistant capability triggered by "Suchi suno" hotword, configurable as the default digital assistant across mobile and desktop devices.',
    specs: [
      'Dedicated local on-device wake-word detection engine listening for "Suchi suno" (0ms latency, zero cloud audio streaming until hotword matches).',
      'Configurable as Default Digital Assistant app on Android (android.service.voice.VoiceInteractionService) replacing Google Assistant on long-press home or power button.',
      'iOS Action Button & Siri Shortcut integration: trigger hands-free voice prompt via "Hey Siri, Suchi suno".',
      'High-cadence natural voice streaming with real-time Speech-to-Text and Text-to-Speech audio response playback.',
      'Zero-audio privacy guarantee: local Voice Activity Detection (VAD) discards all ambient chatter; audio snippets are never retained or logged.'
    ],
    status: 'Architecture Ready',
    priority: 'CRITICAL',
    updatedAt: '2026-10-02'
  }
];

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tabs: dashboard, users, apps, tiers, skills, bulk-import, credentials, mcp, logs, notes, bugs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'apps' | 'tiers' | 'skills' | 'bulk-import' | 'credentials' | 'mcp' | 'logs' | 'notes' | 'bugs'>('dashboard');
  const [adminData, setAdminData] = useState<any>(null);

  // Bug Reports & Telemetry State
  const [bugReports, setBugReports] = useState<any[]>([]);
  const [bugFilter, setBugFilter] = useState<'all' | 'OPEN' | 'INVESTIGATING' | 'RESOLVED'>('all');
  const [selectedBugPayload, setSelectedBugPayload] = useState<string | null>(null);

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

  // User & OAuth Tester form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');
  const [newUserTier, setNewUserTier] = useState('BEGINNER');
  const [newUserIsTester, setNewUserIsTester] = useState(true);
  const [userFormMessage, setUserFormMessage] = useState('');
  const [copyToast, setCopyToast] = useState('');
  const [gcpAudit, setGcpAudit] = useState<any>(null);
  const [isAuditingGcp, setIsAuditingGcp] = useState(false);

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

  function handleDownloadTestersCsv() {
    const testers = (adminData?.users || []).filter((u: any) => u.is_oauth_tester).map((u: any) => u.email);
    const csvContent = 'data:text/csv;charset=utf-8,Email Address\n' + testers.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `suchi-gcp-test-users-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Forms
  const [newKeyProvider, setNewKeyProvider] = useState('gemini');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyTier, setNewKeyTier] = useState('ALL');

  // Tier form
  const [tierId, setTierId] = useState('');
  const [tierName, setTierName] = useState('');
  const [tierDesc, setTierDesc] = useState('');
  const [tierLimit, setTierLimit] = useState(50000);

  // Skill form
  const [skillId, setSkillId] = useState('');
  const [skillName, setSkillName] = useState('');
  const [skillDept, setSkillDept] = useState('Sales, Business Development & Revenue Architecture');
  const [skillDesc, setSkillDesc] = useState('');

  // Bulk Markdown form
  const [bulkMarkdown, setBulkMarkdown] = useState('');
  const [bulkMode, setBulkMode] = useState<'merge' | 'replace'>('merge');
  const [bulkStatus, setBulkStatus] = useState('');

  // Notes / Strategic Roadmap State
  const [adminNotes, setAdminNotes] = useState<AdminNoteItem[]>(DEFAULT_ADMIN_NOTES);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState<'Integration' | 'Home Automation' | 'Voice Assistant' | 'Roadmap'>('Integration');
  const [notePriority, setNotePriority] = useState<'CRITICAL' | 'HIGH' | 'STRATEGIC'>('HIGH');
  const [noteDetails, setNoteDetails] = useState('');
  const [noteSpecs, setNoteSpecs] = useState('');
  const [notesCopyToast, setNotesCopyToast] = useState('');

  // Load and save notes from/to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('suchi_admin_strategic_notes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setAdminNotes(parsed);
        }
      }
    } catch (e) {}
  }, []);

  function saveNotes(notes: AdminNoteItem[]) {
    setAdminNotes(notes);
    try {
      localStorage.setItem('suchi_admin_strategic_notes', JSON.stringify(notes));
    } catch (e) {}
  }

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
    let md = '# Suchi Life OS — Executive Architecture & Roadmap Notes\n\n';
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

  // PWA Install Prompt for Admin App
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installHelperOpen, setInstallHelperOpen] = useState(false);

  useEffect(() => {
    fetchAdminData();

    // Set page title for Admin Console PWA
    document.title = 'Suchi Admin Console';

    // Switch manifest link to /manifest-admin.json for Admin PWA standalone installation
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
    } catch (e) {}

    // Auto-detect currently connected Google session email
    async function checkCurrentSession() {
      try {
        const sRes = await fetch('/api/auth/session');
        if (sRes.ok) {
          const sData = await sRes.json();
          if (sData.authenticated && sData.user?.email) {
            setLoginEmail(prev => prev || sData.user.email);
          } else {
            setLoginEmail(prev => prev || 'dhruvabalde@gmail.com');
          }
        } else {
          setLoginEmail(prev => prev || 'dhruvabalde@gmail.com');
        }
      } catch (e) {
        setLoginEmail(prev => prev || 'dhruvabalde@gmail.com');
      }
    }
    checkCurrentSession();

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallAdminApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
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
        // Automatically run live GCP Console tracking diagnostics & fetch bug reports
        handleRunGcpAudit();
        fetchBugReports();
      } else {
        setIsAdminLoggedIn(false);
      }
    } catch {
      setIsAdminLoggedIn(false);
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
          },
        }),
      });
      if (res.ok) {
        setUserFormMessage(`✓ Added user ${newUserEmail.trim()} successfully.`);
        setNewUserEmail('');
        setNewUserName('');
        fetchAdminData();
        setTimeout(() => setUserFormMessage(''), 3000);
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

  function handleCopyAllTesters() {
    const testers = (adminData?.users || []).filter((u: any) => u.is_oauth_tester).map((u: any) => u.email);
    const text = testers.join(', ');
    navigator.clipboard.writeText(text);
    setCopyToast(`Copied ${testers.length} test user emails to clipboard!`);
    setTimeout(() => setCopyToast(''), 3500);
  }

  async function handleToggleApp(appId: string, enabled: boolean) {
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'TOGGLE_APP', payload: { appId, enabled } }),
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
    if (!confirm(`Delete user ${email}?`)) return;
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DELETE_USER', payload: { email } }),
    });
    fetchAdminData();
  }

  // Tier Actions
  async function handleSaveTier(e: React.FormEvent) {
    e.preventDefault();
    if (!tierName.trim() || !tierId.trim()) return;

    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'SAVE_TIER',
        payload: { id: tierId.trim().toUpperCase(), name: tierName.trim(), description: tierDesc, dailyTokenLimit: tierLimit },
      }),
    });

    setTierId('');
    setTierName('');
    setTierDesc('');
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

  // Skill Actions
  async function handleSaveSkill(e: React.FormEvent) {
    e.preventDefault();
    if (!skillName.trim() || !skillId.trim()) return;

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

  // Bulk Markdown Import
  async function handleBulkImport() {
    if (!bulkMarkdown.trim()) return;
    setBulkStatus('Importing skills...');
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_IMPORT_SKILLS',
          payload: { markdownContent: bulkMarkdown, mode: bulkMode },
        }),
      });
      const data = await res.json();
      setBulkStatus(`Successfully imported ${data.count} skills!`);
      setBulkMarkdown('');
      fetchAdminData();
    } catch {
      setBulkStatus('Bulk import failed. Check markdown format.');
    }
  }

  // API Key Actions
  async function handleAddKey(e: React.FormEvent) {
    e.preventDefault();
    if (!newKeyValue.trim()) return;

    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ADD_API_KEY',
        payload: { provider: newKeyProvider, key: newKeyValue.trim(), tier: newKeyTier },
      }),
    });
    setNewKeyValue('');
    fetchAdminData();
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

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Administrator Access</h1>
              <p className="text-xs text-gray-400">Direct restricted system management</p>
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
                placeholder="ddhruva21balde@gmail.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-300 uppercase">Security PIN</label>
                <span className="text-[10px] text-gray-400 font-mono">210996 / 687996</span>
              </div>
              <input
                type="password"
                required
                maxLength={8}
                placeholder="••••••"
                value={loginPin}
                onChange={(e) => setLoginPin(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 tracking-widest text-center font-mono"
              />
            </div>

            {loginError && (
              <div className="text-red-400 text-xs bg-red-900/30 border border-red-800 rounded p-2">
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

          {/* Download Admin App PWA Button */}
          <div className="mt-5 pt-5 border-t border-gray-700/60">
            <button
              type="button"
              onClick={handleInstallAdminApp}
              className="w-full bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-indigo-400">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download Suchi Admin App (PWA)
            </button>

            {installHelperOpen && (
              <div className="mt-3 text-left bg-gray-900/90 border border-gray-700 rounded-xl p-3.5 text-[11px] text-gray-300 space-y-1.5 shadow-inner">
                <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <span>📱</span> Install Suchi Admin App on Device:
                </p>
                <p>• <b>Chrome / Edge (Desktop & Android):</b> Click the Install icon in your browser address bar or menu ➔ &quot;Install Suchi Admin Console&quot;.</p>
                <p>• <b>Safari (iPhone / iPad):</b> Tap Share <span className="text-blue-400 font-bold">⎋</span> ➔ &quot;Add to Home Screen&quot;.</p>
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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      {/* Admin Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center p-1 shadow">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#475569" strokeWidth="2"/>
              <polygon points="16,6.5 19,16 16,14.5" fill="#38bdf8"/>
              <polygon points="16,25.5 19,16 16,17.5" fill="#94a3b8"/>
              <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
            </svg>
          </span>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white">Suchi Admin Console</h1>
            <p className="text-xs text-emerald-400">Authenticated: {adminData?.admin?.email} ({adminData?.admin?.role})</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={handleInstallAdminApp}
            className="text-xs bg-slate-700/90 hover:bg-slate-700 text-indigo-300 border border-slate-600 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Install Suchi Admin App"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-indigo-400">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download App
          </button>
          <Link
            href="/admin/sparring"
            className="text-xs bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm border border-purple-400/30 transition-all"
            title="Launch Voice Sparring Lab to Grill Navia"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            🎙️ Voice Sparring Lab
          </Link>
          <Link href="/" className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg transition-colors">
            Go to Chat
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs bg-red-600/80 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Responsive Horizontal Scroll Tabs */}
      <nav className="bg-gray-800/60 border-b border-gray-700 px-4 sm:px-6 flex gap-4 text-xs sm:text-sm font-medium overflow-x-auto whitespace-nowrap">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'users', label: `Users & Cloud Testers (${adminData?.stats?.testUsersCount || adminData?.users?.length || 1})` },
          { id: 'apps', label: `Cloud APIs & Apps (${adminData?.apps?.length || 20})` },
          { id: 'tiers', label: 'Subscription Tiers' },
          { id: 'skills', label: `100 Life OS Skills (${adminData?.skills?.length || 100})` },
          { id: 'bulk-import', label: 'Bulk MD Import' },
          { id: 'credentials', label: 'API Key Pool' },
          { id: 'mcp', label: 'App MCP Server' },
          { id: 'logs', label: 'Audit Logs' },
          { id: 'notes', label: `Roadmap & Notes (${adminNotes?.length || 0})` },
          { id: 'bugs', label: `Bug Reports & Telemetry (${bugReports?.length || 0})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-1 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 max-w-6xl w-full mx-auto space-y-6">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Total Users</span>
                <p className="text-2xl font-bold text-white mt-1">{adminData?.stats?.totalUsers || 1}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Configured Skills</span>
                <p className="text-2xl font-bold text-white mt-1">{adminData?.skills?.length || 53}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Subscription Tiers</span>
                <p className="text-2xl font-bold text-white mt-1">{adminData?.tiers?.length || 4}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Cloud APIs Enabled</span>
                <p className="text-2xl font-bold text-white mt-1">{adminData?.stats?.activeApps || 20} / 20</p>
              </div>
            </div>

            {/* Voice Sparring Lab Hero Card */}
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Live Voice & Defensibility Lab</span>
                  </div>
                  <h2 className="text-lg font-bold text-white">Grill Navia (The Life OS Advocate)</h2>
                  <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                    Test the existential argument for the Life OS. Challenge Navia by voice or text on security, why Google/Apple won't kill it, why custom prompts fail, and how it delivers a 20x ROI. Navia responds in real-time with steel-trap logic.
                  </p>
                </div>
                <Link
                  href="/admin/sparring"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md transition-all whitespace-nowrap self-start sm:self-auto border border-purple-400/40"
                >
                  <span>🎙️ Enter Voice Arena</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-2">Platform Master Status</h2>
              <p className="text-xs text-gray-400 mb-4">Top-tier encryption & sovereign data firewall are active.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-gray-700/30 rounded border border-gray-700">
                  <span className="text-emerald-400 font-semibold">✓ AES-256-GCM Encryption</span>
                  <p className="text-gray-400 mt-1">All user messages & drafts encrypted at rest.</p>
                </div>
                <div className="p-3 bg-gray-700/30 rounded border border-gray-700">
                  <span className="text-indigo-400 font-semibold">✓ MCP OAuth 2.0 Server</span>
                  <p className="text-gray-400 mt-1">RFC 8414 compliant for Gemini & third-party apps.</p>
                </div>
                <div className="p-3 bg-gray-700/30 rounded border border-gray-700">
                  <span className="text-purple-400 font-semibold">✓ Zero PII Leakage</span>
                  <p className="text-gray-400 mt-1">Data firewall filters identity tokens before export.</p>
                </div>
              </div>
            </div>

            {/* Google Cloud Console Live Tracking Card */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-700 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h2 className="text-base font-bold text-white">Google Cloud Console Tracking (Project #143315250482)</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunGcpAudit}
                    disabled={isAuditingGcp}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span>{isAuditingGcp ? 'Auditing...' : 'Run Audit'}</span>
                  </button>
                  <a
                    href="https://console.cloud.google.com/apis/dashboard?project=143315250482"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Open GCP Console ↗
                  </a>
                </div>
              </div>

              {gcpAudit ? (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-gray-700/30 rounded border border-gray-700">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Gemini API Status</span>
                    <p className="text-emerald-400 font-bold mt-1">{gcpAudit.diagnostics?.geminiAi?.status || 'Active'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{gcpAudit.diagnostics?.geminiAi?.latencyMs || 0}ms latency</p>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded border border-gray-700">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">OAuth Client Status</span>
                    <p className="text-emerald-400 font-bold mt-1">{gcpAudit.diagnostics?.oauthClient?.status || 'CONFIGURED'}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">{gcpAudit.diagnostics?.oauthClient?.clientIdMasked || 'Active'}</p>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded border border-gray-700">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">OAuth Test Users</span>
                    <p className="text-indigo-400 font-bold mt-1">
                      {gcpAudit.testUsers?.count ?? gcpAudit.diagnostics?.testUsers?.count ?? (adminData?.users?.filter((u: any) => u.is_oauth_tester).length || 0)} / 100 Whitelisted
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {gcpAudit.testUsers?.remainingSlots ?? gcpAudit.diagnostics?.testUsers?.remainingSlots ?? Math.max(0, 100 - (adminData?.users?.filter((u: any) => u.is_oauth_tester).length || 0))} slots remaining
                    </p>
                  </div>
                  <div className="p-3 bg-gray-700/30 rounded border border-gray-700">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Database Persistence</span>
                    <p className={`font-bold mt-1 ${gcpAudit.diagnostics?.database?.isPersistent ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {gcpAudit.diagnostics?.database?.isPersistent ? 'POSTGRES ACTIVE' : 'IN-MEMORY RESILIENT'}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Auto-synced state</p>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-400 py-2 flex items-center gap-2">
                  <span className="animate-spin text-sm">🔄</span> Connecting live telemetry to Google Cloud Project 143315250482...
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS & GOOGLE CLOUD TESTERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Google Cloud OAuth Testing Module */}
            <div className="bg-gray-800 border border-indigo-900/50 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-700 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">Google Cloud OAuth Test Users Whitelist</h2>
                    <span className="bg-amber-900/50 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-700">
                      OAUTH STATUS: TESTING (MAX 100)
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    While the Google Cloud OAuth Consent Screen is in <strong>Testing</strong> mode, only registered Test Users can sign in with Google.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleRunGcpAudit}
                    disabled={isAuditingGcp}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow"
                  >
                    <span>{isAuditingGcp ? '🔄 Testing GCP APIs...' : '⚡ Audit GCP Project'}</span>
                  </button>
                  <button
                    onClick={handleCopyAllTesters}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow"
                  >
                    <span>📋 Copy All Emails</span>
                  </button>
                  <button
                    onClick={handleDownloadTestersCsv}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-600 shadow"
                  >
                    <span>📥 Download CSV</span>
                  </button>
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent?project=143315250482"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-600"
                  >
                    <span>↗ Open GCP Console</span>
                  </a>
                </div>
              </div>

              {gcpAudit && (
                <div className="mt-4 p-4 rounded-xl bg-gray-900 border border-gray-700 text-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Live Google Cloud Diagnostics (Project #{gcpAudit.diagnostics?.projectNumber || '143315250482'})</span>
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {new Date(gcpAudit.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-2.5 rounded-lg bg-gray-800/80 border border-gray-700">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Gemini AI Model</span>
                      <p className="text-emerald-400 font-bold mt-0.5">{gcpAudit.diagnostics?.geminiAi?.status || 'Active'}</p>
                      <p className="text-[11px] text-gray-400">Latency: {gcpAudit.diagnostics?.geminiAi?.latencyMs || 0}ms ({gcpAudit.diagnostics?.geminiAi?.model || 'gemini-2.0-flash'})</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-gray-800/80 border border-gray-700">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">OAuth Credentials</span>
                      <p className="text-indigo-400 font-bold mt-0.5">{gcpAudit.diagnostics?.oauthClient?.status || 'CONFIGURED'}</p>
                      <p className="text-[11px] text-gray-400 font-mono truncate">{gcpAudit.diagnostics?.oauthClient?.clientIdMasked || 'Configured'}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-gray-800/80 border border-gray-700">
                      <span className="text-[10px] text-gray-400 uppercase font-semibold">Database Persistence</span>
                      <p className={`font-bold mt-0.5 ${gcpAudit.diagnostics?.database?.isPersistent ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {gcpAudit.diagnostics?.database?.isPersistent ? 'PostgreSQL Active' : 'In-Memory Fallback'}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">{gcpAudit.diagnostics?.database?.status || 'Active'}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                    <a
                      href={gcpAudit.gcpLinks?.credentials || 'https://console.cloud.google.com/apis/credentials'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      ↗ OAuth Client Credentials
                    </a>
                    <span className="text-gray-600">•</span>
                    <a
                      href={gcpAudit.gcpLinks?.apisDashboard || 'https://console.cloud.google.com/apis/dashboard'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      ↗ APIs & Services Dashboard
                    </a>
                    <span className="text-gray-600">•</span>
                    <a
                      href={gcpAudit.gcpLinks?.apiLibrary || 'https://console.cloud.google.com/apis/library'}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline flex items-center gap-1"
                    >
                      ↗ Google Cloud APIs Library
                    </a>
                  </div>
                </div>
              )}

              {copyToast && (
                <div className="mt-3 bg-emerald-900/50 border border-emerald-600 text-emerald-200 text-xs px-3 py-2 rounded-lg font-medium">
                  {copyToast}
                </div>
              )}

              {/* Add User / Whitelist Tester Form */}
              <form onSubmit={handleAddNewUser} className="mt-5 bg-gray-900/60 p-4 rounded-xl border border-gray-700/60">
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider mb-3">Add User & Whitelist Cloud Tester</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Gmail Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="user@gmail.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Subscription Tier</label>
                    <select
                      value={newUserTier}
                      onChange={(e) => setNewUserTier(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {adminData?.tiers?.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="USER">Standard User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-300">
                    <input
                      type="checkbox"
                      checked={newUserIsTester}
                      onChange={(e) => setNewUserIsTester(e.target.checked)}
                      className="rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Automatically grant Google Cloud OAuth Tester status</span>
                  </label>

                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition-colors"
                  >
                    + Add & Save User
                  </button>
                </div>

                {userFormMessage && (
                  <p className="mt-2 text-xs text-emerald-400">{userFormMessage}</p>
                )}
              </form>
            </div>

            {/* Users Table */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white">Registered Users & Account Tiers</h2>
                  <p className="text-xs text-gray-400">Total Users: {adminData?.users?.length || 0} | Whitelisted Testers: {adminData?.stats?.testUsersCount || 0}</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm text-gray-300">
                  <thead className="bg-gray-700/50 text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-4 sm:px-6 py-3">Gmail Address</th>
                      <th className="px-4 sm:px-6 py-3">Role</th>
                      <th className="px-4 sm:px-6 py-3">Subscription Tier</th>
                      <th className="px-4 sm:px-6 py-3">Cloud OAuth Tester</th>
                      <th className="px-4 sm:px-6 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {adminData?.users?.map((u: any) => (
                      <tr key={u.email} className="hover:bg-gray-700/30">
                        <td className="px-4 sm:px-6 py-3 font-medium text-white">
                          <div className="flex flex-col">
                            <span>{u.email}</span>
                            {u.name && <span className="text-[11px] text-gray-400">{u.name}</span>}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            u.role === 'SUPER_ADMIN' ? 'bg-purple-900/60 text-purple-300' : 'bg-gray-700 text-gray-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <select
                            value={u.subscription_tier}
                            onChange={(e) => handleUserTierChange(u.email, e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                          >
                            {adminData?.tiers?.map((t: any) => (
                              <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <button
                            onClick={() => handleToggleTestUser(u.email, !u.is_oauth_tester)}
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                              u.is_oauth_tester
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700 hover:bg-emerald-900'
                                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            }`}
                          >
                            {u.is_oauth_tester ? '✓ Whitelisted' : '+ Grant Tester'}
                          </button>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          {u.role !== 'SUPER_ADMIN' && (
                            <button
                              onClick={() => handleDeleteUser(u.email)}
                              className="text-xs text-red-400 hover:text-red-300 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* APPS & INTEGRATIONS TAB */}
        {activeTab === 'apps' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white">Google Cloud Apps & Workspace Integrations</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Centralized inventory of all 20 enabled Google APIs, operational health, and subscription tier routing.
                  </p>
                </div>
                <a
                  href="https://console.cloud.google.com/apis/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <span>↗ Google Cloud APIs Dashboard</span>
                </a>
              </div>
            </div>

            {/* Categories */}
            {['Workspace & Productivity', 'AI & Analytics', 'Cloud Infrastructure', 'Security & Operations'].map(category => {
              const categoryApps = (adminData?.apps || []).filter((a: any) => a.category === category);
              if (categoryApps.length === 0) return null;

              return (
                <div key={category} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">{category} ({categoryApps.length})</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categoryApps.map((app: any) => (
                      <div key={app.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-semibold text-sm text-white">{app.name}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              app.status === 'ACTIVE IN APP'
                                ? 'bg-emerald-900/50 text-emerald-300 border-emerald-700'
                                : 'bg-sky-900/50 text-sky-300 border-sky-700'
                            }`}>
                              {app.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mb-3">{app.description}</p>
                        </div>

                        <div className="pt-3 border-t border-gray-700/60 flex items-center justify-between text-xs">
                          <div className="flex flex-wrap gap-1">
                            {app.allowedTiers?.map((tier: string) => (
                              <span key={tier} className="bg-gray-700 text-gray-300 text-[10px] px-1.5 py-0.5 rounded">
                                {tier}
                              </span>
                            ))}
                          </div>

                          <button
                            onClick={() => handleToggleApp(app.id, !app.enabled)}
                            className={`px-3 py-1 rounded font-semibold text-xs transition-colors ${
                              app.enabled
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-400'
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

        {/* SUBSCRIPTION TIERS TAB */}
        {activeTab === 'tiers' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-2">Manage Subscription Tiers</h2>
              <p className="text-xs text-gray-400 mb-6">Create, rename, and set token budgets for subscription tiers</p>

              <form onSubmit={handleSaveTier} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-gray-700/30 p-4 rounded-xl border border-gray-700 mb-6">
                <input
                  type="text"
                  placeholder="Tier ID (e.g. PRO)"
                  value={tierId}
                  onChange={(e) => setTierId(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs uppercase"
                  required
                />
                <input
                  type="text"
                  placeholder="Tier Display Name"
                  value={tierName}
                  onChange={(e) => setTierName(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <input
                  type="number"
                  placeholder="Daily Token Limit"
                  value={tierLimit}
                  onChange={(e) => setTierLimit(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold py-2"
                >
                  Save / Add Tier
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {adminData?.tiers?.map((t: any) => (
                  <div key={t.id} className="bg-gray-700/40 border border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-sm text-white">{t.name}</span>
                        <span className="text-[10px] bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded font-mono">{t.id}</span>
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
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                <div>
                  <h2 className="text-base font-bold text-white">100 Life OS Skills Catalog ({adminData?.skills?.length || 100} Skills)</h2>
                  <p className="text-xs text-gray-400">All 100 modular Life OS skills organized across 8 core life departments</p>
                </div>
                <button
                  onClick={() => setActiveTab('bulk-import')}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  Bulk Import from MD ↗
                </button>
              </div>

              {/* Add Skill Form */}
              <form onSubmit={handleSaveSkill} className="bg-gray-700/30 p-4 rounded-xl border border-gray-700 grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Skill ID (e.g. pitch-deck)"
                  value={skillId}
                  onChange={(e) => setSkillId(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Skill Name"
                  value={skillName}
                  onChange={(e) => setSkillName(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Department"
                  value={skillDept}
                  onChange={(e) => setSkillDept(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                  required
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold py-2"
                >
                  + Add Single Skill
                </button>
              </form>

              {/* Skills List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminData?.skills?.map((s: any) => (
                  <div key={s.id} className="bg-gray-700/40 border border-gray-700 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-white text-sm">{s.name}</span>
                        <button
                          onClick={() => handleToggleSkill(s.id, !s.enabled)}
                          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                            s.enabled ? 'bg-emerald-600 text-white' : 'bg-gray-600 text-gray-300'
                          }`}
                        >
                          {s.enabled ? 'Active' : 'Disabled'}
                        </button>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-indigo-400 mt-1 inline-block">
                        {s.department}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">{s.description}</p>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-700/50">
                      <span className="text-[10px] text-gray-500 font-mono">{s.id}</span>
                      <button
                        onClick={() => handleDeleteSkill(s.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BULK IMPORT FROM MARKDOWN TAB */}
        {activeTab === 'bulk-import' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-2">Bulk Markdown Skills Importer</h2>
            <p className="text-xs text-gray-400 mb-4">
              Paste or upload any Master Skills Markdown file. The system will automatically parse names, departments, descriptions, questions, and parameters.
            </p>

            <div className="flex items-center gap-4 mb-4 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="importMode"
                  value="merge"
                  checked={bulkMode === 'merge'}
                  onChange={() => setBulkMode('merge')}
                />
                <span>Merge / Update with Existing Skills</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={bulkMode === 'replace'}
                  onChange={() => setBulkMode('replace')}
                />
                <span className="text-red-400">Replace All Skills</span>
              </label>
            </div>

            <textarea
              rows={12}
              value={bulkMarkdown}
              onChange={(e) => setBulkMarkdown(e.target.value)}
              placeholder="Paste Master Skills Markdown content here..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 font-mono text-xs text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
            />

            {bulkStatus && (
              <div className="p-3 bg-indigo-900/30 border border-indigo-700 rounded-lg text-xs text-indigo-300 mb-4">
                {bulkStatus}
              </div>
            )}

            <button
              onClick={handleBulkImport}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-xs font-bold"
            >
              Parse & Ingest Skills
            </button>
          </div>
        )}

        {/* API KEY POOL TAB */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-2">API Key Pool Management</h2>
              <p className="text-xs text-gray-400 mb-6">
                Pool multiple Gemini, OpenAI, or Anthropic API keys. Maps keys by tier with automatic load balancing and rate-limit recovery.
              </p>

              <form onSubmit={handleAddKey} className="flex flex-col sm:flex-row gap-3 mb-6 bg-gray-700/30 p-4 rounded-xl border border-gray-700">
                <select
                  value={newKeyProvider}
                  onChange={(e) => setNewKeyProvider(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                >
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                </select>

                <input
                  type="password"
                  placeholder="Paste API Key here..."
                  value={newKeyValue}
                  onChange={(e) => setNewKeyValue(e.target.value)}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                />

                <select
                  value={newKeyTier}
                  onChange={(e) => setNewKeyTier(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-xs"
                >
                  <option value="ALL">All Tiers</option>
                  {adminData?.tiers?.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                >
                  + Add Key
                </button>
              </form>

              <div className="space-y-2">
                {adminData?.apiKeys?.map((k: any) => (
                  <div key={k.id} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-700 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold uppercase text-indigo-400">{k.provider}</span>
                      <span className="font-mono text-gray-300">{k.key_masked}</span>
                      <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-[10px]">Tier: {k.tier}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">Requests: {k.usage_count}</span>
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MCP TAB */}
        {activeTab === 'mcp' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-2">Model Context Protocol (MCP) Server Endpoint</h2>
            <p className="text-xs text-gray-400 mb-6">
              Connect external AI tools (Gemini Third-Party Apps, Claude Desktop, Antigravity) with standard OAuth 2.0 and Zero-Knowledge Data Firewall.
            </p>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Public MCP Endpoint</label>
              <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded border border-gray-700 font-mono text-xs text-emerald-400">
                <span className="truncate">{adminData?.mcpEndpoint}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(adminData?.mcpEndpoint)}
                  className="text-xs text-gray-300 hover:text-white ml-2 bg-gray-700 px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-2">
              <p>• Auth Type: <span className="text-white font-semibold">Standard OAuth 2.0 (RFC 8414 Discovery Enabled)</span></p>
              <p>• Authorize URL: <span className="text-white font-semibold">{adminData?.mcpEndpoint}/oauth/authorize</span></p>
              <p>• Token URL: <span className="text-white font-semibold">{adminData?.mcpEndpoint}/oauth/token</span></p>
              <p>• Data Firewall: <span className="text-emerald-400 font-semibold">Active (Zero personal details or tokens shared)</span></p>
            </div>
          </div>
        )}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-base font-bold text-white">Administrator Audit Logs</h2>
              <p className="text-xs text-gray-400">Tamper-evident record of all tier modifications, key additions, and settings</p>
            </div>
            <div className="divide-y divide-gray-700 text-xs">
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

        {/* NOTES & STRATEGIC ROADMAP TAB */}
        {activeTab === 'notes' && (
          <div className="space-y-6">
            {/* Top Toolbar */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Strategic Architecture & Roadmap Notes</h2>
                  <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/60 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {adminNotes.length} Core Specifications
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Architecture guidelines for Microsoft API integration, smart home automation, and the Suchi wake-word voice agent.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleCopyNotesMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Notes as Markdown
                </button>
                <button
                  type="button"
                  onClick={handleResetNotesToDefault}
                  className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium transition-colors"
                >
                  Reset Defaults
                </button>
              </div>
            </div>

            {notesCopyToast && (
              <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {notesCopyToast}
              </div>
            )}

            {/* Note Cards List */}
            <div className="space-y-4">
              {adminNotes.map((note) => {
                const priorityColor =
                  note.priority === 'CRITICAL'
                    ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                    : note.priority === 'HIGH'
                    ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                    : 'bg-indigo-950/60 border-indigo-800 text-indigo-300';

                const statusColor =
                  note.status === 'Architecture Ready'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                    : note.status === 'In Progress'
                    ? 'bg-blue-950/60 border-blue-800 text-blue-300'
                    : 'bg-gray-800 border-gray-700 text-gray-400';

                return (
                  <div
                    key={note.id}
                    className="bg-gray-800 border border-gray-700 hover:border-gray-600 rounded-xl p-5 transition-colors shadow-sm space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${priorityColor}`}>
                          {note.priority}
                        </span>
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-gray-700 text-gray-300">
                          {note.category}
                        </span>
                        <h3 className="font-bold text-base text-white">{note.title}</h3>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleToggleNoteStatus(note.id)}
                          title="Click to toggle status (Planned ➔ In Progress ➔ Architecture Ready)"
                          className={`text-xs px-2.5 py-1 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${statusColor}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{note.status}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Delete Note"
                          className="p-1 text-gray-400 hover:text-rose-400 rounded hover:bg-gray-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{note.details}</p>

                    {note.specs && note.specs.length > 0 && (
                      <div className="bg-gray-900/80 border border-gray-700/80 rounded-lg p-3 space-y-1.5 text-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                          Implementation Specs:
                        </span>
                        <ul className="space-y-1.5">
                          {(note.specs || []).map((spec, sIdx) => (
                            <li key={sIdx} className="text-gray-300 flex items-start gap-2">
                              <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                              <span className="leading-snug">{spec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                      <span>ID: {note.id}</span>
                      <span>Last updated: {note.updatedAt}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add New Note Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="text-sm font-bold text-white mb-1">Add Strategic Note or Architecture Directive</h3>
              <p className="text-xs text-gray-400 mb-4">Record future technical milestones, protocol requirements, or hardware targets.</p>

              <form onSubmit={handleAddNote} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Note Title</label>
                    <input
                      type="text"
                      required
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="e.g. Local LLM Fallback with Ollama on Mac/PC"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Category</label>
                    <select
                      value={noteCategory}
                      onChange={(e) => setNoteCategory(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Integration">Integration</option>
                      <option value="Home Automation">Home Automation</option>
                      <option value="Voice Assistant">Voice Assistant</option>
                      <option value="Roadmap">Roadmap</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Priority</label>
                    <select
                      value={notePriority}
                      onChange={(e) => setNotePriority(e.target.value as any)}
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="STRATEGIC">STRATEGIC</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Overview Description</label>
                    <input
                      type="text"
                      value={noteDetails}
                      onChange={(e) => setNoteDetails(e.target.value)}
                      placeholder="Executive summary of this architectural note"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">
                    Implementation Specs & Checklist (One point per line)
                  </label>
                  <textarea
                    rows={4}
                    value={noteSpecs}
                    onChange={(e) => setNoteSpecs(e.target.value)}
                    placeholder="Enter technical specifications, endpoints, or required libraries (one per line)..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    Save Note to Roadmap
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* BUG REPORTS & USER TELEMETRY TAB */}
        {activeTab === 'bugs' && (
          <div className="space-y-6">
            {/* Header & Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-800 border border-gray-700 rounded-xl p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-white">Suchi Bug Reports & Incomplete Work Telemetry</h2>
                  <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30">
                    Live Diagnostics
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Specific reports sent by users when an action failed, error occurred, or work was not done properly.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={fetchBugReports}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-gray-400 uppercase font-semibold">Total Reports</span>
                <p className="text-2xl font-bold text-white mt-1">{bugReports.length}</p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-rose-400 uppercase font-semibold">Open Issues</span>
                <p className="text-2xl font-bold text-rose-400 mt-1">
                  {bugReports.filter(b => b.status === 'OPEN').length}
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-amber-400 uppercase font-semibold">Investigating</span>
                <p className="text-2xl font-bold text-amber-400 mt-1">
                  {bugReports.filter(b => b.status === 'INVESTIGATING').length}
                </p>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
                <span className="text-xs text-emerald-400 uppercase font-semibold">Resolved</span>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {bugReports.filter(b => b.status === 'RESOLVED').length}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              {(['all', 'OPEN', 'INVESTIGATING', 'RESOLVED'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setBugFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                    bugFilter === f
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {f === 'all' ? 'All Reports' : f.toLowerCase()}
                </button>
              ))}
            </div>

            {/* Bug Reports Cards List */}
            <div className="space-y-4">
              {bugReports
                .filter(b => (bugFilter === 'all' ? true : b.status === bugFilter))
                .map(report => (
                  <div
                    key={report.id}
                    className="bg-gray-800/90 border border-gray-700 rounded-2xl p-5 space-y-4 shadow-sm"
                  >
                    {/* Top Row: User & Status Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-700/80">
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

                      {/* Status Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateBugStatus(report.id, 'INVESTIGATING')}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                            report.status === 'INVESTIGATING'
                              ? 'bg-amber-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Investigating
                        </button>
                        <button
                          onClick={() => handleUpdateBugStatus(report.id, 'RESOLVED')}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                            report.status === 'RESOLVED'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Mark Resolved ✓
                        </button>
                        <button
                          onClick={() => handleUpdateBugStatus(report.id, 'OPEN')}
                          className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                            report.status === 'OPEN'
                              ? 'bg-rose-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          Reopen
                        </button>
                      </div>
                    </div>

                    {/* Summary & Issue Type */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-[10px] font-mono uppercase">
                          {report.issueType.replace('_', ' ')}
                        </span>
                        <h3 className="text-sm font-bold text-gray-100">{report.summary}</h3>
                      </div>
                      {report.userDescription && (
                        <div className="mt-2 p-3 bg-gray-900/90 rounded-xl border border-gray-700/60 text-xs text-gray-300">
                          <span className="text-gray-500 font-semibold uppercase text-[10px] block mb-1">
                            User Explanation:
                          </span>
                          <p className="italic">"{report.userDescription}"</p>
                        </div>
                      )}
                    </div>

                    {/* Chat Context Snippet */}
                    {(report.lastUserMessage || report.lastAssistantResponse) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {report.lastUserMessage && (
                          <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-700/40">
                            <span className="text-[10px] uppercase font-semibold text-blue-400 block mb-1">
                              Last User Message:
                            </span>
                            <p className="text-gray-300 line-clamp-3 font-mono text-[11px]">
                              {report.lastUserMessage}
                            </p>
                          </div>
                        )}
                        {report.lastAssistantResponse && (
                          <div className="p-3 bg-gray-900/60 rounded-xl border border-gray-700/40">
                            <span className="text-[10px] uppercase font-semibold text-indigo-400 block mb-1">
                              Last Assistant Response:
                            </span>
                            <p className="text-gray-300 line-clamp-3 font-mono text-[11px]">
                              {report.lastAssistantResponse}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Failed Action Data */}
                    {report.failedAction && (
                      <div className="p-3 bg-rose-950/30 rounded-xl border border-rose-900/50 text-xs">
                        <span className="text-[10px] uppercase font-semibold text-rose-400 block mb-1">
                          Failed Action Details:
                        </span>
                        <pre className="text-rose-200 font-mono text-[11px] whitespace-pre-wrap overflow-x-auto">
                          {JSON.stringify(report.failedAction, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* System & Device Diagnostics */}
                    <div className="pt-2 border-t border-gray-700/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-gray-400">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span><strong>Platform:</strong> {report.diagnostics?.platform}</span>
                        <span><strong>Screen:</strong> {report.diagnostics?.screenSize}</span>
                        <span>
                          <strong>Help Opt-in:</strong>{' '}
                          {report.diagnostics?.helpOptIn ? (
                            <span className="text-emerald-400">Active ✓</span>
                          ) : (
                            <span className="text-gray-500">Anonymous</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedBugPayload(
                              selectedBugPayload === report.id ? null : report.id
                            );
                          }}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                        >
                          {selectedBugPayload === report.id ? 'Hide Diagnostics JSON' : 'Inspect Diagnostics JSON'}
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(JSON.stringify(report, null, 2));
                            alert('Diagnostics JSON copied to clipboard!');
                          }}
                          className="px-2 py-0.5 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 text-[10px]"
                        >
                          Copy JSON
                        </button>
                      </div>
                    </div>

                    {/* Raw Diagnostics JSON Viewer */}
                    {selectedBugPayload === report.id && (
                      <div className="p-3 bg-black/80 rounded-xl border border-gray-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60">
                        <pre>{JSON.stringify(report, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ))}

              {bugReports.length === 0 && (
                <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
                  <p className="text-gray-400 text-sm">No bug reports received yet.</p>
                  <p className="text-xs text-gray-500 mt-1">
                    When users encounter tool errors or click 'Send Bug Report', their diagnostics will populate here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
