import { useState, useMemo, useEffect } from "react";
import { Search, MessageCircle, Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";

interface User {
  _id: string;
  email: string;
  fullname: string;
  profilePic?: string;
}

interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  createdAt: string;
}

interface FloatingBubblesSidebarProps {
  onSelectContact: (user: User) => void;
  selectedContactId: string | null;
}

export const FloatingBubblesSidebar = ({ onSelectContact, selectedContactId }: FloatingBubblesSidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  
  const { users, getUsers, isUsersLoading, messages } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const getLastMessage = (userId: string): Message | null => {
    const userMessages = messages.filter(
      msg => msg.senderId === userId || msg.receiverId === userId
    );
    return userMessages.length > 0 ? userMessages[userMessages.length - 1] : null;
  };

  const getLastMessageTime = (userId: string): number => {
    const lastMessage = getLastMessage(userId);
    return lastMessage ? new Date(lastMessage.createdAt).getTime() : 0;
  };

  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users;
    
    if (showOnlineOnly) {
      filtered = filtered.filter(user => onlineUsers.includes(user._id));
    }
    
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.fullname.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => {
      const timeA = getLastMessageTime(a._id);
      const timeB = getLastMessageTime(b._id);
      return timeB - timeA;
    });
  }, [users, onlineUsers, showOnlineOnly, searchTerm, messages]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatLastMessage = (message: Message | null, userId: string): string => {
    if (!message) return "No messages yet";
    
    const isFromMe = message.senderId === authUser?._id;
    const prefix = isFromMe ? "You: " : "";
    
    if (message.image && message.text) {
      return `${prefix}📷 ${message.text.slice(0, 30)}${message.text.length > 30 ? '...' : ''}`;
    } else if (message.image) {
      return `${prefix}📷 Photo`;
    } else if (message.text) {
      return `${prefix}${message.text.slice(0, 40)}${message.text.length > 40 ? '...' : ''}`;
    }
    
    return "No messages yet";
  };

  const formatMessageTime = (message: Message | null): string => {
    if (!message) return "";
    
    const messageDate = new Date(message.createdAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? "now" : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d`;
    }
  };

  if (isUsersLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-card/50 border-r border-border">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-3 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-card/30 backdrop-blur-sm border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <MessageCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Messages</h2>
              <p className="text-xs text-muted-foreground">{filteredAndSortedUsers.length} conversations</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 bg-background/50 border-border"
          />
        </div>

        {/* Online Filter */}
        <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
          <div className="relative">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${showOnlineOnly ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
              {showOnlineOnly && <Check className="w-3 h-3 text-primary-foreground" />}
            </div>
          </div>
          <span>Show online only</span>
        </label>
      </div>

      {/* Conversations List */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredAndSortedUsers.map((user) => {
            const isOnline = onlineUsers.includes(user._id);
            const isSelected = selectedContactId === user._id;
            const lastMessage = getLastMessage(user._id);
            
            return (
              <div
                key={user._id}
                onClick={() => onSelectContact(user)}
                className={`
                  p-3 rounded-xl cursor-pointer transition-all
                  ${isSelected 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/50 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Profile Picture */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarImage src={user.profilePic} alt={user.fullname} />
                      <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                        {getInitials(user.fullname)}
                      </AvatarFallback>
                    </Avatar>
                    
                    {isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card"></div>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="font-medium text-foreground text-sm truncate">
                        {user.fullname}
                      </h3>
                      {lastMessage && (
                        <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                          {formatMessageTime(lastMessage)}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {formatLastMessage(lastMessage, user._id)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredAndSortedUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-14 h-14 mb-3 bg-muted rounded-full flex items-center justify-center">
                <MessageCircle className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">
                {searchTerm ? "No conversations found" : "No conversations yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {showOnlineOnly ? "Try disabling the online filter" : "Start chatting with your contacts"}
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};