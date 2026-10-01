'use client';

import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-10 shadow-sm">
        
        {/* Navigation & Logo */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center p-1.5 shadow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20">
                <circle cx="16" cy="16" r="12" fill="none" stroke="#475569" strokeWidth="2"/>
                <polygon points="16,6.5 19,16 16,14.5" fill="#38bdf8"/>
                <polygon points="16,25.5 19,16 16,17.5" fill="#94a3b8"/>
                <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
              </svg>
            </span>
            <span className="font-bold text-lg tracking-tight">Suchi</span>
          </Link>

          <Link
            href="/"
            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Back to App
          </Link>
        </div>

        {/* Header */}
        <div>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            Data Sovereignty & Encryption Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-gray-950 dark:text-white">
            Suchi Privacy & Security Policy
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last updated: October 2026 • Certified Zero-Knowledge Architecture
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
              ✓ AES-256-GCM Encryption
            </span>
            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80">
              All conversations, transcripts, and meaningful outcomes are encrypted at rest with military-grade authenticated ciphers.
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-1">
              ✓ Zero PII Leakage
            </span>
            <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80">
              Personal identity tokens, passwords, and sensitive keys are strictly scrubbed before any cross-service or model interaction.
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 block mb-1">
              ✓ No AI Model Training
            </span>
            <p className="text-[11px] text-purple-900/80 dark:text-purple-300/80">
              Your data, files, and email interactions are never retained or utilized to train Google, OpenAI, or any foundation AI models.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <section className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">1. Principles of Sovereign Computing</h2>
          <p>
            Suchi was built from the ground up on a fundamental premise: your digital life, personal correspondence, finances, health, and family matters belong exclusively to you. We act purely as your client-side executive operating system. No advertising networks, trackers, or behavioral profiling are built into Suchi.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">2. Google Workspace Scopes & Access</h2>
          <p>
            When you grant permissions through Google OAuth, Suchi receives short-lived, encrypted access tokens stored solely in your secure browser session cookie (JWE A256GCM). Suchi only accesses your Google Workspace resources (Docs, Sheets, Slides, Drive, Calendar, Tasks, Gmail) when you explicitly instruct it to execute a specific task or question.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong>Draft Isolation:</strong> Suchi never sends emails autonomously. It creates a draft and demands your explicit <em>Approve & Send</em> tap.</li>
            <li><strong>File Scoping:</strong> Suchi only alters files that you reference or direct it to create.</li>
            <li><strong>Revocation:</strong> You can disconnect and revoke access at any second via the Settings dropdown or through your Google Account Permissions.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">3. Incognito Mode & Transient Memory</h2>
          <p>
            When you activate <strong>Incognito Mode</strong> in Suchi, the application switches to transient RAM memory:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Zero chat rows are written to the database.</li>
            <li>Zero local storage keys are committed.</li>
            <li>If your browser tab is closed or switched away, memory is instantly purged.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">4. Model Context Protocol (MCP) & Third-Party Apps</h2>
          <p>
            Suchi exposes a secure RFC 8414 OAuth 2.0 endpoint for third-party assistants (like Gemini). The Zero-Knowledge Data Firewall intercepts every outbound MCP tool call, stripping user identity tokens, email addresses, and private file identifiers before passing only the minimal task payload needed to execute.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">5. Permanent Data Erasure</h2>
          <p>
            You hold complete deletion power. Clicking <em>Delete Chat</em> instantly and permanently deletes your conversation, messages, and transcripts from our database using cascading deletion. No shadow backups or soft-delete retention locks are maintained.
          </p>
        </section>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>Suchi Life Operating System</span>
          <Link href="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Launch Suchi →
          </Link>
        </div>
      </div>
    </div>
  );
}
