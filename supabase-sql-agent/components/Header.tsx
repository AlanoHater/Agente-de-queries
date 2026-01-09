import React from 'react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-dark-border bg-dark-bg/80 backdrop-blur-md sticky top-0 z-10 h-16">
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <div className="w-8 h-8 rounded bg-brand-500 flex items-center justify-center text-black font-bold text-lg">
          S
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white">Supabase Agent</h1>
          <p className="hidden sm:block text-xs text-gray-400">LangChain & OpenAI</p>
        </div>
      </div>
      <div>
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-900/20 text-brand-500 text-xs font-mono border border-brand-900/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
          </span>
          Online
        </span>
      </div>
    </header>
  );
};