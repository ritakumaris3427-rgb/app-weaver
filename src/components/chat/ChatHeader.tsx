import { motion } from 'framer-motion';
import { Sparkles, Plus, Menu, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onNewChat: () => void;
  onMenuToggle?: () => void;
}

export function ChatHeader({ onNewChat, onMenuToggle }: ChatHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon-sm"
          onClick={onMenuToggle}
          className="md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground text-sm">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Production-ready</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={onNewChat}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </Button>
        
        <Button variant="ghost" size="icon-sm">
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </motion.header>
  );
}
