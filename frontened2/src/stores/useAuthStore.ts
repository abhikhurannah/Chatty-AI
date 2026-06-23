import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { apiRequest, clearToken, getToken, API_BASE_URL } from "@/lib/api";

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
  updateProfile: (data: any) => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
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
    if (!getToken()) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }
    try {
      const user = await apiRequest<User>('/api/auth/check');
      set({ authUser: user });
      get().connectSocket();
    } catch (error) {
      clearToken();
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
      }, true); // true = save token from response
      set({ authUser: user });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
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
      }, true); // true = save token from response
      set({ authUser: user });
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to login");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch (_) {
      // still clear local state even if request fails
    } finally {
      clearToken();
      set({ authUser: null });
      get().disconnectSocket();
      toast.success("Logged out successfully");
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
      toast.error("Failed to update profile");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(API_BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
      auth: { token: getToken() },
    });

    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (users: string[]) => {
      set({ onlineUsers: users });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket?.disconnect();
    set({ socket: null });
  },
}));