'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SuchiLiveVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserMessage: (text: string) => Promise<string>;
  isDarkMode?: boolean;
}

export default function SuchiLiveVoiceModal({
  isOpen,
  onClose,
  onUserMessage,
  isDarkMode = false,
}: SuchiLiveVoiceModalProps) {
  const [status, setStatus] = useState<'listening' | 'thinking' | 'speaking'>('listening');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [suchiReply, setSuchiReply] = useState('Listening... Speak naturally.');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // Female voice picker helper
  function speakWithFemaleVoice(text: string, onEnd?: () => void) {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEnd) onEnd();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.2; // Feminine pitch
    utterance.rate = 1.05;

    const voices = window.speechSynthesis.getVoices();
    // Prioritize known female voices
    const femaleVoice = voices.find(v => 
      /female/i.test(v.name) ||
      /zira/i.test(v.name) ||
      /samantha/i.test(v.name) ||
      /victoria/i.test(v.name) ||
      /karen/i.test(v.name) ||
      /google uk english female/i.test(v.name) ||
      /natural/i.test(v.name)
    ) || voices.find(v => v.lang.startsWith('en'));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onend = () => {
      setStatus('listening');
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      setStatus('listening');
      if (onEnd) onEnd();
    };

    setStatus('speaking');
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    if (!isOpen) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        isListeningRef.current = false;
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }

    synthRef.current = typeof window !== 'undefined' ? window.speechSynthesis : null;

    // Initial greeting from Suchi
    speakWithFemaleVoice("Hi! Suchi here. I'm ready, what's on your mind?", () => {
      startListening();
    });

    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isOpen]);

  function startListening() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        isListeningRef.current = true;
        setStatus('listening');
      };

      recognition.onresult = async (event: any) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += text;
          } else {
            interimChunk += text;
          }
        }

        const currentSaid = (finalChunk || interimChunk).trim();
        if (currentSaid) {
          setLiveTranscript(currentSaid);
        }

        if (finalChunk.trim()) {
          // User spoke a complete sentence, send to Suchi
          try {
            recognition.stop();
            isListeningRef.current = false;
            setStatus('thinking');
            setSuchiReply('Suchi is processing your request...');

            const reply = await onUserMessage(finalChunk.trim());
            setSuchiReply(reply);
            speakWithFemaleVoice(reply, () => {
              // Automatically resume listening for conversational flow
              setTimeout(() => {
                if (isOpen) startListening();
              }, 300);
            });
          } catch (e: any) {
            console.error('Voice message error:', e);
            speakWithFemaleVoice('I encountered a connection issue. Please tell me again.');
          }
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'no-speech') return;
        console.warn('Speech error:', e.error);
      };

      recognition.onend = () => {
        if (isListeningRef.current && status === 'listening') {
          setTimeout(() => {
            if (isListeningRef.current) {
              try { recognition.start(); } catch (err) {}
            }
          }, 150);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Could not start speech recognition:', e);
    }
  }

  function handleStopAndClose() {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 bg-black/90 backdrop-blur-2xl text-white select-none animate-in fade-in">
      {/* Top Header */}
      <div className="w-full max-w-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Suchi Live Voice
          </span>
        </div>
        <button
          onClick={handleStopAndClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Exit voice mode"
        >
          ✕
        </button>
      </div>

      {/* Center Interactive Animated Voice Orb */}
      <div className="flex flex-col items-center justify-center my-auto space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Animated Glow Rings */}
          <div className={`absolute w-44 h-44 rounded-full filter blur-xl opacity-40 transition-all duration-700 ${
            status === 'speaking'
              ? 'bg-purple-500 scale-125 animate-pulse'
              : status === 'thinking'
              ? 'bg-amber-500 scale-110 animate-spin'
              : 'bg-blue-500 scale-100 animate-ping'
          }`} />

          {/* Core Orb */}
          <div className={`w-32 h-32 rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 border border-white/20 ${
            status === 'speaking'
              ? 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-pink-500 scale-110 shadow-purple-500/50'
              : status === 'thinking'
              ? 'bg-gradient-to-tr from-amber-600 to-indigo-600 scale-95 shadow-amber-500/50'
              : 'bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 scale-100 shadow-blue-500/50'
          }`}>
            <span className="text-3xl">
              {status === 'speaking' ? '🔊' : status === 'thinking' ? '✦' : '🎙️'}
            </span>
          </div>
        </div>

        {/* Live Status Label */}
        <div className="text-center space-y-1">
          <div className="text-xs font-bold uppercase tracking-widest text-purple-300">
            {status === 'speaking' ? 'Suchi Speaking' : status === 'thinking' ? 'Suchi Thinking...' : 'Listening to You...'}
          </div>
          <p className="text-xs text-white/60">
            {status === 'speaking' ? 'Voice: Strictly Female' : 'Speak naturally. Everything is saved to chat.'}
          </p>
        </div>

        {/* Live Subtitle Transcript */}
        <div className="max-w-md w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-center min-h-[70px] flex items-center justify-center">
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
            {liveTranscript ? `"${liveTranscript}"` : suchiReply}
          </p>
        </div>
      </div>

      {/* Bottom Done Button */}
      <div className="w-full max-w-sm flex items-center justify-center pb-4">
        <button
          onClick={handleStopAndClose}
          className="w-full py-3.5 rounded-2xl bg-white text-black font-bold text-sm shadow-xl hover:bg-slate-200 transition-transform active:scale-95"
        >
          Done Talking (Return to Chat)
        </button>
      </div>
    </div>
  );
}
