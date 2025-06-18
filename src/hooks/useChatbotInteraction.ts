import { useState, useCallback } from "react";
import { chatbotService } from "@/services/chatbotService";
import { ChatMessage } from "@/types/chatbot";

export const useChatbotInteraction = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (message: string): Promise<ChatMessage | null> => {
      if (!message.trim()) return null;

      setIsLoading(true);
      setError(null);

      try {
        const response = await chatbotService.sendMessage({
          message: message.trim(),
          include_sources: true,
        });

        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: response.message,
          timestamp: response.timestamp,
        };

        return assistantMessage;
      } catch (err: any) {
        const errorMessage = err.message || "Failed to send message";
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      return await chatbotService.checkHealth();
    } catch (error) {
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    sendMessage,
    checkHealth,
    clearError,
    isLoading,
    error,
  };
};
