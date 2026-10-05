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
            <span className="font-bold text-lg tracking-tight">Life OS</span>
          </Link>

          <Link
            href="/"
            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            ← Back to Life OS
          </Link>
        </div>

        {/* Header */}
        <div>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
            Data Sovereignty & Air-Gapped Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1 text-gray-950 dark:text-white">
            Life OS Privacy & Security Policy
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Last updated: October 2026 • Certified Zero-Leakage Air-Gap Architecture
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
              ✓ Home & Work Air-Gap
            </span>
            <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80">
              Personal health, routines, and family check-ins are cryptographically separated from professional client files and company data.
            </p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-1">
              ✓ WhatsApp Isolation
            </span>
            <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80">
              WhatsApp Personal operates strictly in Home Mode; WhatsApp Business operates strictly in Work Mode. No cross-chatter leakage.
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-xl">
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 block mb-1">
              ✓ User-Controlled Execution
            </span>
            <p className="text-[11px] text-purple-900/80 dark:text-purple-300/80">
              Emails, financial transactions, and calendar invites are staged as 1-tap review cards. Nothing executes without your human-in-the-loop consent.
            </p>
          </div>
        </div>

        {/* Section 1: Data Isolation */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            1. Dual-Mode Air-Gapped Context Architecture
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Life OS utilizes strict parallel session isolation. When you operate in <strong>Home Mode</strong>, conversational memory, Google Keep checklists, and health blueprints are locked to your personal domain. When switching to <strong>Work Mode</strong>, professional tools (Google Docs, Sheets, Slides, B2B outreach, vendor RFQs) operate in an isolated enterprise container with zero cross-contamination.
          </p>
        </div>

        {/* Section 2: Integrations & Authentication */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            2. Google Workspace & Microsoft 365 Cryptographic Tokens
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            OAuth tokens for Google Workspace (Gmail, Calendar, Drive, Docs, Sheets, Slides, Tasks, Forms) and Microsoft 365 (Outlook, OneDrive) are encrypted using AES-256-GCM. Session tokens are delivered exclusively via HTTP-only, SameSite Secure cookies and refreshed automatically with zero client-side credential exposure.
          </p>
        </div>

        {/* Section 3: Family & Team Governance */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            3. Family Members & Team Collaboration Governance
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Family connections (max 2 seniors, max 2 students) only share explicit opted-in items (such as medical check-in confirmations and family calendar blocks). Team members receive only delegated task assignments and project milestones. Neither family members nor team members have access to your private chat slots or sovereign credentials.
          </p>
        </div>

        {/* Section 4: Data Deletion & Sovereign Export */}
        <div className="space-y-3">
          <h2 className="text-base font-bold text-gray-900 dark:text-white">
            4. Sovereign Deletion & Instant Export
          </h2>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            You retain absolute ownership of all generated content. You can export complete conversations as Markdown dossiers, archive chats to your local device, or trigger complete account purges from your user settings. Once purged, database records and encryption keys are irrecoverably deleted.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
          <span>Life OS Data Protection Office</span>
          <Link href="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Return to Dashboard →
          </Link>
        </div>
      </div>
    </div>
  );
}
