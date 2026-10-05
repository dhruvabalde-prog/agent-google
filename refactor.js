const fs = require('fs');
let content = fs.readFileSync('app/page.tsx', 'utf8');

const newHeader = `<header className={\`h-16 border-b px-3.5 sm:px-5 flex items-center justify-between z-20 transition-all \${
  isIncognito
    ? 'bg-[#151125]/90 border-purple-900/40 backdrop-blur-md text-purple-100'
    : isDarkMode
    ? 'bg-[#111827]/90 border-slate-800/80 backdrop-blur-md text-slate-100'
    : 'bg-white/90 border-slate-200/80 backdrop-blur-md text-slate-800 shadow-xs'
}\`}>
  {/* Left: Brand - Life OS Logo (Tapping opens Left Drawer) */}
  <button
    type="button"
    onClick={() => setIsModeDrawerOpen(true)}
    title="Open Life OS Navigation Drawer"
    className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 group cursor-pointer text-left focus:outline-none"
  >
    <span className={\`w-8 h-8 rounded-xl flex items-center justify-center p-1.5 shadow-sm transition-all group-hover:scale-105 active:scale-95 \${
      isIncognito
        ? 'bg-purple-950 border border-purple-700/60 shadow-purple-950/50'
        : isDarkMode
        ? 'bg-slate-900 border border-slate-800'
        : 'bg-slate-950 border border-slate-800'
    }\`}>
      <svg viewBox="0 0 24 24" className="w-full h-full text-white dark:text-slate-100" fill="currentColor">
        <path d="M12 2L2 22h20L12 2z" />
      </svg>
    </span>
    <div>
      <h1 className="font-bold text-sm sm:text-[15px] leading-tight tracking-tight">Life OS</h1>
    </div>
  </button>
</header>`;

// 1. Replace Header
const headerStart = content.indexOf('<header className={`h-16 border-b px-3.5 sm:px-5 flex items-center justify-between z-20 transition-all');
const headerEnd = content.indexOf('</header>', headerStart) + '</header>'.length;
if (headerStart !== -1 && headerEnd !== -1) {
  content = content.substring(0, headerStart) + newHeader + content.substring(headerEnd);
}

// 2. Replace Drawer
const drawerStart = content.indexOf('{/* RIGHT TOP DRAWER: HOME & LIFE DUAL MODE COCKPIT */}');
const drawerEndStr = '{/* End Mode Drawer */}';
// Right Top Drawer ends with `)}` at some point. Let's find exactly how it ends.
// Wait, since {isModeDrawerOpen && ...} wraps the drawer, the easiest way is to use replace for the exact drawer content.
// BUT we couldn't find {/* End Mode Drawer */}. What's the last line of the drawer?
// It was:
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}
//
//         {/* FULLSCREEN ACTIONS DECK
const actualDrawerEndStr = '{/* FULLSCREEN ACTIONS DECK';
const drawerEndIndex = content.indexOf(actualDrawerEndStr, drawerStart);

const newDrawer = `{/* LEFT NAVIGATION DRAWER */}
{isModeDrawerOpen && (
  <div className="fixed inset-0 z-50 flex justify-start">
    {/* Backdrop */}
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={() => setIsModeDrawerOpen(false)}
    />

    {/* Drawer Panel */}
    <div className={\`relative w-full max-w-[280px] h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-200 border-r \${
      isDarkMode || isIncognito
        ? 'bg-slate-900 border-slate-800 text-slate-100'
        : 'bg-white border-slate-200 text-slate-800'
    }\`}>
      {/* Top: Home/Work Toggle */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => handleModeChange('home')}
            className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${chatMode === 'home' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
          >
            Home
          </button>
          <button
            onClick={() => handleModeChange('work')}
            className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${chatMode === 'work' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}
          >
            Work
          </button>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <button onClick={() => { setActiveView('chat'); setIsModeDrawerOpen(false); }} className={\`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors \${activeView === 'chat' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}\`}>
          <span>💬</span> Chats
        </button>
        <button onClick={() => { setActiveView('myday'); setIsModeDrawerOpen(false); }} className={\`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors \${activeView === 'myday' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}\`}>
          <span>☀️</span> My Day & Goals
        </button>
        <button onClick={() => { setActiveView('dashboards'); setIsModeDrawerOpen(false); }} className={\`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors \${activeView === 'dashboards' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}\`}>
          <span>📊</span> Dashboards
        </button>
        <button onClick={() => { setActiveView('systems'); setIsModeDrawerOpen(false); }} className={\`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-colors \${activeView === 'systems' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}\`}>
          <span>⚙️</span> Systems & Routines
        </button>
      </div>

      {/* Bottom: Profile & Settings */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
        {userProfile && (
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              {userProfile.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold truncate">{userProfile.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">{userProfile.userType}</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-2">
          <button onClick={toggleDarkMode} className="flex items-center justify-center gap-2 py-2 bg-slate-200 dark:bg-slate-800 rounded-lg text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
            {isDarkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <button onClick={() => { setIsIncognito(!isIncognito); setMessages([]); }} className={\`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-colors \${isIncognito ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700'}\`}>
            🕵️ Incognito
          </button>
        </div>
        
        {isAdmin && (
          <button onClick={() => window.location.href = '/admin'} className="w-full mt-2 py-2 bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex justify-center items-center gap-2">
            Admin Portal ↗
          </button>
        )}
      </div>
    </div>
  </div>
)}

        `;

if (drawerStart !== -1 && drawerEndIndex !== -1) {
  content = content.substring(0, drawerStart) + newDrawer + content.substring(drawerEndIndex);
}

// 3. Replace Empty State safely
const emptyStartStr = '{messages.length === 0 && (';
const emptyStart = content.indexOf(emptyStartStr);

const emptyEndStr = '{(() => {';
const emptyEnd = content.indexOf(emptyEndStr, emptyStart);

const newEmptyState = `{messages.length === 0 && (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">What can I help you with today?</h2>
    <p className="text-sm text-slate-500 max-w-md">Type a message below to search your files, schedule an event, or chat with Life OS.</p>
  </div>
)}

                `;

if (emptyStart !== -1 && emptyEnd !== -1) {
  content = content.substring(0, emptyStart) + newEmptyState + content.substring(emptyEnd);
}

fs.writeFileSync('app/page.tsx', content);
console.log('Update complete.');
