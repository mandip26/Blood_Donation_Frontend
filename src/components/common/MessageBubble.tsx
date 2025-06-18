import React from "react";
import { ChatMessage } from "@/types/chatbot";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`flex items-start gap-3 ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600"
            : "bg-gradient-to-r from-red-500 to-pink-500"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-white" />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-tr-md"
            : "bg-gray-100 text-gray-800 rounded-tl-md"
        }`}
      >
        {" "}
        <div
          className={`text-sm leading-relaxed formatted-message ${
            isUser ? "text-white" : "text-gray-800"
          }`}
          dangerouslySetInnerHTML={{
            __html: message.content,
          }}
          style={{
            // Custom CSS for formatted content
            wordWrap: "break-word",
            overflowWrap: "break-word",
          }}
        />
        <p
          className={`text-xs mt-2 ${
            isUser ? "text-blue-100" : "text-gray-500"
          }`}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
