import { Request, Response } from 'express';
import * as authService from '../services/authService.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, dob } = req.body;

    const result = await authService.registerUser(name, email, password, new Date(dob));

    res.status(201).json({
      success: true,
      userId: result.userId,
      message: result.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
};

export const loginWithEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await authService.loginWithEmail(email, password);

    const accessToken = authService.generateAccessToken(user.userId);
    const refreshToken = authService.generateRefreshToken(user.userId);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        isAdult: user.isAdult,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Login failed';
    res.status(401).json({
      success: false,
      error: message,
    });
  }
};

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body as { email?: string; name?: string };

    if (!email || typeof email !== 'string') {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const displayName = typeof name === 'string' && name.trim() ? name.trim() : '';

    const user = await authService.loginOrRegisterWithGoogleProfile(email, displayName);

    const accessToken = authService.generateAccessToken(user.userId);
    const refreshToken = authService.generateRefreshToken(user.userId);

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user.userId,
        name: user.name,
        email: user.email,
        dob: user.dob,
        isAdult: user.isAdult,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Google sign-in failed';
    res.status(401).json({
      success: false,
      error: message,
    });
  }
};

export const completeDob = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    const { dob } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    if (!dob) {
      res.status(400).json({ success: false, error: 'Date of birth is required' });
      return;
    }

    const user = await authService.completeUserDob(userId, new Date(dob));

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        dob: user.dob,
        isAdult: user.isAdult,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save date of birth';
    res.status(400).json({
      success: false,
      error: message,
    });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required',
      });
      return;
    }

    const newAccessToken = authService.refreshAccessToken(token);

    res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch {
    res.status(401).json({
      success: false,
      error: 'Failed to refresh token',
    });
  }
};

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
        email: user.email,
        dob: user.dob,
        isAdult: user.isAdult,
        isVerified: user.isVerified,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch user';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    message: 'Logged out successfully',
  });
};
