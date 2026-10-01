'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Tabs: dashboard, users, apps, tiers, skills, bulk-import, credentials, mcp, logs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'apps' | 'tiers' | 'skills' | 'bulk-import' | 'credentials' | 'mcp' | 'logs'>('dashboard');
  const [adminData, setAdminData] = useState<any>(null);

  // User & OAuth Tester form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('USER');
  const [newUserTier, setNewUserTier] = useState('BEGINNER');
  const [newUserIsTester, setNewUserIsTester] = useState(true);
  const [userFormMessage, setUserFormMessage] = useState('');
  const [copyToast, setCopyToast] = useState('');

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

  useEffect(() => {
    fetchAdminData();
  }, []);

  async function fetchAdminData() {
    try {
      const res = await fetch('/api/admin/data');
      if (res.ok) {
        const data = await res.json();
        setAdminData(data);
        setIsAdminLoggedIn(true);
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
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Security PIN</label>
              <input
                type="password"
                required
                maxLength={8}
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {isLoading ? 'Verifying...' : 'Unlock Console'}
            </button>
          </form>

          <div className="mt-6 text-center">
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
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
            AG
          </span>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-white">Agent Google Admin Panel</h1>
            <p className="text-xs text-emerald-400">Authenticated: {adminData?.admin?.email} ({adminData?.admin?.role})</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
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
          { id: 'skills', label: `Skills (${adminData?.skills?.length || 53})` },
          { id: 'bulk-import', label: 'Bulk MD Import' },
          { id: 'credentials', label: 'API Key Pool' },
          { id: 'mcp', label: 'App MCP Server' },
          { id: 'logs', label: 'Audit Logs' },
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
                    onClick={handleCopyAllTesters}
                    className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow"
                  >
                    <span>📋 Copy All Tester Emails</span>
                  </button>
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white font-medium px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-600"
                  >
                    <span>↗ Open Cloud Console</span>
                  </a>
                </div>
              </div>

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
                  <h2 className="text-base font-bold text-white">Skills Catalog ({adminData?.skills?.length || 53} Skills)</h2>
                  <p className="text-xs text-gray-400">All 53 modular skills organized across 9 departments</p>
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
      </main>
    </div>
  );
}
