import { create } from "zustand";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

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

interface ChatState {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  isUsersLoading: boolean;
  isMessagesLoading: boolean;
  
  setSelectedUser: (user: User | null) => void;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: { text?: string; image?: string }) => Promise<void>;
  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
}

// Generic API request function
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const users = await apiRequest<User[]>('/api/messages/users');
      set({ users });
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const messages = await apiRequest<Message[]>(`/api/messages/${userId}`);
      set({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    if (!selectedUser) return;

    try {
      const newMessage = await apiRequest<Message>(`/api/messages/send/${selectedUser._id}`, {
        method: 'POST',
        body: JSON.stringify(messageData),
      });
      set({ messages: [...messages, newMessage] });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const { socket } = useAuthStore.getState();
    if (!socket) return;

    socket.on("newMessage", (newMessage: Message) => {
      const { selectedUser: currentSelectedUser } = get();
      if (newMessage.senderId !== currentSelectedUser?._id) return;
      
      set({ messages: [...get().messages, newMessage] });
    });
  },

  unsubscribeFromMessages: () => {
    const { socket } = useAuthStore.getState();
    if (!socket) return;
    
    socket.off("newMessage");
  },
}));