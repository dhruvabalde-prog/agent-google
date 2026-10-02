'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ActionDeckItem {
  id: string;
  category: 'drafts' | 'workspace' | 'tasks' | 'calendar';
  title: string;
  summary: string;
  timestamp: string;
  status: 'NEEDS_APPROVAL' | 'COMPLETED' | 'DISCARDED';
  link?: string;
  draftInfo?: {
    draftId: string;
    to: string;
    subject: string;
    body: string;
  };
  details?: any;
}

interface ActionsDeckViewProps {
  items: ActionDeckItem[];
  onApproveDraft: (draftId: string) => Promise<void>;
  onRejectDraft: (draftId: string) => Promise<void>;
  onOpenDraftInChat?: (draftInfo: any) => void;
  onRequestRevision?: (item: ActionDeckItem) => void;
  onCompleteTask?: (taskId: string) => Promise<void>;
  onSnoozeTask?: (taskId: string) => Promise<void>;
  onAddMeetLink?: (eventId: string) => Promise<void>;
  isDarkMode?: boolean;
}

export default function ActionsDeckView({
  items,
  onApproveDraft,
  onRejectDraft,
  onOpenDraftInChat,
  onRequestRevision,
  onCompleteTask,
  onSnoozeTask,
  onAddMeetLink,
  isDarkMode = false,
}: ActionsDeckViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'drafts' | 'workspace' | 'tasks' | 'calendar'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwipingUp, setIsSwipingUp] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Filter items by category
  const filteredItems = items.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  // Reset index when changing category
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  const currentItem = filteredItems[currentIndex] || filteredItems[0];
  const totalItems = filteredItems.length;

  function advanceToNextCard(feedbackText: string) {
    setFeedbackToast(feedbackText);
    setIsSwipingUp(true);

    setTimeout(() => {
      setFeedbackToast(null);
      setIsSwipingUp(false);
      if (currentIndex < totalItems - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Wrap around or stay
        setCurrentIndex(0);
      }
    }, 400);
  }

  // Handle specific action choices
  async function handleOptionSelect(optionKey: string, item: ActionDeckItem) {
    if (!item) return;

    if (optionKey === 'approve_draft' && item.draftInfo) {
      await onApproveDraft(item.draftInfo.draftId);
      advanceToNextCard('✓ Approved & Sent via Gmail');
    } else if (optionKey === 'discard_draft' && item.draftInfo) {
      await onRejectDraft(item.draftInfo.draftId);
      advanceToNextCard('Discarded draft');
    } else if (optionKey === 'edit_draft' && item.draftInfo) {
      if (onOpenDraftInChat) onOpenDraftInChat(item.draftInfo);
      advanceToNextCard('Draft opened in Suchi chat');
    } else if (optionKey === 'open_link' && item.link) {
      window.open(item.link, '_blank');
      advanceToNextCard('Opened in Google Workspace');
    } else if (optionKey === 'request_revision') {
      if (onRequestRevision) onRequestRevision(item);
      advanceToNextCard('Revision requested from Suchi');
    } else if (optionKey === 'mark_finalized') {
      advanceToNextCard('✓ Marked as finalized');
    } else if (optionKey === 'complete_task') {
      if (onCompleteTask) await onCompleteTask(item.id);
      advanceToNextCard('✓ Task marked complete');
    } else if (optionKey === 'snooze_task') {
      if (onSnoozeTask) await onSnoozeTask(item.id);
      advanceToNextCard('⏰ Task snoozed to tomorrow');
    } else if (optionKey === 'add_meet_link') {
      if (onAddMeetLink) await onAddMeetLink(item.id);
      advanceToNextCard('🎥 Google Meet video link added');
    } else if (optionKey === 'confirm_calendar') {
      advanceToNextCard('📅 Event confirmed on Google Calendar');
    } else {
      advanceToNextCard('Action logged');
    }
  }

  // Category Badges & Counts
  const counts = {
    all: items.length,
    drafts: items.filter(i => i.category === 'drafts').length,
    workspace: items.filter(i => i.category === 'workspace').length,
    tasks: items.filter(i => i.category === 'tasks').length,
    calendar: items.filter(i => i.category === 'calendar').length,
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full max-w-xl mx-auto overflow-hidden select-none relative p-3 sm:p-5">
      {/* 1. Category Filter Pills (Locked at Top) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-3 shrink-0">
        {[
          { key: 'all', label: 'All', icon: '⚡' },
          { key: 'drafts', label: 'Emails', icon: '✉️' },
          { key: 'workspace', label: 'Workspace', icon: '📄' },
          { key: 'tasks', label: 'Tasks', icon: '☑️' },
          { key: 'calendar', label: 'Calendar', icon: '📅' },
        ].map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setSelectedCategory(cat.key as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
              selectedCategory === cat.key
                ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                : isDarkMode
                ? 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedCategory === cat.key ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              {counts[cat.key as keyof typeof counts] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Floating Action Feedback Pill */}
      {feedbackToast && (
        <div className="absolute top-14 left-1/2 -translate-x-1/2 z-40 bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5 animate-bounce">
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 2. One Card Per Viewport Surface (No Outer Scroll) */}
      <div className="flex-1 flex flex-col justify-center items-center relative overflow-hidden my-auto w-full">
        {totalItems === 0 ? (
          <div className="p-8 text-center rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm max-w-sm w-full space-y-2">
            <span className="text-3xl">✨</span>
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100">All caught up!</h3>
            <p className="text-xs text-slate-400">
              No pending action cards in this category. As Suchi generates drafts, documents, or scheduled tasks, they will appear here.
            </p>
          </div>
        ) : (
          <div
            className={`w-full max-w-md rounded-3xl border shadow-xl flex flex-col justify-between p-5 sm:p-6 transition-all duration-400 ease-out ${
              isSwipingUp
                ? '-translate-y-24 opacity-0 scale-95'
                : 'translate-y-0 opacity-100 scale-100'
            } ${
              isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-white shadow-slate-950/60'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-200/80'
            }`}
            style={{ minHeight: '380px' }}
          >
            {/* Card Header & Counter */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                  currentItem.category === 'drafts'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300/40'
                    : currentItem.category === 'workspace'
                    ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300/40'
                    : currentItem.category === 'tasks'
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300/40'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40'
                }`}>
                  {currentItem.category === 'drafts' ? 'Gmail Consent' : currentItem.category === 'workspace' ? 'Workspace Deliverable' : currentItem.category === 'tasks' ? 'Tasks & Reminder' : 'Calendar & Meet'}
                </span>

                <span className="text-xs font-semibold text-slate-400">
                  {currentIndex + 1} of {totalItems}
                </span>
              </div>

              {/* Title & Summary */}
              <h2 className="text-base sm:text-lg font-bold leading-snug line-clamp-2">
                {currentItem.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {currentItem.summary}
              </p>

              {/* Card Detail Specifics */}
              {currentItem.draftInfo && (
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                  <p><strong className="text-slate-600 dark:text-slate-400">Recipient:</strong> {currentItem.draftInfo.to}</p>
                  <p><strong className="text-slate-600 dark:text-slate-400">Subject:</strong> {currentItem.draftInfo.subject}</p>
                  {currentItem.draftInfo.body && (
                    <p className="italic text-slate-500 dark:text-slate-400 line-clamp-3 pt-1 border-t border-slate-200 dark:border-slate-800">
                      "{currentItem.draftInfo.body}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Specific Type Options (Categorized UX) */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {currentItem.category === 'drafts' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect('approve_draft', currentItem)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Approve & Send ✓</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOptionSelect('edit_draft', currentItem)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Edit in Suchi ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOptionSelect('discard_draft', currentItem)}
                      className="flex-1 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold text-xs transition-colors"
                    >
                      Discard ✕
                    </button>
                  </div>
                </>
              )}

              {currentItem.category === 'workspace' && (
                <>
                  {currentItem.link && (
                    <button
                      type="button"
                      onClick={() => handleOptionSelect('open_link', currentItem)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Open in Workspace ↗</span>
                    </button>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOptionSelect('request_revision', currentItem)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Request Revision ✦
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOptionSelect('mark_finalized', currentItem)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Mark Finalized ✓
                    </button>
                  </div>
                </>
              )}

              {currentItem.category === 'tasks' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect('complete_task', currentItem)}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Mark Completed ✓</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOptionSelect('snooze_task', currentItem)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Snooze to Tomorrow ⏰
                    </button>
                    <button
                      type="button"
                      onClick={() => advanceToNextCard('Task dismissed')}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs transition-colors"
                    >
                      Skip Next ➔
                    </button>
                  </div>
                </>
              )}

              {currentItem.category === 'calendar' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleOptionSelect('add_meet_link', currentItem)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Add Google Meet Video Link 🎥</span>
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleOptionSelect('confirm_calendar', currentItem)}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
                    >
                      Confirm Event 📅
                    </button>
                    <button
                      type="button"
                      onClick={() => advanceToNextCard('Next event')}
                      className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 text-xs transition-colors"
                    >
                      Skip ➔
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Card Dots Indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-3 pt-1">
              {filteredItems.slice(0, 10).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
