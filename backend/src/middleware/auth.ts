import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/authService.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        age: number;
      };
    }
  }
}

// Middleware to verify JWT token
export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;

    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Middleware to check if user is 18+ (for partner routes)
export const verifyAge18Plus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Import here to avoid circular dependency
    const { getUserById } = await import('../services/authService.js');
    const user = await getUserById(req.userId);

    if (user.age < 18) {
      res.status(403).json({ error: 'This feature is only available for users 18 and older' });
      return;
    }

    req.user = {
      id: user.id,
      age: user.age,
    };

    next();
  } catch (error) {
    res.status(500).json({ error: 'Error verifying age restriction' });
  }
};

// Middleware for input validation
export const validateRegistrationInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name, age, email, phone, password } = req.body;

  // Check required fields
  if (!name || name.trim().length === 0) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  if (age === undefined || age === null) {
    res.status(400).json({ error: 'Age is required' });
    return;
  }

  if (!email && !phone) {
    res.status(400).json({ error: 'Either email or phone is required' });
    return;
  }

  // If email is provided, password is required
  if (email && !password) {
    res.status(400).json({ error: 'Password is required for email registration' });
    return;
  }

  next();
};

// Middleware for login validation
export const validateLoginInput = (req: Request, res: Response, next: NextFunction): void => {
  const { method, email, password, phone } = req.body;

  if (!method || !['email', 'phone'].includes(method)) {
    res.status(400).json({ error: 'Invalid login method. Must be "email" or "phone"' });
    return;
  }

  if (method === 'email') {
    if (!email) {
      res.status(400).json({ error: 'Email is required for email login' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Password is required for email login' });
      return;
    }
  }

  if (method === 'phone') {
    if (!phone) {
      res.status(400).json({ error: 'Phone is required for phone login' });
      return;
    }
  }

  next();
};

// Middleware for OTP validation
export const validateOTPInput = (req: Request, res: Response, next: NextFunction): void => {
  const { phone, otp } = req.body;

  if (!phone) {
    res.status(400).json({ error: 'Phone is required' });
    return;
  }

  if (!otp || otp.toString().length !== 6) {
    res.status(400).json({ error: 'OTP must be 6 digits' });
    return;
  }

  next();
};
