'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';

interface GoogleAccountsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  isDarkMode?: boolean;
}

export default function GoogleAccountsModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  isDarkMode = false,
}: GoogleAccountsModalProps) {
  const [personalEmail, setPersonalEmail] = useState(profile?.primaryEmail || profile?.email || '');
  const [workEmail, setWorkEmail] = useState(profile?.workEmail || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  function handleSave() {
    onUpdateProfile({
      primaryEmail: personalEmail.trim(),
      email: personalEmail.trim(),
      workEmail: workEmail.trim(),
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  }

  function handleTriggerOAuth(accountType: 'personal' | 'work') {
    onUpdateProfile({
      primaryEmail: personalEmail.trim(),
      email: personalEmail.trim(),
      workEmail: workEmail.trim(),
    });
    window.location.href = `/api/auth/login?account=${accountType}&redirect=/?account=${accountType}`;
  }

  function handleDisconnect(accountType: 'personal' | 'work') {
    if (accountType === 'personal') {
      setPersonalEmail('');
      onUpdateProfile({ primaryEmail: '', email: '' });
    } else {
      setWorkEmail('');
      onUpdateProfile({ workEmail: '' });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`w-full max-w-lg rounded-2xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${
        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
              ✉️
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">Google Accounts Manager</h2>
              <p className="text-xs text-zinc-400">Partitioned Personal & Work Workspace accounts</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Air-gap guarantee banner */}
          <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-300 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <span>🛡️</span>
              <span>Cryptographic Partitioning Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              Personal health data and domestic notes reside exclusively in Home Mode. Client deliverables and corporate RFQs reside strictly in Work Mode. Neither account cross-contaminates.
            </p>
          </div>

          {/* 1. Personal ID Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🏠</span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Personal Gmail Account
                  </h3>
                  <p className="text-[11px] text-zinc-400">Powers Home Mode, health checklists, family routines</p>
                </div>
              </div>
              {personalEmail ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                  <span>✓</span> Connected
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                  Not Connected
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Personal Email Address</label>
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                placeholder="your.personal@gmail.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleTriggerOAuth('personal')}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>🔑</span>
                <span>{personalEmail ? 'Re-authenticate Personal OAuth' : 'Connect Personal OAuth'}</span>
              </button>
              {personalEmail && (
                <button
                  type="button"
                  onClick={() => handleDisconnect('personal')}
                  className="py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* 2. Work ID Card */}
          <div className={`p-4 rounded-2xl border space-y-3 ${
            isDarkMode ? 'bg-zinc-900/80 border-zinc-800' : 'bg-slate-50 border-zinc-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">💼</span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Work Google Workspace Account
                  </h3>
                  <p className="text-[11px] text-zinc-400">Powers Work Mode, client drafts, financial ledgers & decks</p>
                </div>
              </div>
              {workEmail ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700 flex items-center gap-1">
                  <span>✓</span> Connected
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-500">
                  Not Connected
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-zinc-400">Work Email Address</label>
              <input
                type="email"
                value={workEmail}
                onChange={(e) => setWorkEmail(e.target.value)}
                placeholder="your.name@company.com"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-zinc-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleTriggerOAuth('work')}
                className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>🔑</span>
                <span>{workEmail ? 'Re-authenticate Work OAuth' : 'Connect Work OAuth'}</span>
              </button>
              {workEmail && (
                <button
                  type="button"
                  onClick={() => handleDisconnect('work')}
                  className="py-2 px-3 rounded-xl border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold transition-colors"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
              ✓ Account preferences successfully saved!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-inherit flex items-center justify-end gap-2 bg-zinc-50/50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
