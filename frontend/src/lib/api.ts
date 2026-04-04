import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://heart-haxor-backend-sa1m.onrender.com";

interface TokenResponse {
  success: boolean;
  accessToken: string;
  refreshToken?: string;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  dob: string | null;
  isAdult: boolean;
  isVerified?: boolean;
}

interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: AuthUserDto;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          window.dispatchEvent(new CustomEvent("auth-logout"));
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data;
        localStorage.setItem("accessToken", accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new CustomEvent("auth-logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (data: { name: string; email: string; password: string; dob: string }) => {
    const response = await apiClient.post<{ success: boolean; userId: string; message: string }>(
      "/auth/register",
      data
    );
    return response.data;
  },

  loginWithEmail: async (email: string, password: string) => {
    const response = await apiClient.post<AuthResponse>("/auth/login/email", {
      email,
      password,
    });
    return response.data;
  },

  loginWithGoogle: async (payload: { email: string; name: string }) => {
    const response = await apiClient.post<AuthResponse>("/auth/google", payload);
    return response.data;
  },

  completeDob: async (dob: string) => {
    const response = await apiClient.post<{ success: boolean; user: AuthUserDto }>("/auth/complete-dob", {
      dob,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await axios.post<TokenResponse>(`${API_URL}/api/auth/refresh-token`, {
      refreshToken,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<{ success: boolean; user: AuthUserDto }>("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  verifyAge18Plus: async () => {
    const response = await apiClient.get("/auth/verify-age-18");
    return response.data;
  },
};

export const characterAPI = {
  getAll: async () => {
    const response = await apiClient.get("/characters");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/characters/${id}`);
    return response.data;
  },

  create: async (data: unknown) => {
    const response = await apiClient.post("/characters", data);
    return response.data;
  },

  update: async (id: string, data: unknown) => {
    const response = await apiClient.put(`/characters/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/characters/${id}`);
    return response.data;
  },
};

export const chatAPI = {
  getUserChats: async () => {
    const response = await apiClient.get("/chats/user");
    return response.data;
  },

  getChatHistory: async (chatId: string) => {
    const response = await apiClient.get(`/chats/${chatId}/history`);
    return response.data;
  },

  getChatWithCharacter: async (characterId: string) => {
    const response = await apiClient.get(`/chats/${characterId}/with-character`);
    return response.data;
  },
};

export const chatbotSettingsAPI = {
  getCharacterData: async (characterId: string) => {
    const response = await apiClient.get(`/chatbot-settings/${characterId}`);
    return response.data;
  },

  getAllCustomizations: async () => {
    const response = await apiClient.get("/chatbot-settings");
    return response.data;
  },

  updateCustomization: async (characterId: string, data: { customName?: string; customImageUrl?: string }) => {
    const response = await apiClient.put(`/chatbot-settings/${characterId}`, data);
    return response.data;
  },

  deleteCustomization: async (characterId: string) => {
    const response = await apiClient.delete(`/chatbot-settings/${characterId}`);
    return response.data;
  },
};

export const handleAPIError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return error.response.data.error as string;
    }
    if (error.message) {
      return error.message;
    }
  }
  return "An error occurred. Please try again.";
};

export const isTokenExpired = (): boolean => {
  const token = localStorage.getItem("accessToken");
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export default apiClient;
