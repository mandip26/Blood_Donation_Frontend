export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  include_sources?: boolean;
}

export interface SourceDocument {
  content: string;
  metadata: Record<string, any>;
}

export interface ChatResponse {
  message: string;
  sources?: SourceDocument[];
  timestamp: string;
  formatted?: boolean;
  messageAnalysis?: {
    categories: string[];
    keywords: string[];
    isBloodDonationRelated: boolean;
  };
}

export interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sessionId?: string;
}
