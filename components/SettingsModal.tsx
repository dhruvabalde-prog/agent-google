'use client';

import React, { useState, useEffect } from 'react';
import DelegationSettingsModal, { DelegationSettings, DEFAULT_DELEGATION_SETTINGS } from './DelegationSettingsModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  isDarkMode?: boolean;
}

export default function SettingsModal({
  isOpen,
  onClose,
  isAdmin = false,
  isDarkMode = false,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'systems' | 'memory' | 'admin'>('systems');
  const [memoryAirGapped, setMemoryAirGapped] = useState(false);
  const [memoryCleared, setMemoryCleared] = useState(false);
  const [savedSettings, setSavedSettings] = useState(false);

  // Delegation Settings state
  const [delegationSettings, setDelegationSettings] = useState<DelegationSettings>(DEFAULT_DELEGATION_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('lifeos_delegation_settings');
      if (stored) {
        setDelegationSettings(JSON.parse(stored));
      }
    } catch (e) {}
  }, []);

  if (!isOpen) return null;

  const handleClearMemory = () => {
    if (confirm('Clear conversational memory? Active workspace files in Google Drive will remain intact.')) {
      setMemoryCleared(true);
      setTimeout(() => setMemoryCleared(false), 2000);
    }
  };

  const handleSaveDelegation = (updated: DelegationSettings) => {
    setDelegationSettings(updated);
    try {
      localStorage.setItem('lifeos_delegation_settings', JSON.stringify(updated));
    } catch (e) {}
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${
        isDarkMode ? 'bg-zinc-950 border-zinc-800 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
      }`}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold">
              ⚙️
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">Life OS Settings</h2>
              <p className="text-xs text-zinc-400">Systems & SOPs, Agent Memory, and Platform Governance</p>
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-inherit flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('systems')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'systems'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>📋</span> Systems & SOPs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('memory')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'memory'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>🧠</span> Memory & Privacy
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 shadow-xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <span>🛡️</span> Admin Portal
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          
          {/* TAB 1: SYSTEMS & SOPS */}
          {activeTab === 'systems' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm">Delegation & Execution Protocols</h3>
                <p className="text-[11px] text-zinc-500">Configure how autonomously Life OS drafts emails, models sheets, and schedules events.</p>
              </div>

              <div className="space-y-3">
                <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">Autonomous Email Staging</p>
                      <p className="text-[11px] text-zinc-500">Draft replies require human approval before sending</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      DRAFT & APPROVE
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">Spreadsheet Financial Formulas</p>
                      <p className="text-[11px] text-zinc-500">Always generate uppercase headers and dynamic math formulas</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      ENFORCED
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">Single Master Link Protocol</p>
                      <p className="text-[11px] text-zinc-500">Deliver 1 master clickable URL for Slides PPT, Docs & Sheets</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      ENFORCED
                    </span>
                  </div>
                </div>

                <div className={`p-3.5 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-2`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs">Concise Action Card Responses</p>
                      <p className="text-[11px] text-zinc-500">Life OS delivers deliverables via Action Cards, keeping chat responses concise</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MEMORY & PRIVACY */}
          {activeTab === 'memory' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm">Conversational Memory & Privacy Safeguards</h3>
                <p className="text-[11px] text-zinc-500">Control semantic memory retention and air-gapped isolation.</p>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">Air-Gapped Isolation Mode</p>
                    <p className="text-[11px] text-zinc-500">Disables session memory persistence across turns</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMemoryAirGapped(!memoryAirGapped)}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 flex items-center ${
                      memoryAirGapped ? 'bg-purple-600 justify-end' : 'bg-zinc-300 dark:bg-zinc-700 justify-start'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
                  </button>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">Purge Session Memory</p>
                    <p className="text-[11px] text-zinc-500">Wipes cached conversational context without deleting Workspace files</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearMemory}
                    className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 font-bold text-xs"
                  >
                    Clear Memory
                  </button>
                </div>
                {memoryCleared && (
                  <p className="text-emerald-600 font-semibold text-[11px]">✓ Conversational memory purged successfully.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADMIN PORTAL LINK */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-sm">Platform Administration</h3>
                <p className="text-[11px] text-zinc-500">Tenant governance, skill pack allocations, and API key management.</p>
              </div>

              <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-slate-50 border-slate-200'} space-y-3`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-xs">Super Admin Access</p>
                    <p className="text-[11px] text-zinc-500 font-mono">dhruvabalde@gmail.com</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                    SUPER ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Full unrestricted access to all capability packs, model telemetry, tenant quota control, and API configurations.
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = '/admin';
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>🛡️</span> Open Admin Panel ↗
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-inherit flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
