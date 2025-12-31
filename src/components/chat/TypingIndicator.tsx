import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex gap-4 px-4 py-6 bg-card/30"
    >
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
      
      <div className="flex items-center gap-1 py-2">
        <div className="typing-indicator flex gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
          <span className="w-2 h-2 rounded-full bg-muted-foreground/60" />
        </div>
      </div>
    </motion.div>
  );
}
