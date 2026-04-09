import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { verifyJWT, verifyAge18Plus, validateRegistrationInput } from '../middleware/auth.js';

const router = Router();

router.post('/register', validateRegistrationInput, authController.register);

router.post('/login/email', authController.loginWithEmail);

/** Body: { email, name } — Profile from Firebase after client signInWithPopup (no token verify on server). */
router.post('/google', authController.googleLogin);

router.post('/refresh-token', authController.refreshToken);

router.post('/complete-dob', verifyJWT, authController.completeDob);

router.get('/me', verifyJWT, authController.getCurrentUser);

router.post('/logout', verifyJWT, authController.logout);

router.get('/verify-age-18', verifyJWT, verifyAge18Plus, (req, res) => {
  res.json({
    success: true,
    message: 'User is 18 or older',
    isAdult: req.user?.isAdult,
  });
});

export default router;
