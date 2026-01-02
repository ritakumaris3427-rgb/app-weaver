import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, Paperclip, Smile, Image, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Attachment } from '@/types/chat';
import { EmojiPicker } from './EmojiPicker';
import { AttachmentPreview } from './AttachmentPreview';
import { useMediaGeneration } from '@/hooks/useMediaGeneration';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface ChatInputProps {
  onSend: (message: string, attachments?: Attachment[]) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, generateImage, isGenerating } = useMediaGeneration();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if ((input.trim() || attachments.length > 0) && !isLoading && !disabled) {
      onSend(input, attachments);
      setInput('');
      setAttachments([]);
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

  const handleEmojiSelect = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = input.slice(0, start) + emoji + input.slice(end);
      setInput(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setInput(prev => prev + emoji);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        toast.error('Only images and videos are supported');
        continue;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        continue;
      }

      try {
        const attachment = await uploadFile(file);
        setAttachments(prev => [...prev, attachment]);
      } catch (error) {
        toast.error('Failed to upload file');
      }
    }
    
    e.target.value = '';
  };

  const handleGenerateImage = async () => {
    const prompt = window.prompt('Describe the image you want to generate:');
    if (!prompt) return;

    const placeholderId = Math.random().toString(36).substring(2, 15);
    setAttachments(prev => [...prev, {
      id: placeholderId,
      type: 'image',
      url: '',
      name: `Generating: ${prompt.slice(0, 20)}...`,
      isGenerating: true,
    }]);

    try {
      const attachment = await generateImage(prompt);
      if (attachment) {
        setAttachments(prev => prev.map(a => 
          a.id === placeholderId ? attachment : a
        ));
        toast.success('Image generated successfully!');
      }
    } catch (error) {
      setAttachments(prev => prev.filter(a => a.id !== placeholderId));
      toast.error('Failed to generate image');
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-t border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="max-w-4xl mx-auto p-4">
        <div className="relative flex flex-col bg-secondary/50 rounded-2xl border border-border/50 focus-within:border-primary/50 focus-within:shadow-[0_0_20px_hsl(var(--primary)/0.15)] transition-all duration-300">
          <AttachmentPreview 
            attachments={attachments} 
            onRemove={removeAttachment} 
          />
          
          <div className="flex items-end gap-2 p-2">
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                disabled={disabled || isLoading}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-4 h-4" />
              </Button>
              <EmojiPicker
                isOpen={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelect={handleEmojiSelect}
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                  disabled={disabled || isLoading || isGenerating}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <Paperclip className="w-4 h-4 mr-2" />
                  Upload file
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateImage}>
                  <Image className="w-4 h-4 mr-2" />
                  Generate image
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            
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

            <Button
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0) || isLoading || disabled}
              variant={(input.trim() || attachments.length > 0) ? 'glow' : 'ghost'}
              size="icon-sm"
              className={cn(
                'transition-all duration-200',
                (input.trim() || attachments.length > 0) ? '' : 'text-muted-foreground'
              )}
            >
              <Send className="w-4 h-4" />
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
