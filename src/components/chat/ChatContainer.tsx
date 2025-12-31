import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { EmptyState } from './EmptyState';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '@/hooks/useChat';

export function ChatContainer() {
  const { messages, isLoading, sendMessage, clearMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSuggestionClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const showTypingIndicator = isLoading && messages.length > 0 && !messages[messages.length - 1]?.isStreaming;

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader onNewChat={clearMessages} />
      
      <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
        {messages.length === 0 ? (
          <EmptyState onSuggestionClick={handleSuggestionClick} />
        ) : (
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {showTypingIndicator && <TypingIndicator key="typing" />}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </main>

      <ChatInput 
        onSend={sendMessage} 
        isLoading={isLoading} 
      />
    </div>
  );
}
