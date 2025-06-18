import { ChatMessage } from "@/types/chatbot";

const CHAT_HISTORY_KEY = "bloodDonation_chatHistory";
const CHAT_TIMESTAMP_KEY = "bloodDonation_chatTimestamp";
const HISTORY_EXPIRY_HOURS = 24; // 24 hours

export interface ChatHistoryData {
  messages: ChatMessage[];
  sessionId: string;
  timestamp: number;
}

export const chatHistoryService = {
  /**
   * Save chat history to localStorage
   * @param messages Array of chat messages
   * @param sessionId Current session ID
   */
  saveChatHistory(messages: ChatMessage[], sessionId: string): void {
    try {
      const historyData: ChatHistoryData = {
        messages,
        sessionId,
        timestamp: Date.now(),
      };

      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(historyData));
      localStorage.setItem(CHAT_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.warn("Failed to save chat history:", error);
    }
  },

  /**
   * Load chat history from localStorage
   * @returns Chat history data or null if expired/not found
   */
  loadChatHistory(): ChatHistoryData | null {
    try {
      const historyStr = localStorage.getItem(CHAT_HISTORY_KEY);
      const timestampStr = localStorage.getItem(CHAT_TIMESTAMP_KEY);

      if (!historyStr || !timestampStr) {
        return null;
      }

      const timestamp = parseInt(timestampStr);
      const now = Date.now();
      const hoursElapsed = (now - timestamp) / (1000 * 60 * 60);

      // Check if history has expired (older than 24 hours)
      if (hoursElapsed > HISTORY_EXPIRY_HOURS) {
        this.clearChatHistory();
        return null;
      }

      const historyData: ChatHistoryData = JSON.parse(historyStr);

      // Validate the structure
      if (!historyData.messages || !Array.isArray(historyData.messages)) {
        this.clearChatHistory();
        return null;
      }

      return historyData;
    } catch (error) {
      console.warn("Failed to load chat history:", error);
      this.clearChatHistory();
      return null;
    }
  },

  /**
   * Clear chat history from localStorage
   */
  clearChatHistory(): void {
    try {
      localStorage.removeItem(CHAT_HISTORY_KEY);
      localStorage.removeItem(CHAT_TIMESTAMP_KEY);
    } catch (error) {
      console.warn("Failed to clear chat history:", error);
    }
  },

  /**
   * Check if chat history exists and is valid
   * @returns boolean indicating if valid history exists
   */
  hasValidHistory(): boolean {
    const history = this.loadChatHistory();
    return history !== null && history.messages.length > 1; // More than just welcome message
  },

  /**
   * Get time remaining until history expires
   * @returns Hours remaining or 0 if expired/no history
   */
  getTimeRemaining(): number {
    try {
      const timestampStr = localStorage.getItem(CHAT_TIMESTAMP_KEY);
      if (!timestampStr) return 0;

      const timestamp = parseInt(timestampStr);
      const now = Date.now();
      const hoursElapsed = (now - timestamp) / (1000 * 60 * 60);

      return Math.max(0, HISTORY_EXPIRY_HOURS - hoursElapsed);
    } catch (error) {
      return 0;
    }
  },
};
