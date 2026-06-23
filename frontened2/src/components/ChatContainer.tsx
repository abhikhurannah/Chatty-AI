import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Video, MoreVertical, Heart, ThumbsUp, Smile, Star, CheckCheck, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { MessageInput } from "./MessageInput";
import { ImageViewer } from "./ImageViewer";
import { AIAnalysis } from "./AIAnalysis";
import { formatMessageTime } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface User {
  _id: string;
  fullname: string;
  email: string;
  profilePic?: string;
}

interface ChatContainerProps {
  selectedUser: User;
}

export const ChatContainer = ({ selectedUser }: ChatContainerProps) => {
  const { messages, getMessages, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt: string } | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});
  const [showAnalysis, setShowAnalysis] = useState(false);

  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();
      
      return () => {
        unsubscribeFromMessages();
      };
    }
  }, [selectedUser?._id, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessageReactions((prev) => {
      const reactions = prev[messageId] || [];
      const hasReaction = reactions.includes(emoji);
      
      if (hasReaction) {
        // Remove reaction
        return {
          ...prev,
          [messageId]: reactions.filter((r) => r !== emoji),
        };
      } else {
        // Add reaction (limit to 3 reactions per message)
        if (reactions.length >= 3) return prev;
        return {
          ...prev,
          [messageId]: [...reactions, emoji],
        };
      }
    });
    setHoveredMessage(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-10 h-10 mx-auto mb-4 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Chat Header */}
      <motion.div 
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 lg:px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative">
              <Avatar className="h-11 w-11 lg:h-12 lg:w-12 border-2 border-border">
                <AvatarImage src={selectedUser.profilePic} alt={selectedUser.fullname} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
                  {getInitials(selectedUser.fullname)}
                </AvatarFallback>
              </Avatar>
              
              {isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base lg:text-lg truncate">
                {selectedUser.fullname}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setShowAnalysis(true)}
              className="h-9 w-9 text-muted-foreground hover:text-purple-600 hover:bg-purple-50"
              title="AI Analysis"
            >
              <BarChart3 className="h-5 w-5" />
            </Button>
            
            {[Phone, Video, MoreVertical].map((Icon, i) => (
              <Button 
                key={i}
                size="icon" 
                variant="ghost" 
                className="h-9 w-9 text-muted-foreground hover:text-foreground"
              >
                <Icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 lg:p-6 space-y-3">
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => {
                const isCurrentUser = message.senderId === authUser?._id;
                const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;
              
              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
                  onMouseEnter={() => setHoveredMessage(message._id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {showAvatar ? (
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={isCurrentUser ? authUser?.profilePic : selectedUser.profilePic} 
                          alt={isCurrentUser ? authUser?.fullname : selectedUser.fullname}
                        />
                        <AvatarFallback className="text-xs bg-muted text-muted-foreground">
                          {isCurrentUser 
                            ? (authUser?.fullname ? getInitials(authUser.fullname) : "ME")
                            : getInitials(selectedUser.fullname)
                          }
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isCurrentUser ? "items-end" : "items-start"}`}>
                    {/* Message Bubble */}
                    <div className="relative group">
                      <Card
                        className={`
                          p-3 max-w-full border transition-all
                          ${isCurrentUser
                            ? "bg-primary text-primary-foreground border-primary/20 rounded-2xl rounded-br-sm"
                            : "bg-card text-card-foreground border-border rounded-2xl rounded-bl-sm"
                          }
                        `}
                      >
                        {/* Message Image */}
                        {message.image && (
                          <div 
                            className="mb-2 rounded-lg overflow-hidden cursor-pointer"
                            onClick={() => setSelectedImage({ src: message.image!, alt: "Chat image" })}
                          >
                            <img
                              src={message.image}
                              alt="Attachment"
                              className="max-w-full max-h-60 rounded-lg object-cover hover:opacity-90 transition-opacity"
                            />
                          </div>
                        )}
                        
                        {/* Message Text */}
                        {message.text && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                            {message.text}
                          </p>
                        )}

                        {/* Timestamp */}
                        <div className={`flex items-center gap-1 mt-1 text-xs ${isCurrentUser ? 'opacity-80' : 'text-muted-foreground'}`}>
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {isCurrentUser && (
                            <CheckCheck size={14} />
                          )}
                        </div>

                        {/* Quick Reactions */}
                        <AnimatePresence>
                          {hoveredMessage === message._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className={`absolute -top-8 ${isCurrentUser ? "right-0" : "left-0"} flex gap-0.5 bg-card border border-border rounded-full p-1 shadow-lg z-10`}
                            >
                              {[
                                { Icon: Heart, emoji: "❤️" },
                                { Icon: ThumbsUp, emoji: "👍" },
                                { Icon: Smile, emoji: "😊" },
                                { Icon: Star, emoji: "⭐" }
                              ].map(({ Icon, emoji }, i) => (
                                <motion.button
                                  key={i}
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleReaction(message._id, emoji)}
                                  className={`p-1.5 hover:bg-muted rounded-full transition-colors ${
                                    messageReactions[message._id]?.includes(emoji)
                                      ? "text-primary bg-primary/10"
                                      : "text-muted-foreground hover:text-foreground"
                                  }`}
                                  title={`React with ${emoji}`}
                                >
                                  <Icon size={14} />
                                </motion.button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Display Reactions */}
                        {messageReactions[message._id]?.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex gap-1 mt-2 flex-wrap"
                          >
                            {messageReactions[message._id].map((emoji, i) => (
                              <motion.span
                                key={i}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="inline-flex items-center px-2 py-0.5 bg-muted/50 border border-border rounded-full text-xs cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => handleReaction(message._id, emoji)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {emoji}
                              </motion.span>
                            ))}
                          </motion.div>
                        )}
                      </Card>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Empty State */}
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center px-4"
            >
              <div className="w-16 h-16 mb-4 bg-muted rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No messages yet
              </h3>
              
              <p className="text-muted-foreground">
                Send a message to start the conversation with <span className="font-medium text-foreground">{selectedUser.fullname}</span>
              </p>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      </div>

      {/* Message Input */}
      <div className="p-2 sm:p-4 lg:px-6 lg:pb-6 border-t border-border bg-card/30">
        <MessageInput selectedUser={selectedUser} />
      </div>

      {/* Image Viewer */}
      <ImageViewer
        src={selectedImage?.src || ""}
        alt={selectedImage?.alt || ""}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />

      {/* AI Analysis */}
      <AIAnalysis
        selectedUserId={selectedUser._id}
        userName={selectedUser.fullname}
        isVisible={showAnalysis}
        onClose={() => setShowAnalysis(false)}
      />
    </div>
  );
};