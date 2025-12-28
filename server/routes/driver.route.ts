import express from "express";
import {
  getAllRides,
  getDriversById,
  getLoggedInDriverData,
  newRide,
  sendingOtpToPhone,
  updateDriverStatus,
  updatingRideStatus,
  verifyingEmailOtp,
  verifyPhoneOtpForLogin,
  verifyPhoneOtpForRegistration,
  getAvailableRides,
  acceptRide,
  declineRide,
  startRide,
  completeRide,
  subscribeDriver,
  getSubscriptionStatus,
  updateDriverLocation,
  getRideStatus,
  getDriverEarnings,
  getDriverRideAnalytics,
  getDriverPerformanceAnalytics,
  createDriverAccount,
} from "../controllers/driver.controller";
import { isAuthenticatedDriver } from "../middleware/isAuthenticated";

const driverRouter = express.Router();

driverRouter.post("/send-otp", sendingOtpToPhone);

driverRouter.post("/login", verifyPhoneOtpForLogin);

driverRouter.post("/verify-otp", verifyPhoneOtpForRegistration);

driverRouter.post("/create-account", createDriverAccount);

driverRouter.post("/registration-driver", verifyingEmailOtp);

driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);

driverRouter.get("/get-drivers-data", getDriversById);

driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatus);

driverRouter.post("/new-ride", isAuthenticatedDriver, newRide);

driverRouter.put(
  "/update-ride-status",
  isAuthenticatedDriver,
  updatingRideStatus
);

driverRouter.get("/get-rides", isAuthenticatedDriver, getAllRides);

// Driver Ride Management APIs
driverRouter.get("/available-rides", isAuthenticatedDriver, getAvailableRides);
driverRouter.post("/accept-ride", isAuthenticatedDriver, acceptRide);
driverRouter.post("/decline-ride", isAuthenticatedDriver, declineRide);
driverRouter.post("/start-ride", isAuthenticatedDriver, startRide);
driverRouter.post("/complete-ride", isAuthenticatedDriver, completeRide);

// Driver Subscription APIs
driverRouter.post("/subscribe", isAuthenticatedDriver, subscribeDriver);
driverRouter.get("/subscription-status", isAuthenticatedDriver, getSubscriptionStatus);

// Location and Tracking
driverRouter.post("/update-location", isAuthenticatedDriver, updateDriverLocation);
driverRouter.get("/ride-status/:rideId", isAuthenticatedDriver, getRideStatus);

// Driver Analytics
driverRouter.get("/analytics/earnings", isAuthenticatedDriver, getDriverEarnings);
driverRouter.get("/analytics/rides", isAuthenticatedDriver, getDriverRideAnalytics);
driverRouter.get("/analytics/performance", isAuthenticatedDriver, getDriverPerformanceAnalytics);

export default driverRouter;
