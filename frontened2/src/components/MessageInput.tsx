import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Image, X, Smile, Bot, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatStore } from "@/stores/useChatStore";
import { useAIStore } from "@/stores/useAIStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { AISuggestions } from "./AISuggestions";
import { TypingSuggestions } from "./TypingSuggestions";
import { ChatbotDialog } from "./ChatbotDialog";
import toast from "react-hot-toast";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

interface User {
  _id: string;
  fullname: string;
  email: string;
  profilePic?: string;
}

interface MessageInputProps {
  selectedUser: User;
}

export const MessageInput = ({ selectedUser }: MessageInputProps) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingDebounceRef = useRef<NodeJS.Timeout>();

  const { sendMessage, messages } = useChatStore();
  const { authUser } = useAuthStore();
  const {
    getReplySuggestions,
    getTypingSuggestions,
    typingSuggestions,
    isAIEnabled,
    clearSuggestions,
    clearTypingSuggestions,
    setConversationContext,
    selectedTone,
  } = useAIStore();

  // Build labeled conversation context from recent messages
  const buildConversationContext = useCallback(() => {
    const recentMessages = messages.slice(-15).map(msg => ({
      text: msg.text || '[Image]',
      senderId: msg.senderId,
      timestamp: msg.createdAt,
    }));

    const messageCount = messages.length;
    let userRelationship = 'neutral';
    if (messageCount > 50) userRelationship = 'close';
    else if (messageCount > 20) userRelationship = 'familiar';
    else if (messageCount > 5) userRelationship = 'acquaintance';

    const allText = messages.map(m => m.text || '').join(' ').toLowerCase();
    const topicKeywords: Record<string, string[]> = {
      work: ['work', 'job', 'office', 'project', 'meeting'],
      personal: ['family', 'friend', 'home', 'weekend'],
      tech: ['code', 'programming', 'software', 'app'],
      entertainment: ['movie', 'music', 'game', 'show'],
    };
    const previousTopics = Object.entries(topicKeywords)
      .filter(([, kws]) => kws.some(kw => allText.includes(kw)))
      .map(([topic]) => topic);

    return { messages: recentMessages, userRelationship, previousTopics };
  }, [messages, authUser]);

  // Update context when messages change
  useEffect(() => {
    if (messages.length > 0 && isAIEnabled) {
      setConversationContext(buildConversationContext());
    }
  }, [messages, isAIEnabled, buildConversationContext, setConversationContext]);

  // Typing suggestions — debounced, only when AI is on
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    clearTimeout(typingDebounceRef.current);
    if (val.length >= 3 && isAIEnabled) {
      typingDebounceRef.current = setTimeout(() => {
        const ctx = buildConversationContext();
        getTypingSuggestions(val, selectedUser._id, ctx);
      }, 600); // 600ms debounce — not too aggressive
    } else {
      clearTypingSuggestions();
    }
  };

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    if (showEmojiPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmojiPicker]);

  // Get AI reply suggestions
  const handleGetReplySuggestions = async () => {
    if (!isAIEnabled) { toast.error("AI is disabled. Enable it from the navbar."); return; }
    if (messages.length === 0) { toast.error("No messages yet. Start a conversation first!"); return; }

    try {
      const lastMessage = messages[messages.length - 1];
      const ctx = buildConversationContext();
      await getReplySuggestions(lastMessage?._id || 'latest', selectedUser._id, ctx);
      setShowAISuggestions(true);
    } catch {
      toast.error('Failed to get AI suggestions');
    }
  };

  // Refresh suggestions with current tone
  const handleRefreshSuggestions = async () => {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const ctx = buildConversationContext();
    await getReplySuggestions(lastMessage?._id || 'latest', selectedUser._id, ctx);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText(prev => prev + emojiData.emoji);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    setShowAISuggestions(false);
    clearSuggestions();
    inputRef.current?.focus();
  };

  const handleTypingSuggestionClick = (suggestion: string) => {
    setText(suggestion);
    clearTypingSuggestions();
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({ text: text.trim() || undefined, image: imagePreview || undefined });
      setText("");
      setImagePreview(null);
      setShowEmojiPicker(false);
      setShowAISuggestions(false);
      clearSuggestions();
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const canGetSuggestions = isAIEnabled && messages.length > 0;

  return (
    <div className="space-y-2 relative px-2 sm:px-0">
      {/* AI Reply Suggestions Panel */}
      <AISuggestions
        onSuggestionClick={handleSuggestionClick}
        onClose={() => setShowAISuggestions(false)}
        isVisible={showAISuggestions}
        onRefresh={handleRefreshSuggestions}
      />

      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            ref={emojiPickerRef}
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-0 z-50"
          >
            <div className="backdrop-blur-xl bg-card/95 border border-border rounded-xl shadow-2xl overflow-hidden">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={280}
                height={320}
                theme={document.documentElement.classList.contains('dark') ? Theme.DARK : Theme.LIGHT}
                searchPlaceHolder="Search emoji…"
                previewConfig={{ showPreview: false }}
                lazyLoadEmojis
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview */}
      <AnimatePresence>
        {imagePreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="relative inline-block ml-2"
          >
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border-2 border-primary object-cover" />
            <button
              type="button"
              onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Row */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1.5">
          {/* Chatbot button */}
          <Button
            type="button" size="icon" variant="ghost"
            onClick={() => setShowChatbot(true)}
            disabled={!isAIEnabled}
            className={`h-10 w-10 flex-shrink-0 transition-all ${
              isAIEnabled
                ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950'
                : 'text-muted-foreground opacity-40'
            }`}
            title="Chat with AI assistant"
          >
            <MessageCircle className="h-5 w-5" />
          </Button>

          {/* AI Suggestions button */}
          <div className="relative flex-shrink-0">
            <Button
              type="button" size="icon" variant="ghost"
              onClick={handleGetReplySuggestions}
              disabled={!canGetSuggestions}
              className={`h-10 w-10 transition-all ${
                canGetSuggestions
                  ? 'text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950'
                  : 'text-muted-foreground opacity-40'
              }`}
              title={canGetSuggestions ? `Get ${selectedTone} reply suggestions` : 'Send a message first'}
            >
              <Bot className="h-5 w-5" />
              {canGetSuggestions && (
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full"
                />
              )}
            </Button>
            {/* Tone badge */}
            {isAIEnabled && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-bold text-purple-500 uppercase leading-none whitespace-nowrap">
                {selectedTone.slice(0, 3)}
              </span>
            )}
          </div>

          {/* Image upload */}
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          <Button
            type="button" size="icon" variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 flex-shrink-0 text-muted-foreground hover:text-foreground"
            title="Upload image"
          >
            <Image className="h-5 w-5" />
          </Button>

          {/* Emoji */}
          <Button
            type="button" size="icon" variant="ghost"
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className={`h-10 w-10 flex-shrink-0 transition-all ${
              showEmojiPicker ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="Add emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>

          {/* Text input */}
          <div className="flex-1 relative min-w-0">
            <Input
              ref={inputRef}
              type="text"
              placeholder={`Message ${selectedUser.fullname}…`}
              value={text}
              onChange={handleTextChange}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); } }}
              className="h-10 w-full bg-muted/30 border-border rounded-full px-4 text-sm"
            />
            {/* Typing Suggestions popover */}
            <TypingSuggestions
              suggestions={typingSuggestions}
              onSuggestionClick={handleTypingSuggestionClick}
              isVisible={typingSuggestions.length > 0 && text.length >= 3}
            />
          </div>

          {/* Send */}
          <Button
            type="submit"
            size="icon"
            disabled={!text.trim() && !imagePreview}
            className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-primary to-secondary hover:opacity-90 rounded-full disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>

      <ChatbotDialog isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </div>
  );
};
