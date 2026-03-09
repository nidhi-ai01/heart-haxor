import { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Initialize Twilio client only if credentials are valid
let twilioClient: ReturnType<typeof twilio> | null = null;

const initTwilio = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  // Only initialize if valid credentials provided (should start with AC)
  if (accountSid && accountSid.startsWith('AC') && authToken) {
    try {
      twilioClient = twilio(accountSid, authToken);
    } catch (error) {
      console.warn('Twilio initialization failed. OTP SMS will not work.');
      twilioClient = null;
    }
  } else {
    console.warn('Twilio credentials not configured. Using development mode for OTP.');
  }
};

initTwilio();

// ============= REGISTER USER =============
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, age, email, phone, password } = req.body;

    const result = await authService.registerUser(name, age, email || null, phone || null, password || null);

    res.status(201).json({
      success: true,
      userId: result.userId,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Registration failed',
    });
  }
};

// ============= LOGIN WITH EMAIL =============
export const loginWithEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await authService.loginWithEmail(email, password);

    // Generate tokens
    const accessToken = authService.generateAccessToken(user.userId);
    const refreshToken = authService.generateRefreshToken(user.userId);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        name: user.name,
        age: user.age,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'Login failed',
    });
  }
};

// ============= SEND OTP TO PHONE =============
export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    // Verify phone exists
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Phone number not registered',
      });
      return;
    }

    // Generate OTP
    const { otp, expiresAt } = await authService.createOTP(user.id, phone);

    // Send OTP via Twilio
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;
    if (fromPhone && twilioClient) {
      try {
        await twilioClient.messages.create({
          body: `Your Heart Haxor verification code is: ${otp}. This code will expire in 5 minutes.`,
          from: fromPhone,
          to: phone,
        });
      } catch (twilioError: any) {
        console.error('Twilio error:', twilioError);
        // For development, we'll still return success but log the issue
        console.log(`Development mode - OTP sent: ${otp}`);
      }
    }

    res.json({
      success: true,
      message: 'OTP sent successfully',
      expiresIn: '5 minutes',
      // For development/testing only - remove in production!
      developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send OTP',
    });
  }
};

// ============= VERIFY OTP AND LOGIN =============
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const user = await authService.verifyPhoneOTP(phone, otp);

    // Generate tokens
    const accessToken = authService.generateAccessToken(user.userId);
    const refreshToken = authService.generateRefreshToken(user.userId);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        name: user.name,
        age: user.age,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message || 'OTP verification failed',
    });
  }
};

// ============= REFRESH ACCESS TOKEN =============
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    const newAccessToken = authService.refreshAccessToken(refreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
};

// ============= GET CURRENT USER =============
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated',
      });
      return;
    }

    const user = await authService.getUserById(req.userId);

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        age: user.age,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch user',
    });
  }
};

// ============= LOGOUT =============
export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    // Since we're using stateless JWT tokens, logout is mainly a frontend operation
    // But we can add additional cleanup here if needed (e.g., blacklist tokens)

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Logout failed',
    });
  }
};
