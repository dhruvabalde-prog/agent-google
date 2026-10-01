'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminPage() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Admin Data
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'skills' | 'credentials' | 'mcp' | 'logs'>('dashboard');
  const [adminData, setAdminData] = useState<any>(null);

  // Forms
  const [newKeyProvider, setNewKeyProvider] = useState('gemini');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyTier, setNewKeyTier] = useState('ALL');

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

  async function handleUserTierChange(email: string, tier: string) {
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'UPDATE_USER_TIER',
        payload: { email, tier },
      }),
    });
    fetchAdminData();
  }

  async function handleToggleSkill(skillId: string, enabled: boolean) {
    await fetch('/api/admin/actions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'TOGGLE_SKILL',
        payload: { skillId, enabled },
      }),
    });
    fetchAdminData();
  }

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

  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md w-full shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Administrator Access</h1>
              <p className="text-xs text-gray-400">Restricted system management console</p>
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
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
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
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white">
            AG
          </span>
          <div>
            <h1 className="font-bold text-lg text-white">Agent Google Admin Panel</h1>
            <p className="text-xs text-emerald-400">Authenticated: {adminData?.admin?.email} ({adminData?.admin?.role})</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Tabs */}
      <nav className="bg-gray-800/50 border-b border-gray-700 px-6 flex gap-4 text-sm font-medium">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'users', label: 'Users & Tiers' },
          { id: 'skills', label: 'Skills & Departments' },
          { id: 'credentials', label: 'API Key Pool' },
          { id: 'mcp', label: 'App MCP Server' },
          { id: 'logs', label: 'Audit Logs' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-semibold'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content Area */}
      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Users</span>
                <p className="text-3xl font-bold text-white mt-2">{adminData?.stats?.totalUsers || 1}</p>
                <span className="text-xs text-emerald-400 mt-1 inline-block">Active accounts</span>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Active Skills</span>
                <p className="text-3xl font-bold text-white mt-2">{adminData?.stats?.activeSkills || 6}</p>
                <span className="text-xs text-indigo-400 mt-1 inline-block">Enabled across tiers</span>
              </div>
              <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Pooled API Keys</span>
                <p className="text-3xl font-bold text-white mt-2">{adminData?.stats?.totalKeys || 1}</p>
                <span className="text-xs text-emerald-400 mt-1 inline-block">Automatic load balancing</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Subscription Tiers Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ADMIN'].map(tier => {
                  const count = adminData?.users?.filter((u: any) => u.subscription_tier === tier).length || 0;
                  return (
                    <div key={tier} className="bg-gray-700/40 rounded-lg p-3 border border-gray-700">
                      <span className="text-xs font-semibold text-gray-300">{tier}</span>
                      <p className="text-xl font-bold text-white mt-1">{count} Users</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-base font-bold text-white">User Accounts & Subscription Tiers</h2>
              <p className="text-xs text-gray-400">Map users by Gmail ID to their respective feature & token tiers</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-700/50 text-xs uppercase text-gray-400">
                  <tr>
                    <th className="px-6 py-3">Gmail Address</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Subscription Tier</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {adminData?.users?.map((u: any) => (
                    <tr key={u.email} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 font-medium text-white">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${
                          u.role === 'SUPER_ADMIN' ? 'bg-purple-900/60 text-purple-300' : 'bg-gray-700 text-gray-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={u.subscription_tier}
                          onChange={(e) => handleUserTierChange(u.email, e.target.value)}
                          className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="BEGINNER">BEGINNER</option>
                          <option value="INTERMEDIATE">INTERMEDIATE</option>
                          <option value="ADVANCED">ADVANCED</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-xs text-emerald-400">Active</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-2">Autonomous Skills Catalog</h2>
              <p className="text-xs text-gray-400 mb-6">Enable or disable specific skills across the platform globally</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {adminData?.skills?.map((s: any) => (
                  <div key={s.id} className="bg-gray-700/40 border border-gray-700 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{s.name}</span>
                        <span className="text-[10px] uppercase font-bold bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded">
                          {s.department}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{s.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleSkill(s.id, !s.enabled)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        s.enabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                      }`}
                    >
                      {s.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CREDENTIALS & POOL TAB */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h2 className="text-base font-bold text-white mb-2">API Key Pool Management</h2>
              <p className="text-xs text-gray-400 mb-6">
                Pool multiple Gemini, OpenAI, or Anthropic API keys. The system automatically round-robins across keys and handles rate-limit failovers.
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
                  <option value="BEGINNER">Beginner Only</option>
                  <option value="INTERMEDIATE">Intermediate Only</option>
                  <option value="ADVANCED">Advanced Only</option>
                </select>

                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
                >
                  + Add Key to Pool
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
                    <div className="text-gray-400">
                      Requests: <span className="text-white font-semibold">{k.usage_count}</span>
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
              Connect external AI agents (like Claude Desktop, Antigravity, Cursor, etc.) directly to your Agent Google tools via MCP.
            </p>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 mb-4">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Endpoint URL</label>
              <div className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded border border-gray-700 font-mono text-xs text-emerald-400">
                <span>{adminData?.mcpEndpoint}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(adminData?.mcpEndpoint)}
                  className="text-xs text-gray-300 hover:text-white ml-2 bg-gray-700 px-2 py-1 rounded"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-2">
              <p>• Protocol: <span className="text-white font-semibold">JSON-RPC 2.0 (mcp-2024-11-05)</span></p>
              <p>• Supported Methods: <span className="text-white font-semibold">tools/list, tools/call</span></p>
              <p>• Tools Excluded: <span className="text-white font-semibold">Only enabled skills are exposed</span></p>
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
