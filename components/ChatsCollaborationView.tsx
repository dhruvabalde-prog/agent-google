'use client';

import React, { useState } from 'react';
import { AppMode, UserProfile } from '@/lib/types';

interface ChatsCollaborationViewProps {
  mode: AppMode;
  profile: UserProfile | null;
  onLaunchPrompt: (prompt: string) => void;
  isDarkMode?: boolean;
}

interface ChatContact {
  id: string;
  name: string;
  email: string;
  role?: string;
  status: 'online' | 'offline';
  unreadCount?: number;
}

export default function ChatsCollaborationView({
  mode,
  profile,
  onLaunchPrompt,
  isDarkMode = false,
}: ChatsCollaborationViewProps) {
  // 3 Primary Active Segments + 1 Locked WhatsApp Segment
  const [activeSegment, setActiveSegment] = useState<'gmail' | 'chat' | 'drive' | 'whatsapp'>('gmail');

  // Contact list: up to 5 people can be added (any 5 people)
  const [contacts, setContacts] = useState<ChatContact[]>([
    { id: 'c1', name: 'Operations Partner', email: 'ops@partner.com', status: 'online', unreadCount: 1 },
    { id: 'c2', name: 'Finance Controller', email: 'accounts@ledger.com', status: 'offline', unreadCount: 0 },
    { id: 'c3', name: 'Key Client Rep', email: 'client@enterprise.com', status: 'online', unreadCount: 2 },
  ]);

  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonEmail, setNewPersonEmail] = useState('');
  const [showAddPersonModal, setShowAddPersonModal] = useState(false);

  // Selected thread / item for active conversation
  const [selectedThread, setSelectedThread] = useState<string>('email-1');
  const [chatMessageInput, setChatMessageInput] = useState('');

  // Active conversation threads per item
  const [threadMessages, setThreadMessages] = useState<Record<string, { sender: string; text: string; time: string }[]>>({
    'email-1': [
      { sender: 'Arjun Mehta', text: 'Please find attached the signed vendor agreement for review.', time: '10:15 AM' },
      { sender: 'Life OS', text: 'Action card created for vendor agreement review in Google Docs.', time: '10:16 AM' }
    ],
    'chat-space-1': [
      { sender: 'Operations Partner', text: 'All dispatch schedules for this week are updated in Sheets.', time: '11:30 AM' },
      { sender: 'Life OS', text: 'Action card created for dispatch reconciliation summary.', time: '11:31 AM' }
    ],
    'drive-file-1': [
      { sender: 'System', text: 'Financial Ledger Q4 2026.xlsx shared with 3 collaborators.', time: 'Yesterday' },
      { sender: 'Finance Controller', text: 'Formulas for GST input credit reconciled.', time: '9:00 AM' }
    ]
  });

  // Gmail Threads
  const gmailThreads = [
    { id: 'email-1', subject: 'Urgent: Q4 Strategic Proposal & Pricing Matrix', sender: 'Arjun Mehta <arjun@mehta.com>', snippet: 'Please review the updated deliverables and pricing slabs before signing...', time: '10:15 AM', unread: true },
    { id: 'email-2', subject: 'Tax Audit & Statutory Invoice Reconciliation', sender: 'CA V. Sharma <vsharma@taxoffice.in>', snippet: 'Attached are the ledger accounts for silver purchases and making charges...', time: '09:20 AM', unread: false },
    { id: 'email-3', subject: 'Franchise Expansion Site Feasibility Memo', sender: 'Head Office <licensing@franchise.edu>', snippet: 'Preliminary inspection for the new center passed. Next steps outlined...', time: 'Yesterday', unread: false },
  ];

  // Google Chat Spaces & Direct Messages (any 5 people)
  const chatSpaces = [
    { id: 'chat-space-1', name: '📢 Executive Operations & War Room', unread: 1, members: '5 members' },
    { id: 'chat-space-2', name: '📈 Financial Ledgers & Cashflow Desk', unread: 0, members: '4 members' },
  ];

  // Google Drive Discussions
  const driveFiles = [
    { id: 'drive-file-1', name: '📊 Annual Revenue & Expense Model 2026.xlsx', type: 'Sheets', modified: '2 hours ago', comments: 3 },
    { id: 'drive-file-2', name: '📄 Client Service Agreement & SLA Standard.docx', type: 'Docs', modified: 'Yesterday', comments: 1 },
    { id: 'drive-file-3', name: '🖥️ Strategic Partner Deck (5-Slides).pptx', type: 'Slides', modified: 'Oct 3', comments: 0 },
  ];

  const handleAddPerson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPersonName.trim() || !newPersonEmail.trim()) return;
    if (contacts.length >= 5) {
      alert('Maximum 5 people can be added to your direct chat circle.');
      return;
    }
    const newContact: ChatContact = {
      id: `c-${Date.now()}`,
      name: newPersonName.trim(),
      email: newPersonEmail.trim(),
      status: 'online',
      unreadCount: 0,
    };
    setContacts(prev => [...prev, newContact]);
    setNewPersonName('');
    setNewPersonEmail('');
    setShowAddPersonModal(false);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim()) return;
    const msg = {
      sender: profile?.name || 'You',
      text: chatMessageInput.trim(),
      time: 'Just now',
    };
    setThreadMessages(prev => ({
      ...prev,
      [selectedThread]: [...(prev[selectedThread] || []), msg],
    }));

    // Trigger concise Life OS prompt
    onLaunchPrompt(`Regarding "${selectedThread}": ${chatMessageInput.trim()}`);
    setChatMessageInput('');
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-slate-50 text-zinc-900'
    }`}>
      {/* Top Segment Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between backdrop-blur-md ${
        isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Segment 1: Gmail */}
          <button
            type="button"
            onClick={() => setActiveSegment('gmail')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeSegment === 'gmail'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>✉️</span> Gmail
          </button>

          {/* Segment 2: Google Chat */}
          <button
            type="button"
            onClick={() => setActiveSegment('chat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeSegment === 'chat'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>💬</span> Google Chat ({contacts.length}/5 People)
          </button>

          {/* Segment 3: Google Drive */}
          <button
            type="button"
            onClick={() => setActiveSegment('drive')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeSegment === 'drive'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>📁</span> Google Drive Files
          </button>

          {/* Segment 4: WhatsApp (LOCKED) */}
          <button
            type="button"
            onClick={() => setActiveSegment('whatsapp')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 opacity-70 ${
              activeSegment === 'whatsapp'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <span>🔒</span> WhatsApp (Locked)
          </button>
        </div>

        {activeSegment === 'chat' && contacts.length < 5 && (
          <button
            type="button"
            onClick={() => setShowAddPersonModal(true)}
            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 font-bold text-[11px] hover:bg-blue-100 transition-colors flex items-center gap-1"
          >
            <span>+</span> Add Person ({5 - contacts.length} left)
          </button>
        )}
      </div>

      {/* Main Two-Pane View: Left List & Right Chat Panel */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Items List */}
        <div className={`w-full sm:w-80 md:w-96 border-r flex flex-col overflow-y-auto ${
          isDarkMode ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-white'
        }`}>
          
          {/* GMAIL LIST */}
          {activeSegment === 'gmail' && (
            <div className="p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2">
                Gmail Threads
              </div>
              {gmailThreads.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedThread(t.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedThread === t.id
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                      : isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-xs truncate max-w-[180px]">{t.sender}</p>
                    <span className="text-[10px] text-zinc-400">{t.time}</span>
                  </div>
                  <p className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 truncate">{t.subject}</p>
                  <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{t.snippet}</p>
                </button>
              ))}
            </div>
          )}

          {/* GOOGLE CHAT LIST */}
          {activeSegment === 'chat' && (
            <div className="p-3 space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2 mb-2">
                  Spaces & Channels
                </div>
                <div className="space-y-1.5">
                  {chatSpaces.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedThread(s.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        selectedThread === s.id
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40'
                          : isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-xs truncate">{s.name}</p>
                        <p className="text-[10px] text-zinc-400">{s.members}</p>
                      </div>
                      {s.unread > 0 && (
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Added People ({contacts.length}/5)
                  </span>
                </div>
                <div className="space-y-1.5">
                  {contacts.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedThread(c.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        selectedThread === c.id
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40'
                          : isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs truncate">{c.name}</p>
                          <p className="text-[10px] text-zinc-400 truncate">{c.email}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${c.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-400'}`}></span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GOOGLE DRIVE LIST */}
          {activeSegment === 'drive' && (
            <div className="p-3 space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 px-2">
                Active Drive Documents & Ledgers
              </div>
              {driveFiles.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSelectedThread(f.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedThread === f.id
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs'
                      : isDarkMode ? 'border-zinc-800 hover:bg-zinc-800/50' : 'border-zinc-100 hover:bg-slate-50'
                  }`}
                >
                  <p className="font-bold text-xs truncate">{f.name}</p>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                    <span>{f.type} • {f.modified}</span>
                    <span>💬 {f.comments} notes</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* WHATSAPP LOCKED VIEW */}
          {activeSegment === 'whatsapp' && (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-2xl mx-auto">
                🔒
              </div>
              <h4 className="font-bold text-sm">WhatsApp Business API</h4>
              <p className="text-xs text-zinc-500">
                Direct WhatsApp Business API gateway is currently locked and queued for integration.
              </p>
              <div className="pt-2">
                <span className="px-3 py-1 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Active Discussion & Chat Panel */}
        <div className="hidden sm:flex flex-1 flex-col justify-between bg-inherit overflow-hidden">
          {activeSegment !== 'whatsapp' ? (
            <>
              {/* Thread Header */}
              <div className={`px-5 py-3 border-b flex items-center justify-between ${
                isDarkMode ? 'border-zinc-800 bg-zinc-900/60' : 'border-slate-200 bg-slate-50/80'
              }`}>
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">Active Discussion</h3>
                  <p className="font-bold text-sm truncate max-w-md">{selectedThread}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onLaunchPrompt(`Provide a complete executive summary and action items for "${selectedThread}"`)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  ⚡ Summarize & Act
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {(threadMessages[selectedThread] || [
                  { sender: 'Life OS', text: `Connected to ${selectedThread}. All updates and collaboration will appear here.`, time: 'Now' }
                ]).map((m, idx) => (
                  <div
                    key={idx}
                    className={`max-w-[80%] rounded-2xl p-3 text-xs ${
                      m.sender === (profile?.name || 'You')
                        ? 'ml-auto bg-blue-600 text-white rounded-br-xs'
                        : isDarkMode ? 'bg-zinc-800 text-zinc-100 rounded-bl-xs' : 'bg-white border border-slate-200 text-zinc-900 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <span className="font-bold text-[10px] opacity-75">{m.sender}</span>
                      <span className="text-[9px] opacity-50">{m.time}</span>
                    </div>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendMessage} className={`p-3 border-t flex items-center gap-2 ${
                isDarkMode ? 'border-zinc-800 bg-zinc-900/40' : 'border-slate-200 bg-white'
              }`}>
                <input
                  type="text"
                  value={chatMessageInput}
                  onChange={(e) => setChatMessageInput(e.target.value)}
                  placeholder={`Reply to ${selectedThread}...`}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-slate-50 border-slate-200 text-zinc-900'
                  }`}
                />
                <button
                  type="submit"
                  disabled={!chatMessageInput.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-zinc-400">
              <span className="text-4xl mb-3">🔒</span>
              <p className="font-bold text-sm text-zinc-600 dark:text-zinc-300">WhatsApp Gateway Locked</p>
              <p className="text-xs max-w-xs mt-1">Please use Gmail or Google Chat for active communications.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Person Modal (Up to 5 people) */}
      {showAddPersonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl space-y-4 ${
            isDarkMode ? 'bg-zinc-950 border-zinc-800 text-white' : 'bg-white border-zinc-200 text-zinc-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Person to Direct Chat</h3>
              <button type="button" onClick={() => setShowAddPersonModal(false)} className="text-zinc-400 hover:text-zinc-600">✕</button>
            </div>
            <p className="text-[11px] text-zinc-500">You can add any 5 people (collaborators, team, or clients) to your direct chat circle.</p>

            <form onSubmit={handleAddPerson} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={newPersonName}
                  onChange={(e) => setNewPersonName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Email / Gmail</label>
                <input
                  type="email"
                  required
                  value={newPersonEmail}
                  onChange={(e) => setNewPersonEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-50 border-slate-200'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPersonModal(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs"
                >
                  Add Person
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
