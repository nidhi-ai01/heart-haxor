"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, handleAPIError } from "@/lib/api";

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  age: number;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  // Auth methods
  registerUser: (
    name: string,
    age: number,
    email?: string,
    phone?: string,
    password?: string
  ) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<{ message: string; expiresIn: string; otp?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for logout events from API interceptor
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setError(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // Keep selectedRole and other app data
    };

    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, []);

  // Check if token exists and is valid on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          // Fetch current user
          const response = await authAPI.getCurrentUser();
          setUser(response.user);
        } catch (apiError: any) {
          const status = apiError.response?.status;

          // Only clear tokens on explicit auth errors (401/403)
          if (status === 401 || status === 403) {
            // Unauthorized or Forbidden - explicit permission error, logout
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          } else if (status === 500) {
            // Server error - log but don't fail auth check
            console.warn("Auth check: Server returned 500 error");
          } else if (!apiError.response) {
            // Network error - just warn quietly
            console.warn("Auth check: Network error, keeping session");
          } else {
            // Other HTTP errors
            console.warn("Auth check error:", apiError.message);
          }
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const registerUser = async (
    name: string,
    age: number,
    email?: string,
    phone?: string,
    password?: string
  ) => {
    try {
      setError(null);
      setIsLoading(true);
      await authAPI.register({
        name,
        age,
        email,
        phone,
        password,
      });
      // Don't auto-login after registration
      // User should login separately
    } catch (err) {
      const errorMsg = handleAPIError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authAPI.loginWithEmail(email, password);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user as any);
    } catch (err) {
      const errorMsg = handleAPIError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      setError(null);
      const response = await authAPI.sendOTP(phone);
      return {
        message: response.message,
        expiresIn: response.expiresIn,
        otp: response.developmentOTP,
      };
    } catch (err) {
      const errorMsg = handleAPIError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authAPI.verifyOTP(phone, otp);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user as any);
    } catch (err) {
      const errorMsg = handleAPIError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("selectedRole");
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        registerUser,
        loginWithEmail,
        sendOTP,
        verifyOTP,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
