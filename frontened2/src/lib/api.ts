// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Auth API functions
export const authAPI = {
  login: (credentials: { email: string; password: string }): Promise<any> =>
    apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  
  register: (userData: { email: string; password: string; fullname: string }): Promise<any> =>
    apiRequest('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
  
  logout: (): Promise<any> =>
    apiRequest('/api/auth/logout', {
      method: 'POST',
    }),
  
  checkAuth: (): Promise<any> =>
    apiRequest('/api/auth/check'),

  updateProfile: (formData: FormData): Promise<any> =>
    apiRequest('/api/auth/update-profile', {
      method: 'PUT',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    }),
};

// Messages API functions
export const messagesAPI = {
  getUsers: (): Promise<any> =>
    apiRequest('/api/messages/users'),
  
  getMessages: (userId: string): Promise<any> =>
    apiRequest(`/api/messages/${userId}`),
  
  sendMessage: (userId: string, messageData: { text?: string; image?: string }): Promise<any> =>
    apiRequest(`/api/messages/send/${userId}`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    }),
};