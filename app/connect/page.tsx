'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ConnectPage() {
  const [name, setName] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // If name is provided, store in local storage or session so it persists
    if (name.trim()) {
      try {
        localStorage.setItem('agent_preferred_name', name.trim());
      } catch (e) {}
    }
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-200 shadow-xl p-8 flex flex-col items-center text-center">
        {/* App Logo */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg mb-6">
          AG
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Connect Google Account</h1>
        <p className="text-sm text-gray-500 mb-8">
          Link your Google Workspace to seamlessly organize Docs, Sheets, Slides, Calendar, Tasks, and Gmail.
        </p>

        <div className="w-full space-y-4 text-left">
          <div>
            <label htmlFor="name-input" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Your Name
            </label>
            <input
              id="name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Dhruva"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <button
            onClick={handleConnect}
            disabled={isConnecting}
            className="w-full mt-2 py-3.5 px-4 bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl shadow-sm text-sm font-semibold text-gray-700 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{isConnecting ? 'Redirecting to Google...' : 'Connect Google Account'}</span>
          </button>
        </div>

        <div className="mt-8 border-t border-gray-100 pt-6 w-full flex items-center justify-between text-xs text-gray-500">
          <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">
            ← Back to Chat
          </Link>
          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            🔒 Secure OAuth 2.0
          </span>
        </div>
      </div>
    </div>
  );
}
