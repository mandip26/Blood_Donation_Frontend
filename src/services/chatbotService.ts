import axios from "axios";
import { ChatRequest, ChatResponse } from "@/types/chatbot";
import { messageFormatter } from "@/utils/messageFormatter";

// Chatbot API configuration
const CHATBOT_API_BASE_URL =
  import.meta.env.VITE_CHATBOT_API_URL ||
  "https://medi-chatbot-gemini-fastapi.onrender.com/api/v1";

// Create axios instance for chatbot API
const chatbotApi = axios.create({
  baseURL: CHATBOT_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout for chat responses
});

// Request interceptor for token handling
chatbotApi.interceptors.request.use(
  (config) => {
    // Get user data from localStorage
    const userData = localStorage.getItem("bloodDonationUser");
    if (userData) {
      const user = JSON.parse(userData);
      // If token exists in user data, add it to Authorization header
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
chatbotApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      throw new Error(
        "Unable to connect to chatbot service. Please check if the service is running."
      );
    }
    if (error.response?.status === 500) {
      throw new Error("Server error. Please try again later.");
    }
    if (error.response?.status === 404) {
      throw new Error(
        "Chatbot service not found. Please check the configuration."
      );
    }
    throw error;
  }
);

export const chatbotService = {
  /**
   * Send a message to the chatbot
   * @param request Chat request with message and options
   * @returns Promise resolving to chat response
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await chatbotApi.post<ChatResponse>("/chat", request);

      // Format the response message
      const formattedMessage = messageFormatter.formatMessage(
        response.data.message
      );

      return {
        ...response.data,
        message: formattedMessage.text,
        formatted: formattedMessage.isFormatted,
        messageAnalysis: messageFormatter.analyzeContent(response.data.message),
      };
    } catch (error: any) {
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error(error.message || "Failed to send message");
    }
  },
  /**
   * Check if chatbot service is healthy
   * @returns Promise resolving to health status
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Try the specific chat health endpoint first
      const response = await chatbotApi.get("/chat/health");
      return response.status === 200;
    } catch (error) {
      try {
        // Fallback to main health endpoint
        const fallbackResponse = await axios.get(
          "https://medi-chatbot-gemini-fastapi.onrender.com/health"
        );
        return fallbackResponse.status === 200;
      } catch (fallbackError) {
        return false;
      }
    }
  } /**
   * Clear a chat session
   * @param _sessionId Session ID to clear (unused - handled frontend-only)
   * @returns Promise resolving to success status
   */,
  async clearSession(_sessionId: string): Promise<boolean> {
    // Since the backend doesn't have a delete session endpoint,
    // we handle session clearing purely on the frontend side
    return true;
  },
};
