'use client';

import React, { useState } from 'react';
import { UserProfile, UserType } from '@/lib/types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  isDarkMode?: boolean;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  isDarkMode = false,
}: UserProfileModalProps) {
  const [name, setName] = useState(profile?.name || '');
  const [phoneDigits, setPhoneDigits] = useState(
    profile?.phoneNumber ? profile.phoneNumber.replace(/\D/g, '').slice(-10) : ''
  );
  const [userType, setUserType] = useState<UserType>(profile?.userType || 'working_professional');
  const [subCategory, setSubCategory] = useState(profile?.professionalSubCategory || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Connected Apps Permissions Toggle State
  const [appPermissions, setAppPermissions] = useState({
    gmail: true,
    calendar: true,
    docs: true,
    sheets: true,
    drive: true,
  });

  if (!isOpen) return null;

  const connectedEmail = profile?.workEmail || profile?.primaryEmail || profile?.email || 'Connected';

  const handleToggleApp = (app: keyof typeof appPermissions) => {
    setAppPermissions(prev => ({ ...prev, [app]: !prev[app] }));
  };

  async function handleDisconnectGoogle() {
    if (!confirm('Are you sure you want to disconnect your Google Workspace account? You will need to sign in again to use Life OS.')) {
      return;
    }
    setIsDisconnecting(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('agent_google_user_profile');
      localStorage.removeItem('lifeos_user_profile');
      localStorage.removeItem('agent_user_session');
      window.location.href = '/connect';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/connect';
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const finalPhone = phoneDigits ? `+91 ${phoneDigits}` : '';
    onUpdateProfile({
      name: name.trim() || 'Life OS Member',
      phoneNumber: finalPhone,
      userType,
      professionalSubCategory: subCategory,
      updatedAt: new Date().toISOString(),
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`w-full max-w-xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold">
              👤
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">Profile & Identity</h2>
              <p className="text-xs text-zinc-400">Account credentials, permissions & identity</p>
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          
          {/* 1. PERSISTENT GOOGLE LOGIN & DISCONNECT */}
          <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="font-bold text-xs">Google Workspace Active</span>
                </div>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">{connectedEmail}</p>
              </div>
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                disabled={isDisconnecting}
                className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-[11px] transition-colors"
              >
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect Google'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              Persistent OAuth session active. You remain logged in across browser refreshes until explicitly clicking Disconnect Google.
            </p>
          </div>

          {/* 2. IDENTITY FORM */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dhruva Balde"
                className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                Mobile Number (WhatsApp & Direct Calls)
              </label>
              <div className={`flex items-center rounded-xl border overflow-hidden ${
                isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
              }`}>
                <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-200/70 dark:bg-zinc-700/60 font-bold text-xs text-zinc-700 dark:text-zinc-200 border-r border-inherit select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit number"
                  className="flex-1 px-3.5 py-2.5 bg-transparent focus:outline-none font-mono text-sm tracking-wider"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  User Role / Persona
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value as UserType)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                >
                  <option value="working_professional">Working Professional (Tech / Corporate)</option>
                  <option value="entrepreneur">Entrepreneur & Franchise Owner</option>
                  <option value="self_employed">Stock Trader / Market Investor</option>
                  <option value="student">Student / Academic Aspirant</option>
                  <option value="other">Silver Wholesale / Bullion Business</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Specialization / Domain
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="e.g. Pre-School Franchise, Stock Trader"
                  className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                  }`}
                />
              </div>
            </div>

            {/* 3. CONNECTED APPS PERMISSIONS (SWITCHES) */}
            <div className="pt-2 border-t border-inherit">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Connected Workspace Apps & Permissions
              </label>
              <div className="space-y-2">
                {[
                  { key: 'gmail', label: 'Gmail', desc: 'Read priority emails and stage draft replies', icon: '✉️' },
                  { key: 'calendar', label: 'Google Calendar', desc: 'Inspect schedule and book strategic events', icon: '📅' },
                  { key: 'docs', label: 'Google Docs', desc: 'Draft executive briefs, SOPs, and memos', icon: '📄' },
                  { key: 'sheets', label: 'Google Sheets', desc: 'Build financial models and operational ledgers', icon: '📊' },
                  { key: 'drive', label: 'Google Drive', desc: 'Search and inspect assets across company drive', icon: '📁' },
                ].map(item => (
                  <div
                    key={item.key}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-zinc-900/40 border-zinc-800' : 'bg-zinc-50/80 border-zinc-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{item.icon}</span>
                      <div>
                        <p className="font-bold text-xs">{item.label}</p>
                        <p className="text-[10px] text-zinc-500">{item.desc}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleApp(item.key as keyof typeof appPermissions)}
                      className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center ${
                        appPermissions[item.key as keyof typeof appPermissions]
                          ? 'bg-blue-600 justify-end'
                          : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {saveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center">
                ✓ Profile successfully saved!
              </div>
            )}

            <div className="pt-3 flex justify-end gap-2 border-t border-inherit">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
