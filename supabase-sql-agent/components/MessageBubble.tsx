import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <span className="text-xs text-gray-500 bg-dark-card px-2 py-1 rounded border border-dark-border">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold ${
          isUser ? 'bg-white text-black' : 'bg-brand-600 text-white'
        }`}>
          {isUser ? 'U' : 'AI'}
        </div>

        {/* Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser 
              ? 'bg-white text-black rounded-tr-sm' 
              : 'bg-dark-card border border-dark-border text-gray-100 rounded-tl-sm shadow-sm'
          } ${message.isError ? 'border-red-500/50 bg-red-900/10 text-red-200' : ''}`}>
            {message.content}
          </div>
          <span className="text-[10px] text-gray-500 mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};