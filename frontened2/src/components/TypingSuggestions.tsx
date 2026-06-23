import { motion, AnimatePresence } from "framer-motion";
import { Zap, ChevronRight } from "lucide-react";

interface TypingSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  isVisible: boolean;
}

export const TypingSuggestions = ({ suggestions, onSuggestionClick, isVisible }: TypingSuggestionsProps) => {
  if (!isVisible || suggestions.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-0 right-0 mb-1 z-40"
      >
        <div className="bg-card/95 backdrop-blur-lg border border-border rounded-lg shadow-lg p-2 max-h-32 overflow-y-auto">
          <div className="flex items-center gap-1 mb-1 px-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span className="text-xs text-muted-foreground font-medium">Quick complete</span>
          </div>
          
          <div className="space-y-1">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSuggestionClick(suggestion)}
                className="w-full text-left px-2 py-1.5 rounded text-sm text-foreground hover:bg-muted/80 transition-colors group flex items-center gap-2"
              >
                <span className="flex-1 truncate">{suggestion}</span>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};