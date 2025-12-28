// Email utility functions for verification and notifications
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Send email verification
export const sendEmailVerification = async (
  email: string, 
  userId: string
): Promise<boolean> => {
  try {
    // Generate verification token
    const token = jwt.sign(
      { userId },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@londarides.com',
      to: email,
      subject: 'Verify your Londa Rides account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A3A52;">Welcome to Londa Rides!</h2>
          <p>Thank you for signing up. Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1A3A52; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with Londa Rides, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email verification error:', error);
    return false;
  }
};

// Send ride confirmation email
export const sendRideConfirmation = async (
  email: string,
  rideDetails: any
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@londarides.com',
      to: email,
      subject: 'Ride Confirmed - Londa Rides',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A3A52;">Your ride has been confirmed!</h2>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Ride Details</h3>
            <p><strong>Pickup:</strong> ${rideDetails.pickupLocation}</p>
            <p><strong>Destination:</strong> ${rideDetails.destinationLocation}</p>
            <p><strong>Date & Time:</strong> ${rideDetails.scheduledTime}</p>
            <p><strong>Fare:</strong> NAD ${rideDetails.fare}</p>
            <p><strong>Driver:</strong> ${rideDetails.driverName}</p>
            <p><strong>Vehicle:</strong> ${rideDetails.vehicleDetails}</p>
          </div>
          <p>Your driver will contact you when they arrive at the pickup location.</p>
          <p>Thank you for choosing Londa Rides!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Ride confirmation email error:', error);
    return false;
  }
};

// Send driver verification email
export const sendDriverVerificationEmail = async (
  email: string,
  status: 'approved' | 'rejected',
  reason?: string
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const subject = status === 'approved' 
      ? 'Driver Verification Approved - Londa Rides'
      : 'Driver Verification Update - Londa Rides';
    
    const content = status === 'approved'
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #34A853;">Congratulations!</h2>
          <p>Your driver verification has been approved. You can now start accepting rides on the Londa Rides platform.</p>
          <div style="background-color: #f0fff4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #34A853;">
            <h3>Next Steps:</h3>
            <ul>
              <li>Complete your driver profile</li>
              <li>Set your availability</li>
              <li>Start accepting ride requests</li>
            </ul>
          </div>
          <p>Welcome to the Londa Rides driver community!</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #EA4335;">Verification Update</h2>
          <p>We've reviewed your driver verification documents and need some additional information.</p>
          <div style="background-color: #fef7f7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #EA4335;">
            <h3>Reason:</h3>
            <p>${reason || 'Please check your submitted documents and ensure they are clear and valid.'}</p>
          </div>
          <p>Please log in to your driver account to resubmit your documents.</p>
        </div>
      `;
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@londarides.com',
      to: email,
      subject,
      html: content
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Driver verification email error:', error);
    return false;
  }
};

// Send password reset email
export const sendPasswordReset = async (
  email: string,
  resetToken: string
): Promise<boolean> => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@londarides.com',
      to: email,
      subject: 'Reset your Londa Rides password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1A3A52;">Password Reset Request</h2>
          <p>You requested to reset your password. Click the button below to create a new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #1A3A52; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 1 hour.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Password reset email error:', error);
    return false;
  }
};
