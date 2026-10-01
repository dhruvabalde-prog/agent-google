'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ChatMessage, ActionResult, DraftInfo } from '@/lib/types';

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

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [user, setUser] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [draftStatuses, setDraftStatuses] = useState<Map<string, 'approved' | 'rejected'>>(new Map());

  // Chat Lifecycle & Meaningful Outcome
  const [currentChatId, setCurrentChatId] = useState<string>('');
  const [meaningfulOutcome, setMeaningfulOutcome] = useState<string>('');
  const [outcomeStatus, setOutcomeStatus] = useState<string>('NONE'); // NONE | PROPOSED | CONFIRMED | LOCKED
  const [isChatLocked, setIsChatLocked] = useState<boolean>(false);

  // Settings & Navigation
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIncognito, setIsIncognito] = useState(false);

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

  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
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
        'To install Agent Google:\n\n' +
        '• iPhone/iPad (Safari): Tap the Share icon, then select "Add to Home Screen".\n' +
        '• Android (Chrome): Tap the three-dot menu ⋮, then select "Install app" or "Add to Home screen".\n' +
        '• PC/Mac (Chrome/Edge): Click the install icon in the URL bar.'
      );
    }
  };

  // Incognito auto-exit on tab change or window blur
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden && isIncognito) {
        setIsIncognito(false);
        setMessages([]);
        alert('Incognito session closed for security.');
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isIncognito]);

  // Dynamic progress cycling
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setProgressIndex((prev) => (prev + 1) % PROGRESS_PHRASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, outcomeStatus]);

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
        md += `\n### ${m.role === 'user' ? 'User' : 'Agent Google'}\n${m.content}\n`;
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

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
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
      content: promptText || 'Attached voice note',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachedFiles([]);
    setRecordedAudioUrl(null);
    setIsLoading(true);
    setProgressIndex(0);

    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          isIncognito,
          meaningfulOutcome,
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
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

      setMessages(prev => [...prev, assistantMessage]);

      if (data.meaningfulOutcome && !meaningfulOutcome) {
        setMeaningfulOutcome(data.meaningfulOutcome);
      }
      if (data.outcomeStatus) {
        setOutcomeStatus(data.outcomeStatus);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Not able to respond right now.',
        }
      ]);
    } finally {
      setIsLoading(false);
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
  };

  return (
    <div className={`flex flex-col h-[100dvh] overflow-hidden ${isIncognito ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* HEADER */}
      <header className={`h-14 border-b px-3 sm:px-4 flex items-center justify-between z-20 transition-colors ${
        isIncognito ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        {/* Left: Brand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            G
          </div>
          <span className="font-semibold text-sm tracking-tight hidden sm:inline">Agent Google</span>
          {isIncognito && (
            <span className="text-[10px] bg-purple-900/60 text-purple-300 font-bold px-1.5 py-0.5 rounded-full border border-purple-700">
              INCOGNITO
            </span>
          )}
        </div>

        {/* Center: Meaningful Outcome Pinned */}
        {meaningfulOutcome && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium max-w-[140px] sm:max-w-xs md:max-w-md truncate border transition-all ${
            outcomeStatus === 'PROPOSED'
              ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
              : outcomeStatus === 'LOCKED'
              ? 'bg-gray-100 border-gray-300 text-gray-600'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <span className="truncate">🎯 {meaningfulOutcome}</span>
            {!isChatLocked && outcomeStatus === 'PROPOSED' && (
              <div className="flex items-center gap-1 ml-1 flex-shrink-0">
                <button
                  onClick={handleConfirmOutcome}
                  title="Confirm outcome achieved & lock chat"
                  className="p-1 hover:bg-amber-200 rounded text-green-700"
                >
                  ✓
                </button>
                <button
                  onClick={handleContinueChat}
                  title="Continue conversation"
                  className="p-1 hover:bg-amber-200 rounded text-gray-600"
                >
                  →
                </button>
              </div>
            )}
            {isChatLocked && <span className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded ml-1">Locked</span>}
          </div>
        )}

        {/* Right: Settings Dropdown & Install Button */}
        <div className="flex items-center gap-2">
          {isInstallable && (
            <button
              onClick={handleInstallApp}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors shadow-sm"
              title="Install Web App"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install App</span>
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="flex items-center gap-1.5 p-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs font-medium transition-colors"
            >
              {user ? (
                <img src={user.picture} alt={user.name} className="w-6 h-6 rounded-full" />
              ) : (
                <span className="text-gray-600">Settings ▾</span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl py-2 z-50 text-xs text-gray-700">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b border-gray-100 font-semibold text-gray-900 truncate">
                      {user.name}
                    </div>
                    <button
                      onClick={() => { handleInstallApp(); setIsSettingsOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between text-blue-600 font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Install App</span>
                      </span>
                      {isInstallable && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold">READY</span>}
                    </button>
                    <button
                      onClick={openArchive}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>Chats Archive</span>
                      <span className="text-[10px] text-gray-400">Ctrl+A</span>
                    </button>
                    <button
                      onClick={() => { setIsIncognito(!isIncognito); setIsSettingsOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between text-purple-700 font-medium"
                    >
                      <span>{isIncognito ? 'Exit Incognito' : 'Incognito Mode'}</span>
                      <span className="text-[10px]">🔒</span>
                    </button>
                    <button
                      onClick={handleDeleteCurrentChat}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600"
                    >
                      Delete Chat
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-gray-500"
                    >
                      Disconnect Google / Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { handleInstallApp(); setIsSettingsOpen(false); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between text-blue-600 font-medium"
                    >
                      <span className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Install App</span>
                      </span>
                      {isInstallable && <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0.5 rounded font-bold">READY</span>}
                    </button>
                    <button
                      onClick={handleLogin}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 font-semibold text-blue-600"
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
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
              <h2 className="text-xl font-semibold text-gray-400 mb-6">What can I organize or create for you?</h2>
              <div className="flex flex-wrap justify-center gap-2 max-w-md">
                {[
                  'Make a 5-slide presentation on AI trends',
                  'Research quantum computing and draft a doc',
                  'Create an expense sheet with formulas',
                  'Check my urgent emails today',
                ].map((s, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(s)}
                    className="px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-xs text-gray-600 shadow-sm transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => {
            const isAssistant = msg.role === 'assistant';
            const options = isAssistant ? extractOptions(msg.content) : [];

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : isIncognito
                      ? 'bg-gray-900 border border-gray-800 text-gray-200 rounded-bl-sm'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>

                {/* Interactive MCQ Option Buttons */}
                {options.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-2 max-w-[85%]">
                    {options.map((opt, i) => (
                      <button
                        key={i}
                        disabled={isLoading || isChatLocked}
                        onClick={() => sendMessage(`[${opt.label}] ${opt.text}`)}
                        className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/90 hover:bg-blue-100 text-xs font-medium text-blue-900 transition-all shadow-sm flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-[10px] shadow-xs">
                          {opt.label}
                        </span>
                        <span className="text-left">{opt.text}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions Badges */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 max-w-[85%]">
                    {msg.actions.map((action, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 py-1 px-2.5 rounded-full border bg-gray-50 border-gray-200 text-[11px] text-gray-600"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span className="font-semibold">{action.tool}:</span>
                        <span>{action.summary}</span>
                        {action.link && (
                          <a
                            href={action.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline font-semibold ml-1 inline-flex items-center gap-0.5"
                          >
                            Open ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

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

      {/* INPUT BAR */}
      <footer className={`border-t p-3 relative z-10 ${isIncognito ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-3xl mx-auto flex flex-col gap-2">
          {/* Agent Suggests Popup */}
          {activeSuggestion && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900">
              <span>💡 {activeSuggestion}</span>
              <button onClick={() => setActiveSuggestion(null)} className="text-indigo-500 hover:text-indigo-800 text-sm font-bold">
                ✕
              </button>
            </div>
          )}

          {/* Attached Files Badges */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {attachedFiles.map((file, i) => (
                <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-xs text-gray-700 border">
                  <span>📎 {file.name}</span>
                  <button
                    onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recorded Audio Preview */}
          {recordedAudioUrl && (
            <div className="flex items-center gap-3 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <span>🎙️ Recorded Voice Note</span>
              <audio src={recordedAudioUrl} controls className="h-7 w-48" />
              <button onClick={() => setRecordedAudioUrl(null)} className="text-red-600 hover:underline">
                Discard
              </button>
            </div>
          )}

          {/* Input Controls Row */}
          <div className="flex items-end gap-2">
            {/* Extreme Left: Agent Suggests */}
            <button
              onClick={handleTriggerSuggest}
              title="Agent Suggests (Tips)"
              className="p-2.5 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              💡
            </button>

            {/* Center: Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              disabled={isChatLocked || isLoading}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
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
                  : 'Message Agent Google...'
              }
              className={`flex-1 resize-none px-3.5 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isIncognito ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-800'
              }`}
            />

            {/* Right Controls: Camera, Attach, Mic/Send */}
            <div className="flex items-center gap-1">
              {/* Camera Button */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                title="Capture / Attach Photo"
                className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                📷
              </button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Attach Button with Archive Link option */}
              <div className="relative group">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Files (up to 10)"
                  className="p-2.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  📎
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Attach From Archive Button */}
              <button
                onClick={() => { fetchArchiveChats(); setIsAttachFromArchiveOpen(true); }}
                title="Attach context from Chats Archive folder"
                className="p-2 text-xs text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-xl font-bold"
              >
                📁
              </button>

              {/* Microphone / Send Button */}
              {input.trim() || attachedFiles.length > 0 || recordedAudioUrl ? (
                <button
                  onClick={() => sendMessage()}
                  disabled={isLoading || isChatLocked}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  ↑
                </button>
              ) : (
                <button
                  onClick={toggleAudioRecording}
                  title={isRecording ? 'Stop recording' : 'Record voice note'}
                  className={`p-2.5 rounded-xl transition-colors ${
                    isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {isRecording ? `⏹ ${recordingSeconds}s` : '🎙️'}
                </button>
              )}
            </div>
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
              {archiveChats.map(c => (
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
    </div>
  );
}
