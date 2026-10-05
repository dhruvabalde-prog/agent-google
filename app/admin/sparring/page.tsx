'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SparringMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

const PRESET_CHALLENGES = [
  {
    title: 'Free Tools Defensibility',
    prompt: 'Why should you exist when Google Calendar, Apple Reminders, and basic to-do lists are 100% free?',
    category: 'Market Defensibility'
  },
  {
    title: 'Custom Prompts Fallacy',
    prompt: 'I can literally open ChatGPT or Gemini, write a custom prompt, and add it to my skills page for free. Why would anyone pay you $49 a month?',
    category: 'Platform Risk'
  },
  {
    title: 'Corporate CISO & IT Security',
    prompt: 'No enterprise CISO or IT admin in their right mind will let an employee connect corporate email to a personal Life OS. You are dead on arrival.',
    category: 'Enterprise Security'
  },
  {
    title: 'Big Tech Steamroller',
    prompt: 'Apple Intelligence and Google Gemini are integrating deep into iOS and Android. Why won’t they just steamroll you next year?',
    category: 'Competitive Moat'
  },
  {
    title: 'Glorified To-Do List',
    prompt: 'Isn’t a Life OS just an over-engineered to-do list for people who lack personal discipline? What is the actual hard ROI?',
    category: 'Value Proposition'
  },
  {
    title: 'Dual-Context Air-Gap',
    prompt: 'How can you possibly guarantee that my private family health notes or spouse correspondence won’t accidentally bleed into a corporate email draft?',
    category: 'Privacy Architecture'
  }
];

export default function VoiceSparringPage() {
  const router = useRouter();
  const [isAdminAuth, setIsAdminAuth] = useState<boolean | null>(null);
  const [messages, setMessages] = useState<SparringMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [showPresets, setShowPresets] = useState(true);

  // Admin Theme
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('admin_theme');
      if (saved === 'light' || saved === 'dark') {
        setAdminTheme(saved);
        if (saved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (e) {}
  }, []);

  function toggleAdminTheme() {
    const next = adminTheme === 'dark' ? 'light' : 'dark';
    setAdminTheme(next);
    try {
      localStorage.setItem('admin_theme', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  }

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const accumulatedTextRef = useRef('');
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Verify Admin Session on Mount
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const res = await fetch('/api/admin/data');
        if (res.ok) {
          setIsAdminAuth(true);
        } else {
          router.replace('/admin');
        }
      } catch (e) {
        router.replace('/admin');
      }
    }
    checkAdminAuth();
  }, [router]);

  // 2. Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        // Continuous listening so it does NOT cut off after 3-4 seconds
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          isListeningRef.current = true;
        };

        recognition.onresult = (event: any) => {
          let newlyFinal = '';
          let interim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              newlyFinal += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          if (newlyFinal) {
            accumulatedTextRef.current = (accumulatedTextRef.current + ' ' + newlyFinal).replace(/\s+/g, ' ').trim();
          }

          const fullCombined = (accumulatedTextRef.current + ' ' + interim).replace(/\s+/g, ' ').trim();
          setInputText(fullCombined);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning/error:', event.error);
          // If silence detected, do NOT terminate if user is still actively recording!
          if (event.error === 'no-speech') {
            return;
          }
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            stopRecording(false);
            alert('Microphone permission was denied. Please allow microphone access in your browser settings.');
          }
        };

        recognition.onend = () => {
          // If browser ends speech recognition prematurely while user still wants to record, restart with brief delay
          if (isListeningRef.current) {
            setTimeout(() => {
              if (isListeningRef.current) {
                try {
                  recognition.start();
                } catch (e) {
                  console.warn('Speech recognition restart caught:', e);
                }
              }
            }, 150);
          } else {
            setIsListening(false);
          }
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }

      synthRef.current = window.speechSynthesis;
    }

    // Initial Welcome Message
    setMessages([
      {
        id: 'msg-0',
        role: 'agent',
        content: `I am ready. I am Suchi, your Sovereign Life & Work Operating System.\n\nGrill me on my defensibility, my unit economics, my security architecture, or why Google and Apple won't kill me. Speak freely into your mic or choose a challenge below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);


    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (synthRef.current) synthRef.current.cancel();
    };
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, isListening]);

  function speakText(text: string, messageId?: string) {
    if (!synthRef.current) return;

    synthRef.current.cancel(); // Stop any previous speech
    if (messageId) setSpeakingMessageId(messageId);

    const cleanText = text.replace(/[*_#`[\]()]/g, ''); // strip markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick best English voice
    const voices = synthRef.current.getVoices();
    const premiumVoice = voices.find(v => 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.lang.startsWith('en')) && 
      !v.name.includes('Whisper')
    );
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    };

    synthRef.current.speak(utterance);
  }

  function stopSpeaking() {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    }
  }

  function startRecording() {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your message.');
      return;
    }

    stopSpeaking();
    isListeningRef.current = true;
    setIsListening(true);
    setRecordingSeconds(0);
    accumulatedTextRef.current = inputText; // retain any existing text or start fresh

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds(sec => sec + 1);
    }, 1000);

    try {
      recognitionRef.current?.start();
    } catch (e) {
      console.warn('Speech recognition start error:', e);
    }
  }

  function stopRecording(sendAfterStop = true) {
    isListeningRef.current = false;
    setIsListening(false);

    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    try {
      recognitionRef.current?.stop();
    } catch (e) {}

    if (sendAfterStop) {
      setTimeout(() => {
        const textToSend = accumulatedTextRef.current.trim() || inputText.trim();
        if (textToSend) {
          handleSendMessage(textToSend);
        }
      }, 200);
    }
  }

  function cancelRecording() {
    isListeningRef.current = false;
    setIsListening(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    // Reset newly recorded text back to what was before
    setInputText('');
    accumulatedTextRef.current = '';
  }

  function toggleListening() {
    if (isListening) {
      // Tap while listening stops recording and sends!
      stopRecording(true);
    } else {
      startRecording();
    }
  }

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    // If currently recording, gracefully close recording without triggering another send
    if (isListening) {
      isListeningRef.current = false;
      setIsListening(false);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      try { recognitionRef.current?.stop(); } catch (e) {}
    }

    setInputText('');
    accumulatedTextRef.current = '';
    stopSpeaking();

    const userMsg: SparringMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsProcessing(true);

    try {
      const historyPayload = newMessages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/admin/sparring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Sparring server error');
      }

      const data = await res.json();
      const reply = data.reply || 'I am ready for your next counter-argument.';

      const agentMsgId = `agent-${Date.now()}`;
      const agentMsg: SparringMessage = {
        id: agentMsgId,
        role: 'agent',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
      if (autoSpeak) {
        speakText(reply, agentMsgId);
      }
    } catch (err: any) {
      console.error('Sparring failed:', err);
      const errorMsg: SparringMessage = {
        id: `err-${Date.now()}`,
        role: 'agent',
        content: `Connection interrupted: ${err?.message || 'Failed to connect'}. Try challenging me again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsProcessing(false);
    }
  }

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  if (isAdminAuth === null) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Verifying executive admin clearance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 flex flex-col font-sans overflow-hidden">
      {/* 1. Sleek Chat Header */}
      <header className="h-14 border-b border-slate-200 dark:border-gray-800 bg-white/90 dark:bg-gray-900/90 backdrop-blur px-4 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-gray-800/80 hover:bg-slate-200 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700/60 transition-colors"
          >
            ← Admin
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-gray-800"></div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            <div>
              <h1 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">Suchi Voice Sparring</h1>
              <p className="text-[10px] text-slate-500 dark:text-gray-400 hidden sm:block">Executive Life & Work OS Defensibility Arena</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Admin Theme Toggle Button */}
          <button
            onClick={toggleAdminTheme}
            className="text-xs px-2.5 py-1.5 rounded-lg border bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-gray-700 hover:bg-slate-200 dark:hover:bg-gray-700 transition-colors"
            title={`Switch to ${adminTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {adminTheme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>

          {/* Quick Challenges Toggle */}
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              showPresets
                ? 'bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80'
                : 'bg-slate-100 text-slate-600 border-slate-300 hover:text-slate-900 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:text-gray-200'
            }`}
            title="Toggle Challenge Prompts"
          >
            <span>⚡</span>
            <span className="hidden sm:inline">Challenges</span>
          </button>

          {/* Audio Auto-Speak Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              autoSpeak
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
                : 'bg-slate-100 text-slate-600 border-slate-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
            }`}
            title={autoSpeak ? 'Audio playback enabled' : 'Muted (Text only)'}
          >
            <span>{autoSpeak ? '🔊' : '🔇'}</span>
            <span className="hidden sm:inline">{autoSpeak ? 'Voice On' : 'Muted'}</span>
          </button>

          {/* Clear Arena */}
          <button
            onClick={() => {
              stopSpeaking();
              setMessages([
                {
                  id: `reset-${Date.now()}`,
                  role: 'agent',
                  content: 'Arena reset. Present your next cross-examination.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
            className="text-xs text-slate-500 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-gray-800/60 dark:hover:bg-gray-800 border border-slate-300 dark:border-gray-700/60 transition-colors"
            title="Clear Chat History"
          >
            🗑️
          </button>
        </div>
      </header>

      {/* 2. Chat Messages Area (Full Viewport Scrollable Stream) */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500 dark:text-gray-400 font-medium">
              <span>{msg.role === 'user' ? '🥊 You' : '🛡️ Suchi (Chief of Staff)'}</span>
              <span>•</span>
              <span className="text-[10px] text-slate-400 dark:text-gray-500">{msg.timestamp}</span>
            </div>

            <div
              className={`p-3.5 sm:p-4 rounded-2xl max-w-[90%] sm:max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-sm shadow-md'
                  : 'bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 text-slate-800 dark:text-gray-100 rounded-bl-sm shadow-sm'
              }`}
            >
              {msg.content}

              {msg.role === 'agent' && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-gray-800/80 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 dark:text-gray-400">Autonomous Executive OS</span>
                  <button
                    onClick={() => {
                      if (speakingMessageId === msg.id && isSpeaking) {
                        stopSpeaking();
                      } else {
                        speakText(msg.content, msg.id);
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                      speakingMessageId === msg.id && isSpeaking
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60'
                        : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-800/80'
                    }`}
                  >
                    <span>{speakingMessageId === msg.id && isSpeaking ? '⏹ Stop' : '🔊 Listen'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-500 dark:text-gray-400">
              <span>🛡️ Suchi</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-bl-sm flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-xs text-slate-500 dark:text-gray-400 ml-1">Formulating defense...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Area: Quick Prompts Drawer + Dedicated Chat Input */}
      <div className="border-t border-slate-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur shrink-0 z-20 pb-safe">
        {/* Horizontal Chips: Preset Challenges */}
        {showPresets && (
          <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-800/60 overflow-x-auto no-scrollbar flex items-center gap-2 max-w-3xl mx-auto">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400/80 shrink-0">
              Grill:
            </span>
            {PRESET_CHALLENGES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isProcessing || isListening}
                className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-100 dark:bg-gray-800/80 dark:hover:bg-purple-900/40 text-slate-700 hover:text-purple-700 dark:text-gray-300 dark:hover:text-purple-200 border border-slate-200 hover:border-purple-300 dark:border-gray-700/60 dark:hover:border-purple-600/50 transition-all text-left"
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        <div className="max-w-3xl mx-auto p-3 sm:p-4">
          {/* Active Voice Recording Banner (When recording continuously) */}
          {isListening && (
            <div className="mb-2.5 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2 text-xs text-purple-800 dark:text-purple-300">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">Recording</span>
                <span className="font-mono bg-purple-100 dark:bg-purple-900/50 px-1.5 py-0.5 rounded text-[11px] text-purple-800 dark:text-purple-200">
                  {formatDuration(recordingSeconds)}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-gray-400 hidden sm:inline">
                  (Speak as long as you want. Tap Done or Send when finished)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={cancelRecording}
                  className="text-[11px] text-slate-500 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => stopRecording(true)}
                  className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-semibold px-2.5 py-1 rounded-lg transition-colors shadow-sm"
                >
                  Done & Send ✓
                </button>
              </div>
            </div>
          )}

          {/* Main Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              if (isListening) {
                stopRecording(true);
              } else {
                handleSendMessage();
              }
            }}
            className="flex items-end gap-2"
          >
            {/* Input Box with live transcript or typed text */}
            <div className="flex-1 relative bg-slate-50 dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded-2xl focus-within:border-purple-500 transition-colors shadow-inner flex items-center">
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (isListening) {
                      stopRecording(true);
                    } else {
                      handleSendMessage();
                    }
                  }
                }}
                rows={1}
                aria-label={
                  isListening
                    ? 'Listening continuously... Speak your argument...'
                    : 'Type a tough counter-argument or tap mic to speak...'
                }
                className="w-full bg-transparent px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white resize-none focus:outline-none max-h-28 leading-relaxed"
                disabled={isProcessing}
              />
            </div>

            {/* Continuous Voice Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={isProcessing}
              title={
                isListening
                  ? 'Recording in progress... Tap to Stop & Send'
                  : 'Start Continuous Voice Recording (records until you stop it)'
              }
              className={`h-10 w-10 sm:h-11 sm:w-11 rounded-2xl flex items-center justify-center shrink-0 transition-all shadow-md ${
                isListening
                  ? 'bg-rose-600 hover:bg-rose-500 text-white scale-105 animate-pulse shadow-rose-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 border border-slate-300 dark:border-gray-700/80'
              }`}
            >
              {isListening ? (
                <span className="text-sm font-bold">⏹</span>
              ) : (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                </svg>
              )}
            </button>

            {/* Send Message Button */}
            <button
              type="submit"
              disabled={isProcessing || (!inputText.trim() && !isListening)}
              className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-purple-600 hover:bg-purple-500 disabled:opacity-30 disabled:hover:bg-purple-600 text-white flex items-center justify-center shrink-0 transition-all shadow-md"
              title="Send Message"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
