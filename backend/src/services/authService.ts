import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

  return jwt.sign({ userId }, secret, { expiresIn } as any);
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'your_super_secret_refresh_key_change_in_production';
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRY || '7d';

  return jwt.sign({ userId }, secret, { expiresIn } as any);
};

export const verifyAccessToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const verifyRefreshToken = (token: string): { userId: string } => {
  const secret = process.env.REFRESH_TOKEN_SECRET || 'your_super_secret_refresh_key_change_in_production';

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

// ============= OTP UTILITIES =============
export const generateOTP = (): number => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Create OTP
export const createOTP = async (
  userId: string,
  phone: string
): Promise<{ otp: number; expiresAt: Date }> => {

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  // Delete existing OTPs
  await prisma.oTP.deleteMany({
    where: { userId },
  });

  // Create new OTP
  await prisma.oTP.create({
    data: {
      userId,
      phone,
      otp,
      expiresAt,
    },
  });

  return { otp, expiresAt };
};

// Verify OTP
export const verifyOTP = async (
  userId: string,
  otp: number
): Promise<boolean> => {

  const otpRecord = await prisma.oTP.findFirst({
    where: { userId, otp },
  });

  if (!otpRecord) {
    return false;
  }

  // Check expiration
  if (new Date() > otpRecord.expiresAt) {
    await prisma.oTP.delete({ where: { id: otpRecord.id } });
    return false;
  }

  // Delete OTP after successful verification
  await prisma.oTP.delete({ where: { id: otpRecord.id } });

  return true;
};

// ============= VALIDATION UTILITIES =============
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

export const validatePhone = (phone: string): boolean => {
  // Accept phone numbers in format: +1234567890 or 1234567890
  return /^(\+)?[1-9]\d{1,14}$/.test(phone.replace(/\s/g, ''));
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

export const validateAge = (age: number): boolean => {
  return age >= 13 && age <= 120;
};

// ============= USER REGISTRATION =============
export const registerUser = async (
  name: string,
  age: number,
  email: string | null,
  phone: string | null,
  password: string | null
): Promise<{ userId: string; message: string }> => {
  // Validate inputs
  if (!name || name.length < 2) {
    throw new Error('Name must be at least 2 characters long');
  }

  if (!validateAge(age)) {
    throw new Error('Age must be between 13 and 120');
  }

  if (!email && !phone) {
    throw new Error('Either email or phone is required');
  }

  // If email is provided
  if (email) {
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!password) {
      throw new Error('Password is required for email registration');
    }

    const pwValidation = validatePassword(password);
    if (!pwValidation.valid) {
      throw new Error(pwValidation.errors.join(', '));
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      throw new Error('Email already registered');
    }
  }

  // If phone is provided
  if (phone) {
    if (!validatePhone(phone)) {
      throw new Error('Invalid phone format');
    }

    // Check if phone already exists
    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingPhone) {
      throw new Error('Phone already registered');
    }
  }

  // Hash password if provided
  const hashedPassword = password ? await hashPassword(password) : null;

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      age,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      isVerified: false,
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
): Promise<{ userId: string; name: string; age: number; email: string; phone: string | null }> => {
  if (!validateEmail(email)) {
    throw new Error('Invalid email format');
  }

  if (!password) {
    throw new Error('Password is required');
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  if (!user.password) {
    throw new Error('This account uses phone number for login');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  return {
    userId: user.id,
    name: user.name,
    age: user.age,
    email: user.email || '',
    phone: user.phone,
  };
};

// ============= PHONE LOGIN (OTP) =============
export const sendPhoneOTP = async (
  phone: string
): Promise<{ otp: number; expiresAt: Date }> => {

  if (!validatePhone(phone)) {
    throw new Error("Invalid phone format");
  }

  // Find user by phone
  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    throw new Error("Phone number not registered");
  }

  // Generate and store OTP
  return createOTP(user.id, phone);
};



export const verifyPhoneOTP = async (
  phone: string,
  otp: string
): Promise<{
  userId: string;
  name: string;
  age: number;
  email: string | null;
  phone: string;
}> => {

  if (!validatePhone(phone)) {
    throw new Error("Invalid phone format");
  }

  const user = await prisma.user.findUnique({
    where: { phone },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Convert OTP string → number
  const isOTPValid = await verifyOTP(user.id, Number(otp));

  if (!isOTPValid) {
    throw new Error("Invalid or expired OTP");
  }

  // Mark user as verified
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  return {
    userId: user.id,
    name: user.name,
    age: user.age,
    email: user.email,
    phone: user.phone || "",
  };
};
// ============= TOKEN REFRESH =============
export const refreshAccessToken = (refreshToken: string): string => {
  const decoded = verifyRefreshToken(refreshToken);
  return generateAccessToken(decoded.userId);
};

// ============= USER RETRIEVAL =============
export const getUserById = async (
  userId: string
): Promise<{ id: string; name: string; age: number; email: string | null; phone: string | null; isVerified: boolean }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user.id,
    name: user.name,
    age: user.age,
    email: user.email,
    phone: user.phone,
    isVerified: user.isVerified,
  };
};
