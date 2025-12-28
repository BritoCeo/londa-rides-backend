import express from "express";
import {
  getAllRides,
  getLoggedInUserData,
  registerUser,
  sendingOtpToEmail,
  verifyingEmail,
  verifyOtp,
  createUserAccount,
  requestRide,
  getNearbyDrivers,
  cancelRide,
  rateRide,
  calculateFare,
  processPayment,
  getPaymentHistory,
  subscribeMonthly,
  updateUserProfile,
  updateUserLocation,
  getRideStatus,
  trackRide,
  sendNotification,
  getNotifications,
  markNotificationRead,
  uploadDocument,
  getDocuments,
  getRideAnalytics,
  getPerformanceAnalytics,
} from "../controllers/user.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
import { asyncHandler } from "../middleware/errorHandler";
import { 
  validateUserRegistration, 
  validateUserLogin, 
  validateRequestRide, 
  validateCancelRide, 
  validateRateRide,
  validateCalculateFare,
  validateProcessPayment,
  validateSendNotification,
  validateMarkNotificationAsRead,
  validateUpdateProfile,
  validateUploadDocument,
  validatePagination
} from "../middleware/validation";

const userRouter = express.Router();

// ==================== AUTHENTICATION ROUTES ====================
userRouter.post("/registration", validateUserRegistration, asyncHandler(registerUser));
userRouter.post("/verify-otp", validateUserLogin, asyncHandler(verifyOtp));
userRouter.post("/email-otp-request", asyncHandler(sendingOtpToEmail));
userRouter.put("/email-otp-verify", asyncHandler(verifyingEmail));
userRouter.post("/create-account", asyncHandler(createUserAccount));

// ==================== PROTECTED USER ROUTES ====================
userRouter.get("/me", isAuthenticated, asyncHandler(getLoggedInUserData));
userRouter.get("/get-rides", isAuthenticated, validatePagination, asyncHandler(getAllRides));

// ==================== RIDE BOOKING APIs ====================
userRouter.post("/request-ride", validateRequestRide, asyncHandler(requestRide));
userRouter.get("/nearby-drivers", isAuthenticated, asyncHandler(getNearbyDrivers));
userRouter.post("/cancel-ride", isAuthenticated, validateCancelRide, asyncHandler(cancelRide));
userRouter.put("/rate-ride", isAuthenticated, validateRateRide, asyncHandler(rateRide));

// ==================== PAYMENT APIs ====================
userRouter.post("/payment/calculate-fare", isAuthenticated, validateCalculateFare, asyncHandler(calculateFare));
userRouter.post("/payment/process", isAuthenticated, validateProcessPayment, asyncHandler(processPayment));
userRouter.get("/payment/history", isAuthenticated, validatePagination, asyncHandler(getPaymentHistory));
userRouter.post("/subscribe-monthly", isAuthenticated, asyncHandler(subscribeMonthly));

// ==================== PROFILE MANAGEMENT ====================
userRouter.put("/update-profile", isAuthenticated, validateUpdateProfile, asyncHandler(updateUserProfile));

// ==================== REAL-TIME LOCATION APIs ====================
userRouter.post("/update-location", isAuthenticated, asyncHandler(updateUserLocation));
userRouter.get("/ride-status/:rideId", isAuthenticated, asyncHandler(getRideStatus));
userRouter.post("/ride-tracking", isAuthenticated, asyncHandler(trackRide));

// ==================== NOTIFICATION APIs ====================
userRouter.post("/notifications/send", isAuthenticated, validateSendNotification, asyncHandler(sendNotification));
userRouter.get("/notifications", isAuthenticated, validatePagination, asyncHandler(getNotifications));
userRouter.put("/notifications/read", isAuthenticated, validateMarkNotificationAsRead, asyncHandler(markNotificationRead));

// ==================== DOCUMENT MANAGEMENT ====================
userRouter.post("/upload-document", isAuthenticated, validateUploadDocument, asyncHandler(uploadDocument));
userRouter.get("/documents", isAuthenticated, validatePagination, asyncHandler(getDocuments));

// ==================== ANALYTICS APIs ====================
userRouter.get("/analytics/rides", isAuthenticated, asyncHandler(getRideAnalytics));
userRouter.get("/analytics/performance", isAuthenticated, asyncHandler(getPerformanceAnalytics));

export default userRouter;
