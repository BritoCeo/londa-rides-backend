import express from 'express';
import {
  register,
  login,
  sendOTPCode,
  verifyOTPCode,
  verifyEmail,
  getCurrentUser,
  otpLogin,
  unifiedOtpLogin,
  refreshToken
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOTPCode);
router.post('/verify-otp', verifyOTPCode);
router.post('/otp-login', unifiedOtpLogin);
router.post('/refresh-token', refreshToken);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.get('/me', isAuthenticated, getCurrentUser);

export default router;
