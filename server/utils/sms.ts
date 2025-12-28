// SMS utility functions for OTP and notifications
import axios from 'axios';

// Send OTP via SMS
export const sendOTP = async (phone: string): Promise<boolean> => {
  try {
    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Store OTP in database or cache (Redis recommended for production)
    // For now, we'll just log it
    console.log(`OTP for ${phone}: ${otp}`);
    
    // TODO: Integrate with SMS provider (Twilio, AWS SNS, etc.)
    // For development, we'll simulate success
    const message = `Your Londa Rides verification code is: ${otp}. This code expires in 5 minutes.`;
    
    // Example with Twilio (uncomment when ready)
    /*
    const response = await axios.post(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      new URLSearchParams({
        To: phone,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: message
      }),
      {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN
        }
      }
    );
    */
    
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
};

// Verify OTP
export const verifyOTP = async (phone: string, code: string): Promise<boolean> => {
  try {
    // TODO: Retrieve OTP from database/cache and verify
    // For development, accept any 4-digit code
    if (code.length === 4 && /^\d+$/.test(code)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('OTP verification error:', error);
    return false;
  }
};

// Send ride notification SMS
export const sendRideNotification = async (
  phone: string, 
  message: string
): Promise<boolean> => {
  try {
    // TODO: Implement ride notification SMS
    console.log(`Ride notification to ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error('Ride notification SMS error:', error);
    return false;
  }
};

// Send driver notification SMS
export const sendDriverNotification = async (
  phone: string, 
  message: string
): Promise<boolean> => {
  try {
    // TODO: Implement driver notification SMS
    console.log(`Driver notification to ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error('Driver notification SMS error:', error);
    return false;
  }
};
