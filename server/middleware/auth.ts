import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { FirestoreService } from '../utils/firestore-service';
import { AppError, sendResponse } from './errorHandler';

// Extend Request interface to include user and driver
declare global {
  namespace Express {
    interface Request {
      user?: any;
      driver?: any;
      authType?: 'user' | 'driver';
    }
  }
}

// JWT token verification
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, false, 'Access token required');
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return sendResponse(res, 401, false, 'Access token required');
    }
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (!decoded.id || !decoded.type) {
      return sendResponse(res, 401, false, 'Invalid token format');
    }
    
    // Set auth type
    req.authType = decoded.type;
    
    // Get user or driver data based on token type
    if (decoded.type === 'user') {
      const user = await FirestoreService.getUserById(decoded.id);
      if (!user || !user.isActive) {
        return sendResponse(res, 401, false, 'User not found or inactive');
      }
      req.user = user;
    } else if (decoded.type === 'driver') {
      const driver = await FirestoreService.getDriverById(decoded.id);
      if (!driver || !driver.isActive) {
        return sendResponse(res, 401, false, 'Driver not found or inactive');
      }
      req.driver = driver;
    } else {
      return sendResponse(res, 401, false, 'Invalid token type');
    }
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return sendResponse(res, 401, false, 'Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      return sendResponse(res, 401, false, 'Token expired');
    } else {
      console.error('Token verification error:', error);
      return sendResponse(res, 500, false, 'Token verification failed');
    }
  }
};

// User authentication middleware
export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendResponse(res, 401, false, 'User authentication required');
  }
  next();
};

// Driver authentication middleware
export const authenticateDriver = (req: Request, res: Response, next: NextFunction) => {
  if (!req.driver) {
    return sendResponse(res, 401, false, 'Driver authentication required');
  }
  next();
};

// Optional authentication (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    
    if (decoded.type === 'user') {
      const user = await FirestoreService.getUserById(decoded.id);
      if (user && user.isActive) {
        req.user = user;
        req.authType = 'user';
      }
    } else if (decoded.type === 'driver') {
      const driver = await FirestoreService.getDriverById(decoded.id);
      if (driver && driver.isActive) {
        req.driver = driver;
        req.authType = 'driver';
      }
    }
    
    next();
  } catch (error) {
    // Silently continue if token is invalid
    next();
  }
};

// Authorization middleware for specific user
export const authorizeUser = (userIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedUserId = req.params[userIdParam] || req.body.user_id;
    
    if (!req.user) {
      return sendResponse(res, 401, false, 'User authentication required');
    }
    
    if (req.user.id !== requestedUserId) {
      return sendResponse(res, 403, false, 'Access denied: You can only access your own data');
    }
    
    next();
  };
};

// Authorization middleware for specific driver
export const authorizeDriver = (driverIdParam: string = 'driverId') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestedDriverId = req.params[driverIdParam] || req.body.driver_id;
    
    if (!req.driver) {
      return sendResponse(res, 401, false, 'Driver authentication required');
    }
    
    if (req.driver.id !== requestedDriverId) {
      return sendResponse(res, 403, false, 'Access denied: You can only access your own data');
    }
    
    next();
  };
};

// Admin authorization middleware
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.userType !== 'ADMIN') {
    return sendResponse(res, 403, false, 'Admin access required');
  }
  next();
};

// Driver status check middleware
export const checkDriverStatus = (allowedStatuses: string[] = ['online', 'offline']) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.driver) {
      return sendResponse(res, 401, false, 'Driver authentication required');
    }
    
    if (!allowedStatuses.includes(req.driver.status)) {
      return sendResponse(res, 403, false, `Driver must be ${allowedStatuses.join(' or ')} to perform this action`);
    }
    
    next();
  };
};

// Rate limiting for authentication endpoints
export const authRateLimit = (req: Request, res: Response, next: NextFunction) => {
  // This would be implemented with express-rate-limit
  // For now, we'll just pass through
  next();
};

// Token refresh middleware
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.body.refresh_token;
    
    if (!refreshToken) {
      return sendResponse(res, 400, false, 'Refresh token required');
    }
    
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret') as any;
    
    // Generate new access token
    const accessToken = jwt.sign(
      { id: decoded.id, type: decoded.type },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '15m' }
    );
    
    sendResponse(res, 200, true, 'Token refreshed successfully', {
      access_token: accessToken,
      expires_in: 900 // 15 minutes
    });
  } catch (error) {
    return sendResponse(res, 401, false, 'Invalid refresh token');
  }
};

// Logout middleware
export const logout = (req: Request, res: Response, next: NextFunction) => {
  // In a real implementation, you would:
  // 1. Add the token to a blacklist
  // 2. Remove refresh tokens
  // 3. Update user/driver status
  
  sendResponse(res, 200, true, 'Logged out successfully');
};
