'use client';

import React, { useState } from 'react';
import { AppMode, UserProfile, SharedCollaborationItem } from '@/lib/types';

interface ChatsCollaborationViewProps {
  mode: AppMode;
  profile: UserProfile | null;
  onLaunchPrompt: (prompt: string) => void;
  isDarkMode?: boolean;
}

export default function ChatsCollaborationView({
  mode,
  profile,
  onLaunchPrompt,
  isDarkMode = false,
}: ChatsCollaborationViewProps) {
  // Tabs: 'workspace' | 'spaces' | 'whatsapp' | 'circle' (Family if Home mode, Team if Work mode)
  const [activeSubTab, setActiveSubTab] = useState<'workspace' | 'spaces' | 'whatsapp' | 'circle'>('workspace');
  const [selectedChannel, setSelectedChannel] = useState<string>('ws-inbox');
  const [chatInputText, setChatInputText] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRelation, setInviteRelation] = useState(mode === 'home' ? 'Family Member' : 'Team Member');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // Quick WhatsApp Direct Link State
  const [waTargetNumber, setWaTargetNumber] = useState('');
  const [waMessageText, setWaMessageText] = useState('');

  // Google Workspace Channels
  const workspaceStreams = [
    { id: 'ws-inbox', name: '📬 VIP Priority Inbox', unread: 2, icon: '📧', description: 'Urgent threads requiring executive response' },
    { id: 'ws-docs', name: '📄 Docs Reviews & Approvals', unread: 1, icon: '📝', description: 'Strategy memos, contracts and briefs' },
    { id: 'ws-sheets', name: '📊 Sheets Financial Ledgers', unread: 0, icon: '📈', description: 'Revenue trackers, budgets, metrics' },
    { id: 'ws-drive', name: '🗂️ Google Drive Assets', unread: 0, icon: '📁', description: 'Presentations, blueprints & archives' },
  ];

  // Google Chat Spaces & Direct Messages
  const spaces = [
    { id: 'space-general', name: '📢 General Workspace', unread: 1, members: 5 },
    { id: 'space-warroom', name: '⚡ Strategy & War Room', unread: 0, members: 4 },
    { id: 'space-sprint', name: '🚀 Execution & Operations', unread: 0, members: 3 },
  ];

  const directMessages = [
    { id: 'dm-1', name: 'Operations Lead', status: 'online', unread: 1 },
    { id: 'dm-2', name: 'Finance Controller', status: 'offline', unread: 0 },
  ];

  // Shared items
  const sharedItems: SharedCollaborationItem[] = mode === 'home' ? [
    {
      id: 'sh-h1',
      title: 'Annual Preventive Health Checkup for Family',
      type: 'calendar',
      category: 'home',
      assigneeName: profile?.name || 'Self',
      assigneeEmail: profile?.primaryEmail || profile?.email || '',
      status: 'in_progress',
      dueDate: 'Saturday 10:00 AM',
    },
    {
      id: 'sh-h2',
      title: 'Weekly Organic Grocery & Nutrition Restock',
      type: 'task',
      category: 'home',
      assigneeName: 'Family Circle',
      assigneeEmail: 'home@circle',
      status: 'pending',
      dueDate: 'Sunday',
    },
  ] : [
    {
      id: 'sh-w1',
      title: 'Review Q4 Strategic Revenue Model & Retainers in Sheets',
      type: 'task',
      category: 'work',
      assigneeName: 'Finance',
      assigneeEmail: 'finance@work',
      status: 'in_progress',
      dueDate: 'Tomorrow',
    },
    {
      id: 'sh-w2',
      title: 'Prepare Executive Briefing Deck for Leadership in Slides',
      type: 'goal',
      category: 'work',
      assigneeName: profile?.name || 'Self',
      assigneeEmail: profile?.workEmail || profile?.email || '',
      status: 'in_progress',
      dueDate: '15 Oct',
    },
  ];

  function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) return;

    setInviteSuccessMsg(`Invitation dispatched to ${inviteEmail}.`);
    setTimeout(() => {
      setInviteSuccessMsg('');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    }, 2000);
  }

  function handleLaunchWhatsAppDirect() {
    const cleanNumber = waTargetNumber.replace(/\D/g, '');
    if (!cleanNumber) return;
    const finalNumber = cleanNumber.length === 10 ? `91${cleanNumber}` : cleanNumber;
    const url = `https://wa.me/${finalNumber}?text=${encodeURIComponent(waMessageText || 'Hello, connecting from Life OS.')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className={`flex-1 flex flex-col md:flex-row overflow-hidden max-w-6xl mx-auto w-full transition-colors ${
      isDarkMode ? 'text-zinc-100 bg-[#0b0f19]' : 'text-zinc-900 bg-slate-50'
    }`}>
      {/* Sidebar: Navigation & Channels */}
      <div className={`w-full md:w-80 border-r flex flex-col flex-shrink-0 transition-colors ${
        isDarkMode ? 'bg-[#111827]/90 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
              💬
            </span>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Collaboration Hub</h2>
              <p className="text-[11px] text-zinc-400">
                {mode === 'home' ? 'Home Mode Active' : 'Work Mode Active'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs"
            title="Invite Collaborator"
          >
            + Invite
          </button>
        </div>

        {/* 4 Clear Distinct Sub-Tabs: Google Cloud / Workspace | Spaces | WhatsApp (Locked) | Family/Team */}
        <div className="grid grid-cols-4 border-b border-inherit p-1 gap-1 text-[11px] font-semibold bg-zinc-100/60 dark:bg-zinc-900/60">
          <button
            type="button"
            onClick={() => setActiveSubTab('workspace')}
            className={`py-2 px-1 rounded-lg transition-all text-center truncate ${
              activeSubTab === 'workspace'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Google Workspace & Cloud"
          >
            Google Cloud
          </button>
          
          <button
            type="button"
            onClick={() => setActiveSubTab('spaces')}
            className={`py-2 px-1 rounded-lg transition-all text-center truncate ${
              activeSubTab === 'spaces'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Google Chat Spaces"
          >
            Spaces
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('whatsapp')}
            className={`py-2 px-1 rounded-lg transition-all text-center truncate relative flex items-center justify-center gap-1 ${
              activeSubTab === 'whatsapp'
                ? 'bg-emerald-700 text-white font-bold shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="WhatsApp (🔒 Locked for now)"
          >
            <span>WhatsApp</span>
            <span className="text-[9px] opacity-80">🔒</span>
          </button>

          {/* Fourth Tab: Either Family (Home Mode) or Team (Work Mode) */}
          <button
            type="button"
            onClick={() => setActiveSubTab('circle')}
            className={`py-2 px-1 rounded-lg transition-all text-center truncate ${
              activeSubTab === 'circle'
                ? mode === 'home'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-indigo-600 text-white font-bold shadow-xs'
                : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title={mode === 'home' ? 'Family Circle Hub' : 'Team Operations Hub'}
          >
            {mode === 'home' ? 'Family' : 'Team'}
          </button>
        </div>

        {/* Channel / Member List based on active tab */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          
          {/* TAB 1: GOOGLE CLOUD / WORKSPACE */}
          {activeSubTab === 'workspace' && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                Workspace Collaboration Streams
              </div>
              <div className="space-y-1.5">
                {workspaceStreams.map(stream => (
                  <button
                    key={stream.id}
                    type="button"
                    onClick={() => setSelectedChannel(stream.id)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                      selectedChannel === stream.id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-semibold'
                        : isDarkMode
                        ? 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{stream.icon}</span>
                        <span className="font-semibold">{stream.name}</span>
                      </div>
                      {stream.unread > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-bold">
                          {stream.unread}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-1 line-clamp-1 ${selectedChannel === stream.id ? 'text-blue-100' : 'text-zinc-400'}`}>
                      {stream.description}
                    </p>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onLaunchPrompt('Scan my Google Workspace inbox and docs for any pending high-priority actions.')}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>⚡</span> Scan Workspace for Action Items
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE CHAT SPACES */}
          {activeSubTab === 'spaces' && (
            <div className="space-y-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1">
                Google Chat Spaces
              </div>
              <div className="space-y-1">
                {spaces.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedChannel(s.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                      selectedChannel === s.id
                        ? 'bg-blue-600 text-white font-semibold shadow-xs'
                        : isDarkMode
                        ? 'hover:bg-zinc-800/80 text-zinc-300'
                        : 'hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    {s.unread > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-bold">
                        {s.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-1 pt-2">
                Direct Conversations
              </div>
              <div className="space-y-1">
                {directMessages.map(dm => (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => setSelectedChannel(dm.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                      selectedChannel === dm.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : isDarkMode
                        ? 'hover:bg-zinc-800/80 text-zinc-300'
                        : 'hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dm.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      <span className="truncate">{dm.name}</span>
                    </div>
                    {dm.unread > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] bg-blue-500 text-white rounded-full font-bold">
                        {dm.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP - LOCKED */}
          {activeSubTab === 'whatsapp' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
                  <span>🔒</span>
                  <span>WhatsApp Business API: Locked</span>
                </div>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-200/80 leading-relaxed">
                  The automated Meta WhatsApp Business Cloud Webhook is currently locked for this release.
                </p>
                <div className="pt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span>✓</span> Direct Click-to-Chat (wa.me) is active below.
                </div>
              </div>

              <div className={`p-3.5 rounded-2xl border space-y-3 ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Quick Direct WhatsApp (wa.me)
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Phone (+91 / International)
                  </label>
                  <input
                    type="tel"
                    value={waTargetNumber}
                    onChange={(e) => setWaTargetNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                    Pre-filled Message
                  </label>
                  <textarea
                    rows={2}
                    value={waMessageText}
                    onChange={(e) => setWaMessageText(e.target.value)}
                    placeholder="Enter message to send via WhatsApp..."
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleLaunchWhatsAppDirect}
                  disabled={!waTargetNumber.trim()}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>💬</span> Launch WhatsApp ↗
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: EITHER FAMILY (HOME MODE) OR TEAM (WORK MODE) */}
          {activeSubTab === 'circle' && (
            <div className="space-y-3">
              {mode === 'home' ? (
                <>
                  <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">🏡 Family Circle Hub</span>
                    <span>Air-gapped private domestic hub. Coordinates medical checkups, routines & home checklists.</span>
                  </div>

                  <div className="space-y-2">
                    <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>Family Healthcare & Doctors</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">Connected</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Prescriptions, diagnostic reports & routine reminders</p>
                      <button
                        type="button"
                        onClick={() => onLaunchPrompt('Generate a summary of family health checkups and lab test schedules.')}
                        className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        Inspect Health Schedule →
                      </button>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>Domestic Budget & Chores</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Active</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Household inventory, utility bill dates, monthly SIPs</p>
                      <button
                        type="button"
                        onClick={() => onLaunchPrompt('Review household expenses and upcoming utility bill due dates.')}
                        className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Review Domestic Tracker →
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-2xl border border-indigo-500/30 bg-indigo-500/10 text-xs">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">👥 Team Operations Hub</span>
                    <span>Assign tasks via Google Chat, Gmail, or WhatsApp. Delegated work feeds into Today view.</span>
                  </div>

                  <div className="space-y-2">
                    <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>Strategic Operations</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500">War Room</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Product roadmap, sprint velocity, quarterly OKRs</p>
                      <button
                        type="button"
                        onClick={() => onLaunchPrompt('Review active team sprint tasks and upcoming delivery milestones.')}
                        className="mt-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Inspect Sprint Velocity →
                      </button>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                      <div className="flex items-center justify-between font-bold">
                        <span>Vendor & Partner Management</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Active</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">Contracts, fee disbursements, deliverables in Sheets</p>
                      <button
                        type="button"
                        onClick={() => onLaunchPrompt('Compare vendor quotes and pending contract milestones in Google Sheets.')}
                        className="mt-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Review Vendor Ledgers →
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setShowInviteModal(true);
                }}
                className={`w-full py-2 rounded-xl border border-dashed text-xs font-semibold transition-colors ${
                  mode === 'home'
                    ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                    : 'border-indigo-500/50 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10'
                }`}
              >
                + Add {mode === 'home' ? 'Family Member' : 'Team Member'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Area: Active Chat Conversation or Shared Collaboration Feed */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Channel Bar */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              <span>
                {activeSubTab === 'workspace' && 'Google Cloud & Workspace Collaboration'}
                {activeSubTab === 'spaces' && 'Google Chat Spaces'}
                {activeSubTab === 'whatsapp' && 'WhatsApp Sovereign Bridge (🔒 Locked)'}
                {activeSubTab === 'circle' && (mode === 'home' ? '🏡 Family Circle Hub' : '👥 Team Operations Hub')}
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {activeSubTab === 'whatsapp'
                ? 'Direct Click-to-Chat active. Meta Cloud API scheduled for future release.'
                : 'Authenticated via Google Workspace OAuth. End-to-end sovereign encryption.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLaunchPrompt('Sync all recent messages and documents to extract actionable items.')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition-colors"
            >
              🔄 Scan for Action Items
            </button>
          </div>
        </div>

        {/* Shared Items Tracker Banner */}
        <div className={`p-3 border-b text-xs flex flex-wrap items-center gap-2.5 ${
          isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-blue-50/50 border-blue-100'
        }`}>
          <span className="font-bold text-zinc-400 uppercase text-[10px]">Active Shared Deliverables:</span>
          {sharedItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-2xs'
              }`}
            >
              <span className="text-blue-500 font-bold">{item.type === 'task' ? '☑' : item.type === 'calendar' ? '📅' : '🎯'}</span>
              <span className="font-medium truncate max-w-[200px]">{item.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 font-bold">
                {item.assigneeName}
              </span>
            </div>
          ))}
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              S
            </div>
            <div className={`p-3.5 rounded-2xl rounded-tl-none max-w-md text-xs border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-indigo-500">System Notification</span>
                <span className="text-[10px] text-zinc-400">Recent</span>
              </div>
              <p>
                {mode === 'home'
                  ? 'Family Circle sync initialized. Medical reminders, grocery lists and domestic checklists are linked with Google Keep and Calendar.'
                  : 'Work Operations sync initialized. RFQs, team tasks and financial models are linked with Google Sheets and Drive.'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.6" />
                <polygon points="12,3 15,12 12,10 9,12" fill="#93c5fd" />
                <polygon points="12,21 15,12 12,14 9,12" fill="#ef4444" opacity="0.9" />
              </svg>
            </div>
            <div className={`p-3.5 rounded-2xl rounded-tl-none max-w-md text-xs border ${
              isDarkMode ? 'bg-blue-950/30 border-blue-900/40 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-blue-600 dark:text-blue-400">Life OS</span>
                <span className="text-[10px] opacity-70">Active</span>
              </div>
              <p>
                {activeSubTab === 'whatsapp'
                  ? 'Direct WhatsApp click-to-chat is ready. You can trigger outreach messages directly to any phone number.'
                  : 'Workspace monitoring is active. All action items and deadlines are tracked directly in your Today schedule.'}
              </p>
            </div>
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className={`p-3 border-t flex items-center gap-2 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}>
          <input
            type="text"
            value={chatInputText}
            onChange={(e) => setChatInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && chatInputText.trim()) {
                onLaunchPrompt(`Post message to collaboration hub: "${chatInputText}"`);
                setChatInputText('');
              }
            }}
            placeholder={
              activeSubTab === 'whatsapp'
                ? 'Type message to send via WhatsApp...'
                : activeSubTab === 'circle'
                ? `Type message to ${mode === 'home' ? 'Family Circle' : 'Team Hub'}...`
                : 'Type a message or instruction to Life OS...'
            }
            className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'
            }`}
          />
          <button
            type="button"
            onClick={() => {
              if (chatInputText.trim()) {
                onLaunchPrompt(`Post message to collaboration hub: "${chatInputText}"`);
                setChatInputText('');
              }
            }}
            disabled={!chatInputText.trim()}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-40 shadow-xs"
          >
            Send
          </button>
        </div>
      </div>

      {/* Member Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-2xl p-5 border shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Invite {mode === 'home' ? 'Family Member' : 'Team Member'}
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Enter name"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="collaborator@example.com"
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  Role / Relationship
                </label>
                <input
                  type="text"
                  value={inviteRelation}
                  onChange={(e) => setInviteRelation(e.target.value)}
                  placeholder={mode === 'home' ? 'e.g. Spouse, Parent, Child' : 'e.g. Project Lead, Analyst'}
                  className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              {inviteSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  {inviteSuccessMsg}
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
