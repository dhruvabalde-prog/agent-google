'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ChatMessage, ActionResult, DraftInfo } from '@/lib/types';
import ActionCardsDeck, { ActionCardItem } from '@/components/ActionCardsDeck';

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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {}
  };

  return (
    <div className="relative my-2.5 rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-950 font-mono text-xs shadow-md">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900/90 border-b border-zinc-800 text-[11px] text-zinc-400">
        <span className="font-semibold uppercase tracking-wider text-zinc-300">{lang || 'code'}</span>
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
      <div className="p-3 overflow-x-auto text-zinc-200">
        <pre className="m-0 p-0 bg-transparent">
          <code className={className}>{children}</code>
        </pre>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [user, setUser] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // System 1: AbortController for Stop Generation
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Chat Lifecycle & Meaningful Outcome
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [meaningfulOutcome, setMeaningfulOutcome] = useState<string>('');
  const [outcomeStatus, setOutcomeStatus] = useState<string>('NONE'); // NONE | PROPOSED | CONFIRMED | LOCKED
  const [isChatLocked, setIsChatLocked] = useState<boolean>(false);

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
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
      } else if (savedTheme === 'light') {
        setIsDarkMode(false);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDarkMode(true);
      }
    } catch (e) {}
  }, []);

  function toggleDarkMode() {
    setIsDarkMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('suchi_theme', next ? 'dark' : 'light');
      } catch (e) {}
      return next;
    });
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
    setCurrentChatId(crypto.randomUUID());
  }, []);

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

  // Open Archive Modal
  function openArchive() {
    fetchArchiveChats();
    setIsSettingsOpen(false);
    setIsArchiveOpen(true);
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

  // Send message
  async function sendMessage(textToSend?: string) {
    const promptText = (textToSend || input).trim();
    if ((!promptText && attachedFiles.length === 0 && !recordedAudioUrl) || isLoading || isChatLocked) return;

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

    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInput('');
    try {
      localStorage.removeItem('suchi_composer_draft');
    } catch (e) {}
    setAttachedFiles([]);
    setRecordedAudioUrl(null);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    await executeChatWithHistory(newHistory);
  }

  // System 1: Stop Generation Handler
  function handleStopGeneration() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
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
    await executeChatWithHistory(priorHistory);
  }

  // Core chat execution dispatcher
  async function executeChatWithHistory(chatHistory: ChatMessage[]) {
    setIsLoading(true);
    setProgressIndex(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          chatId: currentChatId,
          isIncognito,
          meaningfulOutcome,
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

      setMessages([...chatHistory, assistantMessage]);

      if (data.meaningfulOutcome && !meaningfulOutcome) {
        setMeaningfulOutcome(data.meaningfulOutcome);
      }
      if (data.outcomeStatus) {
        setOutcomeStatus(data.outcomeStatus);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages([
          ...chatHistory,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '⏹ Response stopped by user.',
          }
        ]);
        return;
      }
      setMessages([
        ...chatHistory,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Not able to respond right now.',
        }
      ]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
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

  // Auth Handlers
  const handleLogin = () => { window.location.href = '/connect'; };
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setMessages([]);
    setAttachedFiles([]);
    setRecordedAudioUrl(null);
    setIsSettingsOpen(false);
    window.location.href = '/connect';
  };

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

        {/* Center: Meaningful Outcome Pinned */}
        {meaningfulOutcome && (
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium max-w-[130px] sm:max-w-xs md:max-w-md truncate border transition-all ${
            outcomeStatus === 'PROPOSED'
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 animate-pulse'
              : outcomeStatus === 'LOCKED'
              ? 'bg-slate-800/60 border-slate-700 text-slate-400'
              : isIncognito
              ? 'bg-purple-900/30 border-purple-700/50 text-purple-200'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400'
          }`}>
            <span className="truncate">🎯 {meaningfulOutcome}</span>
            {!isChatLocked && outcomeStatus === 'PROPOSED' && (
              <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                <button
                  onClick={handleConfirmOutcome}
                  title="Confirm outcome achieved & lock chat"
                  className="p-1 hover:bg-amber-200/20 rounded text-emerald-400 font-bold"
                >
                  ✓
                </button>
                <button
                  onClick={handleContinueChat}
                  title="Continue conversation"
                  className="p-1 hover:bg-amber-200/20 rounded text-gray-400"
                >
                  →
                </button>
              </div>
            )}
            {isChatLocked && <span className="text-[10px] bg-gray-700/50 px-1.5 py-0.5 rounded ml-1">Locked</span>}
          </div>
        )}

        {/* Right: Hub Button, Actions Bell Button & Settings Dropdown */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Locked Life OS Hub Button (Tasks, Routines, Goals) */}
          <button
            type="button"
            onClick={() => triggerToast('Tasks, Routines & Goals is locked')}
            title="Tasks, Routines & Goals (Locked)"
            className={`relative w-10 h-10 rounded-xl border text-xs font-medium transition-all flex items-center justify-center hover:opacity-90 active:scale-95 ${
              isIncognito
                ? 'border-purple-800/40 bg-purple-950/40 text-purple-300/80'
                : isDarkMode
                ? 'border-zinc-800 bg-zinc-900/90 text-zinc-400'
                : 'border-zinc-200/90 hover:bg-zinc-100/80 text-zinc-600 bg-white/90 shadow-2xs'
            }`}
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 dark:bg-zinc-800 text-zinc-300 border border-zinc-600 dark:border-zinc-700 shadow-2xs">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
          </button>

          {/* Locked Bell Button (Shows Actions Page / Deck) */}
          <button
            type="button"
            onClick={() => triggerToast('Actions Feed is locked')}
            title="Actions & Work Feed (Locked)"
            className={`relative w-10 h-10 rounded-xl border text-xs font-medium transition-all flex items-center justify-center hover:opacity-90 active:scale-95 ${
              isIncognito
                ? 'border-purple-800/40 bg-purple-950/40 text-purple-300/80'
                : isDarkMode
                ? 'border-zinc-800 bg-zinc-900/90 text-zinc-400'
                : 'border-zinc-200/90 hover:bg-zinc-100/80 text-zinc-600 bg-white/90 shadow-2xs'
            }`}
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-700 dark:bg-zinc-800 text-zinc-300 border border-zinc-600 dark:border-zinc-700 shadow-2xs">
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </span>
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

      {/* MESSAGES SCROLL AREA */}
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
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                What can Suchi take off your plate today?
              </h2>
              <p className="text-xs text-gray-400 mb-6 max-w-md">
                Your autonomous Chief of Staff & Life OS. Minimum time & attention spent, maximum clarity & benefit received.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                {[
                  'Find best health insurance policy for my parents',
                  'Audit recurring monthly subscriptions & cut costs',
                  'Draft a 6-month emergency fund & debt payoff roadmap',
                  'Organize family medical checkups and records in Drive',
                  'Draft a 5-slide career growth & salary review deck',
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className={`px-3.5 py-2 rounded-full border text-xs shadow-sm transition-all text-left hover:scale-[1.02] active:scale-[0.98] ${
                      isIncognito
                        ? 'border-purple-800/60 bg-[#1a142e] hover:bg-purple-900/40 text-purple-200 hover:border-purple-600'
                        : isDarkMode
                        ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:border-slate-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    ✦ {s}
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
                    /* Message Bubble */
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

                      {/* Floating Message Action Buttons (Copy, Edit, TTS, Retry, Report) */}
                      <div className={`mt-2 pt-1.5 flex items-center gap-1 border-t ${
                        isUser
                          ? 'border-white/20 text-white/80'
                          : isIncognito
                          ? 'border-purple-800/30 text-purple-400'
                          : 'border-gray-100 dark:border-gray-800 text-gray-400'
                      }`}>
                        {/* Copy Button */}
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          title="Copy message"
                          className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-[11px]"
                        >
                          {copiedMessageId === msg.id ? (
                            <>
                              <svg className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-[10px] text-emerald-400 dark:text-emerald-400 font-medium">Copied</span>
                            </>
                          ) : (
                            <svg className="w-3.5 h-3.5 opacity-80 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>

                        {/* Edit Button (Only for last 5 user messages) */}
                        {isEditable && (
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

                        {/* Retry / Regenerate Button (For assistant messages) */}
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
                    </div>
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
                          {/* Image preview card if tool is generate_image or imageUrl is present */}
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
      </main>

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

      {/* INPUT BAR */}
      <footer className={`border-t p-2.5 sm:p-3 relative z-10 transition-colors ${
        isDarkMode || isIncognito ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {/* Agent Suggests Popup */}
          {activeSuggestion && (
            <div className={`flex items-center justify-between p-2 rounded-lg border text-xs shadow-sm ${
              isDarkMode ? 'bg-indigo-950/60 border-indigo-800 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'
            }`}>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {activeSuggestion}
              </span>
              <button onClick={() => setActiveSuggestion(null)} className="text-indigo-500 hover:text-indigo-800 text-sm font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* Attached Files Badges */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-0.5">
              {attachedFiles.map((file, i) => {
                const isImage = file.content?.startsWith('data:image/') || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
                return (
                  <div key={i} className={`group flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl text-xs border transition-all ${
                    isDarkMode ? 'bg-zinc-800/90 border-zinc-700 text-zinc-200' : 'bg-zinc-100 border-zinc-200 text-zinc-800'
                  }`}>
                    {isImage && file.content ? (
                      <img src={file.content} alt={file.name} className="w-5 h-5 rounded object-cover flex-shrink-0 border border-zinc-300 dark:border-zinc-700" />
                    ) : (
                      <svg className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    )}
                    <div className="flex flex-col min-w-0 pr-1">
                      <span className="truncate max-w-[130px] font-medium text-[11px] leading-tight">{file.name}</span>
                      {file.size && <span className="text-[9px] text-zinc-400 leading-tight">{file.size}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="w-4 h-4 rounded-full flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors ml-auto"
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
            <div className={`flex items-center gap-3 p-2 rounded-lg text-xs border ${
              isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}>
              <span className="flex items-center gap-1 font-medium">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Voice Note
              </span>
              <audio src={recordedAudioUrl} controls className="h-7 w-48" />
              <button onClick={() => setRecordedAudioUrl(null)} className="text-red-500 hover:underline">
                Discard
              </button>
            </div>
          )}

          {/* Input Controls Row: Left Highlighted Suggestions | Center Embedded Typebar | Right Highlighted Mic/Send */}
          <div className="flex items-end gap-2 sm:gap-2.5">
            {/* Extreme Left: Suggestions Button (HIGHLIGHTED & PROPERLY SIZED) */}
            <button
              type="button"
              onClick={handleTriggerSuggest}
              title="Suchi Suggestions & Strategy Tips"
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border shadow-sm flex-shrink-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                isIncognito
                  ? 'border-purple-600/70 bg-purple-950/80 text-purple-300 hover:bg-purple-900/80 shadow-purple-950/40'
                  : isDarkMode
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-400 hover:bg-amber-900/40 shadow-amber-950/30'
                  : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-amber-100'
              }`}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </button>

            {/* Center: Type Bar with Embedded Buttons Inside at Bottom Extreme Right */}
            <div className={`flex-1 flex flex-col rounded-2xl sm:rounded-3xl border transition-all ${
              isIncognito
                ? 'bg-[#1a152e] border-purple-800/50 focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20'
                : isDarkMode
                ? 'bg-[#162032] border-slate-700/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20'
                : 'bg-white border-slate-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 shadow-xs'
            }`}>
              <textarea
                ref={textareaRef}
                rows={1}
                disabled={isChatLocked || isLoading}
                value={input}
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
                  // Handle image paste from clipboard
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
                placeholder={
                  isChatLocked
                    ? 'This chat reached its outcome and is locked. Use context in a new chat.'
                    : 'Suchi suno...'
                }
                className={`w-full resize-none px-4 pt-3 pb-1 bg-transparent text-base sm:text-sm min-h-[44px] focus:outline-none transition-colors ${
                  isIncognito
                    ? 'text-purple-100 placeholder-purple-400/60'
                    : isDarkMode
                    ? 'text-white placeholder-slate-400'
                    : 'text-slate-900 placeholder-slate-400'
                }`}
              />

              {/* Inside Type Bar Row: Left File count | Extreme Right: 3 Embedded Buttons (Camera, Attach File, Archive) */}
              <div className="flex items-center justify-between px-3 pb-2 pt-0.5">
                <div className="flex items-center">
                  {attachedFiles.length > 0 && (
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium px-1">
                      {attachedFiles.length}/10 files attached
                    </span>
                  )}
                </div>

                {/* Extreme Right Embedded Buttons */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-gray-500 dark:text-gray-400 ml-auto">
                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    title="Capture / Attach Photo"
                    className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
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

                  {/* Attach File Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach Files (up to 10)"
                    className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* Chats Archive Folder Button */}
                  <button
                    type="button"
                    onClick={() => { fetchArchiveChats(); setIsAttachFromArchiveOpen(true); }}
                    title="Attach context from Chats Archive folder"
                    className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-300 transition-colors"
                  >
                    <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Extreme Right: Mic / Send / Stop Button (HIGHLIGHTED & PROPERLY SIZED) */}
            {isLoading ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                title="Stop generation"
                className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 shadow-md transition-all flex-shrink-0 flex items-center justify-center hover:scale-105 active:scale-95 group"
              >
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-current rounded-xs group-hover:scale-90 transition-transform" />
              </button>
            ) : input.trim() || attachedFiles.length > 0 || recordedAudioUrl ? (
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={isChatLocked}
                title="Send message"
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-md transition-all flex-shrink-0 flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 ${
                  isIncognito
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-950/50'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-900/20'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleAudioRecording}
                title={isRecording ? 'Stop recording' : 'Record voice note'}
                className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl border shadow-sm flex-shrink-0 flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
                  isRecording
                    ? 'bg-red-600 border-red-600 text-white animate-pulse'
                    : isIncognito
                    ? 'border-purple-600/70 bg-purple-950/80 text-purple-300 hover:bg-purple-900/80 shadow-purple-950/40'
                    : isDarkMode
                    ? 'border-blue-500/50 bg-blue-950/40 text-blue-400 hover:bg-blue-900/40 shadow-blue-950/30'
                    : 'border-blue-300 bg-blue-50 text-blue-600 hover:bg-blue-100 shadow-blue-100'
                }`}
              >
                {isRecording ? (
                  <span className="flex items-center gap-1 text-xs font-bold px-1">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                    {recordingSeconds}s
                  </span>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* WHATSAPP-STYLE CHATS ARCHIVE MODAL */}
      {isArchiveOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Archive Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Chats Archive</h2>
                <p className="text-xs text-gray-500">Persistent conversation records & portable contexts</p>
              </div>
              <button onClick={() => setIsArchiveOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg font-bold">
                ✕
              </button>
            </div>

            {/* Search & Filters */}
            <div className="px-6 py-3 border-b border-gray-100 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Search archive conversations..."
                value={archiveSearch}
                onChange={(e) => setArchiveSearch(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="flex gap-1">
                {(['all', 'starred', 'completed', 'active'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setArchiveFilter(tab)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      archiveFilter === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversation Tiles List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
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
                    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleToggleStar(chat.id, e)}
                          title="Star mark chat (pin to top)"
                          className={`text-base ${chat.is_starred ? 'text-amber-500' : 'text-gray-300 hover:text-amber-500'}`}
                        >
                          ★
                        </button>
                        <h3 className="font-semibold text-sm text-gray-900 truncate">{chat.title}</h3>
                        {chat.is_locked && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border">
                            Locked
                          </span>
                        )}
                      </div>
                      {chat.meaningful_outcome && (
                        <p className="text-xs text-blue-700 truncate mt-1">🎯 {chat.meaningful_outcome}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUseContextInNewChat(chat);
                        }}
                        className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-semibold"
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
                        className="p-1 text-gray-400 hover:text-gray-700 text-xs"
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
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[70vh] flex flex-col shadow-2xl p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Attach Chats from Archive</h2>
            <p className="text-xs text-gray-500 mb-4">Select one or multiple chats to attach their Markdown transcripts as context</p>

            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 border rounded-xl mb-4 max-h-60">
              {archiveChats.slice().sort((a, b) => (b.is_starred ? 1 : 0) - (a.is_starred ? 1 : 0)).map(c => (
                <label key={c.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 cursor-pointer text-xs">
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
                    <span className="font-semibold text-gray-800">{c.title}</span>
                    {c.meaningful_outcome && <p className="text-gray-400 truncate">{c.meaningful_outcome}</p>}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setSelectedArchiveAttachments([]); setIsAttachFromArchiveOpen(false); }}
                className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
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
                className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Attach Selected ({selectedArchiveAttachments.length})
              </button>
            </div>
          </div>
        </div>
      )}

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
                placeholder="e.g. I asked to create a spreadsheet but it stopped after 2 rows, or button did not respond..."
                className={`w-full p-3 rounded-xl border text-xs resize-none focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                  isDarkMode || isIncognito
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
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
