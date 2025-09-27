// src/types/chat.types.ts

// Add missing types for better consistency
export type OpenAIRole = 'system' | 'user' | 'assistant'

export interface StoredMessage {
  id: string
  conversation_id: string
  role: OpenAIRole
  content: string
  created_at: string
}

export interface Conversation {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  archived_at?: string | null
}

export interface ConversationListResponse {
  conversations: Conversation[]
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  question: string;
}

export interface ChatResponse {
  answer: string;
  citations: Array<{
    title: string;
    url: string;
  }>;
  count: number;
  window: {
    start: Date;
    end: Date;
  };
}

export interface MessageRequest {
  conversation_id: string;
  content: string;
}

export interface MessageResponse {
  reply: string;
}

export interface ConversationRequest {
  conversation_id: string;
}

export interface ConversationResponse {
  messages: StoredMessage[];
}

export interface NotionContextNote {
  id: string;
  url: string;
  title: string;
  date: string;
  submissionDate: string;
  tldr: string;
  summary: string;
}

export interface OpenAIMessage {
  role: OpenAIRole;
  content: string;
}

export interface OpenAIResponse {
  output_text?: string;
}
