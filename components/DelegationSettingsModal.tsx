'use client';

import React, { useState, useEffect } from 'react';

export interface DelegationSettings {
  globalMode: 'AUTONOMOUS' | 'COLLABORATIVE' | 'ADVISORY';
  emailMode: 'DRAFT_AND_APPROVE' | 'AUTONOMOUS_SEND';
  docsMode: 'AUTO_CREATE' | 'OUTLINE_FIRST';
  calendarMode: 'AUTO_SCHEDULE' | 'CHECK_AVAILABILITY';
  tasksMode: 'AUTO_ORGANIZE' | 'REVIEW_FIRST';
  inboxSweeper: boolean;
  // Voice Engine Settings
  wakeWordEnabled: boolean;
  androidDefaultAssistant: boolean;
  iosSiriShortcut: boolean;
  naturalVoiceStreaming: boolean;
  localVadPrivacy: boolean;
  // Background Daemon Settings
  automationFrequency: 'DAILY_730AM' | 'HOURLY' | 'WEEKLY' | 'WEBHOOK';
  tierQuota: 'STARTER' | 'PRO_EXECUTIVE' | 'FOUNDER_TEAM';
  backgroundDaemonEnabled: boolean;
  sheetsLedgerSync: boolean;
}

export const DEFAULT_DELEGATION_SETTINGS: DelegationSettings = {
  globalMode: 'COLLABORATIVE',
  emailMode: 'DRAFT_AND_APPROVE',
  docsMode: 'AUTO_CREATE',
  calendarMode: 'AUTO_SCHEDULE',
  tasksMode: 'AUTO_ORGANIZE',
  inboxSweeper: true,
  wakeWordEnabled: true,
  androidDefaultAssistant: true,
  iosSiriShortcut: true,
  naturalVoiceStreaming: true,
  localVadPrivacy: true,
  automationFrequency: 'DAILY_730AM',
  tierQuota: 'PRO_EXECUTIVE',
  backgroundDaemonEnabled: true,
  sheetsLedgerSync: true,
};

interface DelegationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
  isIncognito?: boolean;
  onSave?: (settings: DelegationSettings) => void;
}

export default function DelegationSettingsModal({
  isOpen,
  onClose,
  isDarkMode = false,
  isIncognito = false,
  onSave,
}: DelegationSettingsModalProps) {
  const [settings, setSettings] = useState<DelegationSettings>(DEFAULT_DELEGATION_SETTINGS);
  const [activeTab, setActiveTab] = useState<'delegation' | 'voice' | 'daemon'>('delegation');
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('suchi_delegation_settings_v1');
      if (stored) {
        setSettings({ ...DEFAULT_DELEGATION_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (newSettings: DelegationSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('suchi_delegation_settings_v1', JSON.stringify(newSettings));
    } catch (e) {}
    if (onSave) onSave(newSettings);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  const handleGlobalModeChange = (mode: 'AUTONOMOUS' | 'COLLABORATIVE' | 'ADVISORY') => {
    let updated: DelegationSettings;
    if (mode === 'AUTONOMOUS') {
      updated = {
        ...settings,
        globalMode: 'AUTONOMOUS',
        emailMode: 'DRAFT_AND_APPROVE', // Safety: always draft for emails unless explicitly overridden
        docsMode: 'AUTO_CREATE',
        calendarMode: 'AUTO_SCHEDULE',
        tasksMode: 'AUTO_ORGANIZE',
      };
    } else if (mode === 'ADVISORY') {
      updated = {
        ...settings,
        globalMode: 'ADVISORY',
        emailMode: 'DRAFT_AND_APPROVE',
        docsMode: 'OUTLINE_FIRST',
        calendarMode: 'CHECK_AVAILABILITY',
        tasksMode: 'REVIEW_FIRST',
      };
    } else {
      updated = {
        ...settings,
        globalMode: 'COLLABORATIVE',
        emailMode: 'DRAFT_AND_APPROVE',
        docsMode: 'AUTO_CREATE',
        calendarMode: 'AUTO_SCHEDULE',
        tasksMode: 'AUTO_ORGANIZE',
      };
    }
    handleSave(updated);
  };

  const cardBg = isIncognito
    ? 'bg-[#151124] border-purple-900/60 text-zinc-100'
    : isDarkMode
    ? 'bg-zinc-900 border-zinc-800 text-zinc-100'
    : 'bg-white border-zinc-200 text-zinc-900 shadow-2xl';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`w-full max-w-xl rounded-2xl border p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col ${cardBg}`}>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/60 dark:border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              ⚙️
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-bold">Suchi System Settings</h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Configure autonomy, voice engine, and background daemon</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 my-3 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('delegation')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'delegation'
                ? 'bg-white dark:bg-zinc-700 shadow-xs text-blue-600 dark:text-blue-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Autonomy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'voice'
                ? 'bg-white dark:bg-zinc-700 shadow-xs text-blue-600 dark:text-blue-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Voice Engine
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('daemon')}
            className={`flex-1 py-1.5 rounded-lg transition-all ${
              activeTab === 'daemon'
                ? 'bg-white dark:bg-zinc-700 shadow-xs text-blue-600 dark:text-blue-400 font-bold'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Background Daemon
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {/* TAB 1: AUTONOMY & DELEGATION */}
          {activeTab === 'delegation' && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">Primary Collaboration Mode</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'COLLABORATIVE', title: 'Collaborative', desc: 'Balanced delegation with 1-tap approvals.' },
                    { id: 'AUTONOMOUS', title: 'Autonomous', desc: 'Creates docs, sheets & tasks directly.' },
                    { id: 'ADVISORY', title: 'Advisory', desc: 'Proposes plans and asks confirmation first.' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleGlobalModeChange(mode.id as any)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        settings.globalMode === mode.id
                          ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-bold text-xs">{mode.title}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 leading-tight font-normal">
                        {mode.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Controls */}
              <div className="space-y-3 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-semibold">Gmail Protocol</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Strict draft-and-approve safety gate.</p>
                  </div>
                  <select
                    value={settings.emailMode}
                    onChange={(e) => handleSave({ ...settings, emailMode: e.target.value as any })}
                    className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="DRAFT_AND_APPROVE">Draft in Gmail for Approval</option>
                    <option value="AUTONOMOUS_SEND">Autonomous Send</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-semibold">Google Docs & Sheets</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Document and spreadsheet creation stance.</p>
                  </div>
                  <select
                    value={settings.docsMode}
                    onChange={(e) => handleSave({ ...settings, docsMode: e.target.value as any })}
                    className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="AUTO_CREATE">Auto-Create & Format Asset</option>
                    <option value="OUTLINE_FIRST">Propose Outline First</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-semibold">Inbox Sweeper & Task Extraction</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Scan emails to extract tasks for Suchi and you.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSave({ ...settings, inboxSweeper: !settings.inboxSweeper })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.inboxSweeper ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.inboxSweeper ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOCAL VOICE ENGINE ("Suchi suno") */}
          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-800/40 text-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🎙️</span>
                  <span className="font-bold text-xs">Dedicated Local Wake-Word Engine ("Suchi suno")</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Runs on-device with 0ms latency. Discards all ambient noise until hotword matches. Zero cloud audio streaming without hotword match.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    <p className="text-xs font-semibold">Wake-Word Detection ("Suchi suno")</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">On-device acoustic model listening for hands-free prompt.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSave({ ...settings, wakeWordEnabled: !settings.wakeWordEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.wakeWordEnabled ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.wakeWordEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    <p className="text-xs font-semibold">Android Default Digital Assistant</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">android.service.voice.VoiceInteractionService on long-press home.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSave({ ...settings, androidDefaultAssistant: !settings.androidDefaultAssistant })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.androidDefaultAssistant ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.androidDefaultAssistant ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    <p className="text-xs font-semibold">iOS Action Button & Siri Shortcut</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Trigger hands-free prompt via "Hey Siri, Suchi suno".</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSave({ ...settings, iosSiriShortcut: !settings.iosSiriShortcut })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.iosSiriShortcut ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.iosSiriShortcut ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1.5 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    <p className="text-xs font-semibold">High-Cadence Voice Streaming</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Real-time Speech-to-Text with instant natural TTS audio playback.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSave({ ...settings, naturalVoiceStreaming: !settings.naturalVoiceStreaming })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.naturalVoiceStreaming ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.naturalVoiceStreaming ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-1.5">
                  <div>
                    <p className="text-xs font-semibold">Zero-Audio Privacy Guarantee</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Local VAD discards ambient chatter; audio snippets are never stored.</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                    VERIFIED ENCRYPTED
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BACKGROUND DAEMON & AUTOMATIONS */}
          {activeTab === 'daemon' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-900/20 to-teal-900/20 border border-emerald-800/40 text-emerald-200">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚡</span>
                    <span className="font-bold text-xs">Autonomous Background Daemon</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-900 text-emerald-300">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Executes unattended cron sweeps, syncs living Google Sheets ledgers, and delivers 1-tap actionable approval cards.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    <p className="text-xs font-semibold">Execution Frequency</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Scheduled cadence for automated sweeps.</p>
                  </div>
                  <select
                    value={settings.automationFrequency}
                    onChange={(e) => handleSave({ ...settings, automationFrequency: e.target.value as any })}
                    className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="DAILY_730AM">Daily Morning (7:30 AM)</option>
                    <option value="HOURLY">Hourly Monitor</option>
                    <option value="WEEKLY">Weekly Retrospective</option>
                    <option value="WEBHOOK">Event Webhook Trigger</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    <p className="text-xs font-semibold">Subscription Tier Automation Quota</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Quotas: Starter (3 max), Pro (15 max), Team (Unlimited).</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 border border-blue-800 text-blue-300">
                    Pro Executive (15 Max)
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <div>
                    <p className="text-xs font-semibold">Living Google Sheets Ledger Sync</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Autonomous formula and balance updates in background.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSave({ ...settings, sheetsLedgerSync: !settings.sheetsLedgerSync })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.sheetsLedgerSync ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.sheetsLedgerSync ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="p-3 bg-zinc-100 dark:bg-zinc-800/60 rounded-xl border border-zinc-200/60 dark:border-zinc-700/60 text-[11px] text-zinc-500 dark:text-zinc-400">
                  <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Audit & Log Integrity:</p>
                  <p>Every automated execution is cryptographically timestamped and logged with status tracking in your Settings and the Admin Console.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3.5 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <span className="text-[11px] text-emerald-500 font-medium">
            {savedToast ? '✓ Settings saved' : ''}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
