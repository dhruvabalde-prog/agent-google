'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface ActionCardItem {
  id: string;
  type: 'draft_reply' | 'document' | 'presentation' | 'spreadsheet' | 'calendar' | 'tasks' | 'image' | 'form' | 'notebook' | 'playlist' | 'places_list';
  title: string;
  subtitle: string;
  description: string;
  timestamp: string;
  status: 'NEEDS_APPROVAL' | 'COMPLETED' | 'IN_PROGRESS';
  priority?: 'HIGH' | 'NORMAL';
  link?: string;
  details?: {
    to?: string;
    subject?: string;
    draftBody?: string;
    draftId?: string;
    itemCount?: number;
    previewUrl?: string;
    prompt?: string;
    aspectRatio?: string;
  };
  options?: Array<{
    id: string;
    label: string;
    variant: 'primary' | 'secondary' | 'danger' | 'success';
    action: 'approve_draft' | 'reject_draft' | 'open_link' | 'mark_reviewed' | 'next';
  }>;
}

interface ActionCardsDeckProps {
  isOpen: boolean;
  onClose: () => void;
  cards: ActionCardItem[];
  onApproveDraft?: (draftId: string) => Promise<void>;
  onRejectDraft?: (draftId: string) => Promise<void>;
  onMarkReviewed?: (cardId: string) => void;
  isDarkMode?: boolean;
  isIncognito?: boolean;
}

export default function ActionCardsDeck({
  isOpen,
  onClose,
  cards,
  onApproveDraft,
  onRejectDraft,
  onMarkReviewed,
  isDarkMode = false,
  isIncognito = false,
}: ActionCardsDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Touch gesture tracking for vertical swipe
  const touchStartY = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation (Arrow keys, Esc)
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        swipeDown(); // go to previous
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        swipeUp(); // go to next
      } else if (e.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, cards.length]);

  if (!isOpen) return null;

  const totalCards = cards.length;
  const currentCard = cards[currentIndex] || cards[0];

  function swipeUp() {
    if (isTransitioning) return;
    if (currentIndex < totalCards - 1) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 450);
    }
  }

  function swipeDown() {
    if (isTransitioning) return;
    if (currentIndex > 0) {
      setIsTransitioning(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 450);
    }
  }

  // Automatic swipe up triggered after an option button is selected
  function triggerAutoSwipeUp(feedbackMsg: string) {
    setActionFeedback(feedbackMsg);
    setTimeout(() => {
      setActionFeedback(null);
      if (currentIndex < totalCards - 1) {
        swipeUp();
      } else {
        // Last card completed
        setActionFeedback('All action cards reviewed!');
        setTimeout(() => {
          setActionFeedback(null);
          onClose();
        }, 1200);
      }
    }, 400);
  }

  // Handle option click
  async function handleOptionClick(optAction: string, card: ActionCardItem) {
    if (optAction === 'approve_draft' && card.details?.draftId && onApproveDraft) {
      await onApproveDraft(card.details.draftId);
      triggerAutoSwipeUp('Draft Approved & Sent via Gmail');
    } else if (optAction === 'reject_draft' && card.details?.draftId && onRejectDraft) {
      await onRejectDraft(card.details.draftId);
      triggerAutoSwipeUp('Draft Discarded');
    } else if (optAction === 'open_link' && card.link) {
      window.open(card.link, '_blank');
      triggerAutoSwipeUp('Opened in new tab');
    } else if (optAction === 'mark_reviewed') {
      if (onMarkReviewed) onMarkReviewed(card.id);
      triggerAutoSwipeUp('Marked as reviewed');
    } else {
      triggerAutoSwipeUp('Advancing to next task');
    }
  }

  // Touch handlers
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchEndY.current = e.touches[0].clientY;
  }

  function handleTouchEnd() {
    if (touchStartY.current === null || touchEndY.current === null) return;
    const diff = touchStartY.current - touchEndY.current;
    const minSwipeDistance = 50;

    if (diff > minSwipeDistance) {
      // Swiped UP -> Go next
      swipeUp();
    } else if (diff < -minSwipeDistance) {
      // Swiped DOWN -> Go previous
      swipeDown();
    }

    touchStartY.current = null;
    touchEndY.current = null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col h-[100dvh] w-full select-none overflow-hidden transition-colors ${
        isIncognito
          ? 'bg-[#0f0c1b] text-purple-100'
          : isDarkMode
          ? 'bg-[#0b0f19] text-gray-100'
          : 'bg-slate-900 text-white'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* HEADER / NAVIGATION BAR */}
      <div className="h-14 border-b border-white/10 px-4 flex items-center justify-between z-20 bg-black/40 backdrop-blur-md flex-shrink-0">
        {/* Brand / Mode Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-bold text-xs uppercase tracking-wider text-emerald-400">
            Life OS Action Deck
          </span>
          <span className="text-[10px] text-white/50 hidden sm:inline">
            (While you were away)
          </span>
        </div>

        {/* Center: Card Count & Dots */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-white/80">
            {currentIndex + 1} / {totalCards}
          </span>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            {cards.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  currentIndex === i ? 'w-5 bg-blue-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
                title={`Card ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right: Close button */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Return to Chat"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* ACTION FEEDBACK FLOATING BANNER */}
      {actionFeedback && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-emerald-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl flex items-center gap-2 animate-bounce">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {actionFeedback}
        </div>
      )}

      {/* VERTICAL SLIDING CARDS DECK (1 card per viewport, no scroll) */}
      <div className="flex-1 w-full relative overflow-hidden flex flex-col items-center justify-center p-3 sm:p-6">
        <div
          className="w-full h-full max-w-lg mx-auto flex flex-col justify-between transition-transform duration-500 ease-out"
          style={{ transform: `translateY(0)` }}
        >
          {/* Action Card Container */}
          <div className="flex-1 flex flex-col justify-between rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Top Status & Timestamp Row */}
            <div className="flex items-center justify-between gap-2 flex-shrink-0 mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  currentCard.status === 'NEEDS_APPROVAL'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {currentCard.status === 'NEEDS_APPROVAL' ? 'Needs Approval' : 'Completed'}
                </span>
                <span className="text-[10px] uppercase font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                  {currentCard.type.replace(/_/g, ' ')}
                </span>
              </div>

              <span className="text-[11px] text-white/50 font-medium">
                {currentCard.timestamp}
              </span>
            </div>

            {/* Middle Content Section */}
            <div className="flex-1 flex flex-col justify-center space-y-3 my-2 overflow-y-auto pr-1">
              <div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                  {currentCard.title}
                </h2>
                <p className="text-xs text-blue-300 font-medium mt-1">
                  {currentCard.subtitle}
                </p>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {currentCard.description}
              </p>

              {/* Special Details Rendering: Gmail Draft Preview */}
              {currentCard.type === 'draft_reply' && currentCard.details && (
                <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/30 text-xs space-y-1.5 shadow-inner">
                  <div className="flex items-center justify-between text-amber-300 text-[11px] font-semibold">
                    <span>To: {currentCard.details.to}</span>
                    <span className="text-[9px] bg-amber-500/20 px-1.5 py-0.5 rounded">GMAIL</span>
                  </div>
                  <div className="font-medium text-white/90 text-[11px]">
                    Subject: {currentCard.details.subject}
                  </div>
                  <div className="p-2.5 rounded-xl bg-black/50 text-gray-200 text-xs font-mono max-h-32 overflow-y-auto border border-white/10 whitespace-pre-wrap">
                    {currentCard.details.draftBody}
                  </div>
                </div>
              )}

              {/* Special Details Rendering: Image Preview */}
              {currentCard.type === 'image' && currentCard.details?.previewUrl && (
                <div className="rounded-2xl overflow-hidden border border-white/15 max-h-48 bg-black/40">
                  <img
                    src={currentCard.details.previewUrl}
                    alt="Generated by Life OS"
                    className="w-full h-auto object-cover max-h-48"
                  />
                </div>
              )}

              {/* Link Highlight if available */}
              {currentCard.link && (
                <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/30 flex items-center justify-between text-xs">
                  <span className="text-blue-300 font-semibold truncate max-w-[200px]">
                    Single Direct Link Ready
                  </span>
                  <a
                    href={currentCard.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-200 font-bold inline-flex items-center gap-1"
                  >
                    Open Artifact ↗
                  </a>
                </div>
              )}
            </div>

            {/* Bottom Actions Row (Triggering Automatic Swipe Up) */}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2 flex-shrink-0">
              <div className="flex items-center gap-2">
                {currentCard.options?.map((opt) => {
                  let btnStyle = 'bg-blue-600 hover:bg-blue-500 text-white';
                  if (opt.variant === 'success') btnStyle = 'bg-emerald-600 hover:bg-emerald-500 text-white';
                  if (opt.variant === 'danger') btnStyle = 'bg-rose-600 hover:bg-rose-500 text-white';
                  if (opt.variant === 'secondary') btnStyle = 'bg-white/10 hover:bg-white/20 text-gray-200';

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleOptionClick(opt.action, currentCard)}
                      className={`flex-1 py-3 px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 ${btnStyle}`}
                    >
                      <span>{opt.label}</span>
                      <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                    </button>
                  );
                })}
              </div>

              {/* Manual Next / Swipe Up Hint */}
              <div className="flex items-center justify-between text-[11px] text-white/40 pt-1 px-1">
                <span>Swipe up or tap button to auto-advance</span>
                <button
                  onClick={swipeUp}
                  disabled={currentIndex >= totalCards - 1}
                  className="hover:text-white disabled:opacity-30 inline-flex items-center gap-1 font-semibold"
                >
                  <span>Next Action</span>
                  <span>↓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING VERTICAL CONTROLS (Right Side) */}
      <div className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
        <button
          onClick={swipeDown}
          disabled={currentIndex === 0}
          title="Previous Action Card"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 disabled:opacity-20 flex items-center justify-center text-white backdrop-blur transition-all active:scale-95 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>

        <button
          onClick={swipeUp}
          disabled={currentIndex >= totalCards - 1}
          title="Next Action Card (Auto Swipe Up)"
          className="w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 disabled:opacity-20 flex items-center justify-center text-white backdrop-blur transition-all active:scale-95 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
