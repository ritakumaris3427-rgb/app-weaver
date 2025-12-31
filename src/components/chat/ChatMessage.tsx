import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { Message } from '@/types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex gap-4 px-4 py-6',
        isUser ? 'bg-transparent' : 'bg-card/30'
      )}
    >
      <div className="flex-shrink-0">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center',
            isUser 
              ? 'bg-primary/20 text-primary' 
              : 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
          )}
        >
          {isUser ? (
            <User className="w-4 h-4" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-foreground">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        <div className="text-foreground/90">
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <MarkdownRenderer content={message.content} />
              {message.isStreaming && (
                <span className="inline-block w-2 h-5 bg-primary/80 animate-pulse ml-0.5" />
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
