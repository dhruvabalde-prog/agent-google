'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage, ActionResult, DraftInfo } from '@/lib/types';

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ email: string; name: string; picture: string } | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [draftStatuses, setDraftStatuses] = useState<Map<string, 'approved' | 'rejected'>>(new Map());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  async function sendMessage() {
    if (!input.trim() || isLoading) return;
    
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message');
      }
      
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.content,
        actions: data.actions,
        pendingDraft: data.pendingDraft,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: err?.message || 'Sorry, something went wrong. Please try again.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDraftAction = async (draftId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/drafts/${draftId}/${action}`, {
        method: 'POST',
      });
      
      if (res.ok) {
        setDraftStatuses(prev => {
          const newMap = new Map(prev);
          newMap.set(draftId, action === 'approve' ? 'approved' : 'rejected');
          return newMap;
        });
      } else {
        console.error(`Failed to ${action} draft`);
      }
    } catch (error) {
      console.error(`Error performing draft action ${action}:`, error);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const setSuggestion = (text: string) => {
    setInput(text);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* HEADER */}
      <header className="fixed top-0 w-full h-14 bg-white border-b border-gray-200 z-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            A
          </div>
          <span className="font-semibold text-lg text-gray-800">Agent Google</span>
        </div>
        
        <div className="flex items-center">
          {isCheckingAuth ? (
            <div className="w-24 h-8 bg-gray-100 rounded animate-pulse"></div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
              <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-gray-200" />
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                title="Sign out"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          )}
        </div>
      </header>

      {/* MESSAGES AREA */}
      <main className="flex-1 overflow-y-auto pt-14 pb-20">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {!isCheckingAuth && messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center">
              {user ? (
                <>
                  <h2 className="text-2xl font-semibold text-gray-400 mb-8">What can I help you with?</h2>
                  <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                    {[
                      'Search the web for...',
                      'Check my recent emails',
                      'Create a new document',
                      "What's on my calendar today?",
                      'Add a task to my list'
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        onClick={() => setSuggestion(suggestion)}
                        className="px-4 py-2 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 text-sm text-gray-600 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-gray-500">
                  <p className="mb-4">Please sign in to chat with Agent Google.</p>
                  <button 
                    onClick={handleLogin}
                    className="inline-flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Sign in with Google
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`max-w-[85%] px-4 py-3 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-2xl rounded-br-md ml-auto' 
                        : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md mr-auto'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    ) : (
                      <div className="markdown-body text-sm prose prose-sm max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  
                  {/* Actions Display */}
                  {msg.role === 'assistant' && msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-col gap-1 mt-2 mr-auto w-full max-w-[85%] pl-2">
                      {msg.actions.map((action, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1 px-2 rounded bg-gray-50 border border-gray-100 w-fit max-w-full">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${action.success ? 'bg-green-500' : 'bg-red-500'}`} />
                          <span className="text-xs text-gray-500 font-medium truncate">{action.tool}</span>
                          <span className="text-xs text-gray-600 truncate">{action.summary}</span>
                          {action.link && (
                            <a href={action.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-700 ml-1 flex-shrink-0">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Draft Card */}
                  {msg.role === 'assistant' && msg.pendingDraft && (
                    <div className="mt-3 mr-auto w-full max-w-[85%]">
                      {(() => {
                        const status = draftStatuses.get(msg.pendingDraft.draftId);
                        
                        if (status === 'approved') {
                          return (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm flex items-center gap-2 text-green-700">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                              Sent successfully
                            </div>
                          );
                        }
                        
                        if (status === 'rejected') {
                          return (
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-sm flex items-center gap-2 text-gray-500">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                              Draft discarded
                            </div>
                          );
                        }

                        // Pending Draft State
                        return (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-amber-800 font-medium text-sm">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                              </svg>
                              Draft Reply
                            </div>
                            
                            <div className="bg-white rounded border border-amber-100 p-3 text-sm">
                              <div className="text-gray-500 mb-1"><span className="font-medium text-gray-700">To:</span> {msg.pendingDraft.to}</div>
                              <div className="text-gray-500 mb-2 pb-2 border-b border-gray-100"><span className="font-medium text-gray-700">Subject:</span> {msg.pendingDraft.subject}</div>
                              <div className="text-gray-700 whitespace-pre-wrap">
                                {msg.pendingDraft.body.length > 200 
                                  ? msg.pendingDraft.body.substring(0, 200) + '...' 
                                  : msg.pendingDraft.body}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-1">
                              <button 
                                onClick={() => handleDraftAction(msg.pendingDraft!.draftId, 'approve')}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                              >
                                Approve & Send
                              </button>
                              <button 
                                onClick={() => handleDraftAction(msg.pendingDraft!.draftId, 'reject')}
                                className="px-3 py-1.5 border border-red-500 text-red-600 hover:bg-red-50 rounded text-sm font-medium transition-colors"
                              >
                                Discard
                              </button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1 px-4 py-3 bg-gray-100 rounded-2xl rounded-bl-md w-fit">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* INPUT BAR */}
      <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex flex-row gap-3 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              disabled={isLoading || (!user && !isCheckingAuth)}
              placeholder={user ? "Message Agent Google..." : "Sign in to send a message..."}
              className="flex-1 resize-none rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent px-4 py-2.5 outline-none max-h-[120px] min-h-[44px] text-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
              rows={1}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || (!user && !isCheckingAuth)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:hover:bg-blue-600 h-11 w-11 flex-shrink-0 flex items-center justify-center transition-colors mb-[1px]"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
