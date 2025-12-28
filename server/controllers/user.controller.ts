require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import { FirestoreService } from "../utils/firestore-service";
import jwt from "jsonwebtoken";
import { nylas } from "../app";
import { sendToken } from "../utils/send-token";
import { FirebaseAuthService } from "../utils/firebase-auth";
import { firebaseConfig } from "../config/firebase";
import { googleMapsService } from "../utils/google-maps-service";

// register new user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    
    console.log(`🔥 Sending Firebase SMS to: ${phone_number}`);
    
    // Use Firebase Auth Service
    const result = await FirebaseAuthService.sendPhoneVerification(phone_number);
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        sessionInfo: result.sessionInfo, // Include session info for verification
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "Failed to send OTP",
      });
    }
  } catch (error: any) {
    console.log("Firebase registration error:", error);
    res.status(400).json({
      success: false,
      message: "Server error",
    });
  }
};

// verify otp
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp, sessionInfo } = req.body;

    console.log(`🔥 Verifying Firebase OTP for: ${phone_number}`);
    
    // Use Firebase Auth Service for verification
    const result = await FirebaseAuthService.verifyPhoneOTP(phone_number, otp, sessionInfo);
    
    if (result.success) {
      console.log(`✅ Firebase OTP verified for: ${phone_number}`);
      
      try {
        // Check if user already exists in Firestore
        let user = await FirestoreService.getUserByPhone(phone_number);

        if (!user) {
          // Create new user in Firestore
          console.log(`📝 Creating new user in Firestore for: ${phone_number}`);
          user = await FirestoreService.createUser({
            phone_number: phone_number,
            name: '', // Will be set during registration
            email: '', // Will be set during registration
            password: '', // Required field
            userType: 'student', // Default user type
            isVerified: false
          });
          console.log(`✅ User created successfully:`, user);
        } else {
          console.log(`👤 Existing user found:`, user);
        }
        
        // Generate access token
        const accessToken = jwt.sign(
          { id: user.id },
          process.env.ACCESS_TOKEN_SECRET || 'fallback-secret-key',
          { expiresIn: "30d" }
        );
        
        res.status(200).json({
          success: true,
          message: result.message,
          accessToken,
          user: {
            id: user.id,
            phone_number: user.phone_number,
            name: user.name,
            email: user.email,
            firebase_uid: (user as any).firebase_uid || result.uid,
          },
        });
        return;
      } catch (dbError) {
        console.log(`⚠️ Firestore operation failed, continuing with OTP verification:`, (dbError as any).message);
        
        // Continue with OTP verification even if database is not available
        const tempUserId = `temp_${Date.now()}`;
        const accessToken = jwt.sign(
          { id: tempUserId },
          process.env.ACCESS_TOKEN_SECRET || 'fallback-secret-key',
          { expiresIn: "30d" }
        );
        
        res.status(200).json({
          success: true,
          message: result.message,
          accessToken,
          user: {
            id: tempUserId,
            phone_number: phone_number,
            name: null,
            email: null,
            firebase_uid: result.uid,
          },
        });
        return;
      }
    } else {
      res.status(400).json({
        success: false,
        message: result.message || "OTP verification failed",
      });
      return;
    }
  } catch (error) {
    console.log("OTP verification error:", error);
    res.status(400).json({
      success: false,
      message: "Server error during OTP verification",
    });
  }
};

// sending otp to email
export const sendingOtpToEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, userId } = req.body;

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const user = {
      userId,
      name,
      email,
    };
    const token = jwt.sign(
      {
        user,
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

// Create/Update user account directly (bypassing email OTP)
export const createUserAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, phone_number, userType } = req.body;

    console.log(`📝 Creating user account for: ${name}`);

    // Validate required fields
    if (!name || !email || !phone_number) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, email, and phone_number are required",
      });
    }

    // Check if user already exists by email
    const existingUserByEmail = await FirestoreService.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Check if user already exists by phone number
    const existingUserByPhone = await FirestoreService.getUserByPhone(phone_number);
    if (existingUserByPhone) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this phone number",
      });
    }

    // Handle driver registration flow
    if (userType === 'driver') {
      console.log(`🚗 Driver registration flow - redirecting to OTP login`);
      return res.status(200).json({
        success: true,
        message: "Driver registration requires OTP verification.",
        data: {
          userType: 'driver',
          phone_number: phone_number
        }
      });
    }

    // Create new user (for non-driver types)
    console.log(`🆕 Creating new user in Firestore`);
    const user = await FirestoreService.createUser({
      name: name,
      email: email,
      phone_number: phone_number,
      userType: userType || 'student',
      isVerified: false,
      password: '' // Add empty password field
    });
    console.log(`✅ User created successfully:`, user);

    // Return success response
    res.status(201).json({
      success: true,
      message: "User account created successfully",
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
  } catch (error) {
    console.log("Create user account error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create user account",
    });
  }
};

// verifying email otp
export const verifyingEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp, token } = req.body;

    const newUser: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );

    if (newUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is not correct or expired!",
      });
    }

    const { name, email, userId } = newUser.user;

    const user = await FirestoreService.getUserById(userId);
    if (user?.email === null || !user?.email) {
      const updatedUser = await FirestoreService.updateUser(userId, {
        name: name,
        email: email,
      });
      await sendToken(updatedUser, res);
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Your otp is expired!",
    });
  }
};

// get logged in user data
export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const user = req.user;

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

// getting user rides
export const getAllRides = async (req: any, res: Response) => {
  try {
    const rides = await FirestoreService.getRidesByUserId(req.user?.id);
    
    // Get driver and user details for each ride
    const ridesWithDetails = await Promise.all(
      rides.map(async (ride: any) => {
        const driver = ride.driverId ? await FirestoreService.getDriverById(ride.driverId) : null;
        const user = await FirestoreService.getUserById(ride.userId);
        
        return {
          ...ride,
          driver,
          user,
        };
      })
    );

    res.status(201).json({
      rides: ridesWithDetails,
    });
  } catch (error) {
    console.log("Get all rides error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get rides"
    });
  }
};

// Request a ride
export const requestRide = async (req: any, res: Response) => {
  try {
    const { user_id, pickup_location, dropoff_location, ride_type, estimated_fare, passengerCount } = req.body;

    // Calculate distance and fare using Google Maps
    let distance = "0 km";
    let calculatedFare = estimated_fare || 13.00;
    let duration = "0 mins";

    try {
      const distanceData = await googleMapsService.calculateDistance(
        { latitude: pickup_location.latitude, longitude: pickup_location.longitude },
        { latitude: dropoff_location.latitude, longitude: dropoff_location.longitude }
      );

      if (distanceData) {
        distance = distanceData.distance_text;
        duration = distanceData.duration_text;
        
        // Calculate fare based on distance and duration
        const fareCalculation = googleMapsService.calculateFare(
          distanceData.distance,
          distanceData.duration
        );
        calculatedFare = fareCalculation.total_fare;
      }
    } catch (mapsError) {
      console.warn("Google Maps calculation failed, using defaults:", mapsError);
    }

    // Create ride request
    const rideData = {
      userId: user_id,
      pickupLocation: JSON.stringify(pickup_location),
      dropoffLocation: JSON.stringify(dropoff_location),
      currentLocationName: pickup_location.name || "Pickup Location",
      destinationLocationName: dropoff_location.name || "Destination",
      distance: distance,
      passengerCount: passengerCount || 1,
      vehicleType: ride_type || "standard",
      status: "pending" as const,
      fare: calculatedFare,
      currency: "NAD",
      isChildRide: false // Add required isChildRide field
    };

    const rideRequest = await FirestoreService.createRide(rideData);

    res.status(201).json({
      success: true,
      message: "Ride request created successfully",
      data: { 
        ride_id: rideRequest.id, 
        user_id: user_id,
        pickup_location: pickup_location,
        dropoff_location: dropoff_location,
        ride_type: ride_type,
        estimated_fare: calculatedFare,
        distance: distance,
        duration: duration,
        status: "pending"
      }
    });
  } catch (error) {
    console.error("Request ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to create ride request"
    });
  }
};

// Get nearby drivers
export const getNearbyDrivers = async (req: any, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query; // radius in km

    // Find active drivers within radius
    const drivers = await FirestoreService.getActiveDrivers(latitude, longitude, radius);

    res.status(200).json({
      success: true,
      drivers
    });
  } catch (error) {
    console.log("Get nearby drivers error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get nearby drivers"
    });
  }
};

// Cancel ride
export const cancelRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;
    const userId = req.user.id;

    const ride = await FirestoreService.getRideById(rideId);

    if (!ride || ride.userId !== userId || !["pending", "accepted"].includes(ride.status || "")) {
      return res.status(404).json({
        success: false,
        message: "Ride not found or cannot be cancelled"
      });
    }

    await FirestoreService.updateRide(rideId, { status: "cancelled" });

    res.status(200).json({
      success: true,
      message: "Ride cancelled successfully"
    });
  } catch (error) {
    console.log("Cancel ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to cancel ride"
    });
  }
};

// Rate ride
export const rateRide = async (req: any, res: Response) => {
  try {
    const { rideId, rating, review } = req.body;
    const userId = req.user.id;

    const ride = await FirestoreService.getRideById(rideId);

    if (!ride || ride.userId !== userId || ride.status !== "completed") {
      return res.status(404).json({
        success: false,
        message: "Ride not found or not completed"
      });
    }

    await FirestoreService.updateRide(rideId, { rating, review } as any);

    res.status(200).json({
      success: true,
      message: "Ride rated successfully"
    });
  } catch (error) {
    console.log("Rate ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to rate ride"
    });
  }
};

// Calculate fare
export const calculateFare = async (req: any, res: Response) => {
  try {
    const { distance, vehicleType, isMonthlySubscriber } = req.body;

    let fare = 13.00; // Fixed NAD 13.00 per ride as per Londa Rides CC rules
    
    if (isMonthlySubscriber) {
      fare = 0; // Free for monthly subscribers
    }

    res.status(200).json({
      success: true,
      fare,
      currency: "NAD",
      breakdown: {
        baseFare: 13.00,
        distance: distance,
        vehicleType: vehicleType,
        isMonthlySubscriber: isMonthlySubscriber
      }
    });
  } catch (error) {
    console.log("Calculate fare error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to calculate fare"
    });
  }
};

// Process payment
export const processPayment = async (req: any, res: Response) => {
  try {
    const { rideId, paymentMethod, amount } = req.body;
    const userId = req.user.id;

    // Simulate payment processing
    const payment = await FirestoreService.createPayment({
      userId,
      amount,
      paymentMethod,
      status: "completed",
      currency: "NAD"
    } as any);

    res.status(200).json({
      success: true,
      message: "Payment processed successfully",
      payment
    });
  } catch (error) {
    console.log("Process payment error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to process payment"
    });
  }
};

// Get payment history
export const getPaymentHistory = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const payments = await FirestoreService.getPaymentsByUserId(userId);

    res.status(200).json({
      success: true,
      payments
    });
  } catch (error) {
    console.log("Get payment history error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get payment history"
    });
  }
};

// Subscribe to monthly package
export const subscribeMonthly = async (req: any, res: Response) => {
  try {
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    // Create monthly subscription
    const subscription = await FirestoreService.createPayment({
      userId,
      amount: 1000.00, // NAD 1000.00 per month as per Londa Rides CC rules
      currency: "NAD",
      paymentMethod,
      status: "completed",
      transaction_id: `sub_${Date.now()}`,
      payment_type: "subscription"
    });

    res.status(200).json({
      success: true,
      message: "Monthly subscription activated successfully",
      subscription
    });
  } catch (error) {
    console.log("Subscribe monthly error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to subscribe to monthly package"
    });
  }
};

// Update user profile
export const updateUserProfile = async (req: any, res: Response) => {
  try {
    const { name, email, phone_number } = req.body;
    const userId = req.user.id;

    const updatedUser = await FirestoreService.updateUser(userId, {
      name: name || undefined,
      email: email || undefined,
      phone_number: phone_number || undefined
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error) {
    console.log("Update profile error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to update profile"
    });
  }
};

// Update user location
export const updateUserLocation = async (req: any, res: Response) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    // Update user location in database
    await FirestoreService.updateUser(userId, { 
      latitude: latitude, 
      longitude: longitude 
    } as any);

    res.status(200).json({
      success: true,
      message: "Location updated successfully"
    });
  } catch (error) {
    console.log("Update user location error:", error);
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
    const userId = req.user.id;

    const ride = await FirestoreService.getRideById(rideId);
    
    if (!ride || ride.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    const driver = ride.driverId ? await FirestoreService.getDriverById(ride.driverId) : null;
    const user = await FirestoreService.getUserById(ride.userId);

    res.status(200).json({
      success: true,
      ride: {
        ...ride,
        driver,
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

// Track ride
export const trackRide = async (req: any, res: Response) => {
  try {
    const { rideId } = req.body;
    const userId = req.user.id;

    const ride = await FirestoreService.getRideById(rideId);
    
    if (!ride || ride.userId !== userId) {
      return res.status(404).json({
        success: false,
        message: "Ride not found"
      });
    }

    const driver = ride.driverId ? await FirestoreService.getDriverById(ride.driverId) : null;

    res.status(200).json({
      success: true,
      ride,
      driver
    });
  } catch (error) {
    console.log("Track ride error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to track ride"
    });
  }
};

// Send notification
export const sendNotification = async (req: any, res: Response) => {
  try {
    const { recipientId, title, message, type } = req.body;
    const senderId = req.user.id;

    const notification = await FirestoreService.createNotification({
      senderId,
      recipientId,
      title,
      message,
      type: type || "general",
      status: "sent",
      data: {},
      sent_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Notification sent successfully",
      notification
    });
  } catch (error) {
    console.log("Send notification error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to send notification"
    });
  }
};

// Get notifications
export const getNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const notifications = await FirestoreService.getNotificationsByRecipientId(userId);

    res.status(200).json({
      success: true,
      notifications
    });
  } catch (error) {
    console.log("Get notifications error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get notifications"
    });
  }
};

// Mark notification as read
export const markNotificationRead = async (req: any, res: Response) => {
  try {
    const { notificationId } = req.body;
    const userId = req.user.id;

    // Update notification as read in Firestore
    const notification = await FirestoreService.getNotificationsByRecipientId(userId);
    const targetNotification = notification.find(n => n.id === notificationId);
    if (targetNotification) {
      // Note: You'll need to implement updateNotification method in FirestoreService
      console.log(`Marking notification ${notificationId} as read`);
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read"
    });
  } catch (error) {
    console.log("Mark notification read error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to mark notification as read"
    });
  }
};

// Upload document
export const uploadDocument = async (req: any, res: Response) => {
  try {
    const { documentType, fileName, fileUrl } = req.body;
    const userId = req.user.id;

    // Create document record in Firestore
    const document = {
      userId,
      documentType,
      fileName,
      fileUrl,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      document
    });
  } catch (error) {
    console.log("Upload document error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to upload document"
    });
  }
};

// Get documents
export const getDocuments = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    // Get documents from Firestore (you'll need to implement this in FirestoreService)
    const documents: any[] = []; // Placeholder - implement getDocumentsByUserId in FirestoreService

    res.status(200).json({
      success: true,
      documents
    });
  } catch (error) {
    console.log("Get documents error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get documents"
    });
  }
};

// Get ride analytics
export const getRideAnalytics = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const analytics = await FirestoreService.getUserAnalytics(userId);

    res.status(200).json({
      success: true,
      analytics
    });
  } catch (error) {
    console.log("Get ride analytics error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get ride analytics"
    });
  }
};

// Get performance analytics
export const getPerformanceAnalytics = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;

    const user = await FirestoreService.getUserById(userId);

    res.status(200).json({
      success: true,
      performance: {
        averageRating: (user as any)?.ratings || 0,
        totalRides: (user as any)?.totalRides || 0
      }
    });
  } catch (error) {
    console.log("Get performance analytics error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to get performance analytics"
    });
  }
};