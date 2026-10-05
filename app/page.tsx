'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ChatMessage, ActionResult, DraftInfo } from '@/lib/types';
import ActionCardsDeck, { ActionCardItem } from '@/components/ActionCardsDeck';
import MyDayView, { CalendarEvent, TaskItem, GoalItem } from '@/components/MyDayView';
import ActionsDeckView, { ActionDeckItem } from '@/components/ActionsDeckView';

import { RoutineItem } from '@/components/RoutinePlayerModal';
import DelegationSettingsModal, { DelegationSettings, DEFAULT_DELEGATION_SETTINGS } from '@/components/DelegationSettingsModal';

interface ArchiveChat {
  id: string;
  title: string;
  meaningful_outcome?: string;
  outcome_status?: string;
  is_locked?: boolean;
  is_starred?: boolean;
  message_count?: number;
  duration?: string;
  has_files?: boolean;
  has_voice?: boolean;
  updated_at: string;
  markdown_content?: string;
}

const PROGRESS_PHRASES = [
  'Understanding what you need',
  'Gathering the relevant information',
  'Checking the available sources',
  'Organizing the findings',
  'Building the first draft',
  'Finishing things up',
];

const AGENT_SUGGESTIONS_POOL = [
  'Tip: You can attach up to 10 documents or past chats for deeper context.',
  'Tip: Asking for a 5-slide presentation will auto-format title and bullets directly.',
  'Tip: You can star important chats in the Archive to keep them pinned at the top.',
  'Tip: Confirm the meaningful outcome at the top when you are happy with the draft.',
];

const LIFE_MODE_CAPABILITY_POOL = [
  'Generate 1-tap WhatsApp message to follow up on client invoice',
  'Prepare pre-call briefing & dialer for upcoming vendor negotiation',
  'Draft RFQ & compare 3 development vendors in Google Sheets',
  'Launch B2B customer connect outreach pipeline with 3-touch sequence',
  'Compile annual achievements brag sheet for promotion in Google Docs',
  'Incorporate business entity: checklist & founder agreement in Keep',
  'Build 5-slide executive update deck for leadership in Google Slides',
  'Audit urgent tasks due today & sweep unread inbox threads',
];

const HOME_MODE_CAPABILITY_POOL = [
  'Create my Annual Preventive Health Checkup blueprint & schedule tests',
  'Build a weekly grocery & healthy meal plan checklist in Google Keep',
  'Organize medication schedule & doctor visits for aging parents',
  'Track monthly household expenses & SIP savings in Google Sheets',
  'Plan weekend family getaway itinerary with Google Maps places',
  'Draft evening digital-sunset routine in Google Tasks',
  'Organize insurance policies & property documents in Google Drive',
  'Review personal goals & habit tracker for this month',
];

const CAPABILITY_POOL = [...LIFE_MODE_CAPABILITY_POOL, ...HOME_MODE_CAPABILITY_POOL];

const EXECUTIVE_SKILL_SUGGESTIONS = [
  'Generate 1-tap WhatsApp message to follow up on client invoice or agreement.',
  'Prepare an executive pre-call briefing and dialer for my strategic discussion tomorrow.',
  'Draft RFQ and compare 3 leading vendors side-by-side in Google Sheets.',
  'Launch a multi-touch B2B customer connect campaign with email & WhatsApp copy.',
  'Compile my annual impact brag sheet in Google Docs for upcoming appraisal reviews.',
  'Draft a 5-slide strategic update deck for executive leadership in Google Slides.',
  'Create my Annual Preventive Health Checkup blueprint and schedule diagnostic panels.',
];

function extractOptions(text: string): { label: string; text: string }[] {
  if (!text) return [];
  const options: { label: string; text: string }[] = [];
  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^(?:[-*]|\d+\.)?\s*(?:\[([A-Z0-9])\]|\(([A-Z0-9])\))\s*(.+)$/i);
    if (match) {
      const key = (match[1] || match[2]).toUpperCase();
      const val = match[3].trim();
      options.push({ label: key, text: val });
    }
  }
  return options;
}

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, '');
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const isHtml = lang === 'html' || (codeText.trim().startsWith('<') && (codeText.includes('<div') || codeText.includes('<button') || codeText.includes('<table') || codeText.includes('<!DOCTYPE') || codeText.includes('<html')));
  const [viewMode, setViewMode] = useState<'code' | 'preview'>(isHtml ? 'preview' : 'code');

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="relative my-3 rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-zinc-300">{lang || (isHtml ? 'HTML UI' : 'CODE')}</span>
          {isHtml && (
            <div className="flex items-center bg-zinc-800 rounded p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`px-2 py-0.5 rounded font-sans transition-all ${viewMode === 'code' ? 'bg-zinc-700 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2 py-0.5 rounded font-sans transition-all flex items-center gap-1 ${viewMode === 'preview' ? 'bg-blue-600 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'}`}
              >
                <span>👁️</span> Live Preview
              </button>
            </div>
          )}
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <span className="text-emerald-400 font-bold">✓</span>
              <span className="text-emerald-400 font-sans text-[10px]">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span className="font-sans text-[10px]">Copy</span>
            </>
          )}
        </button>
      </div>

      {isHtml && viewMode === 'preview' ? (
        <div className="w-full bg-slate-900 border-t border-zinc-800/80 p-2">
          <iframe
            title="HTML UI Preview"
            srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><script src="https://cdn.tailwindcss.com"></script><style>body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 12px; color: #f8fafc; background: #0f172a; }</style></head><body>${codeText}</body></html>`}
            className="w-full h-80 rounded-lg border border-zinc-800 bg-slate-950"
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <div className="p-3 overflow-x-auto text-zinc-200">
          <pre className="m-0 p-0 bg-transparent">
            <code className={className}>{children}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

interface QuestionOption {
  key: string;
  text: string;
}

function extractQuestionOptions(text: string): QuestionOption[] {
  if (!text) return [];
  const lines = text.split('\n');
  const results: QuestionOption[] = [];
  const regex = /^[-*]?\s*\[([A-Da-d])\]\s*(.+)$/;
  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(regex);
    if (match) {
      results.push({
        key: match[1].toUpperCase(),
        text: match[2].trim(),
      });
    }
  }
  return results;
}

export default function Home() {
  // Two Parallel Chat Slots (Only 2 chats at a time)
  const [activeSlot, setActiveSlot] = useState<1 | 2>(1);
  const [slot1Messages, setSlot1Messages] = useState<ChatMessage[]>([]);
  const [slot2Messages, setSlot2Messages] = useState<ChatMessage[]>([]);
  const [slot1Id, setSlot1Id] = useState<string>(() => crypto.randomUUID());
  const [slot2Id, setSlot2Id] = useState<string>(() => crypto.randomUUID());
  const [slot1Outcome, setSlot1Outcome] = useState<string>('');
  const [slot2Outcome, setSlot2Outcome] = useState<string>('');
  const [slot1OutcomeStatus, setSlot1OutcomeStatus] = useState<string>('NONE');
  const [slot2OutcomeStatus, setSlot2OutcomeStatus] = useState<string>('NONE');
  const [slot1Locked, setSlot1Locked] = useState<boolean>(false);
  const [slot2Locked, setSlot2Locked] = useState<boolean>(false);
  const [isRestored, setIsRestored] = useState<boolean>(false);

  // Active slot proxies
  const messages = activeSlot === 1 ? slot1Messages : slot2Messages;
  const setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> = (val) => {
    if (activeSlot === 1) setSlot1Messages(val);
    else setSlot2Messages(val);
  };
  const currentChatId = activeSlot === 1 ? slot1Id : slot2Id;
  const setCurrentChatId = (id: string) => {
    if (activeSlot === 1) setSlot1Id(id);
    else setSlot2Id(id);
  };
  const meaningfulOutcome = activeSlot === 1 ? slot1Outcome : slot2Outcome;
  const setMeaningfulOutcome = (o: string) => {
    if (activeSlot === 1) setSlot1Outcome(o);
    else setSlot2Outcome(o);
  };
  const outcomeStatus = activeSlot === 1 ? slot1OutcomeStatus : slot2OutcomeStatus;
  const setOutcomeStatus = (s: string) => {
    if (activeSlot === 1) setSlot1OutcomeStatus(s);
    else setSlot2OutcomeStatus(s);
  };
  const isChatLocked = activeSlot === 1 ? slot1Locked : slot2Locked;
  const setIsChatLocked = (l: boolean) => {
    if (activeSlot === 1) setSlot1Locked(l);
    else setSlot2Locked(l);
  };

  // Voice Typing (Speech-to-Text dictation)
  const [isVoiceTyping, setIsVoiceTyping] = useState(false);
  const speechRecognitionRef = useRef<any>(null);
  // Delegation & Autonomy Settings
  const [isDelegationModalOpen, setIsDelegationModalOpen] = useState(false);
  const [delegationSettings, setDelegationSettings] = useState<DelegationSettings>(DEFAULT_DELEGATION_SETTINGS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('suchi_delegation_settings_v1');
      if (stored) {
        setDelegationSettings({ ...DEFAULT_DELEGATION_SETTINGS, ...JSON.parse(stored) });
      }
    } catch (e) {}
  }, []);

  // Dual Mode: Home Mode vs Life Mode (Right Top Corner Drawer)
  const [chatMode, setChatMode] = useState<'home' | 'life'>('life');
  const [isModeDrawerOpen, setIsModeDrawerOpen] = useState(false);

  // Quick Tools State for Right Drawer
  const [quickWaPhone, setQuickWaPhone] = useState('');
  const [quickWaMsg, setQuickWaMsg] = useState('');
  const [quickCallContact, setQuickCallContact] = useState('');
  const [quickCallPhone, setQuickCallPhone] = useState('');
  const [quickCallObjective, setQuickCallObjective] = useState('');

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem('suchi_chat_mode');
      if (savedMode === 'home' || savedMode === 'life') {
        setChatMode(savedMode);
      }
    } catch (e) {}
  }, []);

  function handleModeChange(mode: 'home' | 'life') {
    setChatMode(mode);
    try {
      localStorage.setItem('suchi_chat_mode', mode);
    } catch (e) {}
  }

  const [welcomeCapabilities, setWelcomeCapabilities] = useState<string[]>([]);

  useEffect(() => {
    const pool = chatMode === 'home' ? HOME_MODE_CAPABILITY_POOL : LIFE_MODE_CAPABILITY_POOL;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setWelcomeCapabilities(shuffled.slice(0, 5));
  }, [currentChatId, activeSlot, chatMode]);

  const [input, setInput] = useState('');
  const [slot1Loading, setSlot1Loading] = useState(false);
  const [slot2Loading, setSlot2Loading] = useState(false);
  const isLoading = activeSlot === 1 ? slot1Loading : slot2Loading;
  const [progressIndex, setProgressIndex] = useState(0);
  const [user, setUser] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Independent AbortControllers per slot
  const slot1AbortControllerRef = useRef<AbortController | null>(null);
  const slot2AbortControllerRef = useRef<AbortController | null>(null);
  const abortControllerRef = activeSlot === 1 ? slot1AbortControllerRef : slot2AbortControllerRef;

  // Q&A Pill filters text override
  const [showTextInputOverride, setShowTextInputOverride] = useState(false);

  const currentQuestionOptions = React.useMemo(() => {
    const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
    if (!lastMsg || lastMsg.role !== 'assistant' || isLoading || isChatLocked) return [];
    return extractQuestionOptions(lastMsg.content);
  }, [messages, isLoading, isChatLocked]);

  // System 3: Scroll Management & Jump-to-Latest
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);

  // System 1: Draft persistence in localStorage
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('suchi_composer_draft');
      if (savedDraft && !input) {
        setInput(savedDraft);
      }
    } catch (e) {}
  }, []);

  const handleComposerInputChange = (val: string) => {
    setInput(val);
    try {
      if (val.trim()) {
        localStorage.setItem('suchi_composer_draft', val);
      } else {
        localStorage.removeItem('suchi_composer_draft');
      }
    } catch (e) {}
  };

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [draftStatuses, setDraftStatuses] = useState<Map<string, 'approved' | 'rejected'>>(new Map());

  // Settings & Navigation
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const triggerToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isSettingsOpen]);

  const [isIncognito, setIsIncognito] = useState(false);
  const [savedNormalChat, setSavedNormalChat] = useState<{
    id: string;
    messages: ChatMessage[];
    meaningfulOutcome: string;
    outcomeStatus: string;
    isChatLocked: boolean;
  } | null>(null);

  // Archive Modal & Attach From Archive
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveChats, setArchiveChats] = useState<ArchiveChat[]>([]);
  const [archiveFilter, setArchiveFilter] = useState<'all' | 'active' | 'completed' | 'starred'>('all');
  const [archiveSearch, setArchiveSearch] = useState('');
  const [isAttachFromArchiveOpen, setIsAttachFromArchiveOpen] = useState(false);
  const [selectedArchiveAttachments, setSelectedArchiveAttachments] = useState<string[]>([]);

  // Attachments (up to 10 files)
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; content?: string }>>([]);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);

  // Voice Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Agent Suggests Popup
  const [activeSuggestion, setActiveSuggestion] = useState<string | null>(null);
  const [suggestionCount, setSuggestionCount] = useState(0);

  // Requirement clarification options
  const [activeClarification, setActiveClarification] = useState<{
    question: string;
    options: string[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Dark Mode Theme
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Message Interaction States (Copy, Edit last 5, TTS voice playback, Image Gen)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedImageAspectRatio, setSelectedImageAspectRatio] = useState<string>('1:1');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);

  // Actions Page / Deck State (1 card per viewport, no scroll, auto swipe-up)
  const [isActionsDeckOpen, setIsActionsDeckOpen] = useState<boolean>(false);
  const [actionCards, setActionCards] = useState<ActionCardItem[]>([]);
  const [unreadActionsCount, setUnreadActionsCount] = useState<number>(0);

  // Bottom Navigation Tabs: 'my_day' (left) | 'suchi' (center) | 'actions' (right)
  const [activeAppTab, setActiveAppTab] = useState<'my_day' | 'suchi' | 'actions'>('suchi');

  // My Day state (tasks, routines, goals)
  const [hubTasks, setHubTasks] = useState<any[]>([]);
  const [hubRoutines, setHubRoutines] = useState<any[]>([]);
  const [hubGoals, setHubGoals] = useState<any[]>([]);
  const [isHubLoading, setIsHubLoading] = useState(false);
  const [newHubTaskTitle, setNewHubTaskTitle] = useState('');
  const [hubFilter, setHubFilter] = useState<'all' | 'tasks' | 'routines' | 'goals'>('all');

  // Actions Filter
  const [actionsFilter, setActionsFilter] = useState<'all' | 'needs_approval' | 'completed'>('all');


  // Bug Reporting & Telemetry State
  const [isBugModalOpen, setIsBugModalOpen] = useState<boolean>(false);
  const [bugIssueType, setBugIssueType] = useState<string>('tool_failure');
  const [bugDescription, setBugDescription] = useState<string>('');
  const [bugTargetMessage, setBugTargetMessage] = useState<ChatMessage | null>(null);
  const [isSubmittingBug, setIsSubmittingBug] = useState<boolean>(false);
  const [bugToast, setBugToast] = useState<string | null>(null);

  function handleOpenBugModal(msg?: ChatMessage) {
    setBugTargetMessage(msg || null);
    if (msg && msg.actions && msg.actions.some(a => !a.success)) {
      setBugIssueType('tool_failure');
    } else if (msg && msg.content && msg.content.includes('Sorry, something went wrong')) {
      setBugIssueType('tool_failure');
    } else {
      setBugIssueType('other');
    }
    setBugDescription('');
    setIsBugModalOpen(true);
  }

  async function handleSubmitBugReport() {
    setIsSubmittingBug(true);
    try {
      const helpOptIn = typeof window !== 'undefined' ? localStorage.getItem('help_suchi_improve') !== 'false' : true;
      const failedAction = bugTargetMessage?.actions?.find(a => !a.success);

      const payload = {
        userEmail: user?.email || 'user@suchi.ai',
        userName: user?.name || 'Suchi User',
        issueType: bugIssueType,
        summary: bugDescription.slice(0, 100) || (failedAction ? `Tool ${failedAction.tool} failed: ${failedAction.summary}` : 'Issue encountered in Suchi chat'),
        userDescription: bugDescription,
        lastUserMessage: messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '',
        lastAssistantResponse: bugTargetMessage?.content || messages.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '',
        failedAction: failedAction || null,
        diagnostics: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
          platform: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown',
          screenSize: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Unknown',
          url: typeof window !== 'undefined' ? window.location.href : '/',
          helpOptIn,
          systemStatus: 'Online',
        },
      };

      const res = await fetch('/api/bugs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsBugModalOpen(false);
        setBugToast('Bug report sent to engineering. Thank you for helping Suchi get better!');
        setTimeout(() => setBugToast(null), 5000);
      } else {
        alert('Could not submit bug report. Please try again.');
      }
    } catch (e) {
      console.error('Failed to submit bug report:', e);
      alert('Network error submitting bug report.');
    } finally {
      setIsSubmittingBug(false);
    }
  }

  async function fetchActionCards() {
    try {
      const res = await fetch('/api/actions');
      if (res.ok) {
        const data = await res.json();
        if (data.actions) {
          setActionCards(data.actions);
          setUnreadActionsCount(data.unreadCount || data.actions.filter((a: any) => a.status === 'NEEDS_APPROVAL').length);
        }
      }
    } catch (e) {
      console.error('Failed to fetch action cards:', e);
    }
  }

  useEffect(() => {
    fetchActionCards();
  }, []);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('suchi_theme');
      let isDark = false;
      if (savedTheme === 'dark') {
        isDark = true;
      } else if (savedTheme === 'light') {
        isDark = false;
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        isDark = true;
      }
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } catch (e) {}
  }, []);

  function toggleDarkMode() {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('suchi_theme', next ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', next);
      } catch (e) {}
      return next;
    });
  }

  function handleLogin() {
    window.location.href = '/api/auth/login';
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/connect';
    } catch (e) {
      console.error('Logout error:', e);
      window.location.href = '/connect';
    }
  }

  // Check auth on load - redirect to /connect if unauthenticated
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          } else {
            window.location.href = '/connect';
            return;
          }
        } else {
          window.location.href = '/connect';
          return;
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
        window.location.href = '/connect';
        return;
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  // Chat Persistence & Restore: always stay upon reload and scroll directly to the last message sent
  useEffect(() => {
    let loadedFromLocal = false;
    try {
      const raw = localStorage.getItem('suchi_active_session_v2');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && (saved.slot1?.messages?.length > 0 || saved.slot2?.messages?.length > 0)) {
          if (saved.activeSlot === 1 || saved.activeSlot === 2) {
            setActiveSlot(saved.activeSlot);
          }
          if (saved.slot1) {
            setSlot1Id(saved.slot1.id || crypto.randomUUID());
            setSlot1Messages(saved.slot1.messages || []);
            setSlot1Outcome(saved.slot1.outcome || '');
            setSlot1OutcomeStatus(saved.slot1.outcomeStatus || 'NONE');
            setSlot1Locked(Boolean(saved.slot1.locked));
          }
          if (saved.slot2) {
            setSlot2Id(saved.slot2.id || crypto.randomUUID());
            setSlot2Messages(saved.slot2.messages || []);
            setSlot2Outcome(saved.slot2.outcome || '');
            setSlot2OutcomeStatus(saved.slot2.outcomeStatus || 'NONE');
            setSlot2Locked(Boolean(saved.slot2.locked));
          }
          loadedFromLocal = true;
          setIsRestored(true);

          // Scroll immediately to the last message sent
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
          }, 80);
        }
      }
    } catch (err) {
      console.warn('Error reading chat session from localStorage:', err);
    }

    if (!loadedFromLocal) {
      const restoreLatestFromDb = async () => {
        try {
          const res = await fetch('/api/chats');
          if (res.ok) {
            const data = await res.json();
            if (data.chats && data.chats.length > 0) {
              const latestChat = data.chats[0];
              const chatRes = await fetch(`/api/chats/${latestChat.id}`);
              if (chatRes.ok) {
                const chatData = await chatRes.json();
                if (chatData.messages && chatData.messages.length > 0) {
                  setSlot1Id(latestChat.id);
                  setSlot1Messages(chatData.messages.map((m: any) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    actions: m.actions,
                  })));
                  setSlot1Outcome(latestChat.meaningful_outcome || '');
                  setSlot1OutcomeStatus(latestChat.outcome_status || 'NONE');
                  setSlot1Locked(Boolean(latestChat.is_locked));

                  setTimeout(() => {
                    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
                  }, 80);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Could not restore chat from DB:', e);
        } finally {
          setIsRestored(true);
        }
      }
      restoreLatestFromDb();
    }
  }, []);

  // Save session across slots and reloads
  useEffect(() => {
    if (!isRestored) return;
    try {
      const payload = {
        activeSlot,
        slot1: { id: slot1Id, messages: slot1Messages, outcome: slot1Outcome, outcomeStatus: slot1OutcomeStatus, locked: slot1Locked },
        slot2: { id: slot2Id, messages: slot2Messages, outcome: slot2Outcome, outcomeStatus: slot2OutcomeStatus, locked: slot2Locked },
      };
      localStorage.setItem('suchi_active_session_v2', JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to save chat session:', e);
    }
  }, [activeSlot, slot1Messages, slot2Messages, slot1Id, slot2Id, slot1Outcome, slot2Outcome, slot1OutcomeStatus, slot2OutcomeStatus, slot1Locked, slot2Locked, isRestored]);

  // PWA beforeinstallprompt handler
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      alert(
        'To install Suchi:\n\n' +
        '• iPhone/iPad (Safari): Tap the Share icon, then select "Add to Home Screen".\n' +
        '• Android (Chrome): Tap the three-dot menu ⋮, then select "Install app" or "Add to Home screen".\n' +
        '• PC/Mac (Chrome/Edge): Click the install icon in the URL bar.'
      );
    }
  };

  // Toggle Incognito: The existing chat stays exactly the same way (never converted into incognito).
  // Incognito is ALWAYS a new chat and is not saved in archive.
  function handleToggleIncognito() {
    if (!isIncognito) {
      // Switching ON Incognito: preserve existing chat
      setSavedNormalChat({
        id: currentChatId,
        messages: [...messages],
        meaningfulOutcome,
        outcomeStatus,
        isChatLocked,
      });
      const incognitoId = crypto.randomUUID();
      setCurrentChatId(incognitoId);
      setMessages([]);
      setMeaningfulOutcome('');
      setOutcomeStatus('NONE');
      setIsChatLocked(false);
      setIsIncognito(true);
    } else {
      // Switching OFF Incognito: restore normal chat or reset to fresh normal chat
      if (savedNormalChat) {
        setCurrentChatId(savedNormalChat.id);
        setMessages(savedNormalChat.messages);
        setMeaningfulOutcome(savedNormalChat.meaningfulOutcome);
        setOutcomeStatus(savedNormalChat.outcomeStatus);
        setIsChatLocked(savedNormalChat.isChatLocked);
        setSavedNormalChat(null);
      } else {
        setCurrentChatId(crypto.randomUUID());
        setMessages([]);
        setMeaningfulOutcome('');
        setOutcomeStatus('NONE');
        setIsChatLocked(false);
      }
      setIsIncognito(false);
    }
    setIsSettingsOpen(false);
  }

  // Incognito auto-exit on tab change or window blur without losing previous normal chat
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && isIncognito) {
        if (savedNormalChat) {
          setCurrentChatId(savedNormalChat.id);
          setMessages(savedNormalChat.messages);
          setMeaningfulOutcome(savedNormalChat.meaningfulOutcome);
          setOutcomeStatus(savedNormalChat.outcomeStatus);
          setIsChatLocked(savedNormalChat.isChatLocked);
          setSavedNormalChat(null);
        } else {
          setCurrentChatId(crypto.randomUUID());
          setMessages([]);
          setMeaningfulOutcome('');
          setOutcomeStatus('NONE');
          setIsChatLocked(false);
        }
        setIsIncognito(false);
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isIncognito, savedNormalChat]);

  // Dynamic progress cycling
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % PROGRESS_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll with smart sticky-bottom awareness (System 3)
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (isAtBottomRef.current || lastMsg?.role === 'user') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, outcomeStatus]);

  function handleMessagesScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);
    const atBottom = distanceToBottom < 120;
    isAtBottomRef.current = atBottom;
    setShowJumpToBottom(!atBottom && scrollHeight > clientHeight + 150);
  }

  function handleJumpToBottom() {
    isAtBottomRef.current = true;
    setShowJumpToBottom(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // Fetch Archive chats
  async function fetchArchiveChats() {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        setArchiveChats(data.chats || []);
      }
    } catch (e) {
      console.error('Failed to load archive chats:', e);
    }
  }

  // Open Full-Page Archive
  function openArchive() {
    setIsSettingsOpen(false);
    window.location.href = '/archive';
  }

  // Toggle Star on a Chat
  async function handleToggleStar(chatId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${chatId}/star`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setArchiveChats(prev => prev.map(c => c.id === chatId ? { ...c, is_starred: data.is_starred } : c));
      }
    } catch (e) {
      console.error('Failed to toggle star:', e);
    }
  }

  // Open past chat from Archive
  async function handleOpenPastChat(chat: ArchiveChat) {
    try {
      const res = await fetch(`/api/chats/${chat.id}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentChatId(data.chat.id);
        setMeaningfulOutcome(data.chat.meaningful_outcome || '');
        setOutcomeStatus(data.chat.outcome_status || 'NONE');
        setIsChatLocked(data.chat.is_locked || false);
        setMessages((data.messages || []).map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          actions: typeof m.actions === 'string' ? JSON.parse(m.actions) : m.actions,
        })));
        setIsArchiveOpen(false);
      }
    } catch (e) {
      console.error('Failed to open chat:', e);
    }
  }

  // Use context in new chat
  function handleUseContextInNewChat(chat: ArchiveChat) {
    setIsArchiveOpen(false);
    const newId = crypto.randomUUID();
    setCurrentChatId(newId);
    setMeaningfulOutcome('');
    setOutcomeStatus('NONE');
    setIsChatLocked(false);
    
    // Inject previous chat context
    const contextSnippet = `[Context from Previous Chat: "${chat.title}"]\n${chat.markdown_content || ''}\n---\n`;
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `I've attached the context from **"${chat.title}"**. How would you like to build on this in our new conversation?`,
      }
    ]);
  }

  // Lock chat upon user confirming outcome
  async function handleConfirmOutcome() {
    if (!currentChatId) return;
    try {
      // Build markdown representation
      let md = `# ${meaningfulOutcome || 'Conversation Summary'}\n\n## Dialogue\n`;
      messages.forEach(m => {
        md += `\n### ${m.role === 'user' ? 'User' : 'Suchi'}\n${m.content}\n`;
      });

      await fetch(`/api/chats/${currentChatId}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdownContent: md }),
      });

      setIsChatLocked(true);
      setOutcomeStatus('LOCKED');
    } catch (e) {
      console.error('Failed to lock chat:', e);
    }
  }

  // Dismiss outcome blinking alert and continue
  function handleContinueChat() {
    setOutcomeStatus('ACTIVE');
  }

  // Delete current chat
  async function handleDeleteCurrentChat() {
    if (!currentChatId) return;
    if (confirm('Are you sure you want to delete this chat permanently?')) {
      await fetch(`/api/chats/${currentChatId}`, { method: 'DELETE' });
      setMessages([]);
      setCurrentChatId(crypto.randomUUID());
      setMeaningfulOutcome('');
      setOutcomeStatus('NONE');
      setIsChatLocked(false);
      setIsSettingsOpen(false);
    }
  }

  // Trigger Agent Suggests (max 2/hour)
  function handleTriggerSuggest() {
    if (suggestionCount >= 2) {
      setActiveSuggestion('You have reached the maximum of 2 suggestions for this hour.');
      setTimeout(() => setActiveSuggestion(null), 3500);
      return;
    }
    const tip = AGENT_SUGGESTIONS_POOL[suggestionCount % AGENT_SUGGESTIONS_POOL.length];
    setActiveSuggestion(tip);
    setSuggestionCount(prev => prev + 1);
  }

  // File Attachments (Up to 10)
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (attachedFiles.length + files.length > 10) {
      alert('You can attach a maximum of 10 files at a time.');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedFiles(prev => [
          ...prev,
          {
            name: file.name,
            size: `${(file.size / 1024).toFixed(1)} KB`,
            content: event.target?.result as string,
          }
        ]);
      };
      if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  // Voice Typing — Speech-to-Text using Web Speech API
  function toggleVoiceTyping() {
    if (isVoiceTyping) {
      // Stop
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
      }
      setIsVoiceTyping(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = input; // preserve existing text in the input

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += (finalTranscript ? ' ' : '') + t;
        } else {
          interim += t;
        }
      }
      setInput(finalTranscript + (interim ? ' ' + interim : ''));
      // Auto-grow textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone permission denied. Please allow microphone access.');
      }
      setIsVoiceTyping(false);
    };

    recognition.onend = () => {
      setIsVoiceTyping(false);
    };

    recognition.start();
    speechRecognitionRef.current = recognition;
    setIsVoiceTyping(true);
  }

  // Audio Recording (First tap start, second tap stop)
  async function toggleAudioRecording() {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        const mimeType = (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm'))
          ? 'audio/webm'
          : ((typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/mp4')) ? 'audio/mp4' : '');

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setRecordedAudioUrl(url);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setRecordingSeconds(0);
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1);
        }, 1000);
      } catch (err) {
        alert('Microphone access denied or not supported.');
      }
    }
  }

  // Fresh New Chat Handler
  function handleStartNewChat() {
    setMessages([]);
    setCurrentChatId(crypto.randomUUID());
    setMeaningfulOutcome('');
    setOutcomeStatus('NONE');
    setIsChatLocked(false);
    setInput('');
    setAttachedFiles([]);
    setRecordedAudioUrl(null);
    setShowTextInputOverride(false);
    triggerToast('Started a fresh new chat');
  }

  // Send message
  async function sendMessage(textToSend?: string) {
    const currentSlot = activeSlot;
    const isCurrentSlotLoading = currentSlot === 1 ? slot1Loading : slot2Loading;
    const isCurrentSlotLocked = currentSlot === 1 ? slot1Locked : slot2Locked;
    const promptText = (textToSend || input).trim();
    if ((!promptText && attachedFiles.length === 0 && !recordedAudioUrl) || isCurrentSlotLoading || isCurrentSlotLocked) return;

    let fullPrompt = promptText;

    // Attach text from files
    if (attachedFiles.length > 0) {
      fullPrompt += '\n\n' + attachedFiles.map(f => `--- Attached File: ${f.name} ---\n${f.content || ''}`).join('\n');
    }

    // Attach voice note note
    if (recordedAudioUrl) {
      fullPrompt += '\n\n[Audio Note attached to message]';
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: fullPrompt || 'Attached voice note',
    };

    const currentHistory = currentSlot === 1 ? slot1Messages : slot2Messages;
    const newHistory = [...currentHistory, userMessage];
    if (currentSlot === 1) setSlot1Messages(newHistory);
    else setSlot2Messages(newHistory);

    setInput('');
    try {
      localStorage.removeItem('suchi_composer_draft');
    } catch (e) {}
    setAttachedFiles([]);
    setRecordedAudioUrl(null);
    setShowTextInputOverride(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    await executeChatWithHistory(newHistory, currentSlot);
  }

  // System 1: Stop Generation Handler
  function handleStopGeneration() {
    const activeRef = activeSlot === 1 ? slot1AbortControllerRef : slot2AbortControllerRef;
    if (activeRef.current) {
      activeRef.current.abort();
      activeRef.current = null;
    }
    if (activeSlot === 1) setSlot1Loading(false);
    else setSlot2Loading(false);
    triggerToast('Generation stopped');
  }

  // System 2: Regenerate Response Handler
  async function handleRegenerateResponse(assistantMsgId: string) {
    if (isLoading || isChatLocked) return;
    const targetIdx = messages.findIndex(m => m.id === assistantMsgId);
    if (targetIdx === -1) return;

    // Slices history up to the previous user message
    const priorHistory = messages.slice(0, targetIdx);
    if (priorHistory.length === 0) return;

    setMessages(priorHistory);
    await executeChatWithHistory(priorHistory, activeSlot);
  }

  // Core chat execution dispatcher decoupled per slot
  async function executeChatWithHistory(chatHistory: ChatMessage[], targetSlot: 1 | 2 = activeSlot) {
    if (targetSlot === 1) setSlot1Loading(true);
    else setSlot2Loading(true);
    setProgressIndex(0);

    const controller = new AbortController();
    if (targetSlot === 1) slot1AbortControllerRef.current = controller;
    else slot2AbortControllerRef.current = controller;

    const slotChatId = targetSlot === 1 ? slot1Id : slot2Id;
    const slotOutcome = targetSlot === 1 ? slot1Outcome : slot2Outcome;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          chatId: slotChatId,
          isIncognito,
          meaningfulOutcome: slotOutcome,
          delegationSettings,
          mode: chatMode,
          messages: chatHistory.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('API failure');
      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content || 'Not able to respond right now.',
        actions: data.actions,
        pendingDraft: data.pendingDraft,
      };

      const finalHistory = [...chatHistory, assistantMessage];
      if (targetSlot === 1) setSlot1Messages(finalHistory);
      else setSlot2Messages(finalHistory);

      if (data.meaningfulOutcome) {
        if (targetSlot === 1) setSlot1Outcome(data.meaningfulOutcome);
        else setSlot2Outcome(data.meaningfulOutcome);
      }
      if (data.outcomeStatus) {
        if (targetSlot === 1) setSlot1OutcomeStatus(data.outcomeStatus);
        else setSlot2OutcomeStatus(data.outcomeStatus);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const abortedMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '⏹ Response stopped by user.',
        };
        if (targetSlot === 1) setSlot1Messages([...chatHistory, abortedMsg]);
        else setSlot2Messages([...chatHistory, abortedMsg]);
        return;
      }
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Not able to respond right now.',
      };
      if (targetSlot === 1) setSlot1Messages([...chatHistory, errorMsg]);
      else setSlot2Messages([...chatHistory, errorMsg]);
    } finally {
      if (targetSlot === 1) {
        setSlot1Loading(false);
        slot1AbortControllerRef.current = null;
      } else {
        setSlot2Loading(false);
        slot2AbortControllerRef.current = null;
      }
    }
  }

  // Message Copy Helper
  function handleCopyMessage(id: string, text: string) {
    try {
      navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  }

  // Message Edit Handlers (for last 5 user messages)
  function handleStartEditMessage(msg: ChatMessage) {
    setEditingMessageId(msg.id);
    setEditingText(msg.content);
  }

  function handleCancelEditMessage() {
    setEditingMessageId(null);
    setEditingText('');
  }

  async function handleSaveEditMessage(msgId: string) {
    if (!editingText.trim() || isLoading) return;
    const targetIdx = messages.findIndex(m => m.id === msgId);
    if (targetIdx === -1) return;

    // Truncate all subsequent messages and update this message
    const trimmedHistory: ChatMessage[] = messages.slice(0, targetIdx + 1).map((m, idx) => {
      if (idx === targetIdx) {
        return { ...m, content: editingText.trim() };
      }
      return m;
    });

    setMessages(trimmedHistory);
    setEditingMessageId(null);
    setEditingText('');

    // Re-run conversation from this edited turning point
    await executeChatWithHistory(trimmedHistory);
  }

  // Voice Speech Synthesis Handler
  function handleToggleSpeech(msgId: string, text: string) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Strip markdown formatting for natural voice cadence
    const cleanText = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[#*_~>]/g, '')
      .replace(/-\s*\[[A-Z]\]/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(v => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
    setSpeakingMessageId(msgId);
  }

  // Direct Image Generation Helper
  async function handleGenerateImageDirect(promptToUse: string, ratio: string) {
    setIsGeneratingImage(true);
    try {
      const res = await fetch('/api/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptToUse, aspectRatio: ratio }),
      });
      if (res.ok) {
        const data = await res.json();
        const imgMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Here is your generated image (${ratio}):`,
          actions: [{
            tool: 'generate_image',
            summary: `Generated image (${ratio}): ${promptToUse.slice(0, 40)}...`,
            success: true,
            imageUrl: data.imageUrl,
            link: data.imageUrl,
          }],
        };
        setMessages(prev => [...prev, imgMessage]);
      }
    } catch (e) {
      console.error('Image gen failed:', e);
    } finally {
      setIsGeneratingImage(false);
    }
  }

  // Draft Approval / Discard Handlers
  async function handleApproveDraft(draftId: string) {
    try {
      const res = await fetch(`/api/drafts/${draftId}/approve`, { method: 'POST' });
      if (res.ok) {
        setDraftStatuses(prev => new Map(prev).set(draftId, 'approved'));
      }
    } catch (e) {
      console.error('Failed to approve draft:', e);
    }
  }

  async function handleRejectDraft(draftId: string) {
    try {
      const res = await fetch(`/api/drafts/${draftId}/reject`, { method: 'POST' });
      if (res.ok) {
        setDraftStatuses(prev => new Map(prev).set(draftId, 'rejected'));
      }
    } catch (e) {
      console.error('Failed to discard draft:', e);
    }
  }

  // Load hub data on mount and check ?tab= query parameter
  useEffect(() => {
    loadHubData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'my_day' || tab === 'myday' || tab === 'hub') {
        setActiveAppTab('my_day');
      } else if (tab === 'actions') {
        setActiveAppTab('actions');
      }
    }
  }, []);

  async function loadHubData() {
    setIsHubLoading(true);
    try {
      const res = await fetch('/api/hub');
      if (res.ok) {
        const data = await res.json();
        setHubTasks(data.tasks || []);
        setHubRoutines(data.routines || []);
        setHubGoals(data.goals || []);
      }
    } catch (e) {
      console.error('Failed to load hub data:', e);
    } finally {
      setIsHubLoading(false);
    }
  }

  async function handleToggleHubTask(taskId: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'needsAction' : 'completed';
    setHubTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await fetch('/api/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_TASK',
          payload: { taskId, currentStatus },
        }),
      });
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  }

  // Hub Calendar Events State
  const [hubEvents, setHubEvents] = useState<CalendarEvent[]>([
    {
      id: 'ev-1',
      summary: 'Executive Briefing & Strategic Priorities',
      start: '10:00 AM',
      end: '10:45 AM',
      hasMeet: true,
      meetLink: 'https://meet.google.com/suchi-exec',
    },
    {
      id: 'ev-2',
      summary: 'Product Roadmap & Deliverables Sync',
      start: '02:30 PM',
      end: '03:15 PM',
      hasMeet: true,
      meetLink: 'https://meet.google.com/suchi-prod',
    },
  ]);

  async function handleAddHubTask(title: string, due?: string) {
    const tempId = `task-${Date.now()}`;
    const newTask: TaskItem = { id: tempId, title, due, status: 'needsAction', isDueToday: true };
    setHubTasks(prev => [newTask, ...prev]);
    try {
      await fetch('/api/hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_TASK', payload: { title, due } }),
      });
    } catch (e) {}
  }

  async function handleEditHubTask(taskId: string, title: string, due?: string) {
    setHubTasks(prev => prev.map(t => t.id === taskId ? { ...t, title, due } : t));
  }

  async function handleDeleteHubTask(taskId: string) {
    setHubTasks(prev => prev.filter(t => t.id !== taskId));
  }

  async function handleAddHubEvent(event: Omit<CalendarEvent, 'id'>) {
    const newEvent: CalendarEvent = { ...event, id: `ev-${Date.now()}` };
    setHubEvents(prev => [...prev, newEvent]);
  }

  async function handleEditHubEvent(event: CalendarEvent) {
    setHubEvents(prev => prev.map(e => e.id === event.id ? event : e));
  }

  async function handleDeleteHubEvent(eventId: string) {
    setHubEvents(prev => prev.filter(e => e.id !== eventId));
  }

  async function handleToggleRoutineStep(routineId: string, stepId: string, currentCompleted: boolean) {
    setHubRoutines(prev => prev.map(r => {
      if (r.id !== routineId) return r;
      return {
        ...r,
        steps: (r.steps || []).map((s: any) => s.id === stepId ? { ...s, completed: !currentCompleted } : s),
      };
    }));
  }

  async function handleAddHubRoutine(routine: Omit<RoutineItem, 'id'>) {
    const newRoutine: RoutineItem = { ...routine, id: `routine-${Date.now()}` };
    setHubRoutines(prev => [...prev, newRoutine]);
  }

  async function handleEditHubRoutine(routine: RoutineItem) {
    setHubRoutines(prev => prev.map(r => r.id === routine.id ? routine : r));
  }

  async function handleDeleteHubRoutine(routineId: string) {
    setHubRoutines(prev => prev.filter(r => r.id !== routineId));
  }

  async function handleAddHubGoal(goal: Omit<GoalItem, 'id'>) {
    const newGoal: GoalItem = { ...goal, id: `goal-${Date.now()}` };
    setHubGoals(prev => [...prev, newGoal]);
  }

  async function handleEditHubGoal(goal: GoalItem) {
    setHubGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
  }

  async function handleDeleteHubGoal(goalId: string) {
    setHubGoals(prev => prev.filter(g => g.id !== goalId));
  }

  // Compass suggestion with 2-per-hour limit
  function handleCompassSuggestion() {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    let timestamps: number[] = [];
    try {
      const raw = localStorage.getItem('suchi_hourly_suggestions');
      if (raw) timestamps = JSON.parse(raw);
    } catch (e) {}

    timestamps = timestamps.filter(t => now - t < ONE_HOUR);

    if (timestamps.length >= 2) {
      triggerToast('Hourly limit: 2 strategic suggestions per hour.');
      return;
    }

    const suggestion = EXECUTIVE_SKILL_SUGGESTIONS[Math.floor(Math.random() * EXECUTIVE_SKILL_SUGGESTIONS.length)];
    timestamps.push(now);
    try {
      localStorage.setItem('suchi_hourly_suggestions', JSON.stringify(timestamps));
    } catch (e) {}

    setActiveSuggestion(suggestion);
    setInput(suggestion);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }



  // Take Context to New Chat (Attached as .md)
  function handleTakeContextToNewChat() {
    let summary = `# Strategic Context from Locked Chat\n`;
    if (meaningfulOutcome) {
      summary += `**Target Outcome**: ${meaningfulOutcome}\n\n`;
    }
    summary += `## Key Discussion & Decisions:\n`;
    messages.forEach(m => {
      summary += `- **${m.role === 'user' ? 'User' : 'Suchi'}**: ${m.content.slice(0, 200).replace(/\n/g, ' ')}\n`;
    });

    setMessages([]);
    setCurrentChatId(crypto.randomUUID());
    setMeaningfulOutcome('');
    setOutcomeStatus('NONE');
    setIsChatLocked(false);

    setAttachedFiles([{
      name: 'chat_context.md',
      size: `${(summary.length / 1024).toFixed(1)} KB`,
      content: summary,
    }]);

    triggerToast('Context from previous chat attached as Markdown in new chat!');
  }

  // Two-Chat Switch or New Handler
  function handleChatSwitchOrNew() {
    const slot1HasHistory = slot1Messages.length > 0;
    const slot2HasHistory = slot2Messages.length > 0;

    if (slot1HasHistory && slot2HasHistory) {
      setActiveSlot(prev => (prev === 1 ? 2 : 1));
      triggerToast(`Switched to Chat ${activeSlot === 1 ? 2 : 1}`);
    } else {
      if (activeSlot === 1) {
        setActiveSlot(2);
        triggerToast('Switched to Chat 2');
      } else {
        setActiveSlot(1);
        triggerToast('Switched to Chat 1');
      }
    }
    setActiveAppTab('suchi');
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }, 60);
  }

  // Computed Actions from chat messages + actionCards state
  const computedActions = React.useMemo(() => {
    const list: any[] = [];

    // Extract from messages
    messages.forEach(msg => {
      if (msg.actions && msg.actions.length > 0) {
        msg.actions.forEach((act, actIdx) => {
          list.push({
            id: `act-${msg.id}-${actIdx}`,
            tool: act.tool,
            title: act.summary || act.tool,
            summary: act.summary,
            success: act.success,
            link: act.link,
            timestamp: 'Recent',
            status: act.success ? 'COMPLETED' : 'FAILED',
          });
        });
      }
      if (msg.pendingDraft) {
        const status = draftStatuses.get(msg.pendingDraft.draftId) || 'NEEDS_APPROVAL';
        list.push({
          id: `draft-${msg.pendingDraft.draftId}`,
          tool: 'draft_reply',
          title: `Draft Reply to ${msg.pendingDraft.to}`,
          summary: msg.pendingDraft.subject,
          draftInfo: msg.pendingDraft,
          status: status === 'approved' ? 'COMPLETED' : status === 'rejected' ? 'DISCARDED' : 'NEEDS_APPROVAL',
          timestamp: 'Requires Consent',
        });
      }
    });

    // Also include actionCards state
    actionCards.forEach(card => {
      if (!list.some(item => item.id === card.id)) {
        list.push({
          id: card.id,
          tool: card.type,
          title: card.title,
          summary: card.description || card.subtitle,
          link: card.link,
          status: card.status,
          timestamp: card.timestamp,
          draftInfo: card.details?.draftId ? {
            draftId: card.details.draftId,
            to: card.details.to || '',
            subject: card.details.subject || '',
            body: card.details.draftBody || '',
          } : undefined,
        });
      }
    });

    return list;
  }, [messages, actionCards, draftStatuses]);

  const deckActions: ActionDeckItem[] = React.useMemo(() => {
    const mapped: ActionDeckItem[] = computedActions.map(act => {
      let category: 'drafts' | 'workspace' | 'tasks' | 'calendar' = 'workspace';
      if (act.tool === 'draft_reply' || act.draftInfo) category = 'drafts';
      else if (act.tool?.includes('calendar') || act.tool?.includes('event')) category = 'calendar';
      else if (act.tool?.includes('task')) category = 'tasks';
      else category = 'workspace';

      return {
        id: act.id,
        category,
        title: act.title,
        summary: act.summary,
        timestamp: act.timestamp || 'Today',
        status: act.status || 'COMPLETED',
        link: act.link,
        draftInfo: act.draftInfo,
      };
    });

    if (mapped.length === 0) {
      return [
        {
          id: 'act-draft-1',
          category: 'drafts',
          title: 'Executive Follow-Up on Q4 Deliverables',
          summary: 'Drafted reply to VP of Product confirming sprint delivery and milestones.',
          timestamp: '10 mins ago',
          status: 'NEEDS_APPROVAL',
          draftInfo: {
            draftId: 'sample-draft-1',
            to: 'vp.product@company.com',
            subject: 'Re: Q4 Deliverables & Timeline Confirmation',
            body: 'Hi Sarah,\n\nFollowing up on our sync earlier today. We have locked the core feature set for Q4 and are on track for staging deployment by Friday. Let me know if you need any adjustments to the slide deck.\n\nBest,\nSuchi Team',
          },
        },
        {
          id: 'act-ws-1',
          category: 'workspace',
          title: 'Q4 Financial Projection Sheet',
          summary: 'Created new Google Sheet with recurring expense breakdown and formula calculations.',
          timestamp: '1 hour ago',
          status: 'COMPLETED',
          link: 'https://docs.google.com/spreadsheets',
        },
        {
          id: 'act-task-1',
          category: 'tasks',
          title: 'Audit GCP Cloud IAM Roles & Keys',
          summary: 'Review least-privilege security permissions for production service accounts.',
          timestamp: 'Today',
          status: 'NEEDS_APPROVAL',
        },
        {
          id: 'act-cal-1',
          category: 'calendar',
          title: 'Weekly Strategy Review & Sync',
          summary: 'Scheduled for tomorrow at 10:00 AM with product team.',
          timestamp: 'Tomorrow 10:00 AM',
          status: 'NEEDS_APPROVAL',
          link: 'https://calendar.google.com',
        },
      ];
    }
    return mapped;
  }, [computedActions]);

  const pendingApprovalsCount = computedActions.filter(a => a.status === 'NEEDS_APPROVAL').length;

  return (

    <div className={`flex flex-col h-[100dvh] overflow-hidden ${
      isIncognito
        ? 'bg-[#0f0c1b] text-purple-100 selection:bg-purple-500/30'
        : isDarkMode
        ? 'bg-[#0b0f19] text-slate-100 selection:bg-blue-500/30'
        : 'bg-[#f8fafc] text-slate-900 selection:bg-blue-500/20'
    }`}>
      {/* HEADER - Sized comfortable & pretty for phones & desktops */}
      <header className={`h-16 border-b px-3.5 sm:px-5 flex items-center justify-between z-20 transition-all ${
        isIncognito
          ? 'bg-[#151125]/90 border-purple-900/40 backdrop-blur-md text-purple-100'
          : isDarkMode
          ? 'bg-[#111827]/90 border-slate-800/80 backdrop-blur-md text-slate-100'
          : 'bg-white/90 border-slate-200/80 backdrop-blur-md text-slate-800 shadow-xs'
      }`}>
        {/* Left: Brand - Suchi with Compass Needle */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className={`w-8 h-8 rounded-xl flex items-center justify-center p-1.5 shadow-sm transition-all ${
            isIncognito
              ? 'bg-purple-950 border border-purple-700/60 shadow-purple-950/50'
              : isDarkMode
              ? 'bg-slate-900 border border-slate-800'
              : 'bg-slate-950 border border-slate-800'
          }`}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20">
              <circle cx="16" cy="16" r="12" fill="none" stroke="#475569" strokeWidth="2"/>
              <polygon points="16,6.5 19,16 16,14.5" fill={isIncognito ? '#a855f7' : '#38bdf8'}/>
              <polygon points="16,25.5 19,16 16,17.5" fill="#94a3b8"/>
              <circle cx="16" cy="16" r="2.5" fill="#ffffff"/>
            </svg>
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-base tracking-tight">Suchi</span>
            <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full border ${
              isIncognito
                ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                : 'text-blue-500 bg-blue-500/10 border-blue-500/20'
            }`}>
              Life OS
            </span>
          </div>
          {isIncognito && (
            <span className="text-[10px] bg-purple-500/15 text-purple-300 font-semibold px-2 py-0.5 rounded-full border border-purple-500/30">
              Incognito
            </span>
          )}
        </div>

        {/* Right: Dual Chat Switch / New Chat & Settings */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {activeAppTab === 'suchi' && (
            <button
              type="button"
              onClick={handleChatSwitchOrNew}
              title={
                slot1Messages.length > 0 && slot2Messages.length > 0
                  ? `Switch between active chats (Currently Chat ${activeSlot})`
                  : 'New Chat'
              }
              className={`h-9 w-9 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center hover:scale-105 active:scale-95 ${
                isIncognito
                  ? 'border-purple-800/60 bg-purple-950/60 text-purple-200'
                  : isDarkMode
                  ? 'border-zinc-800 bg-zinc-900 text-zinc-200'
                  : 'border-zinc-200 bg-white text-zinc-700 shadow-2xs hover:bg-zinc-50'
              }`}
            >
              {slot1Messages.length > 0 && slot2Messages.length > 0 ? (
                /* Switch icon: 2 arrows going in different directions ⇄ */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              ) : (
                /* Only + icon */
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </button>
          )}


          {/* Mode Switcher Drawer Trigger (Right Top Corner) */}
          <button
            type="button"
            onClick={() => setIsModeDrawerOpen(true)}
            title={`Switch Operating Mode (Currently in ${chatMode === 'home' ? 'Home Mode' : 'Life Mode'})`}
            className={`h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-2xs ${
              chatMode === 'home'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300'
            }`}
          >
            <span>{chatMode === 'home' ? '🏠' : '💼'}</span>
            <span className="capitalize hidden xs:inline">{chatMode}</span>
            <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Settings Trigger with Click-Outside Ref */}
          <div ref={settingsRef} className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`h-10 px-2 sm:px-2.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 ${
                isIncognito
                  ? 'border-purple-800/60 bg-purple-950/60 hover:bg-purple-900/60 text-purple-300'
                  : isDarkMode
                  ? 'border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200'
                  : 'border-zinc-200 hover:bg-zinc-100 text-zinc-700 bg-white shadow-2xs'
              }`}
            >
              {user ? (
                <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <span className="px-1 font-medium">Settings ▾</span>
              )}
            </button>

            {/* Simplistic, Minimalist Dropdown Menu */}
            {isSettingsOpen && (
              <div className={`absolute right-0 mt-2 w-56 border rounded-2xl shadow-xl py-1.5 z-50 text-xs backdrop-blur-md transition-all ${
                isIncognito
                  ? 'bg-[#151124]/95 border-purple-900/50 text-zinc-300'
                  : isDarkMode
                  ? 'bg-zinc-900/95 border-zinc-800 text-zinc-300'
                  : 'bg-white/95 border-zinc-200 text-zinc-700 shadow-black/5'
              }`}>
                {user ? (
                  <>
                    <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800/80 mb-1">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{user.email}</p>
                    </div>

                    {/* Appearance (Theme) Toggle */}
                    <button
                      type="button"
                      onClick={toggleDarkMode}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg mx-auto flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        {isDarkMode ? (
                          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                          </svg>
                        )}
                        <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">{isDarkMode ? 'DARK' : 'LIGHT'}</span>
                    </button>

                    {/* Incognito Mode */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); handleToggleIncognito(); }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg mx-auto flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                        <span>{isIncognito ? 'Exit Incognito' : 'Incognito Mode'}</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-medium">{isIncognito ? 'Active' : 'Off'}</span>
                    </button>

                    {/* Delegation & Autonomy Settings */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); setIsDelegationModalOpen(true); }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg mx-auto flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-sm">⚡</span>
                        <span>Delegation & Autonomy</span>
                      </span>
                      <span className="text-[10px] text-blue-500 font-semibold uppercase tracking-wider">
                        {delegationSettings.globalMode.slice(0, 4)}
                      </span>
                    </button>

                    {/* Chats Archive */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); openArchive(); }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg mx-auto flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                        <span>Chats Archive</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">⌘A</span>
                    </button>

                    {/* Memory (Locked) */}
                    <button
                      type="button"
                      disabled
                      title="Memory: Suchi securely stores context given by you across sessions. Management controls locked."
                      className="w-full text-left px-3 py-2 flex items-center justify-between text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                        <span>Memory</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">Locked</span>
                    </button>

                    {/* Privacy & Security */}
                    <Link
                      href="/privacy"
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg mx-auto flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Privacy & Security</span>
                      </span>
                    </Link>

                    {/* Report Bug / Issue */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); handleOpenBugModal(); }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg mx-auto flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>Report Bug</span>
                      </span>
                    </button>

                    {/* Install App */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); handleInstallApp(); }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg mx-auto flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <svg className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Install App</span>
                      </span>
                      {isInstallable && <span className="text-[10px] text-zinc-400 font-mono">PWA</span>}
                    </button>

                    <div className="border-t border-zinc-100 dark:border-zinc-800/80 my-1"></div>

                    {/* Delete Chat */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); handleDeleteCurrentChat(); }}
                      className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg mx-auto flex items-center gap-2.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Delete Chat</span>
                    </button>

                    {/* Sign Out */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(false); handleLogout(); }}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400 rounded-lg mx-auto flex items-center gap-2.5 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleInstallApp(); setIsSettingsOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between text-blue-600 font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Install Suchi App</span>
                      </span>
                      {isInstallable && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold">READY</span>}
                    </button>
                    <button
                      onClick={handleLogin}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold text-blue-600"
                    >
                      Connect Google Account
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

      </header>

      {/* 1. MY DAY TAB VIEW (Calendar, Tasks, Routines, Goals - Add/Edit/Delete enabled) */}
      {activeAppTab === 'my_day' && (
        <MyDayView
          tasks={hubTasks}
          routines={hubRoutines}
          goals={hubGoals}
          events={hubEvents}
          onToggleTask={async (id, completed) => handleToggleHubTask(id, completed ? 'completed' : 'needsAction')}
          onAddTask={handleAddHubTask}
          onEditTask={handleEditHubTask}
          onDeleteTask={handleDeleteHubTask}
          onToggleRoutineStep={handleToggleRoutineStep}
          onAddRoutine={handleAddHubRoutine}
          onEditRoutine={handleEditHubRoutine}
          onDeleteRoutine={handleDeleteHubRoutine}
          onAddEvent={handleAddHubEvent}
          onEditEvent={handleEditHubEvent}
          onDeleteEvent={handleDeleteHubEvent}
          onAddGoal={handleAddHubGoal}
          onEditGoal={handleEditHubGoal}
          onDeleteGoal={handleDeleteHubGoal}
          onRefresh={loadHubData}
          isLoading={isHubLoading}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 2. ACTIONS TAB VIEW (1 card per viewport, no scroll, auto swipe-up/in) */}
      {activeAppTab === 'actions' && (
        <ActionsDeckView
          items={deckActions}
          onApproveDraft={handleApproveDraft}
          onRejectDraft={handleRejectDraft}
          onOpenDraftInChat={(draftInfo) => {
            setInput(`Review draft to ${draftInfo.to}: "${draftInfo.subject}"`);
            setActiveAppTab('suchi');
          }}
          onRequestRevision={(item) => {
            setInput(`Revise draft "${item.title}": `);
            setActiveAppTab('suchi');
          }}
          onCompleteTask={async (taskId) => {
            await handleToggleHubTask(taskId, 'needsAction');
          }}
          isDarkMode={isDarkMode}
        />
      )}

      {/* 3. SUCHI CHAT TAB VIEW (MESSAGES SCROLL AREA) */}
      {activeAppTab === 'suchi' && (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Pinned Meaningful Outcome right below header in chatbox itself */}
          {meaningfulOutcome && (
            <div className={`px-4 py-2 border-b backdrop-blur-md flex items-center justify-between z-10 transition-all ${
              outcomeStatus === 'PROPOSED'
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-200'
                : outcomeStatus === 'LOCKED'
                ? 'bg-slate-100/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                : isIncognito
                ? 'bg-purple-950/80 border-purple-800/40 text-purple-200'
                : isDarkMode
                ? 'bg-slate-900/90 border-slate-800 text-blue-300'
                : 'bg-blue-50/90 border-blue-200 text-blue-900'
            }`}>
              <div className="flex items-center gap-2 max-w-[75%] sm:max-w-[85%] truncate">
                <span className="text-sm flex-shrink-0">🎯</span>
                <div className="truncate">
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 block">Target Outcome</span>
                  <span className="text-xs font-semibold truncate block">{meaningfulOutcome}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!isChatLocked && outcomeStatus === 'PROPOSED' && (
                  <>
                    <button
                      onClick={handleConfirmOutcome}
                      title="Confirm outcome achieved & lock chat"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1"
                    >
                      <span>✓ Complete</span>
                    </button>
                    <button
                      onClick={handleContinueChat}
                      title="Continue conversation"
                      className="px-2 py-1 rounded-lg bg-black/10 dark:bg-white/10 hover:bg-black/20 text-xs font-semibold"
                    >
                      →
                    </button>
                  </>
                )}
                {isChatLocked && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Locked
                  </span>
                )}
              </div>
            </div>
          )}

          <main ref={scrollContainerRef} onScroll={handleMessagesScroll} className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                  <span className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-2 shadow-md mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                      <circle cx="16" cy="16" r="13" fill="none" stroke="#334155" strokeWidth="1.5"/>
                      <polygon points="16,5 19.5,16 16,14" fill="#3b82f6"/>
                      <polygon points="16,5 12.5,16 16,14" fill="#60a5fa"/>
                      <polygon points="16,27 19.5,16 16,18" fill="#64748b"/>
                      <polygon points="16,27 12.5,16 16,18" fill="#94a3b8"/>
                      <circle cx="16" cy="16" r="2.5" fill="#ffffff" stroke="#0f172a" strokeWidth="1"/>
                    </svg>
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-3">
                    Hey {user?.name ? user.name.split(' ')[0] : 'User'}, what can I do for you?
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-md">
                    Your autonomous Chief of Staff & Life OS. Minimum time & attention spent, maximum clarity & benefit received.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                    {welcomeCapabilities.map((cap, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(cap)}
                        className={`px-3.5 py-2 rounded-2xl border text-xs shadow-xs transition-all text-left hover:scale-[1.02] active:scale-[0.98] ${
                          isIncognito
                            ? 'border-purple-800/60 bg-[#1a142e] hover:bg-purple-900/40 text-purple-200 hover:border-purple-600'
                            : isDarkMode
                            ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:border-slate-700'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        ✦ {cap}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(() => {
                const userIndices = messages
                  .map((m, idx) => (m.role === 'user' ? idx : -1))
                  .filter(idx => idx !== -1);
                const last5Indices = new Set(userIndices.slice(-5));

                return messages.map((msg, index) => {
                  const isAssistant = msg.role === 'assistant';
                  const isUser = msg.role === 'user';
                  const isEditable = isUser && last5Indices.has(index);
                  const options = isAssistant ? extractOptions(msg.content) : [];
                  const isImageProposal = isAssistant && (
                    msg.content.toLowerCase().includes('improved prompt') ||
                    msg.content.toLowerCase().includes('aspect ratio') ||
                    options.some(o => o.text.toLowerCase().includes('improved prompt') || o.text.toLowerCase().includes('original prompt'))
                  );

                  return (
                    <div
                      key={msg.id}
                      className={`group flex flex-col ${isUser ? 'items-end' : 'items-start'} relative`}
                    >
                      {/* Editing Message State */}
                      {editingMessageId === msg.id ? (
                        <div className="w-full max-w-lg p-3 rounded-2xl bg-white dark:bg-gray-800 border-2 border-blue-500 shadow-md">
                          <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1.5 flex items-center justify-between">
                            <span>Edit Message (updates context from here)</span>
                            <span className="text-[10px] text-gray-400">Esc to cancel</span>
                          </div>
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                            rows={3}
                            autoFocus
                          />
                          <div className="mt-2 flex items-center justify-end gap-2">
                            <button
                              onClick={handleCancelEditMessage}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditMessage(msg.id)}
                              disabled={!editingText.trim() || isLoading}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors disabled:opacity-50 shadow-xs"
                            >
                              Save & Update
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Message Bubble (Content Only) */}
                          <div
                            className={`max-w-[88%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed relative ${
                              isUser
                                ? isIncognito
                                  ? 'bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 text-white rounded-br-xs shadow-md shadow-purple-950/40'
                                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-xs shadow-sm shadow-blue-900/10'
                                : isIncognito
                                ? 'bg-[#181428] border border-purple-800/40 text-purple-100 rounded-bl-xs shadow-xs'
                                : isDarkMode
                                ? 'bg-[#151e2e] border border-slate-800 text-slate-100 rounded-bl-xs shadow-xs'
                                : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs'
                            }`}
                          >
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                code({ node, inline, className, children, ...props }: any) {
                                  if (!inline) {
                                    return <CodeBlock className={className}>{children}</CodeBlock>;
                                  }
                                  return (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                },
                                table({ children, ...props }: any) {
                                  return (
                                    <div className="overflow-x-auto my-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                                      <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800 text-xs" {...props}>
                                        {children}
                                      </table>
                                    </div>
                                  );
                                },
                              }}
                            >
                              {msg.content}
                            </ReactMarkdown>
                          </div>

                          {/* Message Actions Row - Rendered strictly BELOW the message box */}
                          <div className={`mt-1 px-1 flex items-center gap-1.5 text-xs ${
                            isUser ? 'justify-end text-slate-400' : 'justify-start text-slate-400'
                          }`}>
                            {/* Copy Button */}
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.content)}
                              title="Copy message"
                              className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-[11px]"
                            >
                              {copiedMessageId === msg.id ? (
                                <>
                                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                                </>
                              ) : (
                                <svg className="w-3.5 h-3.5 opacity-80 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                              )}
                            </button>

                            {/* Edit Button (Only for last 5 user messages, NOT allowed when chat is locked) */}
                            {!isChatLocked && isEditable && (
                              <button
                                onClick={() => handleStartEditMessage(msg)}
                                title="Edit message (updates chat context from here)"
                                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                <span className="text-[10px]">Edit</span>
                              </button>
                            )}

                            {/* Listen/Speak Button (For assistant messages) */}
                            {isAssistant && (
                              <button
                                onClick={() => handleToggleSpeech(msg.id, msg.content)}
                                title={speakingMessageId === msg.id ? 'Stop audio playback' : 'Play voice response'}
                                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-[11px]"
                              >
                                {speakingMessageId === msg.id ? (
                                  <>
                                    <svg className="w-3.5 h-3.5 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                                    </svg>
                                    <span className="text-[10px] text-blue-500 font-medium">Playing...</span>
                                  </>
                                ) : (
                                  <svg className="w-3.5 h-3.5 opacity-80 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                  </svg>
                                )}
                              </button>
                            )}

                            {/* Retry / Regenerate Button (For assistant messages, only when NOT locked) */}
                            {isAssistant && !isChatLocked && (
                              <button
                                onClick={() => handleRegenerateResponse(msg.id)}
                                disabled={isLoading}
                                title="Regenerate response"
                                className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-[11px] opacity-80 hover:opacity-100 disabled:opacity-40"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span className="text-[10px]">Retry</span>
                              </button>
                            )}

                            {/* Report Bug / Issue Button */}
                            {isAssistant && (
                              <button
                                onClick={() => handleOpenBugModal(msg)}
                                title="Report bug or incomplete work to Suchi engineering"
                                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 text-gray-400 hover:text-rose-500 transition-colors inline-flex items-center gap-1 text-[11px] ml-auto"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-[10px]">Report</span>
                              </button>
                            )}
                          </div>
                        </>
                      )}

                      {/* Incomplete Work / Tool Failure High-Visibility Banner */}
                      {isAssistant && (msg.actions?.some(a => !a.success) || (msg.content && msg.content.includes('Sorry, something went wrong'))) && (
                        <div className="mt-2.5 max-w-[88%] sm:max-w-[80%] p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-between gap-3 text-xs shadow-xs">
                          <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200">
                            <span className="text-base">⚠️</span>
                            <div className="text-left">
                              <span className="font-semibold block">Work could not be completed properly</span>
                              <span className="text-[11px] text-rose-600 dark:text-rose-300">Suchi encountered a tool or permission failure</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleOpenBugModal(msg)}
                            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-transform active:scale-95 flex-shrink-0"
                          >
                            <span>Send Bug Report</span>
                            <span>→</span>
                          </button>
                        </div>
                      )}

                      {/* Aspect Ratio Selector for Image Proposals */}
                      {isImageProposal && (
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap max-w-[85%] px-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                            Aspect Ratio:
                          </span>
                          {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                            <button
                              key={ratio}
                              type="button"
                              onClick={() => setSelectedImageAspectRatio(ratio)}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border transition-all ${
                                selectedImageAspectRatio === ratio
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs scale-105'
                                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                              }`}
                            >
                              {ratio}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Interactive MCQ Option Buttons */}
                      {options.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2 max-w-[85%]">
                          {options.map((opt, i) => (
                            <button
                              key={i}
                              disabled={isLoading || isChatLocked || isGeneratingImage}
                              onClick={() => {
                                if (isImageProposal) {
                                  sendMessage(`[${opt.label}] ${opt.text} (Aspect ratio: ${selectedImageAspectRatio})`);
                                } else {
                                  sendMessage(`[${opt.label}] ${opt.text}`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/90 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-xs font-medium text-blue-900 dark:text-blue-300 transition-all shadow-xs flex items-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                            >
                              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                                {opt.label}
                              </span>
                              <span className="text-left">{opt.text}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Actions & Generated Images Badges / Cards */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div className="mt-2 flex flex-col gap-2 max-w-[88%] sm:max-w-[80%]">
                          {msg.actions.map((action, idx) => (
                            <div key={idx} className="flex flex-col gap-2">
                              {(action.imageUrl || action.tool === 'generate_image') && action.imageUrl && (
                                <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-black/5 max-w-md shadow-sm">
                                  <img
                                    src={action.imageUrl}
                                    alt="Generated by Suchi"
                                    className="w-full h-auto object-cover max-h-96"
                                    loading="lazy"
                                  />
                                  <div className="p-2.5 flex items-center justify-between text-xs bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                                    <span className="text-gray-500 dark:text-gray-400 font-medium truncate max-w-[200px]">
                                      {action.summary}
                                    </span>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      <a
                                        href={action.imageUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                      >
                                        Full Size ↗
                                      </a>
                                      <a
                                        href={action.imageUrl}
                                        download="suchi-image.jpg"
                                        className="px-2.5 py-1 rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium"
                                      >
                                        Download ↓
                                      </a>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Specialized WhatsApp 1-Tap Action Card */}
                              {(action.tool === 'generate_whatsapp_link' || action.data?.waUrl) && (
                                <div className="p-3.5 rounded-2xl border border-emerald-300 dark:border-emerald-800/80 bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 flex flex-col gap-2 shadow-xs">
                                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                    <span className="flex items-center gap-1.5">
                                      <span>💬</span> WhatsApp Action Card
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                      +{action.data?.phone || ''}
                                    </span>
                                  </div>
                                  {action.data?.message && (
                                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 text-xs italic text-slate-700 dark:text-slate-300">
                                      "{action.data.message}"
                                    </div>
                                  )}
                                  <a
                                    href={action.data?.waUrl || action.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                  >
                                    <span>Open WhatsApp Chat ↗</span>
                                  </a>
                                </div>
                              )}

                              {/* Specialized Direct Call & Briefing Card */}
                              {(action.tool === 'create_call_briefing' || action.data?.telUrl) && (
                                <div className="p-3.5 rounded-2xl border border-blue-300 dark:border-blue-800/80 bg-blue-500/10 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 flex flex-col gap-2.5 shadow-xs">
                                  <div className="flex items-center justify-between text-xs font-bold text-blue-800 dark:text-blue-300">
                                    <span className="flex items-center gap-1.5">
                                      <span>📞</span> Direct Call Briefing
                                    </span>
                                    <span className="font-mono text-[10px] text-blue-700 dark:text-blue-300">
                                      {action.data?.phone || ''}
                                    </span>
                                  </div>
                                  <div className="text-xs">
                                    <strong className="text-blue-900 dark:text-blue-200">Contact:</strong> {action.data?.contactName || 'Target Contact'}
                                  </div>
                                  <div className="text-xs">
                                    <strong className="text-blue-900 dark:text-blue-200">Objective:</strong> {action.data?.objective || 'Strategic Alignment'}
                                  </div>
                                  {action.data?.talkingPoints && action.data.talkingPoints.length > 0 && (
                                    <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-blue-200 dark:border-blue-900/60 text-[11px] space-y-1">
                                      <strong className="block text-blue-800 dark:text-blue-300">Key Talking Points:</strong>
                                      {action.data.talkingPoints.map((tp: string, tIdx: number) => (
                                        <div key={tIdx} className="flex items-start gap-1">
                                          <span className="text-blue-500">•</span>
                                          <span>{tp}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {action.data?.landminesToAvoid && action.data.landminesToAvoid.length > 0 && (
                                    <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-800 dark:text-rose-300 space-y-0.5">
                                      <strong className="block">⚠️ Landmines to Avoid:</strong>
                                      {action.data.landminesToAvoid.map((lm: string, lIdx: number) => (
                                        <div key={lIdx} className="flex items-start gap-1">
                                          <span>•</span>
                                          <span>{lm}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <a
                                    href={action.data?.telUrl || action.link}
                                    className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                  >
                                    <span>Call {action.data?.contactName || 'Now'} ({action.data?.phone || ''}) 📞</span>
                                  </a>
                                </div>
                              )}

                              {/* Specialized Vendor Comparison Card */}
                              {action.tool === 'search_and_compare_vendors' && (
                                <div className="p-3.5 rounded-2xl border border-indigo-300 dark:border-indigo-800/80 bg-indigo-500/10 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 flex flex-col gap-2 shadow-xs">
                                  <div className="flex items-center justify-between text-xs font-bold text-indigo-800 dark:text-indigo-300">
                                    <span className="flex items-center gap-1.5">
                                      <span>🏢</span> Vendor Comparison Matrix
                                    </span>
                                    <span className="text-[10px] font-semibold bg-indigo-500/20 px-2 py-0.5 rounded-full">
                                      3 Evaluated
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Side-by-side cost & deliverable comparison sheet built with quotes, SLA timelines, and phone contacts.
                                  </p>
                                  {action.link && (
                                    <a
                                      href={action.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                    >
                                      <span>Open Google Sheets Matrix ↗</span>
                                    </a>
                                  )}
                                </div>
                              )}

                              {/* Specialized Customer Outreach Card */}
                              {action.tool === 'create_customer_outreach_pipeline' && (
                                <div className="p-3.5 rounded-2xl border border-violet-300 dark:border-violet-800/80 bg-violet-500/10 dark:bg-violet-950/40 text-violet-950 dark:text-violet-100 flex flex-col gap-2 shadow-xs">
                                  <div className="flex items-center justify-between text-xs font-bold text-violet-800 dark:text-violet-300">
                                    <span className="flex items-center gap-1.5">
                                      <span>🎯</span> Customer Connect Pipeline
                                    </span>
                                    <span className="text-[10px] font-semibold bg-violet-500/20 px-2 py-0.5 rounded-full">
                                      Email + WhatsApp
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300">
                                    Multi-touch outreach sequence created with status tracking in Google Sheets and ready-to-send messages.
                                  </p>
                                  {action.link && (
                                    <a
                                      href={action.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                                    >
                                      <span>Open Outreach Lead Tracker in Sheets ↗</span>
                                    </a>
                                  )}
                                </div>
                              )}

                              {/* Normal action badge */}
                              <div className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border bg-gray-50 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 text-[11px] text-gray-600 dark:text-gray-300 w-fit">
                                <span className={`w-1.5 h-1.5 rounded-full ${action.success ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                                <span className="font-semibold uppercase tracking-wider text-[9px] text-gray-400 dark:text-gray-500">
                                  {action.tool.replace(/_/g, ' ')}:
                                </span>
                                <span>{action.summary}</span>
                                {action.link && !action.imageUrl && (
                                  <a
                                    href={action.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline font-semibold ml-1 inline-flex items-center gap-0.5"
                                  >
                                    Open ↗
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Gmail Pending Draft Card */}
                      {msg.pendingDraft && !draftStatuses.get(msg.pendingDraft.draftId) && (
                        <div className="mt-3 w-full max-w-md p-4 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 shadow-sm">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-800 dark:text-amber-300 mb-2">
                            <span className="flex items-center gap-1.5">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Gmail Reply Draft (Approval Required)
                            </span>
                            <span className="text-[10px] uppercase tracking-wider bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded">Pending</span>
                          </div>
                          <div className="text-xs space-y-1 mb-3">
                            <div><strong className="text-gray-600 dark:text-gray-400">To:</strong> {msg.pendingDraft.to}</div>
                            <div><strong className="text-gray-600 dark:text-gray-400">Subject:</strong> {msg.pendingDraft.subject}</div>
                            <div className="p-2 rounded bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap max-h-36 overflow-y-auto mt-2">
                              {msg.pendingDraft.body}
                            </div>
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRejectDraft(msg.pendingDraft!.draftId)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 border border-red-200 dark:border-red-900 transition-colors"
                            >
                              Discard Draft
                            </button>
                            <button
                              onClick={() => handleApproveDraft(msg.pendingDraft!.draftId)}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                            >
                              Approve & Send
                            </button>
                          </div>
                        </div>
                      )}

                      {msg.pendingDraft && draftStatuses.get(msg.pendingDraft.draftId) === 'approved' && (
                        <div className="mt-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Email successfully sent via Gmail.
                        </div>
                      )}

                      {msg.pendingDraft && draftStatuses.get(msg.pendingDraft.draftId) === 'rejected' && (
                        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5">
                          Draft discarded.
                        </div>
                      )}
                    </div>
                  );
                });
              })()}

              {/* Long Running Progress Indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 max-w-sm animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                  <span>{PROGRESS_PHRASES[progressIndex]}...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Floating Jump to Latest Button (System 3) */}
            {showJumpToBottom && (
              <div className="fixed bottom-24 right-6 sm:right-10 z-20 transition-all">
                <button
                  type="button"
                  onClick={handleJumpToBottom}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/95 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold shadow-xl border border-zinc-700/50 dark:border-zinc-300 hover:scale-105 active:scale-95 transition-transform"
                  title="Scroll to latest messages"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  <span>Jump to latest</span>
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      {/* INPUT BAR (LOCKED RIGHT ABOVE FOOTER WHEN IN SUCHI TAB) */}
      {activeAppTab === 'suchi' && (
      <footer className={`border-t px-3 py-2 sm:py-2.5 relative z-10 transition-colors ${
        isDarkMode || isIncognito ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-3xl mx-auto flex flex-col gap-1.5">
          {/* End of Chat Action Buttons */}
          {isChatLocked && (
            <div className="flex items-center justify-center gap-3 pb-2 pt-1">
              <button
                type="button"
                onClick={handleTakeContextToNewChat}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
              >
                <span>📄 Take context to new chat</span>
              </button>
              <button
                type="button"
                onClick={handleStartNewChat}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${
                  isDarkMode ? 'border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200' : 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 text-zinc-800'
                }`}
              >
                <span>✨ New chat</span>
              </button>
            </div>
          )}

          {/* Agent Suggests Popup */}
          {activeSuggestion && (
            <div className={`flex items-center justify-between p-2 rounded-xl border text-xs shadow-xs ${
              isDarkMode ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              <span className="flex items-center gap-1.5 truncate">
                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span className="truncate">{activeSuggestion}</span>
              </span>
              <button onClick={() => setActiveSuggestion(null)} className="text-indigo-500 hover:text-indigo-800 text-sm font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Attached Files Badges */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5 pb-1 max-h-24 overflow-y-auto">
              {attachedFiles.map((file, i) => {
                const isImage = file.content?.startsWith('data:image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
                return (
                  <div key={i} className={`group flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-lg text-xs border transition-all ${
                    isDarkMode ? 'bg-zinc-800 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                  }`}>
                    {isImage && file.content ? (
                      <img src={file.content} alt={file.name} className="w-4 h-4 rounded object-cover flex-shrink-0" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                    <span className="truncate max-w-[120px] font-medium text-[11px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-500 transition-colors ml-0.5"
                      title="Remove attachment"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recorded Audio Preview */}
          {recordedAudioUrl && (
            <div className={`flex items-center gap-2 p-1.5 rounded-xl text-xs border ${
              isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Note
              </span>
              <audio src={recordedAudioUrl} controls className="h-6 w-40 sm:w-48" />
              <button onClick={() => setRecordedAudioUrl(null)} className="text-red-500 hover:underline text-[11px] ml-auto">
                Discard
              </button>
            </div>
          )}

          {/* Q&A 1-QUESTION-AT-A-TIME PILL BUTTONS (Replaces input bar with options) */}
          {currentQuestionOptions.length > 0 && !showTextInputOverride && !isChatLocked ? (
            <div className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
              isDarkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="flex items-center justify-center gap-2.5 flex-wrap w-full">
                {currentQuestionOptions.map(opt => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => sendMessage(`Option ${opt.key}: ${opt.text}`)}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md hover:shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border border-blue-400/30"
                  >
                    <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-xs font-black">
                      {opt.key}
                    </span>
                    <span className="text-xs font-semibold max-w-[200px] truncate hidden sm:inline">
                      {opt.text}
                    </span>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setShowTextInputOverride(true)}
                className="text-[11px] text-zinc-400 hover:text-blue-500 underline transition-colors pt-0.5"
              >
                Or type custom response
              </button>
            </div>
          ) : (
            /* UNIFIED SLEEK ROW: SLIM INPUT PILL + DEDICATED MIC OUTSIDE */
            <div className="flex items-end gap-1.5 sm:gap-2 relative w-full max-w-full min-w-0">
              {/* Attach Popup Menu */}
              {isAttachMenuOpen && (
                <div className={`absolute bottom-full left-0 mb-2 p-1.5 rounded-2xl border shadow-xl flex flex-col gap-1 min-w-[175px] z-30 animate-in fade-in slide-in-from-bottom-2 ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200' : 'bg-white border-zinc-200 text-zinc-800 shadow-slate-200'
                }`}>
                  <button
                    type="button"
                    onClick={() => { setIsAttachMenuOpen(false); cameraInputRef.current?.click(); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Take / Attach Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAttachMenuOpen(false); fileInputRef.current?.click(); }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span>Upload Files / Docs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAttachMenuOpen(false); window.location.href = '/archive'; }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-left"
                  >
                    <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span>Chats Archive</span>
                  </button>
                </div>
              )}

              {/* The single-row slim pill container */}
              <div className={`flex-1 min-w-0 flex items-end gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-3xl border transition-all ${
                isIncognito
                  ? 'bg-[#1a152e] border-purple-800/60 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20'
                  : isDarkMode
                  ? 'bg-slate-900 border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
                  : 'bg-slate-100 border-slate-200 focus-within:bg-white focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
              }`}>
                {/* Plus / Attach Action Button */}
                <button
                  type="button"
                  onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                  disabled={isChatLocked}
                  aria-label="Attach options"
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 ${
                    isAttachMenuOpen ? 'rotate-45 bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>

                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Textarea - Auto-growing, NO placeholder */}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  disabled={isChatLocked || isLoading}
                  value={input}
                  aria-label="Message Suchi"
                  onChange={(e) => {
                    handleComposerInputChange(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  onPaste={(e) => {
                    const items = e.clipboardData.items;
                    if (items) {
                      for (let i = 0; i < items.length; i++) {
                        if (items[i].type.indexOf('image') !== -1) {
                          const file = items[i].getAsFile();
                          if (file && attachedFiles.length < 10) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const base64 = uploadEvent.target?.result as string;
                              setAttachedFiles(prev => [...prev.slice(0, 9), {
                                name: `pasted-image-${Date.now().toString().slice(-4)}.png`,
                                size: `${(file.size / 1024).toFixed(1)} KB`,
                                content: base64,
                              }]);
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                      }
                    }
                    const text = e.clipboardData.getData('text');
                    if (text && text.length > 500 && attachedFiles.length < 10) {
                      const titleMatch = text.match(/^#\s+([^\n]+)/);
                      const fileName = titleMatch ? `${titleMatch[1].slice(0, 20).trim()}.md` : `pasted-content-${Date.now().toString().slice(-4)}.md`;
                      setAttachedFiles(prev => [...prev.slice(0, 9), {
                        name: fileName,
                        size: `${(text.length / 1024).toFixed(1)} KB`,
                        content: text,
                      }]);
                    }
                  }}
                  className={`flex-1 resize-none py-1.5 px-2 bg-transparent text-sm leading-relaxed max-h-[120px] focus:outline-none transition-colors ${
                    isIncognito
                      ? 'text-purple-100'
                      : isDarkMode
                      ? 'text-white'
                      : 'text-slate-900'
                  }`}
                  style={{ height: '32px' }}
                />

                {/* Show back-to-options toggle if currently in override mode */}
                {currentQuestionOptions.length > 0 && showTextInputOverride && (
                  <button
                    type="button"
                    onClick={() => setShowTextInputOverride(false)}
                    className="px-2 py-1 rounded-md text-[10px] font-bold bg-blue-600 text-white hover:bg-blue-500"
                    title="Return to option buttons"
                  >
                    Options
                  </button>
                )}

              {/* Compass Needle Skill Suggestion Button (Replaces Bulb) */}
              <button
                type="button"
                onClick={handleCompassSuggestion}
                disabled={isChatLocked}
                title="Executive Strategy & Skill Suggestion"
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/40 transition-colors disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                  <circle cx="12" cy="12" r="9" />
                  <polygon points="12,6 14.5,12 12,10.5" fill="currentColor" stroke="none" />
                  <polygon points="12,18 14.5,12 12,13.5" fill="#94a3b8" stroke="none" />
                  <polygon points="12,6 9.5,12 12,10.5" fill="currentColor" stroke="none" />
                  <polygon points="12,18 9.5,12 12,13.5" fill="#64748b" stroke="none" />
                  <circle cx="12" cy="12" r="1.5" fill="#ffffff" stroke="none" />
                </svg>
              </button>

              {/* Send or Stop Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={handleStopGeneration}
                  title="Stop generation"
                  className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-xs transition-transform flex-shrink-0 flex items-center justify-center active:scale-95 group"
                >
                  <div className="w-2.5 h-2.5 bg-current rounded-xs" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => sendMessage()}
                  disabled={isChatLocked || (!input.trim() && attachedFiles.length === 0 && !recordedAudioUrl)}
                  title="Send message"
                  className={`w-8 h-8 rounded-full shadow-xs transition-transform flex-shrink-0 flex items-center justify-center disabled:opacity-40 active:scale-95 ${
                    isIncognito
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </button>
              )}
            </div>

            {/* Mic Button — Voice Typing (Speech-to-Text) */}
            <button
              type="button"
              onClick={toggleVoiceTyping}
              disabled={isChatLocked}
              title={isVoiceTyping ? 'Stop voice typing' : 'Voice typing — tap to speak'}
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm hover:scale-105 active:scale-95 disabled:opacity-40 ${
                isVoiceTyping
                  ? 'bg-rose-500 text-white animate-pulse'
                  : isIncognito
                  ? 'bg-purple-600 hover:bg-purple-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 text-white'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
          )}
        </div>
      </footer>
      )}


      {/* BOTTOM FOOTER NAVIGATION TABS (From Left to Right: My Day, Suchi, Actions) */}
      <nav className={`h-14 sm:h-16 border-t px-6 flex items-center justify-around z-20 flex-shrink-0 transition-colors ${
        isDarkMode || isIncognito
          ? 'bg-slate-950/95 border-slate-800/80 backdrop-blur text-slate-400'
          : 'bg-white/95 border-slate-200 backdrop-blur text-slate-600 shadow-xs'
      }`}>
        {/* Tab 1: My Day (Left) */}
        <button
          type="button"
          onClick={() => setActiveAppTab('my_day')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            activeAppTab === 'my_day'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeAppTab === 'my_day' ? 2.3 : 1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-[11px] tracking-tight">My Day</span>
        </button>

        {/* Tab 2: Suchi (Center) */}
        <button
          type="button"
          onClick={() => setActiveAppTab('suchi')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all ${
            activeAppTab === 'suchi'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <div className={`relative ${activeAppTab === 'suchi' ? 'p-1 rounded-full bg-blue-50 dark:bg-blue-950/50' : ''}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeAppTab === 'suchi' ? 2.3 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-[11px] tracking-tight">Suchi</span>
        </button>

        {/* Tab 3: Actions (Right) */}
        <button
          type="button"
          onClick={() => setActiveAppTab('actions')}
          className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 transition-all relative ${
            activeAppTab === 'actions'
              ? 'text-blue-600 dark:text-blue-400 font-bold scale-105'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium'
          }`}
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={activeAppTab === 'actions' ? 2.3 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1.5 py-0.2 min-w-4 text-[9px] font-bold bg-amber-500 text-white rounded-full flex items-center justify-center animate-pulse">
                {pendingApprovalsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-tight">Actions</span>
        </button>
      </nav>


      {/* WHATSAPP-STYLE CHATS ARCHIVE MODAL */}
      {isArchiveOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100">
            {/* Archive Header */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Chats Archive</h2>
                <p className="text-xs text-gray-500 dark:text-zinc-400">Persistent conversation records & portable contexts</p>
              </div>
              <button onClick={() => setIsArchiveOpen(false)} className="text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 text-lg font-bold">
                ✕
              </button>
            </div>

            {/* Search & Filters */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                aria-label="Search archive conversations"
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="flex-1 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-1">
                {(['all', 'starred', 'completed', 'active'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setArchiveFilter(tab)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors ${
                      archiveFilter === tab
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Tiles List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800">
              {archiveChats
                .filter(c => {
                  if (archiveFilter === 'starred' && !c.is_starred) return false;
                  if (archiveFilter === 'completed' && !c.is_locked) return false;
                  if (archiveFilter === 'active' && c.is_locked) return false;
                  if (archiveSearch) {
                    const q = archiveSearch.toLowerCase();
                    return c.title.toLowerCase().includes(q) || (c.meaningful_outcome && c.meaningful_outcome.toLowerCase().includes(q));
                  }
                  return true;
                })
                .sort((a, b) => (b.is_starred ? 1 : 0) - (a.is_starred ? 1 : 0))
                .map(chat => (
                  <div
                    key={chat.id}
                    onClick={() => handleOpenPastChat(chat)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleStar(chat.id, e)}
                          title="Star mark chat (pin to top)"
                          className={`text-base ${chat.is_starred ? 'text-amber-500' : 'text-gray-300 dark:text-zinc-600 hover:text-amber-500'}`}
                        >
                          ★
                        </button>
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-zinc-100 truncate">{chat.title}</h3>
                        {chat.is_locked && (
                          <span className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-700">
                            Locked
                          </span>
                        )}
                      </div>
                      {chat.meaningful_outcome && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 truncate mt-1">🎯 {chat.meaningful_outcome}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseContextInNewChat(chat);
                        }}
                        className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded text-xs font-semibold transition-colors"
                      >
                        Use in New Chat
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const blob = new Blob([chat.markdown_content || `# ${chat.title}`], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `${chat.title.replace(/\s+/g, '_')}.md`;
                          a.click();
                        }}
                        className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-zinc-200 text-xs"
                        title="Download Markdown"
                      >
                        ⬇ .md
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ATTACH FROM ARCHIVE MODAL */}
      {isAttachFromArchiveOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full max-h-[70vh] flex flex-col shadow-2xl p-6 text-zinc-900 dark:text-zinc-100">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-1">Attach Chats from Archive</h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mb-4">Select one or multiple chats to attach their Markdown transcripts as context</p>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl mb-4 max-h-60">
              {archiveChats.slice().sort((a, b) => (b.is_starred ? 1 : 0) - (a.is_starred ? 1 : 0)).map(c => (
                <label key={c.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 cursor-pointer text-xs transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedArchiveAttachments.includes(c.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedArchiveAttachments(prev => [...prev, c.id]);
                      } else {
                        setSelectedArchiveAttachments(prev => prev.filter(id => id !== c.id));
                      }
                    }}
                  />
                  <div className="flex-1 truncate">
                    <span className="font-semibold text-gray-800 dark:text-zinc-200">{c.title}</span>
                    {c.meaningful_outcome && <p className="text-gray-400 dark:text-zinc-500 truncate">{c.meaningful_outcome}</p>}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSelectedArchiveAttachments([]); setIsAttachFromArchiveOpen(false); }}
                className="px-3 py-1.5 text-xs text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const toAttach = archiveChats.filter(c => selectedArchiveAttachments.includes(c.id));
                  toAttach.forEach(c => {
                    setAttachedFiles(prev => [
                      ...prev,
                      {
                        name: `${c.title}.md`,
                        size: 'Chat MD',
                        content: c.markdown_content || `# ${c.title}\n\nOutcome: ${c.meaningful_outcome}`,
                      }
                    ]);
                  });
                  setSelectedArchiveAttachments([]);
                  setIsAttachFromArchiveOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
              >
                Attach Selected ({selectedArchiveAttachments.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELEGATION & AUTONOMY SETTINGS MODAL */}
      <DelegationSettingsModal
        isOpen={isDelegationModalOpen}
        onClose={() => setIsDelegationModalOpen(false)}
        isDarkMode={isDarkMode}
        isIncognito={isIncognito}
        onSave={setDelegationSettings}
      />

      {/* BUG REPORTING & INCOMPLETE WORK MODAL */}
      {isBugModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-lg w-full p-6 shadow-2xl border flex flex-col space-y-4 transition-all ${
            isIncognito
              ? 'bg-[#18132b] border-purple-800 text-purple-100'
              : isDarkMode
              ? 'bg-gray-900 border-gray-700 text-gray-100'
              : 'bg-white border-gray-200 text-gray-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-base">
                  🐞
                </span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Send Bug Report to Engineering</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Help Suchi get better by reporting errors and incomplete work</p>
                </div>
              </div>
              <button
                onClick={() => setIsBugModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Issue Category
              </label>
              <select
                value={bugIssueType}
                onChange={(e) => setBugIssueType(e.target.value)}
                className={`w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  isDarkMode || isIncognito
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              >
                <option value="tool_failure">Google Workspace Tool Failed (Docs, Sheets, Slides, Tasks, Gmail)</option>
                <option value="wrong_answer">Wrong Answer / Logical Reasoning Glitch</option>
                <option value="infinite_loading">Hanging / Infinite Loading / Request Timeout</option>
                <option value="auth_error">Google Cloud Permission or Access Denied Error</option>
                <option value="ui_glitch">Display, Theme or Button Layout Problem</option>
                <option value="other">Other Unspecified Issue</option>
              </select>
            </div>

            {/* User Explanation Textarea */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                What went wrong? (Optional details)
              </label>
              <textarea
                rows={3}
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                aria-label="What went wrong"
                className={`w-full p-3 rounded-xl border text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  isDarkMode || isIncognito
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}
              />
            </div>

            {/* Pre-collected Diagnostics Summary */}
            <div className={`p-3 rounded-xl border text-[11px] space-y-1 ${
              isDarkMode || isIncognito ? 'bg-gray-950/60 border-gray-800 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="flex items-center justify-between font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Auto-Captured Telemetry</span>
                <span className="text-[10px] text-emerald-500">Ready to Send</span>
              </div>
              <p><strong>User:</strong> {user?.email || 'Anonymous'}</p>
              <p><strong>Device:</strong> {typeof navigator !== 'undefined' ? navigator.platform : 'Web'} ({typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'Standard'})</p>
              {bugTargetMessage?.actions?.some(a => !a.success) && (
                <p className="text-rose-500">
                  <strong>Failed Action:</strong> {bugTargetMessage.actions.find(a => !a.success)?.tool}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBugModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitBugReport}
                disabled={isSubmittingBug}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingBug ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Submit to Engineering</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING SUCCESS TOAST */}
      {bugToast && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span>✓</span>
          <span>{bugToast}</span>
        </div>
      )}

      {/* FLOATING ACTION NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-zinc-900/95 dark:bg-zinc-800 text-zinc-100 border border-zinc-700/80 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-medium backdrop-blur-md transition-all">
          <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* RIGHT TOP DRAWER: HOME & LIFE DUAL MODE COCKPIT */}
      {isModeDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setIsModeDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className={`relative w-full max-w-sm sm:max-w-md h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200 border-l ${
            isDarkMode || isIncognito
              ? 'bg-slate-900 border-slate-800 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {/* Header */}
            <div className="p-4 sm:p-5 border-b flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm">
                  🧭
                </span>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Operating Mode</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Toggle persona & quick toolkits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModeDrawerOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Close drawer"
              >
                ✕
              </button>
            </div>

            {/* Segmented Mode Switcher */}
            <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 grid grid-cols-2 gap-1 border border-slate-200/80 dark:border-slate-700/80">
                <button
                  type="button"
                  onClick={() => handleModeChange('home')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    chatMode === 'home'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/20 scale-[1.02]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">🏠</span>
                  <span>Home Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('life')}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    chatMode === 'life'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm border border-blue-500/20 scale-[1.02]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span className="text-base">💼</span>
                  <span>Life Mode</span>
                </button>
              </div>

              {/* Mode Context Description */}
              <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                chatMode === 'home'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : 'bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-300'
              }`}>
                {chatMode === 'home' ? (
                  <p>
                    <strong>🏠 Home Mode:</strong> Curates personal vitality, health diagnostics, aging parent care, grocery/packing checklists, family schedules, and household finances.
                  </p>
                ) : (
                  <p>
                    <strong>💼 Life Mode:</strong> Powers salaried professionals, entrepreneurs & founders. Features 1-tap WhatsApp communication, direct call briefings, vendor search, and B2B customer outreach.
                  </p>
                )}
              </div>

              {/* Mode-Specific Power Tools & Forms */}
              {chatMode === 'life' ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      ⚡ Quick Action Tools (Life Mode)
                    </span>
                  </div>

                  {/* WhatsApp Quick Launcher Box */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span>💬</span> 1-Tap WhatsApp Launcher
                      </span>
                      <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded-md">
                        wa.me
                      </span>
                    </div>
                    <label className="text-[11px] font-semibold text-slate-500">Phone with country code (e.g. 919876543210):</label>
                    <input
                      type="tel"
                      value={quickWaPhone}
                      onChange={(e) => setQuickWaPhone(e.target.value)}
                      aria-label="Recipient Phone Number"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex gap-1 flex-wrap">
                      {[
                        { label: 'Invoice', text: 'Hi, checking in on the status of our pending invoice. Please share an update!' },
                        { label: 'RFQ Quote', text: 'Hi, sharing our scope requirements. Could you send your estimated quotation and turnaround time?' },
                        { label: 'Catch up', text: 'Hi, had a quick question regarding our upcoming sync. Let me know when you are free for 5 mins!' }
                      ].map(t => (
                        <button
                          key={t.label}
                          type="button"
                          onClick={() => setQuickWaMsg(t.text)}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-500 hover:text-white transition-colors"
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    <label className="text-[11px] font-semibold text-slate-500">Message:</label>
                    <textarea
                      rows={2}
                      value={quickWaMsg}
                      onChange={(e) => setQuickWaMsg(e.target.value)}
                      aria-label="Message Text"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                    />
                    <button
                      type="button"
                      disabled={!quickWaPhone.trim() || !quickWaMsg.trim()}
                      onClick={() => {
                        const cleanPhone = quickWaPhone.replace(/[^\d]/g, '');
                        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(quickWaMsg)}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-40"
                    >
                      <span>Open WhatsApp Chat ↗</span>
                    </button>
                  </div>

                  {/* Pre-Call Briefing Launcher */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <span>📞</span> Direct Call & Pre-Call Briefing
                      </span>
                      <span className="text-[9px] font-semibold bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded-md">
                        tel:
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Contact Name:</label>
                        <input
                          type="text"
                          value={quickCallContact}
                          onChange={(e) => setQuickCallContact(e.target.value)}
                          aria-label="Contact Name"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-slate-500 block mb-1">Phone Number:</label>
                        <input
                          type="tel"
                          value={quickCallPhone}
                          onChange={(e) => setQuickCallPhone(e.target.value)}
                          aria-label="Phone Number"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <label className="text-[10px] font-semibold text-slate-500 block">Call Objective:</label>
                    <input
                      type="text"
                      value={quickCallObjective}
                      onChange={(e) => setQuickCallObjective(e.target.value)}
                      aria-label="Call Objective"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!quickCallPhone.trim()}
                        onClick={() => {
                          const tel = `tel:${quickCallPhone.replace(/[\s()-]/g, '')}`;
                          window.location.href = tel;
                        }}
                        className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-sm transition-all disabled:opacity-40"
                      >
                        <span>Call Now 📞</span>
                      </button>
                      <button
                        type="button"
                        disabled={!quickCallContact.trim()}
                        onClick={() => {
                          setIsModeDrawerOpen(false);
                          sendMessage(`Prepare an executive pre-call briefing for my upcoming phone call with ${quickCallContact} (${quickCallPhone}). Objective: ${quickCallObjective || 'Strategic discussion'}. Include 3 punchy talking points, leverage points, and landmines to avoid.`);
                        }}
                        className="py-2 px-3 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors disabled:opacity-40"
                      >
                        Briefing in Chat
                      </button>
                    </div>
                  </div>

                  {/* 1-Tap Trigger Chips */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 pt-1">
                      💼 Instant Prompts
                    </span>
                    {[
                      { icon: '🏢', title: 'Compare 3 Vendors in Sheets', prompt: 'Find and compare 3 leading vendors for my project in Google Sheets with side-by-side costs, turnaround times, and pros/cons.' },
                      { icon: '🎯', title: 'Start B2B Customer Outreach', prompt: 'Create a B2B customer connect outreach pipeline with Gmail drafts, WhatsApp follow-ups, and a Google Sheets lead tracker.' },
                      { icon: '📄', title: 'Build Appraisal Brag Sheet', prompt: 'Help me draft an executive performance brag sheet in Google Docs with measurable business outcomes and promotion talking points.' },
                      { icon: '🏛️', title: 'Business Entity & GST Checklist', prompt: 'Provide a step-by-step business setup checklist (LLP vs Pvt Ltd, GST, founder agreement, banking) in Google Keep.' },
                    ].map(item => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          setIsModeDrawerOpen(false);
                          sendMessage(item.prompt);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 bg-white dark:bg-slate-800/60 hover:bg-blue-500/5 text-left flex items-center gap-2.5 transition-all text-xs"
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-semibold flex-1">{item.title}</span>
                        <span className="text-slate-400">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      🌿 Quick Action Tools (Home Mode)
                    </span>
                  </div>

                  {/* 1-Tap Trigger Chips for Home Mode */}
                  <div className="flex flex-col gap-1.5">
                    {[
                      { icon: '🩺', title: 'Annual Health Checkup Blueprint', prompt: 'Create my Annual Preventive Health Checkup blueprint and schedule comprehensive age-appropriate diagnostic blood panels.' },
                      { icon: '📝', title: 'Keep Grocery & Meal Checklist', prompt: 'Create a healthy weekly grocery and meal planning checklist in Google Keep.' },
                      { icon: '👴', title: 'Aging Parents Medication & Doctor Hub', prompt: 'Organize a medical schedule, doctor appointment log, and medication tracker for aging parents in Google Tasks and Keep.' },
                      { icon: '💰', title: 'Personal Balance Sheet in Sheets', prompt: 'Build a monthly household expense budget and SIP investment tracker with automated formulas in Google Sheets.' },
                      { icon: '🧳', title: 'Travel Packing Master List', prompt: 'Generate an organized travel packing checklist in Google Keep grouped by essentials, electronics, and documents.' },
                      { icon: '🌅', title: 'Evening Wind-down Routine', prompt: 'Set up an evening digital-sunset and habit routine in Google Tasks to protect mental bandwidth.' },
                    ].map(item => (
                      <button
                        key={item.title}
                        type="button"
                        onClick={() => {
                          setIsModeDrawerOpen(false);
                          sendMessage(item.prompt);
                        }}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 bg-white dark:bg-slate-800/60 hover:bg-emerald-500/5 text-left flex items-center gap-2.5 transition-all text-xs"
                      >
                        <span className="text-sm">{item.icon}</span>
                        <span className="font-semibold flex-1">{item.title}</span>
                        <span className="text-slate-400">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN ACTIONS DECK (1 card per viewport, no scroll, auto swipe-up) */}
      <ActionCardsDeck
        isOpen={isActionsDeckOpen}
        onClose={() => setIsActionsDeckOpen(false)}
        cards={actionCards}
        onApproveDraft={handleApproveDraft}
        onRejectDraft={handleRejectDraft}
        onMarkReviewed={(cardId) => {
          setActionCards(prev => prev.map(c => c.id === cardId ? { ...c, status: 'COMPLETED' } : c));
          fetch('/api/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'resolve', cardId }),
          }).catch(() => {});
        }}
        isDarkMode={isDarkMode}
        isIncognito={isIncognito}
      />
    </div>
  );
}
