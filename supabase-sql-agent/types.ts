export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isError?: boolean;
}

export interface AgentResponse {
  output: string;
  intermediate_steps?: any[];
}

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: number;
}