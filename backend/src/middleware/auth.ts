import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../services/authService.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: {
        id: string;
        isAdult: boolean;
      };
    }
  }
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or invalid authorization header' });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);
    req.userId = decoded.userId;

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const verifyAge18Plus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { getUserById } = await import('../services/authService.js');
    const user = await getUserById(req.userId);

    if (!user.isAdult) {
      res.status(403).json({ error: 'This feature is only available for users 18 and older' });
      return;
    }

    req.user = {
      id: user.id,
      isAdult: user.isAdult,
    };

    next();
  } catch {
    res.status(500).json({ error: 'Error verifying age restriction' });
  }
};

export const validateRegistrationInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email, password, dob } = req.body;

  if (!name || String(name).trim().length === 0) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }

  if (!dob) {
    res.status(400).json({ error: 'Date of birth is required' });
    return;
  }

  next();
};
