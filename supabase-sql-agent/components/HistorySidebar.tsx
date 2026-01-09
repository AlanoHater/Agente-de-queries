import React from 'react';
import { HistoryItem } from '../types';

interface HistorySidebarProps {
  history: HistoryItem[];
  onSelectQuery: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelectQuery, isOpen, onClose }) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-30
        w-64 bg-dark-card border-r border-dark-border transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-4 border-b border-dark-border flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-200">Historial</h2>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {history.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-8">
              No hay consultas recientes.
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectQuery(item.query);
                  if (window.innerWidth < 768) onClose();
                }}
                className="w-full text-left px-3 py-3 rounded-lg hover:bg-white/5 transition-colors group"
              >
                <p className="text-sm text-gray-300 truncate group-hover:text-white transition-colors">
                  {item.query}
                </p>
                <span className="text-[10px] text-gray-600">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </>
  );
};