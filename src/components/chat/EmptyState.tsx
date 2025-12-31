import { motion } from 'framer-motion';
import { Sparkles, Code2, Lightbulb, Rocket, Zap } from 'lucide-react';

const suggestions = [
  {
    icon: Code2,
    title: 'Build a component',
    prompt: 'Create a responsive navigation bar with dropdown menus',
  },
  {
    icon: Lightbulb,
    title: 'Get architecture advice',
    prompt: 'How should I structure a React app with authentication?',
  },
  {
    icon: Rocket,
    title: 'Optimize performance',
    prompt: 'Review my code for performance improvements',
  },
  {
    icon: Zap,
    title: 'Debug an issue',
    prompt: 'Help me fix this error in my application',
  },
];

interface EmptyStateProps {
  onSuggestionClick: (prompt: string) => void;
}

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center max-w-2xl"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_hsl(var(--primary)/0.3)]"
        >
          <Sparkles className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl md:text-4xl font-bold mb-3"
        >
          <span className="gradient-text">Production-Grade</span> AI Assistant
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg mb-10"
        >
          Build real, deployable web applications with expert guidance
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => onSuggestionClick(suggestion.prompt)}
              className="group flex items-start gap-3 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <suggestion.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">{suggestion.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{suggestion.prompt}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
