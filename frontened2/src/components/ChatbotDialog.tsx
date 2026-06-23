import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, X, Send, Sparkles, Trash2, Copy, Volume2, 
  MessageCircle, Smile, Briefcase, Heart, Users 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIStore, ConversationTone } from "@/stores/useAIStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import toast from "react-hot-toast";

interface ChatbotDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const toneOptions: Array<{ value: ConversationTone; label: string; icon: any; color: string; description: string }> = [
  { 
    value: 'casual', 
    label: 'Casual', 
    icon: Smile, 
    color: 'bg-blue-500',
    description: 'Relaxed and informal conversation'
  },
  { 
    value: 'professional', 
    label: 'Professional', 
    icon: Briefcase, 
    color: 'bg-purple-500',
    description: 'Business-like and polished'
  },
  { 
    value: 'flirty', 
    label: 'Flirty', 
    icon: Heart, 
    color: 'bg-pink-500',
    description: 'Playful and charming'
  },
  { 
    value: 'friendly', 
    label: 'Friendly', 
    icon: Users, 
    color: 'bg-green-500',
    description: 'Warm and approachable'
  },
];

export const ChatbotDialog = ({ isOpen, onClose }: ChatbotDialogProps) => {
  const [message, setMessage] = useState("");
  const { 
    chatbotMessages, 
    isLoadingChatbot, 
    chatWithBot, 
    clearChatbotMessages,
    selectedTone,
    setSelectedTone 
  } = useAIStore();
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatbotMessages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoadingChatbot) return;

    const userMessage = message;
    setMessage("");

    try {
      await chatWithBot(userMessage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!', { icon: '📋' });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-purple-500/10 to-blue-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Bot className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl flex items-center gap-2">
                  AI Chat Assistant
                  <Badge variant="secondary" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Beta
                  </Badge>
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Your intelligent conversation companion
                </p>
              </div>
            </div>
            {chatbotMessages.length > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  clearChatbotMessages();
                  toast.success('Chat history cleared');
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Tone Selector */}
        <div className="px-6 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-muted-foreground">Conversation Style:</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {toneOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedTone === option.value;
              return (
                <motion.button
                  key={option.value}
                  onClick={() => setSelectedTone(option.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex flex-col items-center gap-1.5 p-3 rounded-lg text-xs font-medium
                    transition-all duration-200 relative overflow-hidden
                    ${isSelected 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : 'bg-background hover:bg-muted border border-border'
                    }
                  `}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="selectedTone"
                      className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500"
                      initial={false}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className="relative flex flex-col items-center gap-1">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-primary'}`} />
                    <span className={isSelected ? 'text-white' : ''}>{option.label}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-4">
            {chatbotMessages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0] 
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-6"
                >
                  <Bot className="h-20 w-20 text-primary/20" />
                </motion.div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Start a conversation!
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  I'm your AI assistant. Ask me anything, practice conversations, or get help with messaging.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-lg">
                  {[
                    "Help me start a conversation",
                    "Give me conversation tips",
                    "Practice a job interview",
                    "Suggest an icebreaker"
                  ].map((suggestion, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setMessage(suggestion)}
                      className="p-3 text-sm text-left bg-muted hover:bg-muted/80 rounded-lg border border-border transition-colors"
                    >
                      💡 {suggestion}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="popLayout">
              {chatbotMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className="flex items-start gap-2">
                      {msg.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <Card className={`
                          p-4 ${msg.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted/50'
                          }
                        `}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                            <span className="text-xs opacity-70">
                              {formatTime(msg.timestamp)}
                            </span>
                            {msg.role === 'assistant' && (
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleCopy(msg.content)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoadingChatbot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-2"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 1, 0.3],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                          className="w-2 h-2 bg-primary rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-6 py-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Type your message... (${selectedTone} tone)`}
              disabled={isLoadingChatbot}
              className="flex-1 h-11 bg-background"
            />
            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoadingChatbot}
              className="h-11 px-6 bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send • The AI adapts to your selected conversation style
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};