/**
 * Socket Integration Routes
 * HTTP endpoints for socket server to call for ride events and driver validation
 */

import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';
import { socketClient } from '../utils/socket-client';

// Middleware to authenticate socket server requests
const authenticateSocketRequest = (req: Request, res: Response, next: any) => {
  const socketSecret = req.headers['x-socket-secret'];
  const expectedSecret = process.env.SOCKET_API_SECRET || 'londa-socket-secret-2024';
  
  if (socketSecret !== expectedSecret) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid socket secret'
    });
  }
  
  next();
};

// POST /api/v1/socket/ride-event - Receive ride events from socket server
export const handleRideEvent = async (req: Request, res: Response) => {
  try {
    const { rideId, event, data } = req.body;

    if (!rideId || !event) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: rideId, event'
      });
    }

    console.log(`📨 Received ride event: ${event} for ride ${rideId}`);

    // Get ride details
    const ride = await FirestoreService.getRideById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Handle different ride events
    switch (event) {
      case 'accepted':
        await handleRideAccepted(rideId, data);
        break;
      case 'started':
        await handleRideStarted(rideId, data);
        break;
      case 'completed':
        await handleRideCompleted(rideId, data);
        break;
      case 'cancelled':
        await handleRideCancelled(rideId, data);
        break;
      default:
        console.log(`Unknown ride event: ${event}`);
    }

    res.status(200).json({
      success: true,
      message: `Ride event ${event} processed successfully`,
      data: { rideId, event, timestamp: new Date().toISOString() }
    });

  } catch (error: any) {
    console.error('Error handling ride event:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process ride event',
      error: error.message
    });
  }
};

// POST /api/v1/socket/driver-status - Driver online/offline updates
export const handleDriverStatusUpdate = async (req: Request, res: Response) => {
  try {
    const { driverId, status, location } = req.body;

    if (!driverId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: driverId, status'
      });
    }

    console.log(`🚗 Driver ${driverId} status updated: ${status}`);

    // Update driver status in Firestore
    if (location) {
      await FirestoreService.updateDriverLocation(
        driverId,
        location.latitude,
        location.longitude,
        status
      );
    } else {
      await FirestoreService.setDriverOnlineStatus(driverId, status === 'online');
    }

    // Update driver status in drivers collection
    await FirestoreService.updateDriver(driverId, {
      status: status === 'online' ? 'online' : 'offline',
      isActive: status === 'online'
    });

    res.status(200).json({
      success: true,
      message: 'Driver status updated successfully',
      data: { driverId, status, timestamp: new Date().toISOString() }
    });

  } catch (error: any) {
    console.error('Error updating driver status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update driver status',
      error: error.message
    });
  }
};

// POST /api/v1/socket/driver-location - Sync driver location to Firestore
export const handleDriverLocationSync = async (req: Request, res: Response) => {
  try {
    const { driverId, latitude, longitude, status, accuracy, heading, speed } = req.body;

    if (!driverId || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: driverId, latitude, longitude'
      });
    }

    // Update driver location in Firestore
    await FirestoreService.updateDriverLocation(
      driverId,
      latitude,
      longitude,
      status || 'online',
      accuracy,
      heading,
      speed
    );

    res.status(200).json({
      success: true,
      message: 'Driver location synced successfully',
      data: { driverId, latitude, longitude, timestamp: new Date().toISOString() }
    });

  } catch (error: any) {
    console.error('Error syncing driver location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync driver location',
      error: error.message
    });
  }
};

// GET /api/v1/socket/ride/:id - Get ride details for socket server
export const getRideDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const ride = await FirestoreService.getRideById(id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ride
    });

  } catch (error: any) {
    console.error('Error getting ride details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ride details',
      error: error.message
    });
  }
};

// GET /api/v1/socket/driver/:id/validate - Validate driver credentials
export const validateDriver = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const driver = await FirestoreService.getDriverById(id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Check if driver has active subscription
    const subscription = await FirestoreService.getActiveDriverSubscription(id);
    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: 'Driver subscription required',
        data: {
          driverId: id,
          hasSubscription: false,
          subscriptionRequired: true
        }
      });
    }

    // Check if driver is verified
    if (!driver.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Driver verification required',
        data: {
          driverId: id,
          isVerified: false,
          verificationRequired: true
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Driver validation successful',
      data: {
        driverId: id,
        name: driver.name,
        email: driver.email,
        phone_number: driver.phone_number,
        vehicle_type: driver.vehicle_type,
        vehicle_model: driver.vehicle_model,
        vehicle_plate: driver.vehicle_plate,
        rating: driver.rating,
        hasSubscription: true,
        isVerified: true,
        subscription: subscription
      }
    });

  } catch (error: any) {
    console.error('Error validating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate driver',
      error: error.message
    });
  }
};

// GET /api/v1/socket/active-drivers - Get active drivers with locations
export const getActiveDrivers = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: latitude, longitude'
      });
    }

    const drivers = await FirestoreService.getActiveDriversWithLocations(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string)
    );

    res.status(200).json({
      success: true,
      data: {
        drivers,
        count: drivers.length,
        center: { latitude: parseFloat(latitude as string), longitude: parseFloat(longitude as string) },
        radius: parseFloat(radius as string)
      }
    });

  } catch (error: any) {
    console.error('Error getting active drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get active drivers',
      error: error.message
    });
  }
};

// ==================== RIDE EVENT HANDLERS ====================

async function handleRideAccepted(rideId: string, data: any) {
  const { driverId, eta } = data;
  
  // Update ride status
  await FirestoreService.updateRide(rideId, {
    driverId,
    status: 'accepted',
    updatedAt: new Date()
  });

  // Get ride details for notification
  const ride = await FirestoreService.getRideById(rideId);
  if (ride) {
    // Notify user via socket
    socketClient.notifyUserOfDriverStatus(ride.userId, driverId, 'accepted', {
      eta,
      rideId
    });
  }
}

async function handleRideStarted(rideId: string, data: any) {
  const { driverId } = data;
  
  // Update ride status
  await FirestoreService.updateRide(rideId, {
    status: 'started',
    updatedAt: new Date()
  });

  // Get ride details for notification
  const ride = await FirestoreService.getRideById(rideId);
  if (ride) {
    // Notify user via socket
    socketClient.notifyUserOfDriverStatus(ride.userId, driverId, 'started', {
      rideId
    });
  }
}

async function handleRideCompleted(rideId: string, data: any) {
  const { driverId, fare } = data;
  
  // Update ride status
  await FirestoreService.updateRide(rideId, {
    status: 'completed',
    fare: fare || 13, // Default NAD 13 as per Londa rules
    updatedAt: new Date()
  });

  // Get ride details for notification
  const ride = await FirestoreService.getRideById(rideId);
  if (ride) {
    // Notify user via socket
    socketClient.notifyUserOfDriverStatus(ride.userId, driverId, 'completed', {
      rideId,
      fare: fare || 13
    });

    // Send payment confirmation
    socketClient.notifyPaymentConfirmation(ride.userId, rideId, fare || 13, 'NAD');
  }
}

async function handleRideCancelled(rideId: string, data: any) {
  const { reason, cancelledBy } = data;
  
  // Update ride status
  await FirestoreService.updateRide(rideId, {
    status: 'cancelled',
    updatedAt: new Date()
  });

  // Get ride details for notification
  const ride = await FirestoreService.getRideById(rideId);
  if (ride) {
    // Notify user via socket
    socketClient.notifyRideCancellation(rideId, reason, cancelledBy);
  }
}

// Export routes with authentication middleware
export const socketRoutes = {
  handleRideEvent: [authenticateSocketRequest, handleRideEvent],
  handleDriverStatusUpdate: [authenticateSocketRequest, handleDriverStatusUpdate],
  handleDriverLocationSync: [authenticateSocketRequest, handleDriverLocationSync],
  getRideDetails: [authenticateSocketRequest, getRideDetails],
  validateDriver: [authenticateSocketRequest, validateDriver],
  getActiveDrivers: [authenticateSocketRequest, getActiveDrivers]
};
