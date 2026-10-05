'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConnectPage() {
  const [name, setName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check error param
    try {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) setAuthError(err);
    } catch (e) {}

    // Check existing session
    async function checkExistingSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (e) {}
    }
    checkExistingSession();

    // PWA Install Prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert('To install Suchi, tap Share / Settings in your browser and select "Add to Home Screen".');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const [includeDocsSheets, setIncludeDocsSheets] = useState(true);
  const [includeSlides, setIncludeSlides] = useState(true);
  const [includeCalendarTasks, setIncludeCalendarTasks] = useState(true);
  const [includeGmail, setIncludeGmail] = useState(true);
  const [showAdvancedPermissions, setShowAdvancedPermissions] = useState(false);
  const [helpSuchiImprove, setHelpSuchiImprove] = useState(true);

  useEffect(() => {
    try {
      const savedImprove = localStorage.getItem('help_suchi_improve');
      if (savedImprove !== null) {
        setHelpSuchiImprove(savedImprove === 'true');
      }
    } catch (e) {}
  }, []);

  const handleConnect = () => {
    setIsConnecting(true);
    if (name.trim()) {
      try {
        localStorage.setItem('agent_preferred_name', name.trim());
      } catch (e) {}
    }
    try {
      localStorage.setItem('help_suchi_improve', helpSuchiImprove ? 'true' : 'false');
    } catch (e) {}
    const tools: string[] = [];
    if (includeDocsSheets) tools.push('docs', 'sheets');
    if (includeSlides) tools.push('slides');
    if (includeCalendarTasks) tools.push('calendar', 'tasks');
    if (includeGmail) tools.push('gmail');
    const query = tools.length > 0 ? `?tools=${tools.join(',')}` : '';
    window.location.href = `/api/auth/login${query}`;
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-gray-100 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-8 flex flex-col items-center text-center">
        {/* Compass Needle Logo */}
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-inner mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="38" height="38">
            <circle cx="16" cy="16" r="13" fill="none" stroke="#334155" strokeWidth="1.5"/>
            <polygon points="16,5 19.5,16 16,14" fill="#3b82f6"/>
            <polygon points="16,5 12.5,16 16,14" fill="#60a5fa"/>
            <polygon points="16,27 19.5,16 16,18" fill="#64748b"/>
            <polygon points="16,27 12.5,16 16,18" fill="#94a3b8"/>
            <circle cx="16" cy="16" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1"/>
          </svg>
        </div>

        <div className="inline-block px-2.5 py-0.5 mb-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-widest">
          LIFE OPERATING SYSTEM
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to Suchi</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs">
          Your autonomous Chief of Staff. Directing your attention to what matters, automating the rest.
        </p>

        {/* Access Denied Warning Banner */}
        {authError === 'access_denied' && (
          <div className="w-full mb-6 p-4 rounded-2xl bg-amber-950/60 border border-amber-700/80 text-left text-xs text-amber-200">
            <div className="flex items-center gap-2 font-bold text-amber-300 mb-1">
              <span>⚠️</span>
              <span>Google Cloud Access Restricted</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              While our Google Cloud OAuth screen is in <strong>Testing</strong> mode, only registered Test Users can sign in. Please contact your workspace administrator (<span className="text-amber-100 font-mono underline">admin@suchi.ai</span>) to whitelist your Gmail address in Google Cloud Console.
            </p>
          </div>
        )}

        {authError === 'auth_failed' && (
          <div className="w-full mb-6 p-3 rounded-xl bg-red-950/60 border border-red-800 text-left text-xs text-red-200">
            <span>⚠️ Authentication could not be completed. Please try again.</span>
          </div>
        )}

        {/* If Already Connected User */}
        {currentUser ? (
          <div className="w-full space-y-4 mb-2">
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-emerald-900/50 text-left flex items-center gap-3">
              {currentUser.picture ? (
                <img src={currentUser.picture} alt={currentUser.name} className="w-10 h-10 rounded-full border border-emerald-500/40" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white">
                  {currentUser.name?.[0] || 'U'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white truncate">{currentUser.name}</span>
                  <span className="text-[9px] bg-emerald-900/60 text-emerald-300 px-1.5 py-0.5 rounded font-bold">CONNECTED</span>
                </div>
                <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <Link
              href="/"
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 rounded-xl shadow text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Open Suchi Chat →</span>
            </Link>

            <button
              onClick={() => setCurrentUser(null)}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-1 block mx-auto"
            >
              Switch Account or Update Permissions
            </button>
          </div>
        ) : (
          <div className="w-full space-y-4 text-left">
            <div>
              <label htmlFor="name-input" className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                Your Preferred Name
              </label>
              <input
                id="name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Your Preferred Name"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Granular Permission Controls Accordion */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/60 p-3 text-xs">
              <button
                type="button"
                onClick={() => setShowAdvancedPermissions(!showAdvancedPermissions)}
                className="w-full flex items-center justify-between text-slate-700 dark:text-slate-300 font-semibold"
              >
                <span className="flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>Customize Permissions & Tools</span>
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400">{showAdvancedPermissions ? 'Hide ▲' : 'Edit ▼'}</span>
              </button>

              {showAdvancedPermissions && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <p className="text-[10px] text-slate-500">
                    Select strictly the tools you wish Suchi to access. Admin & cloud infrastructure APIs are never requested from you.
                  </p>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeDocsSheets}
                      onChange={(e) => setIncludeDocsSheets(e.target.checked)}
                      className="rounded bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Google Docs & Sheets (Documents, spreadsheets & analysis)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeSlides}
                      onChange={(e) => setIncludeSlides(e.target.checked)}
                      className="rounded bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Google Slides (Presentations & executive decks)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeCalendarTasks}
                      onChange={(e) => setIncludeCalendarTasks(e.target.checked)}
                      className="rounded bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Google Calendar & Tasks (Schedules & reminders)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer hover:text-slate-900 dark:hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={includeGmail}
                      onChange={(e) => setIncludeGmail(e.target.checked)}
                      className="rounded bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Gmail (Read & draft replies with mandatory approval)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Help Suchi Get Better (Optional Tick Mark) */}
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer transition-colors text-left">
              <input
                type="checkbox"
                checked={helpSuchiImprove}
                onChange={(e) => {
                  setHelpSuchiImprove(e.target.checked);
                  try {
                    localStorage.setItem('help_suchi_improve', e.target.checked ? 'true' : 'false');
                  } catch (err) {}
                }}
                className="mt-0.5 w-4 h-4 rounded bg-slate-800 border-slate-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white">Help Suchi get better</span>
                  <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-medium">Optional</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  Share anonymous telemetry and bug diagnostics to help our engineering team continuously train and improve Suchi's reasoning.
                </p>
              </div>
            </label>

            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full py-3.5 px-4 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 rounded-xl shadow text-sm font-semibold text-white dark:text-slate-900 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>{isConnecting ? 'Opening Google Sign-In...' : 'Connect Google Workspace'}</span>
            </button>

            {/* Install App Button */}
            <button
              onClick={handleInstallApp}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install Suchi App (PWA)</span>
              {isInstallable && <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">READY</span>}
            </button>
          </div>
        )}

        <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-5 w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <Link href="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline">
            Privacy & Security Policy
          </Link>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            🔒 AES-256 Sovereign
          </span>
        </div>
      </div>
    </div>
  );
}
