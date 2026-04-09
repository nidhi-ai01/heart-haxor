# Complete Authentication System Implementation Guide

## Status: Backend ✅ Complete | Frontend ⏳ In Progress

### What's Been Completed (Backend):
-  Prisma schema updated with User and OTPmodels
✅ Database migrated and reset
✅ Auth service with JWT, bcrypt, OTP generation/validation
✅ Auth controller with all endpoints
✅ Auth middleware for JWT verification and input validation
✅ Auth routes integrated in server.ts
✅ Twilio SMS OTP setup in controller
✅ Environment variables configured

---

## FRONTEND IMPLEMENTATION GUIDE

### Step 1: Update .env.local (Frontend)

Create or update `/frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 2: Update AuthContext (CRITICAL)

Replace `/frontend/src/context/AuthContext.tsx` with:

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { authAPI, handleAPIError, isTokenExpired } from "@/lib/api";

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

  // Auth methods
  registerUser: (name: string, age: number, email?: string, phone?: string, password?: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  sendOTP: (phone: string) => Promise<{ message: string; expiresIn: string; otp?: string }>;
  verifyOTP: (phone: string, otp: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if token exists and is valid on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token || isTokenExpired()) {
          // Try to refresh if refresh token exists
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            await refreshAccessToken(refreshToken);
          } else {
            setIsLoading(false);
            return;
          }
        }

        // Fetch current user
        const userData = await authAPI.getCurrentUser();
        setUser(userData.user);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
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
    } catch (error) {
      throw new Error(handleAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.loginWithEmail(email, password);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user as any);
    } catch (error) {
      throw new Error(handleAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async (phone: string) => {
    try {
      const response = await authAPI.sendOTP(phone);
      return {
        message: response.message,
        expiresIn: response.expiresIn,
        otp: response.developmentOTP, // Only in dev mode
      };
    } catch (error) {
      throw new Error(handleAPIError(error));
    }
  };

  const verifyOTP = async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyOTP(phone, otp);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user as any);
    } catch (error) {
      throw new Error(handleAPIError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = async (refreshToken: string) => {
    try {
      const response = await authAPI.refreshToken(refreshToken);
      localStorage.setItem("accessToken", response.accessToken);
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const refreshToken = async () => {
    const token = localStorage.getItem("refreshToken");
    if (token) {
      await refreshAccessToken(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        registerUser,
        loginWithEmail,
        sendOTP,
        verifyOTP,
        logout,
        refreshToken,
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
```

### Step 3: Update Login Page

Replace `/frontend/src/app/login/page.tsx` with the login form that connects to real API (see separate detailed code below)

### Step 4: Update Signup Page

Replace `/frontend/src/app/signup/page.tsx` to call registerUser via API

### Step 5: Update ProtectedLayout

Modify to check JWT tokens:

```typescript
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = ["/login", "/signup", "/", "/login-form"];

export function withProtectedLayout<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (!isLoading && !isAuthenticated && !publicRoutes.includes(pathname)) {
        router.push("/login");
      }
    }, [isLoading, isAuthenticated, pathname, router]);

    if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
```

---

## TWILIO SETUP INSTRUCTIONS

### Get Your Credentials:

1. Go to https://www.twilio.com/console
2. Find your Account SID and Auth Token
3. Get a Twilio phone number (for testing, use trial account)
4. Update `/backend/.env`:

```
TWILIO_ACCOUNT_SID=your_actual_sid
TWILIO_AUTH_TOKEN=your_actual_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Testing OTP in Development:

- The API returns `developmentOTP` in development mode for testing
- Use this OTP to complete the verification flow without actually sending SMS
- In production, remove the `developmentOTP` field from the response

---

## TESTING CHECKLIST

### Backend Testing (via curl or Postman):

```bash
# 1. Register with email
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "age": 25,
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# 2. Login with email
curl -X POST http://localhost:3001/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# 3. Send OTP
curl -X POST http://localhost:3001/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'

# 4. Get current user (use token from login)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Frontend Testing Flow:

1. **Signup**: Create new account with email and password
2. **Login (Email)**: Use credentials to get JWT tokens
3. **Login (Phone)**: Register with phone, send OTP, verify OTP
4. **Token Refresh**: Let token expire, verify auto-refresh works
5. **Protected Routes**: Access role-select and characters pages with token
6. **Partner Access**: Verify 18+ users can see Partner section

---

## API ENDPOINTS SUMMARY

```
POST   /api/auth/register           - Create new user
POST   /api/auth/login/email        - Login with email + password
POST   /api/auth/send-otp           - Send OTP to phone
POST   /api/auth/verify-otp         - Verify OTP and login
POST   /api/auth/refresh-token      - Get new access token
GET    /api/auth/me                 - Get current user (protected)
POST   /api/auth/logout             - Logout (protected)
GET    /api/auth/verify-age-18      - Check if user is 18+ (protected)
```

---

## KEY FEATURES

✅ **JWT Authentication** - Access + Refresh tokens
✅ **Password Security** - bcrypt hashing
✅ **OTP via Twilio** - Phone-based authentication
✅ **Email+Password Login** - Traditional login method
✅ **Age-Gated Content** - Partner section (18+) only
✅ **Automatic Token Refresh** - Seamless experience
✅ **Input Validation** - Server-side validation
✅ **Error Handling** - Comprehensive error messages

---

## PRODUCTION CHECKLIST

- [ ] Change JWT_SECRET to 32+ char random string
- [ ] Change REFRESH_TOKEN_SECRET to 32+ char  random string
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS in frontend
- [ ] Move tokens to httpOnly cookies (recommended)
- [ ] Add rate limiting to auth endpoints
- [ ] Add email verification flow
- [ ] Set up CORS properly (not "*")
- [ ] Test password reset flow
- [ ] Remove developmentOTP from production code
- [ ] Enable logging and monitoring
- [ ] Set up database backups

---

## NEXT STEPS

1. Update the frontend AuthContext with the code above
2. Create new login page with phone/email tabs
3. Create new signup page
4. Test all flows
5. Integrate with existing chat system
6. Update role-select to use JWT tokens
7. Test end-to-end authentication flow

---

**For detailed code examples for specific files, refer to the commented sections above.**
