import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { ChatContainer } from "./ChatContainer";

interface User {
  _id: string;
  fullname: string;
  email: string;
  profilePic?: string;
}

interface ChatAreaProps {
  contact: User | null;
}

export const ChatArea = ({ contact }: ChatAreaProps) => {
  if (!contact) {
    return (
      <div className="flex-1 h-full flex items-center justify-center bg-gradient-to-br from-background to-muted/10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-6 max-w-md mx-auto px-6"
        >
          {/* Logo */}
          <motion.div 
            className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl flex items-center justify-center mb-4"
            animate={{ 
              scale: [1, 1.05, 1],
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <MessageCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
          </motion.div>
          
          {/* Welcome Text */}
          <div className="space-y-3">
            <h3 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center justify-center gap-2">
              Welcome to Chatty{" "}
              <motion.span 
                className="relative inline-block"
                animate={{ 
                  y: [0, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2.5, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
              >
                <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 bg-clip-text text-transparent font-extrabold relative z-10">
                  AI
                </span>
                <motion.span 
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 via-blue-400 to-purple-400 blur-md opacity-40"
                  animate={{ 
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{ 
                    duration: 2.5, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  AI
                </motion.span>
              </motion.span>
            </h3>
            
            <p className="text-muted-foreground text-base lg:text-lg">
              Select a contact to start AI-powered messaging
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 text-sm">
            {[
              { label: "Real-time messages", color: "bg-green-500" },
              { label: "Image sharing", color: "bg-blue-500" },
              { label: "Online status", color: "bg-purple-500" }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border"
              >
                <div className={`w-2 h-2 ${feature.color} rounded-full`}></div>
                <span className="text-muted-foreground">{feature.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full flex flex-col">
      <ChatContainer selectedUser={contact} />
    </div>
  );
};