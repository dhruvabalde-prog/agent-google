'use client';

import React from 'react';
import { UserProfile, AppMode } from '@/lib/types';

interface DashboardsViewProps {
  mode: AppMode;
  profile: UserProfile | null;
  onNavigateToTab: (tab: 'dashboards' | 'today' | 'chat' | 'actions' | 'chats') => void;
  onLaunchPrompt: (prompt: string) => void;
  isDarkMode?: boolean;
}

export default function DashboardsView({
  mode,
  profile,
  onNavigateToTab,
  onLaunchPrompt,
  isDarkMode = false,
}: DashboardsViewProps) {
  const userType = profile?.userType || 'working_professional';
  const proCategory = profile?.workingCategory || 'salaried';
  const proSub = profile?.workingSubCategory || 'Software Engineer / Tech Lead';
  const studentSub = profile?.studentSubType || 'competitive_exam';

  return (
    <div className={`flex-1 overflow-y-auto px-4 py-6 max-w-5xl mx-auto w-full transition-colors ${
      isDarkMode ? 'text-zinc-100' : 'text-zinc-900'
    }`}>
      {/* Header Banner */}
      <div className={`rounded-2xl p-5 sm:p-6 mb-6 border transition-all ${
        mode === 'home'
          ? isDarkMode
            ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-800/50'
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
          : isDarkMode
          ? 'bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border-blue-800/50'
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{mode === 'home' ? '🏠' : '💼'}</span>
              <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                mode === 'home'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
              }`}>
                {mode === 'home' ? 'Home Mode Dashboard' : 'Work Mode Dashboard'}
              </span>
              <span className="text-xs text-zinc-400">•</span>
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 capitalize">
                {userType === 'working_professional' ? proSub : userType.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {profile?.name ? `Welcome back, ${profile.name}` : 'Executive Operations Command'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {mode === 'home'
                ? 'Air-gapped personal vitality, family health, routines, and domestic asset management.'
                : 'Real-time performance indicators, deliverables, client touchpoints, and career leverage.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateToTab('today')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isDarkMode
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-200 hover:bg-zinc-700'
                  : 'bg-white border-zinc-200 text-zinc-800 hover:bg-zinc-50 shadow-xs'
              }`}
            >
              📅 View Today&apos;s Schedule
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('chat')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold text-white shadow-xs transition-all ${
                mode === 'home'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              💬 Open Life OS Chat
            </button>
          </div>
        </div>
      </div>

      {/* DASHBOARDS CONTENT: HOME MODE */}
      {mode === 'home' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Vitality Score</span>
                <span>🩺</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">94%</div>
              <div className="text-[11px] text-zinc-500 mt-1">Checkups up to date</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Family Sync</span>
                <span>👨‍👩‍👧‍👦</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {profile?.familyMembers?.length || 2} Connected
              </div>
              <div className="text-[11px] text-zinc-500 mt-1">All check-ins active</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Domestic Routine</span>
                <span>📋</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">4 / 5 Done</div>
              <div className="text-[11px] text-zinc-500 mt-1">Evening sunset left</div>
            </div>

            <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>Household Ledger</span>
                <span>💰</span>
              </div>
              <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">₹42,800</div>
              <div className="text-[11px] text-zinc-500 mt-1">Within monthly budget</div>
            </div>
          </div>

          {/* Home Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <span>🥗</span> Health & Aging Parents Care
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">OPTIMAL</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Prescription schedules, upcoming blood test diagnostic panels, and daily hydration reminders.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-xs">
                  <span>💊 Morning Vitamin D3 & Omega-3</span>
                  <span className="text-emerald-500 font-bold">Taken ✓</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-xs">
                  <span>🩺 Parents HbA1c & Lipid Panel Follow-up</span>
                  <span className="text-amber-500 font-bold">Saturday</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLaunchPrompt('Generate my Annual Preventive Health Checkup blueprint and schedule tests in Calendar.')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600/20 transition-colors"
              >
                + Update Preventive Health Blueprint
              </button>
            </div>

            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold flex items-center gap-2">
                  <span>🛒</span> Household Stock & Weekend Logistics
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-500">KEEP NOTES</span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Google Keep grocery checklists, domestic pantry replenishment, and weekend getaway itinerary.
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-xs">
                  <span>📝 Weekend Grocery Restock Checklist</span>
                  <span className="text-zinc-400">8 Items pending</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 text-xs">
                  <span>🚗 Vehicle Service & Insurance Renewal</span>
                  <span className="text-blue-500 font-bold">12 Oct</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onLaunchPrompt('Create a smart weekly grocery checklist and healthy meal plan in Google Keep.')}
                className="mt-4 w-full py-2 rounded-xl text-xs font-semibold bg-blue-600/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600/20 transition-colors"
              >
                + Sync Grocery Checklist to Keep
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARDS CONTENT: WORK MODE (TAILORED PER PERSONA) */}
      {mode === 'work' && (
        <div className="space-y-6">
          {/* Persona: STUDENT */}
          {userType === 'student' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Active Syllabus</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">76% Mastered</div>
                  <div className="text-[11px] text-zinc-500 mt-1">14 modules completed</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Mock Test Accuracy</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">82.4%</div>
                  <div className="text-[11px] text-zinc-500 mt-1">+4.2% from last mock</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Study Streak</div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">18 Days 🔥</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Daily deep work block</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Exam Countdown</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">42 Days</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Target date: 15 Nov</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">🎯 Conceptual Bottlenecks & Feynman Explainer</h3>
                  <p className="text-xs text-zinc-500 mb-3">Break down dense concepts using analogies and active-recall flashcards.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Break down the hardest topic in my syllabus using the Feynman technique and create revision flashcards in Keep.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Launch Feynman Synthesis
                  </button>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">📊 Mock Test Negative Marking Diagnostic</h3>
                  <p className="text-xs text-zinc-500 mb-3">Analyze unforced errors vs conceptual traps from recent practice mocks.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Analyze my latest mock test score error log, eliminate negative marks, and schedule remedial blocks in Calendar.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Open Error Diagnostic Ledger
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Persona: WORKING PROFESSIONAL — SALARIED */}
          {userType === 'working_professional' && proCategory === 'salaried' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Quarterly Impact</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">8 Deliverables</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Logged in Brag Sheet</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Manager Alignment</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">High</div>
                  <div className="text-[11px] text-zinc-500 mt-1">1-on-1 scheduled this week</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Appraisal Readiness</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">92%</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Target promotion dossier ready</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Calendar Load</div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">14 hrs meetings</div>
                  <div className="text-[11px] text-zinc-500 mt-1">5 focus blocks protected</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">📄 Annual Impact & Appraisal Brag Sheet</h3>
                  <p className="text-xs text-zinc-500 mb-3">Synthesize quarterly achievements into quantified business outcomes in Google Docs.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Generate an executive impact brag sheet in Google Docs for my upcoming performance appraisal.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Draft Appraisal Dossier
                  </button>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">📊 Executive Update Deck (Google Slides)</h3>
                  <p className="text-xs text-zinc-500 mb-3">Build high-visibility 5-slide progress deck for skip-level leadership.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Create a 5-slide strategic progress presentation in Google Slides for executive leadership.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500"
                  >
                    Generate Leadership Deck
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Persona: WORKING PROFESSIONAL — ENTREPRENEUR & PRE-SCHOOL / FRANCHISE OWNER */}
          {userType === 'working_professional' && proCategory === 'entrepreneur' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Admissions & Pipeline</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">48 Enrolled</div>
                  <div className="text-[11px] text-zinc-500 mt-1">6 prospective tours pending</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Monthly Fee Dues</div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">₹1,45,000</div>
                  <div className="text-[11px] text-zinc-500 mt-1">1-tap WhatsApp reminders ready</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Staff Roster</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">12 Active</div>
                  <div className="text-[11px] text-zinc-500 mt-1">100% attendance today</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Vendor Procurement</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">3 RFQs</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Catering & learning kits</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">💬 Parent WhatsApp Circulars & Fee Follow-ups</h3>
                  <p className="text-xs text-zinc-500 mb-3">Generate warm, professional 1-tap WhatsApp message links for parent notices and fee dues.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Generate 1-tap WhatsApp reminder messages for pending monthly fees and draft this week\'s parent activity notice.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Open WhatsApp Broadcast Desk
                  </button>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">📦 Vendor Procurement & Matrix in Sheets</h3>
                  <p className="text-xs text-zinc-500 mb-3">Compare vendors side-by-side in Google Sheets for facility maintenance and school supplies.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Draft an RFQ and build a side-by-side vendor comparison matrix in Google Sheets for school supplies.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Build Vendor Comparison Matrix
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Persona: WORKING PROFESSIONAL — SELF-EMPLOYED (STOCK TRADER, CA, LAWYER, DOCTOR) */}
          {userType === 'working_professional' && proCategory === 'self_employed' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Win Rate / Cases</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">68.5%</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Disciplined risk adherence</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Capital at Risk %</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">1.2%</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Under strict 2% rule</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Filing Deadlines</div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">4 Urgent</div>
                  <div className="text-[11px] text-zinc-500 mt-1">GST / Court / Consult dates</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Client Retainers</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">₹2,80,000</div>
                  <div className="text-[11px] text-zinc-500 mt-1">12 active client files</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">📈 Trade Journal & Risk Capital Desk</h3>
                  <p className="text-xs text-zinc-500 mb-3">Enforce 1-2% portfolio risk rules, calculate trade expectancies, and track psychological logs.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Log my trading setups, risk-reward ratios, and stop-losses into my Google Sheets risk capital journal.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500"
                  >
                    Open Risk Ledger
                  </button>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">⚖️ Client Retainers & Statutory Filing Desk</h3>
                  <p className="text-xs text-zinc-500 mb-3">Draft retainer proposals in Docs, schedule GST/hearing dates in Calendar, and stage invoices.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Draft a client engagement retainer agreement in Google Docs and schedule statutory deadlines in Calendar.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Draft Client Retainer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Persona: WORKING PROFESSIONAL — FREELANCER & CREATOR */}
          {userType === 'working_professional' && proCategory === 'freelancer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Content Pipeline</div>
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">6 Scripts</div>
                  <div className="text-[11px] text-zinc-500 mt-1">YouTube & LinkedIn</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Brand Sponsorships</div>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">₹1,85,000</div>
                  <div className="text-[11px] text-zinc-500 mt-1">3 campaigns pending review</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Active Retainers</div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">4 Clients</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Deliverables on schedule</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-xs text-zinc-400 mb-1">Outreach Conversion</div>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600">22%</div>
                  <div className="text-[11px] text-zinc-500 mt-1">Multi-touch B2B connect</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">🎬 Content Creator Script & Hook Engine</h3>
                  <p className="text-xs text-zinc-500 mb-3">Structure high-retention video outlines with 3-second hooks and brand integration scripts.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Structure a high-retention video script outline with hook, retention spikes, and sponsorship integration.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500"
                  >
                    Generate Video Script
                  </button>
                </div>
                <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <h3 className="text-sm font-bold mb-2">🤝 Brand Sponsorship Pitch Deck (Slides)</h3>
                  <p className="text-xs text-zinc-500 mb-3">Build customized rate card and audience engagement pitch decks for prospective brands.</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Create a brand sponsorship pitch deck in Google Slides with demographic metrics and deliverable packages.')}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Build Pitch Deck
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Persona: SENIORS */}
          {userType === 'seniors' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl border bg-emerald-500/10 border-emerald-500/30 text-center">
                <span className="text-4xl block mb-2">🌸</span>
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  Peaceful Vitality & Daily Care
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2 max-w-lg mx-auto">
                  Large print, simple buttons, and zero clutter. Everything you need is right here.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-3xl mb-2">💊</div>
                  <h3 className="text-base font-bold mb-1">Prescription Medicine</h3>
                  <p className="text-xs text-zinc-500 mb-3">Afternoon Calcium & Blood Pressure</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Remind me about my medicine dosage and schedule doctor appointment in Calendar.')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white w-full"
                  >
                    Check Medicines
                  </button>
                </div>

                <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-3xl mb-2">👨‍👩‍👦</div>
                  <h3 className="text-base font-bold mb-1">Family WhatsApp</h3>
                  <p className="text-xs text-zinc-500 mb-3">Send &quot;I am doing well&quot; update</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Generate a 1-tap WhatsApp message to send to my children saying I am doing well today.')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white w-full"
                  >
                    Send Family Hello
                  </button>
                </div>

                <div className={`p-5 rounded-2xl border text-center ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200 shadow-xs'}`}>
                  <div className="text-3xl mb-2">🚶‍♂️</div>
                  <h3 className="text-base font-bold mb-1">Evening Walk Routine</h3>
                  <p className="text-xs text-zinc-500 mb-3">45 mins in garden at 5:30 PM</p>
                  <button
                    type="button"
                    onClick={() => onLaunchPrompt('Add an evening walk reminder to my Google Calendar for 5:30 PM.')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white w-full"
                  >
                    Set Walk Reminder
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
