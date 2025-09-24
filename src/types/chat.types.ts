// src/types/chat.types.ts

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
  messages: Array<{
    id: string;
    conversation_id: string;
    role: string;
    content: string;
    created_at: string;
  }>;
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
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIResponse {
  output_text?: string;
}
