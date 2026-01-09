import React, { useState, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { MessageBubble } from './components/MessageBubble';
import { ChatInput } from './components/ChatInput';
import { HistorySidebar } from './components/HistorySidebar';
import { Message, HistoryItem } from './types';

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy tu experto SQL para Supabase. 🤖\n\nPuedo ayudarte a extraer datos sin que escribas código. Por ejemplo:\n\n• "Top 5 productos más vendidos"\n• "Usuarios registrados el último mes"\n• "Total de ventas por categoría"',
      timestamp: Date.now(),
    },
  ]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (content: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    // Add to messages and history
    setMessages((prev) => [...prev, userMsg]);
    setHistory((prev) => [{ id: Date.now().toString(), query: content, timestamp: Date.now() }, ...prev]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: content }),
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${response.status}`);
      }

      const data = await response.json();
      
      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.output,
        timestamp: Date.now(),
      };
      
      setMessages((prev) => [...prev, agentMsg]);
    } catch (error) {
      console.error('Error querying agent:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Lo siento, encontré un problema técnico al consultar la base de datos.\n\nPor favor intenta reformular tu pregunta de manera más sencilla o verifica la conexión.',
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-dark-bg text-white font-sans overflow-hidden">
      <HistorySidebar 
        history={history} 
        onSelectQuery={handleSendMessage}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-full relative w-full">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <main className="flex-1 overflow-y-auto relative scroll-smooth p-4">
          <div className="max-w-3xl mx-auto pt-4 pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start w-full mb-6 animate-pulse">
                <div className="flex max-w-[85%] md:max-w-[70%] gap-3 flex-row">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold bg-brand-600 text-white">
                    AI
                  </div>
                  <div className="flex items-center h-10 px-4 bg-dark-card border border-dark-border rounded-2xl rounded-tl-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        <footer className="w-full bg-dark-bg border-t border-dark-border/50 z-10">
          <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </footer>
      </div>
    </div>
  );
}

export default App;