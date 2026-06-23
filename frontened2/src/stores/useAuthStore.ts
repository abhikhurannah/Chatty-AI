import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

interface User {
  _id: string;
  email: string;
  fullname: string;
  profilePic?: string;
}

interface AuthState {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  onlineUsers: string[];
  socket: Socket | null;
  isCheckingAuth: boolean;
  
  checkAuth: () => Promise<void>;
  signup: (data: { email: string; password: string; fullname: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: FormData) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
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

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  onlineUsers: [],
  socket: null,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const user = await apiRequest<User>('/api/auth/check');
      set({ authUser: user });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const user = await apiRequest<User>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set({ authUser: user });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.log("Error in signup:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const user = await apiRequest<User>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set({ authUser: user });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      console.log("Error in login:", error);
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      console.log("Error in logout:", error);
      toast.error("Failed to logout");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const user = await apiRequest<User>('/api/auth/update-profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      set({ authUser: user });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile:", error);
      toast.error("Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(API_BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (users: string[]) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket?.disconnect();
    }
    set({ socket: null });
  },
}));