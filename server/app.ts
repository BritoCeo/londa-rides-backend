require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import driverRouter from "./routes/driver.route";
import driverSubscriptionRouter from "./routes/driver-subscription.route";
import rideRouter from "./routes/ride.route";
import scheduledRidesRouter from "./routes/scheduled-rides.route";
import carpoolRouter from "./routes/carpool.route";
import parentSubscriptionRouter from "./routes/parent-subscription.route";
import locationRouter from "./routes/location.route";
import paymentRouter from "./routes/payment.route";
import notificationRouter from "./routes/notification.route";
import profileRouter from "./routes/profile.route";
import analyticsRouter from "./routes/analytics.route";
import authRouter from "./routes/auth.route";
import mapsRouter from "./routes/maps.route";
import { socketRoutes } from "./routes/socket.route";
import Nylas from "nylas";

// Import middleware
import cors from 'cors';
import { corsOptions, generalRateLimit, helmetConfig, securityHeaders, sanitizeInput } from './middleware/security';
import { accessLogger, consoleLogger, requestIdMiddleware, responseTimeMiddleware, apiLogger, performanceMonitor } from './middleware/logging';
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler';
import { setupSwagger } from './middleware/swagger';
import { paginationMiddleware } from './middleware/pagination';
import { searchAndFilter, dateRangeFilter, fieldSelection, transformResponse } from './middleware/pagination';

export const app = express();

export const nylas = new Nylas({
  apiKey: process.env.NYLAS_API_KEY!,
  apiUri: "https://api.eu.nylas.com",
});

// Initialize Firestore connection
const initializeFirestore = async () => {
  try {
    // Firestore is initialized in config/firestore.ts
    console.log('🔥 Firestore connection initialized');
  } catch (error) {
    console.error('❌ Firestore initialization failed:', error);
    console.log('🔄 Application will continue with mock database...');
  }
};

// Initialize Firestore on app start
initializeFirestore();

// ==================== MIDDLEWARE SETUP ====================

// 1. Security middleware (order matters!)
app.use(helmetConfig);
app.use(securityHeaders);
app.use(sanitizeInput);

// 2. CORS configuration
app.use(cors(corsOptions));

// 3. Request parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// 4. Logging middleware
app.use(requestIdMiddleware);
app.use(responseTimeMiddleware);
app.use(accessLogger);
app.use(consoleLogger);
app.use(apiLogger);
app.use(performanceMonitor);

// 5. Rate limiting
app.use('/api/v1', generalRateLimit);

// 6. Pagination and filtering middleware
app.use('/api/v1', paginationMiddleware(10, 100));
app.use('/api/v1', searchAndFilter);
app.use('/api/v1', dateRangeFilter);
app.use('/api/v1', fieldSelection);
app.use('/api/v1', transformResponse);

// ==================== ROUTES ====================

// API routes with proper organization
app.use("/api/v1", authRouter);
app.use("/api/v1", userRouter);
app.use("/api/v1/driver", driverRouter);
app.use("/api/v1/driver", driverSubscriptionRouter);
app.use("/api/v1", rideRouter);
app.use("/api/v1/scheduled-rides", scheduledRidesRouter);
app.use("/api/v1/carpool", carpoolRouter);
app.use("/api/v1/parent", parentSubscriptionRouter);
app.use("/api/v1", locationRouter);
app.use("/api/v1", paymentRouter);
app.use("/api/v1", notificationRouter);
app.use("/api/v1", profileRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1/maps", mapsRouter);

// Socket integration routes
app.post("/api/v1/socket/ride-event", ...socketRoutes.handleRideEvent);
app.post("/api/v1/socket/driver-status", ...socketRoutes.handleDriverStatusUpdate);
app.post("/api/v1/socket/driver-location", ...socketRoutes.handleDriverLocationSync);
app.get("/api/v1/socket/ride/:id", ...socketRoutes.getRideDetails);
app.get("/api/v1/socket/driver/:id/validate", ...socketRoutes.validateDriver);
app.get("/api/v1/socket/active-drivers", ...socketRoutes.getActiveDrivers);

// ==================== DOCUMENTATION ====================

// Setup Swagger documentation
setupSwagger(app);

// ==================== HEALTH CHECK ====================

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Testing API endpoint
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working",
    timestamp: new Date().toISOString(),
    requestId: (req as any).requestId
  });
});

// ==================== ERROR HANDLING ====================

// 404 handler for undefined routes
app.use(notFoundHandler);

// Centralized error handling (must be last)
app.use(errorHandler);
