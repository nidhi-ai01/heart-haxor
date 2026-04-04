import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import validator from 'validator';
import prisma from '../lib/prisma.js';

// ============= AGE / DOB UTILITIES =============
export function getAgeFromDob(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

export function computeIsAdult(dob: Date): boolean {
  return getAgeFromDob(dob) >= 18;
}

export function isBirthdayToday(dob: Date): boolean {
  const now = new Date();
  return dob.getMonth() === now.getMonth() && dob.getDate() === now.getDate();
}

// ============= PASSWORD UTILITIES =============
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// ============= JWT TOKEN UTILITIES =============
export const generateAccessToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';
  const expiresIn = process.env.JWT_EXPIRY || '15m';

  return jwt.sign({ userId }, secret, { expiresIn } as SignOptions);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'your_super_secret_refresh_key_change_in_production';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || '7d';

  return jwt.sign({ userId }, secret, { expiresIn } as SignOptions);
};

export const verifyAccessToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'your_super_secret_refresh_key_change_in_production';

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
};

// ============= VALIDATION =============
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
};

export const parseAndValidateDob = (dobInput: string | Date): Date => {
  const dob = typeof dobInput === 'string' ? new Date(dobInput) : dobInput;
  if (Number.isNaN(dob.getTime())) {
    throw new Error('Invalid date of birth');
  }
  const age = getAgeFromDob(dob);
  if (age < 13) {
    throw new Error('You must be at least 13 years old');
  }
  if (age > 120) {
    throw new Error('Please enter a valid date of birth');
  }
  return dob;
};

// ============= USER REGISTRATION (EMAIL) =============
export const registerUser = async (
  name: string,
  email: string,
  password: string,
  dob: Date
): Promise<{ userId: string; message: string }> => {
  if (!name || name.length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }

  const emailNorm = email.trim().toLowerCase();

  if (!validateEmail(emailNorm)) {
    throw new Error('Invalid email format');
  }

  const pwValidation = validatePassword(password);
  if (!pwValidation.valid) {
    throw new Error(pwValidation.errors.join(', '));
  }

  const dobDate = parseAndValidateDob(dob);

  const existingEmail = await prisma.user.findUnique({
    where: { email: emailNorm },
  });

  if (existingEmail) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await hashPassword(password);
  const isAdult = computeIsAdult(dobDate);

  const user = await prisma.user.create({
    data: {
      name,
      email: emailNorm,
      password: hashedPassword,
      dob: dobDate,
      isAdult,
      isVerified: true,
    },
  });

  return {
    userId: user.id,
    message: 'User registered successfully',
  };
};

// ============= EMAIL LOGIN =============
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<{ userId: string; name: string; email: string; dob: Date | null; isAdult: boolean }> => {
  const emailNorm = email.trim().toLowerCase();

  if (!validateEmail(emailNorm)) {
    throw new Error('Invalid email format');
  }

  if (!password) {
    throw new Error('Password is required');
  }

  const user = await prisma.user.findUnique({
    where: { email: emailNorm },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password) {
    throw new Error('This account uses Google sign-in. Continue with Google.');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    dob: user.dob,
    isAdult: user.isAdult,
  };
};

/**
 * Google sign-in: Firebase handles OAuth on the client; backend trusts email + name
 * after the user has authenticated with Firebase (production should add extra hardening).
 */
export const loginOrRegisterWithGoogleProfile = async (
  email: string,
  name: string
): Promise<{ userId: string; name: string; email: string; dob: Date | null; isAdult: boolean }> => {
  const emailNorm = email.trim().toLowerCase();
  if (!validateEmail(emailNorm)) {
    throw new Error('Invalid email format');
  }

  const displayName = (name && name.trim()) || emailNorm.split('@')[0] || 'User';
  if (displayName.length < 1) {
    throw new Error('Name is required');
  }

  let user = await prisma.user.findUnique({
    where: { email: emailNorm },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: displayName,
        email: emailNorm,
        password: null,
        dob: null,
        isAdult: false,
        isVerified: true,
      },
    });
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: displayName.length >= 2 ? displayName : user.name,
        isVerified: true,
      },
    });
  }

  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    dob: user.dob,
    isAdult: user.isAdult,
  };
};

// ============= COMPLETE DOB (GOOGLE USERS) =============
export const completeUserDob = async (
  userId: string,
  dob: Date
): Promise<{ id: string; name: string; email: string; dob: Date; isAdult: boolean }> => {
  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) {
    throw new Error('User not found');
  }
  if (existing.dob) {
    return {
      id: existing.id,
      name: existing.name,
      email: existing.email,
      dob: existing.dob,
      isAdult: existing.isAdult,
    };
  }

  const dobDate = parseAndValidateDob(dob);

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      dob: dobDate,
      isAdult: computeIsAdult(dobDate),
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dob: user.dob!,
    isAdult: user.isAdult,
  };
};

// ============= TOKEN REFRESH =============
export const refreshAccessToken = (refreshToken: string): string => {
  const decoded = verifyRefreshToken(refreshToken);
  return generateAccessToken(decoded.userId);
};

// ============= USER RETRIEVAL =============
export const getUserById = async (userId: string): Promise<{
  id: string;
  name: string;
  email: string;
  dob: Date | null;
  isAdult: boolean;
  isVerified: boolean;
}> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    dob: user.dob,
    isAdult: user.isAdult,
    isVerified: user.isVerified,
  };
};
