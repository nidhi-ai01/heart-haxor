import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface TokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
}

interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    age: number;
    email: string | null;
    phone: string | null;
  };
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retried, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, dispatch logout event for AuthContext to handle
          const logoutEvent = new CustomEvent('auth-logout');
          window.dispatchEvent(logoutEvent);
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, only remove auth tokens and dispatch logout event
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        const logoutEvent = new CustomEvent('auth-logout');
        window.dispatchEvent(logoutEvent);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============= AUTH ENDPOINTS =============

export const authAPI = {
  // Register new user
  register: async (data: {
    name: string;
    age: number;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    const response = await apiClient.post<{ success: boolean; userId: string; message: string }>(
      '/auth/register',
      data
    );
    return response.data;
  },

  // Login with email
  loginWithEmail: async (email: string, password: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/login/email', {
      email,
      password,
    });
    return response.data;
  },

  // Send OTP to phone
  sendOTP: async (phone: string) => {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      expiresIn: string;
      developmentOTP?: string;
    }>('/auth/send-otp', { phone });
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (phone: string, otp: string) => {
    const response = await apiClient.post<AuthResponse>('/auth/verify-otp', {
      phone,
      otp,
    });
    return response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post<TokenResponse>('/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Verify user is 18+
  verifyAge18Plus: async () => {
    const response = await apiClient.get('/auth/verify-age-18');
    return response.data;
  },
};

// ============= CHARACTER ENDPOINTS =============

export const characterAPI = {
  // Get all characters
  getAll: async () => {
    const response = await apiClient.get('/characters');
    return response.data;
  },

  // Get character by ID
  getById: async (id: string) => {
    const response = await apiClient.get(`/characters/${id}`);
    return response.data;
  },

  // Create character
  create: async (data: any) => {
    const response = await apiClient.post('/characters', data);
    return response.data;
  },

  // Update character
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/characters/${id}`, data);
    return response.data;
  },

  // Delete character
  delete: async (id: string) => {
    const response = await apiClient.delete(`/characters/${id}`);
    return response.data;
  },
};

// ============= CHAT ENDPOINTS =============

export const chatAPI = {
  // Get all user's chats (authenticated)
  getUserChats: async () => {
    const response = await apiClient.get('/chats/user');
    return response.data;
  },

  // Get specific chat history (authenticated)
  getChatHistory: async (chatId: string) => {
    const response = await apiClient.get(`/chats/${chatId}/history`);
    return response.data;
  },

  // Get or create chat with character and fetch history (authenticated)
  getChatWithCharacter: async (characterId: string) => {
    const response = await apiClient.get(`/chats/${characterId}/with-character`);
    return response.data;
  },
};

// ============= CHATBOT SETTINGS ENDPOINTS =============

export const chatbotSettingsAPI = {
  // Get character data with user customizations
  getCharacterData: async (characterId: string) => {
    const response = await apiClient.get(`/chatbot-settings/${characterId}`);
    return response.data;
  },

  // Get all user's customizations
  getAllCustomizations: async () => {
    const response = await apiClient.get('/chatbot-settings');
    return response.data;
  },

  // Update customization
  updateCustomization: async (
    characterId: string,
    data: { customName?: string; customImageUrl?: string }
  ) => {
    const response = await apiClient.put(`/chatbot-settings/${characterId}`, data);
    return response.data;
  },

  // Delete customization
  deleteCustomization: async (characterId: string) => {
    const response = await apiClient.delete(`/chatbot-settings/${characterId}`);
    return response.data;
  },
};



// ============= ERROR HANDLING =============

export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return error.response.data.error;
    }
    if (error.message) {
      return error.message;
    }
  }
  return 'An error occurred. Please try again.';
};

export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem('accessToken');
  if (!token) return true;

  try {
    // Decode JWT to check expiration
    // Note: This is a simple check and doesn't verify signature
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export default apiClient;
