'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ArchiveChat {
  id: string;
  user_email: string;
  title: string;
  meaningful_outcome?: string;
  outcome_status?: string;
  is_locked?: boolean;
  is_starred?: boolean;
  is_incognito?: boolean;
  markdown_content?: string;
  message_count?: number;
  duration?: string;
  has_files?: boolean;
  has_voice?: boolean;
  created_at: string;
  updated_at?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: any[];
  created_at?: string;
}

export default function ArchivePage() {
  const [chats, setChats] = useState<ArchiveChat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChatMessages, setSelectedChatMessages] = useState<ChatMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'starred' | 'locked'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileDetailView, setMobileDetailView] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('suchi_theme');
      const isDark = savedTheme === 'dark' || (!savedTheme && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
      setIsDarkMode(isDark);
      document.documentElement.classList.toggle('dark', isDark);
    } catch (e) {}
  }, []);

  // Fetch all chats for user
  async function loadChats() {
    setIsLoading(true);
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const data = await res.json();
        const list: ArchiveChat[] = data.chats || [];
        setChats(list);
        if (list.length > 0 && !selectedChatId) {
          setSelectedChatId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load archive chats:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadChats();
  }, []);

  // Fetch detailed messages for selected chat
  useEffect(() => {
    if (!selectedChatId) return;
    async function loadSelectedChat(id: string) {
      setIsLoadingChat(true);
      try {
        const res = await fetch(`/api/chats/${id}`);
        if (res.ok) {
          const data = await res.json();
          setSelectedChatMessages(data.messages || []);
        }
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      } finally {
        setIsLoadingChat(false);
      }
    }
    loadSelectedChat(selectedChatId);
  }, [selectedChatId]);

  // Toggle star
  async function handleToggleStar(chatId: string, e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chats/${chatId}/star`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_starred: data.is_starred } : c));
      }
    } catch (err) {
      console.error('Failed to toggle star:', err);
    }
  }

  // Delete chat
  async function handleDeleteChat(chatId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to permanently delete this conversation from archive?')) return;
    try {
      const res = await fetch(`/api/chats/${chatId}`, { method: 'DELETE' });
      if (res.ok) {
        const remaining = chats.filter(c => c.id !== chatId);
        setChats(remaining);
        if (selectedChatId === chatId) {
          setSelectedChatId(remaining.length > 0 ? remaining[0].id : null);
          setSelectedChatMessages([]);
          setMobileDetailView(false);
        }
      }
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  }

  // Export as Markdown file
  function handleExportMarkdown(chat: ArchiveChat) {
    const title = chat.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const mdContent = chat.markdown_content || selectedChatMessages.map(m => `### ${m.role === 'user' ? 'User' : 'Suchi'}\n\n${m.content}`).join('\n\n---\n\n');
    const fullDoc = `# ${chat.title}\n\n**Date**: ${new Date(chat.created_at).toLocaleString()}\n**Outcome**: ${chat.meaningful_outcome || 'None'}\n\n---\n\n${mdContent}`;
    const blob = new Blob([fullDoc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'conversation'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Open in active chat
  function handleOpenInActiveChat(chat: ArchiveChat) {
    try {
      const payload = {
        activeSlot: 1,
        slot1: {
          id: chat.id,
          messages: selectedChatMessages,
          outcome: chat.meaningful_outcome || '',
          outcomeStatus: chat.outcome_status || 'NONE',
          locked: Boolean(chat.is_locked),
        },
      };
      localStorage.setItem('suchi_active_session_v2', JSON.stringify(payload));
    } catch (e) {}
    window.location.href = '/';
  }

  // Use context in new chat
  function handleUseContextInNewChat(chat: ArchiveChat) {
    try {
      const contextSummary = `# Context from: ${chat.title}\n${chat.markdown_content || selectedChatMessages.map(m => `- ${m.role}: ${m.content.slice(0, 150)}`).join('\n')}`;
      const payload = {
        activeSlot: 1,
        slot1: {
          id: crypto.randomUUID(),
          messages: [
            {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `I've attached context from **"${chat.title}"**. How would you like to build on this?`,
            }
          ],
          outcome: '',
          outcomeStatus: 'NONE',
          locked: false,
          attachedFiles: [
            {
              name: 'prior_context.md',
              size: `${(contextSummary.length / 1024).toFixed(1)} KB`,
              content: contextSummary,
            }
          ]
        },
      };
      localStorage.setItem('suchi_active_session_v2', JSON.stringify(payload));
    } catch (e) {}
    window.location.href = '/';
  }

  const filteredChats = chats.filter(chat => {
    if (filterTab === 'starred' && !chat.is_starred) return false;
    if (filterTab === 'locked' && !chat.is_locked) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = chat.title?.toLowerCase().includes(q);
      const matchOutcome = chat.meaningful_outcome?.toLowerCase().includes(q);
      const matchContent = chat.markdown_content?.toLowerCase().includes(q);
      if (!matchTitle && !matchOutcome && !matchContent) return false;
    }
    return true;
  });

  const selectedChat = chats.find(c => c.id === selectedChatId);

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'bg-[#0a0f1d] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Top Navbar */}
      <header className={`h-16 px-4 sm:px-6 border-b flex items-center justify-between flex-shrink-0 z-20 ${
        isDarkMode ? 'bg-[#0f172a]/90 border-slate-800 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all hover:scale-105 active:scale-95 ${
              isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span>←</span>
            <span>Back to Chat</span>
          </Link>
          <div className="h-4 w-px bg-slate-700/50" />
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-sm sm:text-base font-bold tracking-tight">Chats Archive</h1>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {chats.length} saved
            </span>
          </div>
        </div>

        {/* Search Bar - Absolutely ZERO placeholders */}
        <div className="flex items-center gap-2 max-w-xs sm:max-w-md w-full ml-4">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conversations"
              className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border outline-none transition-all ${
                isDarkMode
                  ? 'bg-slate-900 border-slate-700 focus:border-blue-500 text-slate-100'
                  : 'bg-white border-slate-200 focus:border-blue-500 text-slate-800 shadow-2xs'
              }`}
            />
          </div>
        </div>
      </header>

      {/* Main Two-Pane Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Conversation List */}
        <aside className={`w-full md:w-80 lg:w-96 border-r flex flex-col flex-shrink-0 transition-all ${
          mobileDetailView ? 'hidden md:flex' : 'flex'
        } ${isDarkMode ? 'border-slate-800 bg-[#0d1326]' : 'border-slate-200 bg-white'}`}>
          {/* Filter Pills */}
          <div className="p-3 border-b border-inherit flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setFilterTab('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({chats.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('starred')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                filterTab === 'starred'
                  ? 'bg-amber-600 text-white'
                  : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>★</span>
              <span>Starred ({chats.filter(c => c.is_starred).length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterTab('locked')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterTab === 'locked'
                  ? 'bg-purple-600 text-white'
                  : isDarkMode
                  ? 'text-slate-400 hover:bg-slate-800'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Locked ({chats.filter(c => c.is_locked).length})
            </button>
          </div>

          {/* Chat List Scrollable */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading conversation archive...</div>
            ) : filteredChats.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {searchQuery ? 'No conversations match your search.' : 'No conversations saved in archive yet.'}
              </div>
            ) : (
              filteredChats.map(chat => {
                const isSelected = chat.id === selectedChatId;
                const formattedDate = new Date(chat.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setSelectedChatId(chat.id);
                      setMobileDetailView(true);
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative group ${
                      isSelected
                        ? isDarkMode
                          ? 'bg-slate-800/90 border-blue-500/60 shadow-md'
                          : 'bg-blue-50/80 border-blue-300 shadow-xs'
                        : isDarkMode
                        ? 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h2 className="text-xs sm:text-sm font-semibold truncate flex-1 text-slate-100 dark:text-slate-100">
                        {chat.title || 'Untitled Conversation'}
                      </h2>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(chat.id, e)}
                          title={chat.is_starred ? 'Remove Star' : 'Star Chat'}
                          className={`p-1 rounded-md transition-all ${
                            chat.is_starred ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                          }`}
                        >
                          ★
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          title="Delete Chat"
                          className="p-1 rounded-md text-slate-400 hover:text-red-400 opacity-60 group-hover:opacity-100 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {chat.meaningful_outcome && (
                      <p className="text-[11px] text-blue-400 line-clamp-1 mb-1 font-medium">
                        Target: {chat.meaningful_outcome}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>{formattedDate}</span>
                      <div className="flex items-center gap-1.5">
                        {chat.is_locked && (
                          <span className="px-1.5 py-0.2 rounded-md bg-purple-950 text-purple-300 border border-purple-800/50">
                            Locked
                          </span>
                        )}
                        <span>{chat.message_count || 1} msgs</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Column: Full Dialogue Preview & Actions */}
        <main className={`flex-1 flex flex-col overflow-hidden ${
          !mobileDetailView ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedChat ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Conversation Top Header */}
              <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 flex-shrink-0 ${
                isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => setMobileDetailView(false)}
                    className="md:hidden p-1.5 rounded-lg border text-xs"
                  >
                    ← List
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-sm sm:text-base font-bold truncate">
                      {selectedChat.title}
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Created on {new Date(selectedChat.created_at).toLocaleString()} • {selectedChat.message_count || selectedChatMessages.length} exchanges
                    </p>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleOpenInActiveChat(selectedChat)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
                  >
                    <span>💬 Open in Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUseContextInNewChat(selectedChat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 ${
                      isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>📄 Take Context to New Chat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportMarkdown(selectedChat)}
                    title="Export Markdown File"
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      isDarkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>Export .md</span>
                  </button>
                </div>
              </div>

              {/* Conversation Messages Scrollable View */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 max-w-4xl w-full mx-auto">
                {isLoadingChat ? (
                  <div className="py-12 text-center text-xs text-slate-500">Loading conversation messages...</div>
                ) : selectedChatMessages.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500">
                    <p className="mb-2">No individual messages found. Showing full saved transcript:</p>
                    <div className="p-4 rounded-xl border text-left font-mono text-xs whitespace-pre-wrap bg-slate-900 border-slate-800">
                      {selectedChat.markdown_content || 'No transcript available.'}
                    </div>
                  </div>
                ) : (
                  selectedChatMessages.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id || index}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
                            {isUser ? 'User' : 'Suchi'}
                          </span>
                        </div>
                        <div className={`p-4 rounded-2xl max-w-[90%] text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : isDarkMode
                            ? 'bg-slate-800/90 text-slate-100 rounded-bl-xs border border-slate-700/60'
                            : 'bg-white text-slate-900 rounded-bl-xs border border-slate-200 shadow-2xs'
                        }`}>
                          <ReactMarkdown remarkPlugins={[remarkGfm]} className="markdown-body">
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
              <svg className="w-12 h-12 mb-3 stroke-slate-600" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h2 className="text-sm font-semibold text-slate-400">Select a conversation from the archive</h2>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                View previous strategy sessions, export markdown transcripts, or open directly in chat.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
