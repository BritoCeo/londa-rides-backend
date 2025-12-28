import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';

// Real-time Location APIs

// POST /api/v1/update-location - Update driver/user location
export const updateLocation = async (req: Request, res: Response) => {
  try {
    const { user_id, driver_id, latitude, longitude, type } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude'
      });
    }

    if (!user_id && !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: user_id or driver_id'
      });
    }

    const locationData = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      updated_at: new Date()
    };

    let result;
    if (driver_id) {
      result = await FirestoreService.updateDriverLocation(driver_id, locationData);
    } else if (user_id) {
      result = await FirestoreService.updateUserLocation(user_id, locationData);
    }

    res.status(200).json({
      success: true,
      message: 'Location updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message
    });
  }
};

// GET /api/v1/ride-status/{rideId} - Get current ride status
export const getRideStatus = async (req: Request, res: Response) => {
  try {
    const { rideId } = req.params;

    if (!rideId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: rideId'
      });
    }

    const ride = await FirestoreService.getRideById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Get driver location if ride is in progress
    let driverLocation = null;
    if (ride.driverId && (ride.status === 'accepted' || ride.status === 'started')) {
      const driver = await FirestoreService.getDriverById(ride.driverId);
      driverLocation = driver?.location;
    }

    res.status(200).json({
      success: true,
      message: 'Ride status retrieved successfully',
      data: {
        ride,
        driver_location: driverLocation
      }
    });
  } catch (error) {
    console.error('Get ride status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ride status',
      error: error.message
    });
  }
};

// POST /api/v1/ride-tracking - Real-time ride tracking
export const trackRide = async (req: Request, res: Response) => {
  try {
    const { ride_id, user_id, driver_id } = req.body;

    if (!ride_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required field: ride_id'
      });
    }

    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check authorization
    if (user_id && ride.userId !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to track this ride'
      });
    }

    if (driver_id && ride.driverId !== driver_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to track this ride'
      });
    }

    // Get current locations
    let userLocation = null;
    let driverLocation = null;

    if (ride.userId) {
      const user = await FirestoreService.getUserById(ride.userId);
      userLocation = user?.location;
    }

    if (ride.driverId) {
      const driver = await FirestoreService.getDriverById(ride.driverId);
      driverLocation = driver?.location;
    }

    // Calculate distance if both locations are available
    let distance = null;
    if (userLocation && driverLocation) {
      distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        driverLocation.latitude,
        driverLocation.longitude
      );
    }

    res.status(200).json({
      success: true,
      message: 'Ride tracking data retrieved successfully',
      data: {
        ride,
        user_location: userLocation,
        driver_location: driverLocation,
        distance_km: distance
      }
    });
  } catch (error) {
    console.error('Track ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track ride',
      error: error.message
    });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}
