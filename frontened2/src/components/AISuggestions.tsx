import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, X, Brain, Smile, Briefcase, Heart, Users, Theater, Laugh, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAIStore, ConversationTone } from "@/stores/useAIStore";

interface AISuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  onClose: () => void;
  isVisible: boolean;
  onRefresh?: () => void;
}

const toneOptions: Array<{ value: ConversationTone; label: string; icon: any; color: string; bg: string }> = [
  { value: 'casual',       label: 'Casual',       icon: Smile,    color: 'text-blue-500',   bg: 'bg-blue-500/10 border-blue-500/30' },
  { value: 'professional', label: 'Pro',           icon: Briefcase,color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/30' },
  { value: 'flirty',       label: 'Flirty',        icon: Heart,    color: 'text-pink-500',   bg: 'bg-pink-500/10 border-pink-500/30' },
  { value: 'friendly',     label: 'Friendly',      icon: Users,    color: 'text-green-500',  bg: 'bg-green-500/10 border-green-500/30' },
  { value: 'formal',       label: 'Formal',        icon: Theater,  color: 'text-indigo-500', bg: 'bg-indigo-500/10 border-indigo-500/30' },
  { value: 'humorous',     label: 'Funny',         icon: Laugh,    color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30' },
];

export const AISuggestions = ({ onSuggestionClick, onClose, isVisible, onRefresh }: AISuggestionsProps) => {
  const {
    replySuggestions,
    isLoadingSuggestions,
    isAIEnabled,
    selectedTone,
    setSelectedTone,
  } = useAIStore();

  if (!isAIEnabled || !isVisible) return null;

  const currentToneOption = toneOptions.find(t => t.value === selectedTone)!;

  return (
    <AnimatePresence>
      {(isLoadingSuggestions || replySuggestions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute bottom-16 left-0 right-0 z-50"
        >
          <Card className="mx-2 bg-card/98 backdrop-blur-xl border border-border shadow-2xl">
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
                  <Bot className="h-3.5 w-3.5 text-white" />
                </div>
                <div>
                  <span className="text-sm font-semibold">AI Suggestions</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {currentToneOption && <currentToneOption.icon className={`h-3 w-3 ${currentToneOption.color}`} />}
                    <span className={`text-xs capitalize ${currentToneOption?.color}`}>{selectedTone} tone</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {onRefresh && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onRefresh}
                    disabled={isLoadingSuggestions}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                    title="Refresh suggestions"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isLoadingSuggestions ? 'animate-spin' : ''}`} />
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={onClose} className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ── Tone Selector ── */}
            <div className="px-4 pt-3 pb-2">
              <p className="text-xs text-muted-foreground mb-2 font-medium">Change tone</p>
              <div className="flex flex-wrap gap-1.5">
                {toneOptions.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = selectedTone === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedTone(opt.value)}
                      className={`
                        flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all
                        ${isSelected
                          ? `${opt.bg} ${opt.color} border-current shadow-sm`
                          : 'bg-muted/40 text-muted-foreground border-border hover:bg-muted'
                        }
                      `}
                    >
                      <Icon className={`h-3 w-3 ${isSelected ? opt.color : ''}`} />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Loading ── */}
            {isLoadingSuggestions && (
              <div className="flex items-center gap-3 px-4 py-5">
                <div className="flex space-x-1">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  ))}
                </div>
                <div>
                  <p className="text-sm font-medium">Generating suggestions…</p>
                  <p className="text-xs text-muted-foreground">Analysing conversation context</p>
                </div>
              </div>
            )}

            {/* ── Suggestions ── */}
            {!isLoadingSuggestions && replySuggestions.length > 0 && (
              <div className="px-4 pb-3 space-y-1.5 max-h-64 overflow-y-auto">
                {replySuggestions.map((s, i) => (
                  <motion.button
                    key={`${selectedTone}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => onSuggestionClick(s.suggestion)}
                    className="w-full text-left px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-muted border border-transparent hover:border-purple-300/40 transition-all group"
                  >
                    <p className="text-sm text-foreground group-hover:text-purple-600 transition-colors leading-relaxed">
                      {s.suggestion}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Brain className="h-3 w-3 text-purple-400" />
                      <span className="text-xs text-muted-foreground">{Math.round(s.confidence * 100)}% confidence</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <Sparkles className="h-3 w-3 text-blue-400" />
                      <span className={`text-xs capitalize ${currentToneOption?.color}`}>{s.tone || selectedTone}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* ── Footer tip ── */}
            {!isLoadingSuggestions && replySuggestions.length > 0 && (
              <div className="px-4 pb-3 pt-1 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  💡 Click a suggestion to use it, or change the tone for different styles
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
