'use client';

import React, { useState, useEffect } from 'react';

export interface DelegationSettings {
  globalMode: 'AUTONOMOUS' | 'COLLABORATIVE' | 'ADVISORY';
  emailMode: 'DRAFT_AND_APPROVE' | 'AUTONOMOUS_SEND';
  docsMode: 'AUTO_CREATE' | 'OUTLINE_FIRST';
  calendarMode: 'AUTO_SCHEDULE' | 'CHECK_AVAILABILITY';
  tasksMode: 'AUTO_ORGANIZE' | 'REVIEW_FIRST';
  inboxSweeper: boolean;
}

export const DEFAULT_DELEGATION_SETTINGS: DelegationSettings = {
  globalMode: 'COLLABORATIVE',
  emailMode: 'DRAFT_AND_APPROVE',
  docsMode: 'AUTO_CREATE',
  calendarMode: 'AUTO_SCHEDULE',
  tasksMode: 'AUTO_ORGANIZE',
  inboxSweeper: true,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className={`relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-7 transition-all ${cardBg}`}>
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-200/60 dark:border-zinc-800/80 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h2 className="text-lg font-semibold tracking-tight">Delegation & Autonomy Level</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Control how much Suchi executes autonomously vs. asking for your review.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Global Autonomy Tier Cards */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Overall Autonomy Mode
          </label>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Mode 1: Autonomous */}
            <button
              type="button"
              onClick={() => handleGlobalModeChange('AUTONOMOUS')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                settings.globalMode === 'AUTONOMOUS'
                  ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold">🚀 Autonomous</span>
                {settings.globalMode === 'AUTONOMOUS' && (
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Act & Report. Creates docs, sheets, notes, and tasks immediately with direct links.
              </p>
            </button>

            {/* Mode 2: Collaborative (Default) */}
            <button
              type="button"
              onClick={() => handleGlobalModeChange('COLLABORATIVE')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                settings.globalMode === 'COLLABORATIVE'
                  ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold">🤝 Collaborative</span>
                {settings.globalMode === 'COLLABORATIVE' && (
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Recommended. Previews drafts and asks 1-click confirmation for emails & critical steps.
              </p>
            </button>

            {/* Mode 3: Advisory */}
            <button
              type="button"
              onClick={() => handleGlobalModeChange('ADVISORY')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                settings.globalMode === 'ADVISORY'
                  ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold">💡 Advisory</span>
                {settings.globalMode === 'ADVISORY' && (
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                )}
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                Ask First. Proposes plans and outlines, waiting for your explicit approval before execution.
              </p>
            </button>
          </div>
        </div>

        {/* Granular App Settings */}
        <div className="space-y-4 mb-6 pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80">
          <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
            Workspace Permissions & Tool Behavior
          </label>

          {/* Email Replies */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
            <div>
              <p className="text-xs font-semibold">Gmail Email Replies</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {settings.emailMode === 'DRAFT_AND_APPROVE'
                  ? 'Creates draft reply card in chat with 1-click "Approve & Send" button.'
                  : 'Sends email reply autonomously without waiting for approval.'}
              </p>
            </div>
            <select
              value={settings.emailMode}
              onChange={(e) => handleSave({ ...settings, emailMode: e.target.value as any })}
              className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="DRAFT_AND_APPROVE">Draft & Approve (Safe)</option>
              <option value="AUTONOMOUS_SEND">Autonomous Send</option>
            </select>
          </div>

          {/* Google Docs & Sheets */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
            <div>
              <p className="text-xs font-semibold">Google Docs, Sheets & Slides</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {settings.docsMode === 'AUTO_CREATE'
                  ? 'Builds document immediately and returns direct master link.'
                  : 'Presents outline in chat before initializing Google file.'}
              </p>
            </div>
            <select
              value={settings.docsMode}
              onChange={(e) => handleSave({ ...settings, docsMode: e.target.value as any })}
              className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="AUTO_CREATE">Auto-Create & Link</option>
              <option value="OUTLINE_FIRST">Review Outline First</option>
            </select>
          </div>

          {/* Google Calendar */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
            <div>
              <p className="text-xs font-semibold">Google Calendar Scheduling</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {settings.calendarMode === 'AUTO_SCHEDULE'
                  ? 'Books event automatically into open focus slots and notifies you.'
                  : 'Suggests times and asks for confirmation first.'}
              </p>
            </div>
            <select
              value={settings.calendarMode}
              onChange={(e) => handleSave({ ...settings, calendarMode: e.target.value as any })}
              className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="AUTO_SCHEDULE">Auto-Schedule & Report</option>
              <option value="CHECK_AVAILABILITY">Confirm Slot First</option>
            </select>
          </div>

          {/* Google Tasks & Keep Notes */}
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
            <div>
              <p className="text-xs font-semibold">Tasks & Keep Checklists</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {settings.tasksMode === 'AUTO_ORGANIZE'
                  ? 'Directly inserts action items and checklists into Google Tasks.'
                  : 'Presents checklist in chat before inserting.'}
              </p>
            </div>
            <select
              value={settings.tasksMode}
              onChange={(e) => handleSave({ ...settings, tasksMode: e.target.value as any })}
              className="text-xs font-medium bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="AUTO_ORGANIZE">Auto-Organize into Tasks</option>
              <option value="REVIEW_FIRST">Review in Chat First</option>
            </select>
          </div>

          {/* Inbox Sweeper */}
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-xs font-semibold">Inbox Sweeper & Task Extraction</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Allow Suchi to scan email threads to intuitively extract tasks for itself and for you.
              </p>
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

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200/60 dark:border-zinc-800/80">
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
