import React, { createContext, useContext, ReactNode } from "react";
import Chatbot from "@/components/common/Chatbot";

interface ChatbotContextType {
  // This can be extended later if needed for global chatbot state management
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider: React.FC<ChatbotProviderProps> = ({
  children,
}) => {
  const contextValue: ChatbotContextType = {
    // Add any global chatbot state management here if needed
  };

  return (
    <ChatbotContext.Provider value={contextValue}>
      {children}
      <Chatbot />
    </ChatbotContext.Provider>
  );
};

export const useChatbot = (): ChatbotContextType => {
  const context = useContext(ChatbotContext);
  if (context === undefined) {
    throw new Error("useChatbot must be used within a ChatbotProvider");
  }
  return context;
};
