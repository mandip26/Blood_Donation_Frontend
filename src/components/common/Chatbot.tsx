import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { chatbotService } from "@/services/chatbotService";
import { chatHistoryService } from "@/services/chatHistoryService";
import { ChatMessage, ChatbotState } from "@/types/chatbot";
import MessageBubble from "./MessageBubble";
import gsap from "gsap";

const Chatbot: React.FC = () => {
  // Generate a simple session ID
  const sessionId = useRef<string>(
    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Initialize state with default welcome message
  const getInitialMessages = (): ChatMessage[] => {
    return [
      {
        role: "assistant",
        content:
          "Hello! I'm your Blood Donation Assistant. I can help you with questions about blood donation, health requirements, and donation processes. How can I assist you today?",
        timestamp: new Date().toISOString(),
      },
    ];
  };

  const [state, setState] = useState<ChatbotState>({
    isOpen: false,
    messages: getInitialMessages(),
    isLoading: false,
    error: null,
    sessionId: sessionId.current,
  });
  const [inputMessage, setInputMessage] = useState("");
  const [isServiceHealthy, setIsServiceHealthy] = useState(true);
  const [hasLoadedHistory, setHasLoadedHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const floatingButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  // Auto-save chat history whenever messages change
  useEffect(() => {
    if (state.messages.length > 1) {
      // Don't save just the welcome message
      chatHistoryService.saveChatHistory(
        state.messages,
        state.sessionId || sessionId.current
      );
    }
  }, [state.messages, state.sessionId]);
  // Check service health on mount
  useEffect(() => {
    const checkServiceHealth = async () => {
      try {
        const healthy = await chatbotService.checkHealth();
        setIsServiceHealthy(healthy);
      } catch (error) {
        setIsServiceHealthy(false);
      }
    };

    checkServiceHealth();
  }, []);
  // Load chat history on mount
  useEffect(() => {
    const loadHistory = () => {
      try {
        const history = chatHistoryService.loadChatHistory();
        if (history && history.messages.length > 1) {
          sessionId.current = history.sessionId;
          setState((prev) => ({
            ...prev,
            messages: history.messages,
            sessionId: history.sessionId,
          }));
          setHasLoadedHistory(true);
        }
      } catch (error) {
        console.warn("Failed to load chat history:", error);
      }
    };

    loadHistory();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (chatContainerRef.current) {
      if (state.isOpen) {
        gsap.fromTo(
          chatContainerRef.current,
          {
            opacity: 0,
            scale: 0.8,
            y: 20,
            transformOrigin: "bottom right",
          },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.3,
            ease: "back.out(1.7)",
          }
        );
      }
    }
  }, [state.isOpen]);

  useEffect(() => {
    if (floatingButtonRef.current) {
      gsap.fromTo(
        floatingButtonRef.current,
        { scale: 0, rotation: -180 },
        { scale: 1, rotation: 0, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, []);

  const toggleChatbot = () => {
    setState((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || state.isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    setInputMessage("");

    try {
      const response = await chatbotService.sendMessage({
        message: userMessage.content,
        include_sources: true,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.message,
        timestamp: response.timestamp,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        error: error.message || "Failed to send message",
        isLoading: false,
      }));

      // Check if it's a connection error and update service health
      if (
        error.message.includes("connect") ||
        error.message.includes("network")
      ) {
        setIsServiceHealthy(false);
      }

      // Auto-clear error after 5 seconds
      setTimeout(() => {
        setState((prev) => ({ ...prev, error: null }));
      }, 5000);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = async () => {
    try {
      // Clear session on backend if possible
      if (state.sessionId) {
        await chatbotService.clearSession(state.sessionId);
      }

      // Clear stored history
      chatHistoryService.clearChatHistory();

      // Reset local state with new session
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionId.current = newSessionId;

      setState({
        ...state,
        messages: getInitialMessages(),
        error: null,
        sessionId: newSessionId,
      });
    } catch (error) {
      // If backend clear fails, still clear locally
      chatHistoryService.clearChatHistory();

      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionId.current = newSessionId;

      setState({
        ...state,
        messages: getInitialMessages(),
        error: null,
        sessionId: newSessionId,
      });
    }
  };

  return (
    <>
      {" "}
      {/* Floating Chat Button */}
      <Button
        ref={floatingButtonRef}
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 group sm:h-14 sm:w-14 h-12 w-12"
        size="lg"
      >
        {state.isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform duration-200" />
        )}
      </Button>{" "}
      {/* Chat Container */}
      {state.isOpen && (
        <Card
          ref={chatContainerRef}
          className="fixed bottom-24 right-6 z-40 w-96 h-[500px] shadow-2xl border-0 bg-white/95 backdrop-blur-md max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] sm:w-96 sm:h-[500px]"
        >
          {" "}
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-t-lg p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Bot className="h-5 w-5" />
              Blood Donation Assistant
              <div className="ml-auto flex items-center gap-2">
                <Button
                  onClick={clearConversation}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                  title="Clear conversation"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>{" "}
                <Badge
                  variant="secondary"
                  className={`border-white/30 ${
                    isServiceHealthy
                      ? "bg-green-500/20 text-white"
                      : "bg-red-500/20 text-white"
                  }`}
                >
                  {isServiceHealthy ? "Online" : "Offline"}
                </Badge>
                {hasLoadedHistory && (
                  <span className="chat-history-indicator text-xs">
                    History Restored
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>{" "}
          {/* Messages Area */}
          <CardContent className="p-0 h-full flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="space-y-4">
                {" "}
                {state.messages.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    isUser={message.role === "user"}
                  />
                ))}
                {/* Loading Indicator */}
                {state.isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                        <span className="text-sm text-gray-500">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                {/* Error Message */}
                {state.error && (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-2xl rounded-tl-md px-4 py-3">
                      <p className="text-sm text-red-700">{state.error}</p>
                      <p className="text-xs text-red-500 mt-1">
                        Please try again
                      </p>
                    </div>
                  </div>
                )}{" "}
              </div>
              <div ref={messagesEndRef} />
            </div>{" "}
            {/* Input Area */}
            <div className="p-4 border-t bg-gray-50/50">
              {!isServiceHealthy && (
                <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700 text-center">
                    Chatbot service is offline. Please check your connection.
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    isServiceHealthy
                      ? "Type your message here..."
                      : "Service offline..."
                  }
                  disabled={state.isLoading || !isServiceHealthy}
                  className="rounded-full border-gray-200 focus:border-red-300 focus:ring-red-200"
                />
                <Button
                  onClick={sendMessage}
                  disabled={
                    !inputMessage.trim() || state.isLoading || !isServiceHealthy
                  }
                  className="rounded-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default Chatbot;
