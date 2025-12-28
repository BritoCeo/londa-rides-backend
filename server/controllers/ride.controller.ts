import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';
import { socketClient } from '../utils/socket-client';
import axios from 'axios';

// User Ride Booking APIs

// POST /api/v1/request-ride - Create ride request
export const requestRide = async (req: Request, res: Response) => {
  try {
    const { user_id, pickup_location, dropoff_location, ride_type, estimated_fare, pickup_coordinates, dropoff_coordinates } = req.body;

    if (!user_id || !pickup_location || !dropoff_location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: user_id, pickup_location, dropoff_location'
      });
    }

    const rideData = {
      userId: user_id,
      pickupLocation: JSON.stringify(pickup_location),
      dropoffLocation: JSON.stringify(dropoff_location),
      currentLocationName: pickup_location.name || "Pickup Location",
      destinationLocationName: dropoff_location.name || "Destination",
      distance: "0 km",
      scheduledTime: undefined,
      passengerCount: 1,
      vehicleType: ride_type || 'standard',
      fare: estimated_fare || 13.00,
      currency: 'NAD',
      isChildRide: false
    };

    const ride = await FirestoreService.createRide(rideData);

    // Query socket server for nearby drivers
    let nearbyDrivers = [];
    if (pickup_coordinates) {
      try {
        const socketResponse = await axios.get(`${process.env.SOCKET_SERVER_URL || 'http://localhost:3001'}/api/nearby-drivers`, {
          params: {
            lat: pickup_coordinates.latitude,
            lon: pickup_coordinates.longitude,
            radius: 5
          }
        });
        
        if (socketResponse.data.success) {
          nearbyDrivers = socketResponse.data.data.drivers;
        }
      } catch (error) {
        console.error('Failed to get nearby drivers from socket server:', error);
      }
    }

    // Notify nearby drivers via socket server
    if (nearbyDrivers.length > 0) {
      try {
        await axios.post(`${process.env.SOCKET_SERVER_URL || 'http://localhost:3001'}/api/broadcast`, {
          message: 'rideRequested',
          data: {
            rideId: ride.id,
            userId: user_id,
            pickupLocation: pickup_location,
            destinationLocation: dropoff_location,
            rideType: ride_type || 'standard',
            fare: estimated_fare || 13.00,
            coordinates: pickup_coordinates
          }
        });
      } catch (error) {
        console.error('Failed to notify drivers via socket:', error);
      }
    }

    res.status(201).json({
      success: true,
      message: 'Ride request created successfully',
      data: { 
        ride_id: ride.id, 
        ...rideData,
        nearby_drivers: nearbyDrivers.length,
        drivers_notified: nearbyDrivers.length > 0
      }
    });
  } catch (error: any) {
    console.error('Request ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ride request',
      error: error.message
    });
  }
};

// GET /api/v1/nearby-drivers - Find available drivers near user
export const getNearbyDrivers = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: latitude, longitude'
      });
    }

    const drivers = await FirestoreService.getActiveDrivers(
      parseFloat(latitude as string),
      parseFloat(longitude as string),
      parseFloat(radius as string)
    );

    res.status(200).json({
      success: true,
      message: 'Nearby drivers retrieved successfully',
      data: { drivers, count: drivers.length }
    });
  } catch (error) {
    console.error('Get nearby drivers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get nearby drivers',
      error: error.message
    });
  }
};

// POST /api/v1/cancel-ride - Cancel ride request
export const cancelRide = async (req: Request, res: Response) => {
  try {
    const { ride_id, user_id, reason } = req.body;

    if (!ride_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, user_id'
      });
    }

    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.userId !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this ride'
      });
    }

    if (ride.status === 'completed' || ride.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a completed or already cancelled ride'
      });
    }

    const updatedRide = await FirestoreService.updateRide(ride_id, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelled_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully',
      data: updatedRide
    });
  } catch (error) {
    console.error('Cancel ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel ride',
      error: error.message
    });
  }
};

// PUT /api/v1/rate-ride - Rate completed ride
export const rateRide = async (req: Request, res: Response) => {
  try {
    const { ride_id, user_id, rating, review } = req.body;

    if (!ride_id || !user_id || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, user_id, rating'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.userId !== user_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to rate this ride'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed rides'
      });
    }

    const updatedRide = await FirestoreService.updateRide(ride_id, {
      userRating: rating,
      user_review: review,
      rated_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Ride rated successfully',
      data: updatedRide
    });
  } catch (error) {
    console.error('Rate ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate ride',
      error: error.message
    });
  }
};

// Driver Ride Management APIs

// GET /api/v1/driver/available-rides - Get pending ride requests
export const getAvailableRides = async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.params;

    if (!driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: driver_id'
      });
    }

    const rides = await FirestoreService.getPendingRides();

    res.status(200).json({
      success: true,
      message: 'Available rides retrieved successfully',
      data: { rides, count: rides.length }
    });
  } catch (error) {
    console.error('Get available rides error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available rides',
      error: error.message
    });
  }
};

// POST /api/v1/driver/accept-ride - Accept ride request
export const acceptRide = async (req: Request, res: Response) => {
  try {
    const { ride_id, driver_id } = req.body;

    if (!ride_id || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, driver_id'
      });
    }

    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Ride is no longer available'
      });
    }

    const updatedRide = await FirestoreService.updateRide(ride_id, {
      driverId: driver_id,
      status: 'accepted',
      accepted_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Ride accepted successfully',
      data: updatedRide
    });
  } catch (error) {
    console.error('Accept ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept ride',
      error: error.message
    });
  }
};

// POST /api/v1/driver/decline-ride - Decline ride request
export const declineRide = async (req: Request, res: Response) => {
  try {
    const { ride_id, driver_id, reason } = req.body;

    if (!ride_id || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, driver_id'
      });
    }

    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driverId !== driver_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to decline this ride'
      });
    }

    const updatedRide = await FirestoreService.updateRide(ride_id, {
      status: 'declined',
      declineReason: reason,
      declined_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Ride declined successfully',
      data: updatedRide
    });
  } catch (error) {
    console.error('Decline ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline ride',
      error: error.message
    });
  }
};

// POST /api/v1/driver/start-ride - Start ride (pickup)
export const startRide = async (req: Request, res: Response) => {
  try {
    const { ride_id, driver_id } = req.body;

    if (!ride_id || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, driver_id'
      });
    }

    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driverId !== driver_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to start this ride'
      });
    }

    if (ride.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only start an accepted ride'
      });
    }

    const updatedRide = await FirestoreService.updateRide(ride_id, {
      status: 'started',
      started_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Ride started successfully',
      data: updatedRide
    });
  } catch (error) {
    console.error('Start ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start ride',
      error: error.message
    });
  }
};

// POST /api/v1/driver/complete-ride - Complete ride (dropoff)
export const completeRide = async (req: Request, res: Response) => {
  try {
    const { ride_id, driver_id, final_fare } = req.body;

    if (!ride_id || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, driver_id'
      });
    }

    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.driverId !== driver_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to complete this ride'
      });
    }

    if (ride.status !== 'started') {
      return res.status(400).json({
        success: false,
        message: 'Can only complete an in-progress ride'
      });
    }

    const updatedRide = await FirestoreService.updateRide(ride_id, {
      status: 'completed',
      finalFare: final_fare || ride.fare,
      completed_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Ride completed successfully',
      data: updatedRide
    });
  } catch (error) {
    console.error('Complete ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete ride',
      error: error.message
    });
  }
};

// POST /api/v1/ride/accept - Driver accepts ride (Socket Integration)
export const acceptRideSocket = async (req: Request, res: Response) => {
  try {
    const { ride_id, driver_id, eta } = req.body;

    if (!ride_id || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, driver_id'
      });
    }

    // Validate driver
    const driver = await FirestoreService.getDriverById(driver_id);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Get ride details
    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Update ride status
    await FirestoreService.updateRide(ride_id, {
      driverId: driver_id,
      status: 'accepted',
      updatedAt: new Date()
    });

    // Notify user via socket
    socketClient.notifyUserOfDriverStatus(ride.userId, driver_id, 'accepted', {
      eta: eta || '5 min',
      rideId: ride_id,
      driverInfo: {
        name: driver.name,
        rating: driver.rating,
        vehicle: `${driver.vehicle_model} (${driver.vehicle_plate})`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Ride accepted successfully',
      data: {
        ride_id,
        driver_id,
        status: 'accepted',
        eta: eta || '5 min'
      }
    });

  } catch (error: any) {
    console.error('Accept ride error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept ride',
      error: error.message
    });
  }
};

// PUT /api/v1/ride/:id/location - Update ride location during trip
export const updateRideLocation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, driver_id } = req.body;

    if (!latitude || !longitude || !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: latitude, longitude, driver_id'
      });
    }

    // Get ride details
    const ride = await FirestoreService.getRideById(id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Send location update to user via socket
    socketClient.sendDriverLocationUpdate(ride.userId, driver_id, {
      latitude,
      longitude
    });

    res.status(200).json({
      success: true,
      message: 'Ride location updated successfully',
      data: { ride_id: id, latitude, longitude }
    });

  } catch (error: any) {
    console.error('Update ride location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ride location',
      error: error.message
    });
  }
};
