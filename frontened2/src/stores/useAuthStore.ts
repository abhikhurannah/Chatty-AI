import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const TOKEN_KEY = 'chatty_auth_token';

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

// Save token from response headers
function saveToken(response: Response) {
  const token = response.headers.get('X-Auth-Token');
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

// Get saved token
function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Clear saved token
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // Send token in Authorization header — works cross-origin always
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  const response = await fetch(url, config);

  // Save token if backend returns one (login/signup)
  saveToken(response);

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
      // If no token saved, skip the network call entirely
      if (!getToken()) {
        set({ authUser: null, isCheckingAuth: false });
        return;
      }
      const user = await apiRequest<User>('/api/auth/check');
      set({ authUser: user });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
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
      });
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
      });
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
    } catch (error) {
      // continue logout even if request fails
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

    const token = getToken();
    const socket = io(API_BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
      // Also pass token in socket auth for extra reliability
      auth: { token },
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