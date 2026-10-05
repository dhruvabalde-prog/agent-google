'use client';

import React, { useState } from 'react';
import { AppMode, UserProfile, FamilyMember, TeamMember, SharedCollaborationItem } from '@/lib/types';

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
  const [activeSubTab, setActiveSubTab] = useState<'spaces' | 'family' | 'team'>(
    mode === 'home' ? 'family' : 'team'
  );
  const [selectedChatSpace, setSelectedChatSpace] = useState<string | null>('general');
  const [chatInputText, setChatInputText] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteType, setInviteType] = useState<'family' | 'team'>(mode === 'home' ? 'family' : 'team');
  const [inviteRelation, setInviteRelation] = useState('Parent');
  const [inviteRole, setInviteRole] = useState('Contributor');
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState('');

  // Sample Google Chat Spaces & Direct Messages
  const spaces = [
    { id: 'general', name: '📢 General Workspace', unread: 2, type: 'group', members: 6 },
    { id: 'exec-war-room', name: '⚡ Strategy & War Room', unread: 0, type: 'group', members: 4 },
    { id: 'family-circle', name: '🏡 Family Circle Hub', unread: 1, type: 'family', members: 4 },
    { id: 'finance-tax', name: '📊 Finance, Tax & Retainers', unread: 0, type: 'group', members: 3 },
  ];

  const directMessages = [
    { id: 'dm-1', name: 'Priya Patel (Product)', status: 'online', unread: 1 },
    { id: 'dm-2', name: 'Rohan Mehta (Operations)', status: 'offline', unread: 0 },
    { id: 'dm-3', name: 'Dr. Ramesh Sharma (Family)', status: 'online', unread: 0 },
  ];

  // Shared items (tasks, calendar, goals)
  const sharedItems: SharedCollaborationItem[] = [
    {
      id: 'sh-1',
      title: 'Review Q3 Financial Ledger & Fee Collection in Sheets',
      type: 'task',
      category: 'work',
      assigneeName: 'Rohan Mehta',
      assigneeEmail: 'rohan.mehta@example.com',
      status: 'in_progress',
      dueDate: 'Tomorrow',
    },
    {
      id: 'sh-2',
      title: 'Parents Annual Health Checkup & Lab Tests',
      type: 'calendar',
      category: 'home',
      assigneeName: 'Priya Patel',
      assigneeEmail: 'priya.patel@example.com',
      status: 'pending',
      dueDate: 'Saturday 10:00 AM',
    },
    {
      id: 'sh-3',
      title: 'Launch B2B Customer Outreach Campaign on WhatsApp',
      type: 'goal',
      category: 'work',
      assigneeName: 'Self',
      assigneeEmail: profile?.email || 'me',
      status: 'in_progress',
      dueDate: '15 Oct',
    },
  ];

  function handleSendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) return;

    setInviteSuccessMsg(`Invitation email sent to ${inviteEmail} with 1-tap sign-up link!`);
    setTimeout(() => {
      setInviteSuccessMsg('');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
    }, 2000);
  }

  return (
    <div className={`flex-1 flex flex-col md:flex-row overflow-hidden max-w-6xl mx-auto w-full transition-colors ${
      isDarkMode ? 'text-zinc-100 bg-zinc-950' : 'text-zinc-900 bg-slate-50'
    }`}>
      {/* Sidebar: Navigation & Channels */}
      <div className={`w-full md:w-72 border-r flex flex-col flex-shrink-0 transition-colors ${
        isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-white border-zinc-200'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💬</span>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Collaboration Hub</h2>
              <p className="text-[11px] text-zinc-400">Google Chat, Teams & Family</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
            title="Invite Family or Team Member"
          >
            + Invite
          </button>
        </div>

        {/* Sub-Tabs: Spaces vs Family vs Team */}
        <div className="flex border-b border-inherit px-2 pt-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('spaces')}
            className={`flex-1 py-1.5 font-medium rounded-t-lg transition-colors ${
              activeSubTab === 'spaces'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Spaces
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('family')}
            className={`flex-1 py-1.5 font-medium rounded-t-lg transition-colors ${
              activeSubTab === 'family'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Family ({profile?.familyMembers?.length || 2})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('team')}
            className={`flex-1 py-1.5 font-medium rounded-t-lg transition-colors ${
              activeSubTab === 'team'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border-b-2 border-indigo-600'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            Team ({profile?.teamMembers?.length || 3})
          </button>
        </div>

        {/* Channel / Member List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {activeSubTab === 'spaces' && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-1.5">
                Google Chat Spaces
              </div>
              <div className="space-y-1">
                {spaces.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedChatSpace(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                      selectedChatSpace === s.id
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

              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mt-4 mb-1.5">
                Direct Messages
              </div>
              <div className="space-y-1">
                {directMessages.map(dm => (
                  <button
                    key={dm.id}
                    type="button"
                    onClick={() => setSelectedChatSpace(dm.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                      selectedChatSpace === dm.id
                        ? 'bg-blue-600 text-white font-semibold'
                        : isDarkMode
                        ? 'hover:bg-zinc-800/80 text-zinc-300'
                        : 'hover:bg-zinc-100 text-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className={`w-2 h-2 rounded-full ${dm.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-400'}`} />
                      <span className="truncate">{dm.name}</span>
                    </div>
                    {dm.unread > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] bg-red-500 text-white rounded-full font-bold">
                        {dm.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSubTab === 'family' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-xs">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-0.5">🏡 Family Safe Hub</span>
                <span>Max 2 seniors, max 2 students. Auto-shares health routines and calendar events.</span>
              </div>

              <div className="space-y-2">
                <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-800/70 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Dr. Ramesh Sharma</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">Senior (Parent)</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">ramesh.sharma@example.com</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onLaunchPrompt('Generate a 1-tap WhatsApp message to check in on father Dr. Ramesh Sharma.')}
                      className="px-2 py-1 rounded-lg bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]"
                    >
                      💬 WhatsApp Check-in
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-800/70 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Aarav Sharma</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Student (Child)</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">aarav.student@example.com</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onLaunchPrompt('Review Aarav\'s study schedule and mock exam preparation in Calendar.')}
                      className="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px]"
                    >
                      📅 View Schedule
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInviteType('family');
                  setShowInviteModal(true);
                }}
                className="w-full py-2 rounded-xl border border-dashed border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/10 transition-colors"
              >
                + Add Family Member (Up to 5)
              </button>
            </div>
          )}

          {activeSubTab === 'team' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-xs">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-0.5">👥 Team Operations</span>
                <span>Assign tasks via Google Chat, Gmail, or WhatsApp. View assignees in Today.</span>
              </div>

              <div className="space-y-2">
                <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-800/70 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Priya Patel</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-500">Product Lead</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">priya.patel@example.com</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onLaunchPrompt('Delegate task to Priya Patel: "Finalize PRD and send draft in Google Chat".')}
                      className="px-2 py-1 rounded-lg bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 font-semibold text-[10px]"
                    >
                      📌 Assign Task
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? 'bg-zinc-800/70 border-zinc-700' : 'bg-white border-zinc-200'}`}>
                  <div className="flex items-center justify-between font-bold">
                    <span>Rohan Mehta</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">Ops Director</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 mt-1">rohan.mehta@example.com</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => onLaunchPrompt('Delegate task to Rohan Mehta: "Reconcile vendor quotes in Google Sheets".')}
                      className="px-2 py-1 rounded-lg bg-blue-600/20 text-blue-600 dark:text-blue-400 font-semibold text-[10px]"
                    >
                      📌 Assign Task
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setInviteType('team');
                  setShowInviteModal(true);
                }}
                className="w-full py-2 rounded-xl border border-dashed border-indigo-500/50 text-indigo-600 dark:text-indigo-400 text-xs font-semibold hover:bg-indigo-500/10 transition-colors"
              >
                + Add Team Member (Up to 5)
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
              <span>{activeSubTab === 'family' ? '🏡 Family Circle' : activeSubTab === 'team' ? '👥 Team Space' : '💬 Google Chat'}</span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              Synced with Google Workspace OAuth & Microsoft 365 Bridge
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onLaunchPrompt('Sync all recent messages from Google Chat and WhatsApp to find pending action items.')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20"
            >
              🔄 Scan for Action Items
            </button>
          </div>
        </div>

        {/* Shared Items Tracker Banner */}
        <div className={`p-3 border-b text-xs flex flex-wrap items-center gap-3 ${
          isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-blue-50/50 border-blue-100'
        }`}>
          <span className="font-bold text-zinc-400 uppercase text-[10px]">Shared Items with Assignees:</span>
          {sharedItems.map(item => (
            <div
              key={item.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-2xs'
              }`}
            >
              <span className="text-blue-500 font-bold">{item.type === 'task' ? '☑' : item.type === 'calendar' ? '📅' : '🎯'}</span>
              <span className="font-medium truncate max-w-[180px]">{item.title}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-700 font-bold">
                {item.assigneeName}
              </span>
            </div>
          ))}
        </div>

        {/* Message Thread Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
              P
            </div>
            <div className={`p-3 rounded-2xl rounded-tl-none max-w-md text-xs border ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-indigo-500">Priya Patel</span>
                <span className="text-[10px] text-zinc-400">10:45 AM</span>
              </div>
              <p>Updated the project delivery milestones in our shared Google Sheet. Please review when ready!</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              L
            </div>
            <div className={`p-3 rounded-2xl rounded-tl-none max-w-md text-xs border ${
              isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Life OS Assistant</span>
                <span className="text-[10px] opacity-70">10:46 AM</span>
              </div>
              <p>Action item detected from Priya: Created task &quot;Review project delivery milestones in Google Sheets&quot; due today.</p>
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
                onLaunchPrompt(`Post message to Google Chat: "${chatInputText}"`);
                setChatInputText('');
              }
            }}
            placeholder="Type a message or task to Google Chat / Family..."
            className={`flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'
            }`}
          />
          <button
            type="button"
            onClick={() => {
              if (chatInputText.trim()) {
                onLaunchPrompt(`Post message to Google Chat: "${chatInputText}"`);
                setChatInputText('');
              }
            }}
            disabled={!chatInputText.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>

      {/* Member Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 border shadow-2xl ${
            isDarkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold">
                {inviteType === 'family' ? '🏡 Invite Family Member' : '👥 Invite Team Member'}
              </h3>
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-400 hover:text-zinc-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Ramesh Sharma"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Gmail / Email ID</label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>

              {inviteType === 'family' ? (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Relationship</label>
                  <select
                    value={inviteRelation}
                    onChange={(e) => setInviteRelation(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                    }`}
                  >
                    <option value="Parent">Parent (Senior)</option>
                    <option value="Child">Child (Student)</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Sibling">Sibling</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-1">Role / Department</label>
                  <input
                    type="text"
                    required
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    placeholder="e.g. Operations Manager, Tech Lead"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-100 border-zinc-200 text-zinc-900'
                    }`}
                  />
                </div>
              )}

              {inviteSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-500 text-xs font-semibold">
                  ✓ {inviteSuccessMsg}
                </div>
              )}

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!inviteEmail.includes('@') || !inviteName.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 shadow-xs"
                >
                  Send Invitation Email ✉
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
