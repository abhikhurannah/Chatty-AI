import { motion } from "framer-motion";
import { Bot, BotOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIStore } from "@/stores/useAIStore";

export const AIToggle = () => {
  const { isAIEnabled, toggleAI } = useAIStore();

  console.log('🔘 AIToggle render - AI Enabled:', isAIEnabled);

  const handleToggle = () => {
    console.log('🔄 AI Toggle clicked, current state:', isAIEnabled);
    toggleAI();
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              size="icon"
              variant={isAIEnabled ? "default" : "outline"}
              onClick={handleToggle}
              className={`relative h-10 w-10 ${
                isAIEnabled 
                  ? "bg-gradient-to-br from-purple-500 to-blue-500 hover:opacity-90 text-white" 
                  : "border-muted-foreground/30 hover:border-muted-foreground/50"
              }`}
            >
              {isAIEnabled ? (
                <Bot className="h-5 w-5" />
              ) : (
                <BotOff className="h-5 w-5" />
              )}
              
              {/* Status indicator */}
              <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                isAIEnabled ? "bg-green-400" : "bg-red-400"
              }`}>
                <div className={`w-full h-full rounded-full animate-ping ${
                  isAIEnabled ? "bg-green-400" : "bg-red-400"
                }`} />
              </div>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <span>AI Assistant</span>
            <Badge variant={isAIEnabled ? "default" : "secondary"} className="text-xs">
              {isAIEnabled ? "ON" : "OFF"}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};