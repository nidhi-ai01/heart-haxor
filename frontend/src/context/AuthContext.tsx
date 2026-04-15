"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, handleAPIError, type AuthUserDto } from "@/lib/api";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

interface User {
  id: string;
  email: string;
  name: string;
  dob: string | null;
  isAdult: boolean;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  registerUser: (name: string, email: string, password: string, dob: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<AuthUserDto>;
  loginWithGoogleProfile: (email: string, name: string) => Promise<AuthUserDto>;
  completeDob: (dob: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapUser(u: AuthUserDto): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    dob: u.dob,
    isAdult: u.isAdult,
    isVerified: u.isVerified,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setError(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    };

    const handleBeforeUnload = () => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    };

    window.addEventListener("auth-logout", handleLogout);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("auth-logout", handleLogout);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          setIsLoading(false);
          return;
        }

        try {
          const response = await authAPI.getCurrentUser();
          setUser(mapUser(response.user));
        } catch (apiError: unknown) {
          const err = apiError as { response?: { status?: number } };
          const status = err.response?.status;
          if (status === 401 || status === 403) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
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

  const registerUser = async (name: string, email: string, password: string, dob: string) => {
    try {
      setError(null);
      setIsLoading(true);
      await authAPI.register({ name, email, password, dob });
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
      setUser(mapUser(response.user));
      return response.user;
    } catch (err) {
      const errorMsg = handleAPIError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleProfile = async (email: string, name: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await authAPI.loginWithGoogle({ email, name });

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(mapUser(response.user));
      return response.user;
    } catch (err) {
      const errorMsg = handleAPIError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const completeDob = async (dob: string) => {
    try {
      setError(null);
      const response = await authAPI.completeDob(dob);
      setUser(mapUser(response.user));
    } catch (err) {
      const errorMsg = handleAPIError(err);
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setError(null);
      localStorage.clear();
      sessionStorage.clear();
      
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Firebase logout error:", e);
      }
      
      window.location.replace("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.replace("/login");
    }
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
        loginWithGoogleProfile,
        completeDob,
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
