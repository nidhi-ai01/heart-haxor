import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import {
  verifyJWT,
  verifyAge18Plus,
  validateRegistrationInput,
  validateLoginInput,
  validateOTPInput,
} from '../middleware/auth.js';

const router = Router();

// ============= PUBLIC ROUTES =============

/**
 * POST /auth/register
 * Register a new user with email or phone
 * Body: { name, age, email?, phone?, password? }
 */
router.post('/register', validateRegistrationInput, authController.register);

/**
 * POST /auth/login/email
 * Login with email and password
 * Body: { email, password }
 */
router.post('/login/email', authController.loginWithEmail);

/**
 * POST /auth/send-otp
 * Send OTP to phone number
 * Body: { phone }
 */
router.post('/send-otp', authController.sendOTP);

/**
 * POST /auth/verify-otp
 * Verify OTP and login
 * Body: { phone, otp }
 */
router.post('/verify-otp', validateOTPInput, authController.verifyOTP);

/**
 * POST /auth/refresh-token
 * Get new access token using refresh token
 * Body: { refreshToken }
 */
router.post('/refresh-token', authController.refreshToken);

// ============= PROTECTED ROUTES =============

/**
 * GET /auth/me
 * Get current user information
 * Headers: { Authorization: "Bearer <accessToken>" }
 */
router.get('/me', verifyJWT, authController.getCurrentUser);

/**
 * POST /auth/logout
 * Logout user (mainly frontend operation)
 * Headers: { Authorization: "Bearer <accessToken>" }
 */
router.post('/logout', verifyJWT, authController.logout);

// ============= AGE-RESTRICTED ROUTES =============

/**
 * GET /auth/verify-age-18
 * Verify user is 18+ (for partner content)
 * Headers: { Authorization: "Bearer <accessToken>" }
 */
router.get('/verify-age-18', verifyJWT, verifyAge18Plus, (req, res) => {
  res.json({
    success: true,
    message: 'User is 18 or older',
    age: req.user?.age,
  });
});

export default router;
