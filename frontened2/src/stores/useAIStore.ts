import { create } from "zustand";
import toast from "react-hot-toast";
import { apiRequest as sharedApiRequest } from "@/lib/api"; // ✅ use shared utility

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Wrapper that prepends /api/chatbot to all AI endpoints
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  return sharedApiRequest<T>(`/api/chatbot${endpoint}`, options);
}

export type ConversationTone = 'casual' | 'professional' | 'flirty' | 'friendly' | 'formal' | 'humorous';

export interface AISuggestion {
  suggestion: string;
  confidence: number;
  tone?: ConversationTone;
}

interface AIAnalysis {
  sentiment: string;
  tone: string;
  topics: string[];
  suggestions: string[];
  conversationStyle?: string;
  emotionalTone?: string;
  messageCount?: number;
}

interface ConversationContext {
  messages: Array<{ text: string; senderId: string; timestamp: string }>;
  userRelationship?: string;
  previousTopics?: string[];
}

interface AIState {
  replySuggestions: AISuggestion[];
  typingSuggestions: string[];
  isLoadingSuggestions: boolean;
  isLoadingTyping: boolean;
  isLoadingAnalysis: boolean;
  analysis: AIAnalysis | null;
  isAIEnabled: boolean;
  selectedTone: ConversationTone;
  conversationContext: ConversationContext | null;
  // Store last call params so tone change can re-fetch
  _lastSuggestionParams: { messageId: string; receiverId: string } | null;
  chatbotMessages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>;
  isLoadingChatbot: boolean;

  getReplySuggestions: (messageId: string, receiverId: string, context?: ConversationContext) => Promise<void>;
  getTypingSuggestions: (partialText: string, receiverId: string, context?: ConversationContext) => Promise<void>;
  analyzeConversation: (receiverId: string, messages: any[]) => Promise<void>;
  chatWithBot: (message: string, tone?: ConversationTone) => Promise<string>;
  clearSuggestions: () => void;
  clearTypingSuggestions: () => void;
  toggleAI: () => void;
  setSelectedTone: (tone: ConversationTone) => void;
  setConversationContext: (context: ConversationContext) => void;
  clearChatbotMessages: () => void;
}

export const useAIStore = create<AIState>((set, get) => ({
  replySuggestions: [],
  typingSuggestions: [],
  isLoadingSuggestions: false,
  isLoadingTyping: false,
  isLoadingAnalysis: false,
  analysis: null,
  isAIEnabled: true,
  selectedTone: 'casual',
  conversationContext: null,
  _lastSuggestionParams: null,
  chatbotMessages: [],
  isLoadingChatbot: false,

  getReplySuggestions: async (messageId, receiverId, context) => {
    if (!get().isAIEnabled) return;
    const { selectedTone, conversationContext } = get();

    // Store params for tone-change re-fetch
    set({ isLoadingSuggestions: true, _lastSuggestionParams: { messageId, receiverId } });
    try {
      const data = await apiRequest<{ suggestions: AISuggestion[] }>('/suggestions/reply', {
        method: 'POST',
        body: JSON.stringify({
          messageId,
          receiverId,
          tone: selectedTone,
          context: context || conversationContext,
        }),
      });
      set({ replySuggestions: data.suggestions || [] });
    } catch (error) {
      console.error("Error getting reply suggestions:", error);
      // Show fallback so the panel still opens
      set({
        replySuggestions: [
          { suggestion: "That's interesting! Tell me more.", confidence: 0.7, tone: selectedTone },
          { suggestion: "I see what you mean.", confidence: 0.6, tone: selectedTone },
          { suggestion: "Thanks for sharing that with me.", confidence: 0.65, tone: selectedTone },
        ],
      });
    } finally {
      set({ isLoadingSuggestions: false });
    }
  },

  getTypingSuggestions: async (partialText, receiverId, context) => {
    if (!get().isAIEnabled || partialText.length < 3) {
      set({ typingSuggestions: [] });
      return;
    }
    const { selectedTone, conversationContext } = get();
    set({ isLoadingTyping: true });
    try {
      const data = await apiRequest<{ suggestions: any[] }>('/suggestions/typing', {
        method: 'POST',
        body: JSON.stringify({
          partialText,
          receiverId,
          tone: selectedTone,
          context: context || conversationContext,
        }),
      });
      const texts = (data.suggestions || []).map((s: any) =>
        typeof s === 'string' ? s : s.suggestion || s.text || ''
      ).filter(Boolean);
      set({ typingSuggestions: texts });
    } catch {
      set({ typingSuggestions: [] });
    } finally {
      set({ isLoadingTyping: false });
    }
  },

  analyzeConversation: async (receiverId, messages = []) => {
    if (!get().isAIEnabled) return;
    set({ isLoadingAnalysis: true });
    try {
      const data = await apiRequest<AIAnalysis>(`/analyze/${receiverId}`, {
        method: 'POST',
        body: JSON.stringify({ messages: messages.slice(-20) }),
      });
      set({ analysis: data });
      toast.success('Conversation analyzed!');
    } catch {
      toast.error("Failed to analyze conversation");
    } finally {
      set({ isLoadingAnalysis: false });
    }
  },

  chatWithBot: async (message, tone) => {
    if (!get().isAIEnabled) throw new Error("AI is disabled");
    const chosenTone = tone || get().selectedTone;
    const history = get().chatbotMessages;
    const userMsg = { role: 'user' as const, content: message, timestamp: new Date() };
    set({ chatbotMessages: [...history, userMsg], isLoadingChatbot: true });
    try {
      const data = await apiRequest<{ response: string }>('/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          tone: chosenTone,
          chatHistory: history.slice(-10).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const botMsg = { role: 'assistant' as const, content: data.response, timestamp: new Date() };
      set({ chatbotMessages: [...get().chatbotMessages, botMsg], isLoadingChatbot: false });
      return data.response;
    } catch (error) {
      set({ isLoadingChatbot: false });
      throw error;
    }
  },

  clearSuggestions: () => set({ replySuggestions: [], typingSuggestions: [], analysis: null }),
  clearTypingSuggestions: () => set({ typingSuggestions: [] }),

  toggleAI: () => {
    const newState = !get().isAIEnabled;
    set({ isAIEnabled: newState });
    if (!newState) get().clearSuggestions();
    toast.success(`AI ${newState ? 'enabled ✨' : 'disabled'}`, { icon: newState ? '🤖' : '🚫' });
  },

  setSelectedTone: (tone) => {
    set({ selectedTone: tone });
    toast.success(`Tone: ${tone}`, { icon: '🎭', duration: 1500 });

    // Auto re-fetch suggestions if panel was already open
    const { _lastSuggestionParams, replySuggestions, isAIEnabled } = get();
    if (isAIEnabled && _lastSuggestionParams && replySuggestions.length > 0) {
      const { messageId, receiverId } = _lastSuggestionParams;
      // Small delay so the tone state commits first
      setTimeout(() => {
        get().getReplySuggestions(messageId, receiverId);
      }, 50);
    }
  },

  setConversationContext: (context) => set({ conversationContext: context }),
  clearChatbotMessages: () => set({ chatbotMessages: [] }),
}));
