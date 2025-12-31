import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Mic, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim() && !isLoading && !disabled) {
      onSend(input);
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-4xl mx-auto p-4">
        <div className="relative flex items-end gap-2 bg-secondary/50 rounded-2xl border border-border/50 p-2 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="flex-shrink-0 text-muted-foreground hover:text-foreground"
            disabled={disabled || isLoading}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the assistant..."
            disabled={disabled || isLoading}
            rows={1}
            className={cn(
              'flex-1 bg-transparent border-none resize-none text-foreground placeholder:text-muted-foreground focus:outline-none py-2 px-1 text-sm max-h-[200px]',
              'scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent'
            )}
          />

          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              disabled={disabled || isLoading}
            >
              <Mic className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading || disabled}
              variant={input.trim() ? 'glow' : 'ghost'}
              size="icon-sm"
              className={cn(
                'transition-all duration-200',
                input.trim() ? '' : 'text-muted-foreground'
              )}
            >
              {isLoading ? (
                <StopCircle className="w-4 h-4" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        <p className="text-center text-xs text-muted-foreground mt-3">
          Press <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-secondary rounded text-[10px] font-mono">Shift + Enter</kbd> for new line
        </p>
      </div>
    </motion.div>
  );
}
