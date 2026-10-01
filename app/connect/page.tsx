'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ConnectPage() {
  const [name, setName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
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

  const handleConnect = () => {
    setIsConnecting(true);
    if (name.trim()) {
      try {
        localStorage.setItem('agent_preferred_name', name.trim());
      } catch (e) {}
    }
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-[100dvh] bg-slate-950 text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-8 flex flex-col items-center text-center">
        {/* Compass Needle Logo */}
        <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="38" height="38">
            <circle cx="16" cy="16" r="13" fill="none" stroke="#334155" strokeWidth="1.5"/>
            <polygon points="16,5 19.5,16 16,14" fill="#3b82f6"/>
            <polygon points="16,5 12.5,16 16,14" fill="#60a5fa"/>
            <polygon points="16,27 19.5,16 16,18" fill="#64748b"/>
            <polygon points="16,27 12.5,16 16,18" fill="#94a3b8"/>
            <circle cx="16" cy="16" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1"/>
          </svg>
        </div>

        <div className="inline-block px-2.5 py-0.5 mb-2 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-[10px] font-bold text-indigo-300 uppercase tracking-widest">
          LIFE OPERATING SYSTEM
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Welcome to Suchi</h1>
        <p className="text-xs text-slate-400 mb-8 max-w-xs">
          Your autonomous Chief of Staff. Directing your attention to what matters, automating the rest.
        </p>

        <div className="w-full space-y-4 text-left">
          <div>
            <label htmlFor="name-input" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dhruva"
              className="w-full px-4 py-3 rounded-xl bg-slate-800/80 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 rounded-xl shadow text-sm font-semibold text-slate-900 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
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
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs font-medium text-slate-300 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Install Suchi App (PWA)</span>
            {isInstallable && <span className="bg-blue-600 text-white text-[9px] px-1.5 py-0.2 rounded font-bold">READY</span>}
          </button>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-5 w-full flex items-center justify-between text-xs text-slate-400">
          <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors underline">
            Privacy & Security Policy
          </Link>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            🔒 AES-256 Sovereign
          </span>
        </div>
      </div>
    </div>
  );
}
