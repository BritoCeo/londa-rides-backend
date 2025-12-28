require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { FirestoreService } from "../utils/firestore-service";
import jwt from "jsonwebtoken";
import { sendToken } from "../utils/send-token";
import { nylas } from "../app";
import { FirebaseAuthService } from "../utils/firebase-auth";
import { verifyOTP } from "../utils/sms";

// Twilio client - optional for development
let client: any = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.log("Twilio not configured, using development mode");
}

// sending otp to driver phone number
export const sendingOtpToPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    console.log(`🔥 Sending Firebase SMS to driver: ${phone_number}`);
    
    // Use Firebase Auth Service for drivers
    const result = await FirebaseAuthService.sendPhoneVerification(phone_number);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        sessionInfo: result.sessionInfo,
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "Failed to send OTP",
      });
    }
  } catch (error) {
    console.log("Firebase driver registration error:", error);
    res.status(400).json({
      success: false,
      message: "Server error",
    });
  }
};

// verifying otp for login
export const verifyPhoneOtpForLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp, sessionInfo } = req.body;

    console.log(`🔥 Verifying Firebase OTP for driver login: ${phone_number}`);
    
    // Use Firebase Auth Service for verification
    const result = await FirebaseAuthService.verifyPhoneOTP(phone_number, otp, sessionInfo);
    
    if (result.success) {
      // For development mode without database
      const mockDriver = {
        id: result.uid || "firebase_driver_123",
        phone_number: phone_number,
        name: "Firebase Driver",
        email: null,
        firebase_uid: result.uid,
        status: "online"
      };
      
      sendToken(mockDriver, res);
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "OTP verification failed",
      });
    }
  } catch (error) {
    console.log("Driver OTP verification error:", error);
    res.status(400).json({
      success: false,
      message: "Server error",
    });
  }
};

// verifying phone otp for registration
export const verifyPhoneOtpForRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp, sessionInfo } = req.body;

    console.log(`🔥 Verifying Firebase OTP for driver registration: ${phone_number}`);
    
    // Use Firebase Auth Service for verification
    const result = await FirebaseAuthService.verifyPhoneOTP(phone_number, otp, sessionInfo);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || 'Invalid OTP'
      });
    }

    // Check if driver already exists
    let driver = await FirestoreService.getDriverByPhone(phone_number);
    if (!driver) {
      // Create new driver
      console.log(`🆕 Creating new driver for ${phone_number}`);
      driver = await FirestoreService.createDriver({
        phone_number: phone_number,
        name: 'Driver', // Default name, can be updated later
        isVerified: false
      });
    }

    // Update driver verification status
    await FirestoreService.updateDriver(driver.id, { isVerified: true });

    // Generate JWT token
    const token = jwt.sign(
      { userId: driver.id, userType: 'driver' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Driver OTP verified successfully',
      data: {
        driver: {
          id: driver.id,
          name: driver.name,
          phone_number: driver.phone_number,
          isVerified: true
        },
        token: token
      }
    });
  } catch (error: any) {
    console.log("Driver registration OTP verification error:", error);
    res.status(400).json({
      success: false,
      message: "Server error",
    });
  }
};

// sending otp to email
export const sendingOtpToEmail = async (req: Request, res: Response) => {
  try {
    const {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const driver = {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    };
    const token = jwt.sign(
      {
        driver,
        otp,
      },
      process.env.EMAIL_ACTIVATION_SECRET!,
      {
        expiresIn: "5m",
      }
    );
    try {
      await nylas.messages.send({
        identifier: process.env.USER_GRANT_ID!,
        requestBody: {
          to: [{ name: name, email: email }],
          subject: "Verify your email address!",
          body: `
            <p>Hi ${name},</p>
        <p>Your Londa verification code is ${otp}. If you didn't request for this OTP, please ignore this email!</p>
        <p>Thanks,<br>Londa Team</p>
            `,
        },
      });
      res.status(201).json({
        success: true,
        token,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      console.log(error);
    }
  } catch (error) {
    console.log(error);
  }
};

// Create driver account directly (bypassing email OTP)
export const createDriverAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone_number } = req.body;

    console.log(`📝 Creating driver account for: ${name}`);

    // Validate required fields
    if (!name || !email || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, and phone_number are required",
      });
    }

    // Check if driver already exists by email
    const existingDriverByEmail = await FirestoreService.getDriverByEmail(email);
    if (existingDriverByEmail) {
      return res.status(400).json({
        success: false,
        message: "Driver already exists with this email",
      });
    }

    // Check if driver already exists by phone number
    const existingDriverByPhone = await FirestoreService.getDriverByPhone(phone_number);
    if (existingDriverByPhone) {
      return res.status(400).json({
        success: false,
        message: "Driver already exists with this phone number",
      });
    }

    // Create new driver account
    console.log(`🆕 Creating new driver in Firestore`);
    const driver = await FirestoreService.createDriver({
      name: name,
      email: email,
      phone_number: phone_number,
      isVerified: false,
      status: 'inactive' // Driver needs to complete verification
    });
    console.log(`✅ Driver created successfully:`, driver);

    // Return success response
    res.status(201).json({
      success: true,
      message: "Driver account created successfully",
      data: {
        driver: {
          id: driver.id,
          name: driver.name,
          email: driver.email,
          phone_number: driver.phone_number,
          isVerified: driver.isVerified,
          status: driver.status
        }
      }
    });
  } catch (error) {
    console.log("Create driver account error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create driver account",
    });
  }
};

// verifying email otp and creating driver account
export const verifyingEmailOtp = async (req: Request, res: Response) => {
  try {
    const { otp, token } = req.body;

    const newDriver: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );

    if (newDriver.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is not correct or expired!",
      });
    }

    const {
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    } = newDriver.driver;

    const driver = await FirestoreService.createDriver({
      name,
      country,
      phone_number,
      email,
      vehicle_type,
      registration_number,
      registration_date,
      driving_license,
      vehicle_color,
      rate,
    });
    sendToken(driver, res);
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Your otp is expired!",
    });
  }
};

// get logged in driver data
export const getLoggedInDriverData = async (req: any, res: Response) => {
  try {
    const driver = req.driver;

    res.status(201).json({
      success: true,
      driver,
    });
  } catch (error) {
    console.log(error);
  }
};

// updating driver status
export const updateDriverStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;

    const driver = await FirestoreService.updateDriver(req.driver.id!, {
      status: status as any,
    });
    res.status(201).json({
      success: true,
      driver,
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// get drivers data with id
export const getDriversById = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query as any;
    console.log(ids,'ids')
    if (!ids) {
      return res.status(400).json({ message: "No driver IDs provided" });
    }

    const driverIds = ids.split(",");

    // Fetch drivers from Firestore
    const drivers = await Promise.all(
      driverIds.map((id: string) => FirestoreService.getDriverById(id))
    );
    const validDrivers = drivers.filter(driver => driver !== null);

    res.json(validDrivers);
  } catch (error) {
    console.error("Error fetching driver data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// creating new ride
export const newRide = async (req: any, res: Response) => {
  try {
    const {
      userId,
      charge,
      status,
      currentLocationName,
      destinationLocationName,
      distance,
    } = req.body;

    const newRide = await FirestoreService.createRide({
      userId,
      driverId: req.driver.id,
      fare: parseFloat(charge),
      status: status as any,
      currentLocationName,
      destinationLocationName,
      distance,
    });
    res.status(201).json({ success: true, newRide });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// updating ride status
export const updatingRideStatus = async (req: any, res: Response) => {
  try {
    const { rideId, rideStatus } = req.body;

    // Validate input
    if (!rideId || !rideStatus) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid input data" });
    }

    const driverId = req.driver?.id;
    if (!driverId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Fetch the ride data to get the rideCharge
    const ride = await FirestoreService.getRideById(rideId);

    if (!ride || ride.driverId !== driverId) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    const rideCharge = ride.fare || 0;

    // Update ride status
    const updatedRide = await FirestoreService.updateRide(rideId, {
      status: rideStatus as any,
    });

    if (rideStatus === "Completed") {
      // Update driver stats if the ride is completed
      const driver = await FirestoreService.getDriverById(driverId);
      if (driver) {
        await FirestoreService.updateDriver(driverId, {
          totalEarning: (driver.totalEarning || 0) + rideCharge,
          totalRides: (driver.totalRides || 0) + 1,
        });
      }
    }

    res.status(201).json({
      success: true,
      updatedRide,
    });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// getting drivers rides
export const getAllRides = async (req: any, res: Response) => {
  try {
    const rides = await FirestoreService.getRidesByDriverId(req.driver?.id);
    
    // Get user details for each ride
    const ridesWithDetails = await Promise.all(
      rides.map(async (ride) => {
        const user = await FirestoreService.getUserById(ride.userId);
        return {
          ...ride,
          user,
        };
      })
    );
    
    res.status(201).json({
      rides: ridesWithDetails,
    });
  } catch (error) {
    console.log("Get driver rides error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get rides"
    });
  }
};

// Get available rides for driver
export const getAvailableRides = async (req: any, res: Response) => {
  try {
    const driverId = req.driver.id;

    // Get pending rides that match driver's vehicle type and location
    const rides = await FirestoreService.getPendingRides();
    
    // Get user details for each ride
    const ridesWithDetails = await Promise.all(
      rides.map(async (ride) => {
        const user = await FirestoreService.getUserById(ride.userId);
        return {
          ...ride,
          user,
        };
      })
    );

    res.status(200).json({
      success: true,
      rides: ridesWithDetails
    });
  } catch (error) {
    console.log("Get available rides error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get available rides"
    });
  }
};

// Accept ride
export const acceptRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;
    const driverId = req.driver.id;

    const ride = await FirestoreService.getRideById(rideId);

    if (!ride || ride.status !== "pending") {
      return res.status(404).json({
        success: false,
        message: "Ride not found or already taken"
      });
    }

    await FirestoreService.updateRide(rideId, {
      driverId,
      status: "accepted"
    });

    res.status(200).json({
      success: true,
      message: "Ride accepted successfully"
    });
  } catch (error) {
    console.log("Accept ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to accept ride"
    });
  }
};

// Decline ride
export const declineRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;

    await FirestoreService.updateRide(rideId, { status: "declined" });

    res.status(200).json({
      success: true,
      message: "Ride declined successfully"
    });
  } catch (error) {
    console.log("Decline ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to decline ride"
    });
  }
};

// Start ride
export const startRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;
    const driverId = req.driver.id;

    const ride = await FirestoreService.getRideById(rideId);

    if (!ride || ride.driverId !== driverId || ride.status !== "accepted") {
      return res.status(404).json({
        success: false,
        message: "Ride not found or not accepted"
      });
    }

    await FirestoreService.updateRide(rideId, { status: "started" });

    res.status(200).json({
      success: true,
      message: "Ride started successfully"
    });
  } catch (error) {
    console.log("Start ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to start ride"
    });
  }
};

// Complete ride
export const completeRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;
    const driverId = req.driver.id;

    const ride = await FirestoreService.getRideById(rideId);

    if (!ride || ride.driverId !== driverId || ride.status !== "started") {
      return res.status(404).json({
        success: false,
        message: "Ride not found or not started"
      });
    }

    await FirestoreService.updateRide(rideId, { status: "completed" });

    // Update driver earnings
    const driver = await FirestoreService.getDriverById(driverId);
    if (driver) {
      await FirestoreService.updateDriver(driverId, {
        totalEarning: (driver.totalEarning || 0) + (ride.fare || 0),
        totalRides: (driver.totalRides || 0) + 1
      });
    }

    res.status(200).json({
      success: true,
      message: "Ride completed successfully"
    });
  } catch (error) {
    console.log("Complete ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to complete ride"
    });
  }
};

// Driver subscription
export const subscribeDriver = async (req: any, res: Response) => {
  try {
    const { paymentMethod } = req.body;
    const driverId = req.driver.id;

    // Create driver subscription (NAD 150.00 per month as per Londa Rides CC rules)
    const subscription = await FirestoreService.createPayment({
      userId: driverId,
      amount: 150.00,
      currency: "NAD",
      paymentMethod,
      status: "completed"
    });

    res.status(200).json({
      success: true,
      message: "Driver subscription activated successfully",
      subscription
    });
  } catch (error) {
    console.log("Driver subscription error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to subscribe"
    });
  }
};

// Get subscription status
export const getSubscriptionStatus = async (req: any, res: Response) => {
  try {
    const driverId = req.driver.id;

    // Get driver subscription from payments
    const payments = await FirestoreService.getPaymentsByUserId(driverId);
    const subscription = payments.find(payment => payment.amount === 150.00);

    res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.log("Get subscription status error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get subscription status"
    });
  }
};

// Update driver location
export const updateDriverLocation = async (req: any, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    const driverId = req.driver.id;

    // Update driver location in database
    await FirestoreService.updateDriverLocation(driverId, latitude, longitude);

    res.status(200).json({
      success: true,
      message: "Location updated successfully"
    });
  } catch (error) {
    console.log("Update location error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update location"
    });
  }
};

// Get ride status
export const getRideStatus = async (req: any, res: Response) => {
  try {
    const { rideId } = req.params;
    const driverId = req.driver.id;

    const ride = await FirestoreService.getRideById(rideId);

    if (!ride || ride.driverId !== driverId) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    const user = await FirestoreService.getUserById(ride.userId);

    res.status(200).json({
      success: true,
      ride: {
        ...ride,
        user
      }
    });
  } catch (error) {
    console.log("Get ride status error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get ride status"
    });
  }
};

// Get driver earnings
export const getDriverEarnings = async (req: any, res: Response) => {
  try {
    const driverId = req.driver.id;

    const driver = await FirestoreService.getDriverById(driverId);
    const analytics = await FirestoreService.getDriverAnalytics(driverId);

    res.status(200).json({
      success: true,
      earnings: {
        totalEarnings: driver?.totalEarning || 0,
        totalRides: driver?.totalRides || 0,
        averageRating: driver?.ratings || 0,
        monthlyEarnings: analytics.totalRides * 13.00 // Approximate monthly earnings
      }
    });
  } catch (error) {
    console.log("Get driver earnings error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get driver earnings"
    });
  }
};

// Get driver ride analytics
export const getDriverRideAnalytics = async (req: any, res: Response) => {
  try {
    const driverId = req.driver.id;

    const analytics = await FirestoreService.getDriverAnalytics(driverId);

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.log("Get driver ride analytics error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get driver ride analytics"
    });
  }
};

// Get driver performance analytics
export const getDriverPerformanceAnalytics = async (req: any, res: Response) => {
  try {
    const driverId = req.driver.id;

    const driver = await FirestoreService.getDriverById(driverId);
    const analytics = await FirestoreService.getDriverAnalytics(driverId);

    res.status(200).json({
      success: true,
      performance: {
        averageRating: driver?.ratings || 0,
        totalRides: driver?.totalRides || 0,
        totalEarnings: driver?.totalEarning || 0,
        cancelledRides: driver?.cancelRides || 0,
        recentRides: analytics.totalRides,
        cancellationRate: driver && driver.totalRides > 0 ? ((driver.cancelRides || 0) / driver.totalRides) * 100 : 0
      }
    });
  } catch (error) {
    console.log("Get driver performance analytics error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get driver performance analytics"
    });
  }
};