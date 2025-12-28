import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';
import { AppError, sendResponse } from '../middleware/errorHandler';
import { body, param, query, validationResult } from 'express-validator';

// Scheduled Rides Management APIs

// POST /api/v1/scheduled-rides - Create scheduled ride
export const createScheduledRide = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const {
      user_id,
      pickup_location,
      dropoff_location,
      scheduled_date,
      scheduled_time,
      ride_type = 'standard',
      passenger_count = 1,
      notes,
      recurring_pattern,
      recurring_end_date
    } = req.body;

    // Validate user exists
    const user = await FirestoreService.getUserById(user_id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Validate scheduled date is in the future
    const scheduledDateTime = new Date(`${scheduled_date}T${scheduled_time}`);
    if (scheduledDateTime <= new Date()) {
      return sendResponse(res, 400, false, 'Scheduled date must be in the future');
    }

    // Calculate estimated fare
    const fareCalculation = await FirestoreService.calculateFare({
      pickup_coordinates: pickup_location,
      dropoff_coordinates: dropoff_location,
      ride_type,
      user_type: user.user_type || 'student'
    });

    const scheduledRideData = {
      user_id,
      pickup_location,
      dropoff_location,
      scheduled_date,
      scheduled_time,
      scheduled_datetime: scheduledDateTime,
      ride_type,
      passenger_count,
      notes: notes || '',
      recurring_pattern: recurring_pattern || null,
      recurring_end_date: recurring_end_date || null,
      estimated_fare: fareCalculation.total_fare,
      status: 'scheduled',
      created_at: new Date(),
      updated_at: new Date()
    };

    const scheduledRide = await FirestoreService.createScheduledRide(scheduledRideData);

    // If recurring pattern is set, create additional scheduled rides
    if (recurring_pattern && recurring_end_date) {
      await createRecurringRides(scheduledRideData, recurring_pattern, recurring_end_date);
    }

    return sendResponse(res, 201, true, 'Scheduled ride created successfully', {
      scheduled_ride: scheduledRide,
      estimated_fare: fareCalculation
    });

  } catch (error: any) {
    console.error('Error creating scheduled ride:', error);
    return sendResponse(res, 500, false, 'Failed to create scheduled ride', null, error.message);
  }
};

// GET /api/v1/scheduled-rides - Get user's scheduled rides
export const getScheduledRides = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { user_id } = req.query;
    const { page = 1, limit = 10, status, upcoming_only = false } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'user_id is required');
    }

    const scheduledRides = await FirestoreService.getScheduledRides(
      user_id as string,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        upcoming_only: upcoming_only === 'true'
      }
    );

    return sendResponse(res, 200, true, 'Scheduled rides retrieved successfully', {
      scheduled_rides: scheduledRides.data,
      pagination: scheduledRides.pagination
    });

  } catch (error: any) {
    console.error('Error getting scheduled rides:', error);
    return sendResponse(res, 500, false, 'Failed to get scheduled rides', null, error.message);
  }
};

// GET /api/v1/scheduled-rides/:id - Get specific scheduled ride
export const getScheduledRideById = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const scheduledRide = await FirestoreService.getScheduledRideById(id);

    if (!scheduledRide) {
      return sendResponse(res, 404, false, 'Scheduled ride not found');
    }

    return sendResponse(res, 200, true, 'Scheduled ride retrieved successfully', {
      scheduled_ride: scheduledRide
    });

  } catch (error: any) {
    console.error('Error getting scheduled ride:', error);
    return sendResponse(res, 500, false, 'Failed to get scheduled ride', null, error.message);
  }
};

// PUT /api/v1/scheduled-rides/:id - Update scheduled ride
export const updateScheduledRide = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const updateData = req.body;

    // Check if scheduled ride exists
    const existingRide = await FirestoreService.getScheduledRideById(id);
    if (!existingRide) {
      return sendResponse(res, 404, false, 'Scheduled ride not found');
    }

    // Check if ride can be updated (not confirmed or completed)
    if (existingRide.status === 'confirmed' || existingRide.status === 'completed') {
      return sendResponse(res, 400, false, 'Cannot update confirmed or completed rides');
    }

    // If date/time is being updated, validate it's in the future
    if (updateData.scheduled_date || updateData.scheduled_time) {
      const scheduledDateTime = updateData.scheduled_date && updateData.scheduled_time
        ? new Date(`${updateData.scheduled_date}T${updateData.scheduled_time}`)
        : new Date(`${existingRide.scheduled_date}T${existingRide.scheduled_time}`);
      
      if (scheduledDateTime <= new Date()) {
        return sendResponse(res, 400, false, 'Scheduled date must be in the future');
      }
      
      updateData.scheduled_datetime = scheduledDateTime;
    }

    updateData.updated_at = new Date();

    const updatedRide = await FirestoreService.updateScheduledRide(id, updateData);

    return sendResponse(res, 200, true, 'Scheduled ride updated successfully', {
      scheduled_ride: updatedRide
    });

  } catch (error: any) {
    console.error('Error updating scheduled ride:', error);
    return sendResponse(res, 500, false, 'Failed to update scheduled ride', null, error.message);
  }
};

// DELETE /api/v1/scheduled-rides/:id - Cancel scheduled ride
export const cancelScheduledRide = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const { reason } = req.body;

    // Check if scheduled ride exists
    const existingRide = await FirestoreService.getScheduledRideById(id);
    if (!existingRide) {
      return sendResponse(res, 404, false, 'Scheduled ride not found');
    }

    // Check if ride can be cancelled
    if (existingRide.status === 'completed' || existingRide.status === 'cancelled') {
      return sendResponse(res, 400, false, 'Ride cannot be cancelled');
    }

    const updateData = {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancel_reason: reason || 'User cancelled',
      updated_at: new Date()
    };

    const cancelledRide = await FirestoreService.updateScheduledRide(id, updateData);

    return sendResponse(res, 200, true, 'Scheduled ride cancelled successfully', {
      scheduled_ride: cancelledRide
    });

  } catch (error: any) {
    console.error('Error cancelling scheduled ride:', error);
    return sendResponse(res, 500, false, 'Failed to cancel scheduled ride', null, error.message);
  }
};

// POST /api/v1/scheduled-rides/:id/confirm - Confirm scheduled ride
export const confirmScheduledRide = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const { driver_id } = req.body;

    // Check if scheduled ride exists
    const existingRide = await FirestoreService.getScheduledRideById(id);
    if (!existingRide) {
      return sendResponse(res, 404, false, 'Scheduled ride not found');
    }

    // Check if ride can be confirmed
    if (existingRide.status !== 'scheduled') {
      return sendResponse(res, 400, false, 'Ride cannot be confirmed');
    }

    // Check if scheduled time is approaching (within 30 minutes)
    const timeUntilRide = existingRide.scheduled_datetime.getTime() - new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (timeUntilRide > thirtyMinutes) {
      return sendResponse(res, 400, false, 'Ride confirmation is only available 30 minutes before scheduled time');
    }

    const updateData = {
      status: 'confirmed',
      driver_id: driver_id || null,
      confirmed_at: new Date(),
      updated_at: new Date()
    };

    const confirmedRide = await FirestoreService.updateScheduledRide(id, updateData);

    // Create actual ride request
    const rideData = {
      user_id: existingRide.user_id,
      pickup_location: existingRide.pickup_location.address,
      dropoff_location: existingRide.dropoff_location.address,
      pickup_coordinates: existingRide.pickup_location,
      dropoff_coordinates: existingRide.dropoff_location,
      ride_type: existingRide.ride_type,
      estimated_fare: existingRide.estimated_fare,
      scheduled_ride_id: id,
      driver_id: driver_id || null
    };

    const ride = await FirestoreService.createRide(rideData);

    return sendResponse(res, 200, true, 'Scheduled ride confirmed successfully', {
      scheduled_ride: confirmedRide,
      ride: ride
    });

  } catch (error: any) {
    console.error('Error confirming scheduled ride:', error);
    return sendResponse(res, 500, false, 'Failed to confirm scheduled ride', null, error.message);
  }
};

// GET /api/v1/driver/scheduled-rides - Driver's upcoming scheduled rides
export const getDriverScheduledRides = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { driver_id } = req.query;
    const { page = 1, limit = 10, date } = req.query;

    if (!driver_id) {
      return sendResponse(res, 400, false, 'driver_id is required');
    }

    const scheduledRides = await FirestoreService.getDriverScheduledRides(
      driver_id as string,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        date: date as string
      }
    );

    return sendResponse(res, 200, true, 'Driver scheduled rides retrieved successfully', {
      scheduled_rides: scheduledRides.data,
      pagination: scheduledRides.pagination
    });

  } catch (error: any) {
    console.error('Error getting driver scheduled rides:', error);
    return sendResponse(res, 500, false, 'Failed to get driver scheduled rides', null, error.message);
  }
};

// Helper function to create recurring rides
const createRecurringRides = async (baseRideData: any, pattern: string, endDate: string) => {
  const endDateTime = new Date(endDate);
  const baseDateTime = new Date(baseRideData.scheduled_datetime);
  
  let currentDateTime = new Date(baseDateTime);
  const rides = [];

  while (currentDateTime <= endDateTime) {
    // Calculate next occurrence based on pattern
    switch (pattern) {
      case 'daily':
        currentDateTime.setDate(currentDateTime.getDate() + 1);
        break;
      case 'weekly':
        currentDateTime.setDate(currentDateTime.getDate() + 7);
        break;
      case 'weekdays':
        // Skip weekends
        do {
          currentDateTime.setDate(currentDateTime.getDate() + 1);
        } while (currentDateTime.getDay() === 0 || currentDateTime.getDay() === 6);
        break;
      default:
        return; // Invalid pattern
    }

    if (currentDateTime <= endDateTime) {
      const recurringRideData = {
        ...baseRideData,
        scheduled_date: currentDateTime.toISOString().split('T')[0],
        scheduled_time: currentDateTime.toTimeString().split(' ')[0].substring(0, 5),
        scheduled_datetime: new Date(currentDateTime),
        parent_ride_id: baseRideData.id || null,
        created_at: new Date(),
        updated_at: new Date()
      };

      rides.push(recurringRideData);
    }
  }

  // Create all recurring rides
  for (const rideData of rides) {
    await FirestoreService.createScheduledRide(rideData);
  }
};
