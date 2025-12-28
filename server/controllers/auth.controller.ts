import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { FirestoreService } from '../utils/firestore-service';
import { sendOTP, verifyOTP } from '../utils/sms';
import { sendEmailVerification } from '../utils/email';
import { FirebaseAuthService } from '../utils/firebase-auth';

// Register new user
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, userType, password } = req.body;

    // Check if user already exists
    const existingUser = await FirestoreService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User already exists with this email'
        }
      });
    }

    const existingUserByPhone = await FirestoreService.getUserByPhone(phone);
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User already exists with this phone number'
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await FirestoreService.createUser({
      name,
      email,
      phone_number: phone,
      userType,
      password: hashedPassword,
      isVerified: false
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Send verification email
    if (email) {
      await sendEmailVerification(email, user.id);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          userType: user.userType,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_FAILED',
        message: 'Failed to register user'
      }
    });
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await FirestoreService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          userType: user.userType,
          isVerified: user.isVerified
        },
        token
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_FAILED',
        message: 'Failed to login user'
      }
    });
  }
};

// Verify OTP
export const verifyOTPCode = async (req: Request, res: Response) => {
  try {
    const { phone_number, otp, sessionInfo } = req.body;

    console.log(`🔥 Verifying Firebase OTP for user: ${phone_number}`);
    
    // Use Firebase Auth Service for verification
    const result = await FirebaseAuthService.verifyPhoneOTP(phone_number, otp, sessionInfo);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_OTP',
          message: result.message || 'Invalid OTP'
        }
      });
    }

    // Find user by phone or create new user
    let user = await FirestoreService.getUserByPhone(phone_number);
    if (!user) {
      // Create new user account
      console.log(`🆕 Creating new user account for ${phone_number}`);
      user = await FirestoreService.createUser({
        phone_number: phone_number,
        name: 'User', // Default name, can be updated later
        isVerified: false
      });
    }

    // Update user verification status
    await FirestoreService.updateUser(user.id, { isVerified: true });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, userType: user.userType },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          userType: user.userType,
          isVerified: true
        },
        token
      }
    });
  } catch (error: any) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OTP_VERIFICATION_FAILED',
        message: 'Failed to verify OTP'
      }
    });
  }
};

// Send OTP
export const sendOTPCode = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.body;

    // Send OTP
    await sendOTP(phone_number);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully'
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SEND_OTP_FAILED',
        message: 'Failed to send OTP'
      }
    });
  }
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, token } = req.body;

    // Find user by email
    const user = await FirestoreService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Update user verification status
    await FirestoreService.updateUser(user.id, { isVerified: true });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EMAIL_VERIFICATION_FAILED',
        message: 'Failed to verify email'
      }
    });
  }
};

// Forgot password
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await FirestoreService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // TODO: Send reset email with token
    // await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset instructions sent to email'
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FORGOT_PASSWORD_FAILED',
        message: 'Failed to process forgot password request'
      }
    });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const userId = decoded.userId;

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update user password
    await FirestoreService.updateUser(userId, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESET_PASSWORD_FAILED',
        message: 'Failed to reset password'
      }
    });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated'
        }
      });
    }

    const user = await FirestoreService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone_number: user.phone_number,
          userType: user.userType,
          isVerified: user.isVerified
        }
      }
    });
  } catch (error: any) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_FAILED',
        message: 'Failed to get current user'
      }
    });
  }
};

// OTP Login for driver registration
// Unified OTP Login for both users and drivers
export const unifiedOtpLogin = async (req: Request, res: Response) => {
  try {
    const { phone_number, userType } = req.body;

    console.log(`📱 Unified OTP Login: ${phone_number} (${userType || 'user'})`);

    // Validate required fields
    if (!phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Use Firebase Auth Service for OTP
    const result = await FirebaseAuthService.sendPhoneVerification(phone_number);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        data: {
          phone_number: phone_number,
          userType: userType || 'user',
          sessionInfo: result.sessionInfo,
          nextStep: 'verify-otp',
          endpoint: userType === 'driver' ? '/api/v1/driver/verify-otp' : '/api/v1/verify-otp'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || 'Failed to send OTP'
      });
    }
  } catch (error: any) {
    console.error('Unified OTP Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during OTP login'
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { user_id, userType } = req.body;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Check if user exists
    let user = null;
    if (userType === 'driver') {
      user = await FirestoreService.getDriverById(user_id);
    } else {
      user = await FirestoreService.getUserById(user_id);
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new JWT token
    const token = jwt.sign(
      { userId: user.id, userType: userType || 'user' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          phone_number: user.phone_number,
          userType: userType || 'user',
          isVerified: user.isVerified
        }
      }
    });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh token'
    });
  }
};

export const otpLogin = async (req: Request, res: Response) => {
  try {
    const { phone_number } = req.body;

    console.log(`📱 OTP Login for driver registration: ${phone_number}`);

    // Send OTP
    await sendOTP(phone_number);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully for driver registration',
      data: {
        phone_number: phone_number,
        nextStep: 'verify-otp',
        endpoint: '/api/v1/driver/verify-otp'
      }
    });
  } catch (error: any) {
    console.error('OTP Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'OTP_LOGIN_FAILED',
        message: 'Failed to send OTP for driver registration'
      }
    });
  }
};