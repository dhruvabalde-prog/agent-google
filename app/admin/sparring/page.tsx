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
    title: 'The Free Tools Challenge',
    prompt: 'Why should you exist when Google Calendar, Apple Reminders, and basic to-do lists are 100% free?',
    category: 'Market Defensibility'
  },
  {
    title: 'The Custom Prompts Challenge',
    prompt: 'I can literally open ChatGPT or Gemini, write a custom prompt, and add it to my skills page for free. Why would anyone pay you $49 a month?',
    category: 'Platform Risk'
  },
  {
    title: 'The Corporate CISO / Security Challenge',
    prompt: 'No enterprise CISO or IT admin in their right mind will let an employee connect corporate email to a personal Life OS. You are dead on arrival.',
    category: 'Enterprise Security'
  },
  {
    title: 'The Big Tech Steamroller Challenge',
    prompt: 'Apple Intelligence and Google Gemini are integrating deep into iOS and Android. Why won’t they just steamroll you next year?',
    category: 'Competitive Moat'
  },
  {
    title: 'The "Glorified To-Do List" Challenge',
    prompt: 'Isn’t a Life OS just an over-engineered to-do list for people who lack personal discipline? What is the actual hard ROI?',
    category: 'Value Proposition'
  },
  {
    title: 'The Dual-Context Bleed Challenge',
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
          setCurrentTranscript('');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              const finalTranscript = event.results[i][0].transcript;
              setCurrentTranscript(finalTranscript);
              setIsListening(false);
              handleSendMessage(finalTranscript);
              return;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setCurrentTranscript(interim);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
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
        content: `I am ready. I am Navia, the Sovereign Life & Work Operating System.\n\nGrill me on my existence, my business model, my security architecture, or why Google and Apple won't kill me. Speak directly into your microphone, or choose a challenge below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing, currentTranscript]);

  // Audio level animation during speaking
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSpeaking || isListening) {
      interval = setInterval(() => {
        setAudioLevel(Math.floor(Math.random() * 80) + 20);
      }, 100);
    } else {
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isSpeaking, isListening]);

  function speakText(text: string) {
    if (!autoSpeak || !synthRef.current) return;

    synthRef.current.cancel(); // Stop any previous speech
    const cleanText = text.replace(/[*_#`[\]()]/g, ''); // strip markdown
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Pick best English voice
    const voices = synthRef.current.getVoices();
    const premiumVoice = voices.find(v => (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.lang.startsWith('en')) && !v.name.includes('Whisper'));
    if (premiumVoice) utterance.voice = premiumVoice;

    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }

  function stopSpeaking() {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }

  function toggleListening() {
    if (!speechSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or type your challenge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend || inputText).trim();
    if (!text || isProcessing) return;

    setInputText('');
    setCurrentTranscript('');
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

      const agentMsg: SparringMessage = {
        id: `agent-${Date.now()}`,
        role: 'agent',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, agentMsg]);
      speakText(reply);
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

  if (isAdminAuth === null) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm">Verifying executive admin clearance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="border-b border-gray-800 bg-gray-900/90 backdrop-blur sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-gray-800/80 hover:bg-gray-800 border border-gray-700/60 transition-colors"
          >
            ← Admin Console
          </Link>
          <div className="h-4 w-px bg-gray-700"></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white tracking-wide flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
                Voice Sparring Lab
              </span>
              <span className="text-[10px] bg-purple-950/80 text-purple-300 font-semibold px-2 py-0.5 rounded border border-purple-800/50">
                Grill Navia / Life OS
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Autonomous Executive Advocacy Engine & Defensibility Arena</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio Auto-Speak Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopSpeaking();
              setAutoSpeak(!autoSpeak);
            }}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
              autoSpeak
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
            title={autoSpeak ? 'Voice output enabled' : 'Muted (Text only)'}
          >
            <span>{autoSpeak ? '🔊 Voice On' : '🔇 Muted'}</span>
          </button>

          {isSpeaking && (
            <button
              onClick={stopSpeaking}
              className="text-xs bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-800/80 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              Stop Audio ⏹
            </button>
          )}
        </div>
      </header>

      {/* Main Interactive Stage */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Visualizer & Mic Hero Status Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border border-gray-800 p-6 shadow-2xl flex flex-col items-center justify-center text-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent pointer-events-none"></div>

          {/* Animated Pulsing Halo */}
          <div className="relative mb-4 flex items-center justify-center">
            <div
              className={`absolute -inset-4 rounded-full transition-all duration-300 ${
                isSpeaking
                  ? 'bg-purple-500/20 blur-xl animate-pulse'
                  : isListening
                  ? 'bg-emerald-500/25 blur-xl animate-ping'
                  : isProcessing
                  ? 'bg-indigo-500/20 blur-lg animate-pulse'
                  : 'bg-transparent'
              }`}
            ></div>

            {/* Central Mic Button */}
            <button
              onClick={toggleListening}
              disabled={isProcessing}
              className={`relative z-10 w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-200 border-2 ${
                isListening
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-400 text-white scale-105 shadow-emerald-500/30'
                  : isSpeaking
                  ? 'bg-purple-600 hover:bg-purple-500 border-purple-400 text-white shadow-purple-500/30'
                  : isProcessing
                  ? 'bg-gray-800 border-indigo-500 text-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 border-gray-700 text-gray-200 hover:border-indigo-500'
              }`}
            >
              {isProcessing ? (
                <div className="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              ) : isListening ? (
                <>
                  <span className="text-2xl animate-pulse">🎙️</span>
                  <span className="text-[10px] font-bold tracking-tight">Listening</span>
                </>
              ) : isSpeaking ? (
                <>
                  <span className="text-2xl animate-bounce">🔊</span>
                  <span className="text-[10px] font-bold tracking-tight">Speaking</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🎙️</span>
                  <span className="text-[10px] font-semibold text-gray-300">Tap to Grill</span>
                </>
              )}
            </button>
          </div>

          {/* Soundwave Simulation Bars */}
          <div className="h-6 flex items-center justify-center gap-1 mb-2">
            {[20, 45, 75, 30, 90, 60, 35, 80, 50, 25, 65, 40].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isSpeaking
                    ? 'bg-purple-400'
                    : isListening
                    ? 'bg-emerald-400'
                    : 'bg-gray-800'
                }`}
                style={{
                  height: isSpeaking || isListening ? `${Math.max(4, (h * audioLevel) / 100)}px` : '4px'
                }}
              ></span>
            ))}
          </div>

          {/* Status Text & Interim Speech */}
          <div className="min-h-[28px] max-w-xl">
            {isListening ? (
              <p className="text-xs text-emerald-400 font-medium animate-pulse">
                {currentTranscript || 'Listening to your argument... Speak freely.'}
              </p>
            ) : isProcessing ? (
              <p className="text-xs text-indigo-400 font-medium animate-pulse">
                Formulating steel-trap counter-argument...
              </p>
            ) : isSpeaking ? (
              <p className="text-xs text-purple-400 font-medium">Navia is defending the platform aloud...</p>
            ) : (
              <p className="text-xs text-gray-400">
                Tap microphone to speak aloud, or pick a challenge card below to test my reasoning.
              </p>
            )}
          </div>
        </div>

        {/* Quick Challenge Cards: The Gauntlet */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚡</span> The Skeptic's Gauntlet (Instant Grilling Prompts)
            </h3>
            <span className="text-[11px] text-gray-400">Tap any card to challenge Navia</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {PRESET_CHALLENGES.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isProcessing}
                className="text-left p-3 rounded-xl bg-gray-900/60 hover:bg-gray-800/80 border border-gray-800 hover:border-purple-500/50 transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold text-purple-400/80 uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <p className="text-xs font-semibold text-gray-200 group-hover:text-white transition-colors">
                    {item.title}
                  </p>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2 mt-2 leading-relaxed italic">
                  "{item.prompt}"
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Sparring Conversation Turn Log */}
        <div className="flex-1 bg-gray-900/40 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 min-h-[350px]">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <span>⚔️</span> Sparring Transcript & Record
            </span>
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
              className="text-[11px] text-gray-400 hover:text-white transition-colors"
            >
              Clear Arena
            </button>
          </div>

          {/* Turn-by-Turn Chat Deck */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      msg.role === 'user'
                        ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                        : 'bg-purple-950/60 text-purple-300 border border-purple-800/40'
                    }`}
                  >
                    {msg.role === 'user' ? '🥊 Admin / Griller' : '🛡️ Navia / Sovereign OS'}
                  </span>
                  <span className="text-[10px] text-gray-400">{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-2xl max-w-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-rose-950/30 text-rose-100 border border-rose-900/40 rounded-tr-none'
                      : 'bg-gray-800/80 text-gray-100 border border-gray-700/60 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.content}

                  {msg.role === 'agent' && (
                    <div className="mt-2.5 pt-2 border-t border-gray-700/40 flex items-center justify-end gap-2">
                      <button
                        onClick={() => speakText(msg.content)}
                        className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                      >
                        <span>🔊</span> Replay Voice
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex flex-col items-start">
                <div className="p-3.5 rounded-2xl bg-gray-800/60 border border-gray-700/40 rounded-tl-none flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></div>
                  <span className="text-xs text-gray-400">Navia is assembling counter-arguments...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Text Input Fallback Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="mt-2 flex items-center gap-2 border-t border-gray-800 pt-3"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Or type a tough counter-argument here (e.g. 'Why wouldn't an executive just hire an intern?')..."
              className="flex-1 bg-gray-900 border border-gray-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !inputText.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-md transition-colors"
            >
              Challenge
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
