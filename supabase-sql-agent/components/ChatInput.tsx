import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    onSend(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      <form 
        onSubmit={handleSubmit}
        className="relative flex items-end gap-2 bg-dark-card border border-dark-border rounded-xl p-2 shadow-lg ring-1 ring-white/5 focus-within:ring-brand-500/50 focus-within:border-brand-500/50 transition-all duration-200"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Pregunta a tu base de datos (e.g., 'Top 10 usuarios activos')..."
          className="w-full bg-transparent text-white placeholder-gray-500 text-sm p-3 resize-none focus:outline-none max-h-[120px] min-h-[44px]"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={`p-2.5 rounded-lg mb-0.5 transition-all duration-200 flex items-center justify-center
            ${!input.trim() || isLoading 
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/20'
            }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          )}
        </button>
      </form>
      <div className="text-center mt-2">
        <p className="text-[10px] text-gray-600">
          El agente solo puede ejecutar queries de lectura (SELECT).
        </p>
      </div>
    </div>
  );
};