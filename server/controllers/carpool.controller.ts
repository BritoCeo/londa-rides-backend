import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';
import { AppError, sendResponse } from '../middleware/errorHandler';
import { body, param, query, validationResult } from 'express-validator';

// Carpooling/Ride Sharing APIs

// POST /api/v1/carpool/create - Create carpool ride
export const createCarpool = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const {
      user_id,
      pickup_location,
      dropoff_location,
      scheduled_datetime,
      max_passengers = 4,
      fare_per_person,
      notes,
      vehicle_preferences
    } = req.body;

    // Validate user exists
    const user = await FirestoreService.getUserById(user_id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Validate scheduled datetime is in the future
    const scheduledDate = new Date(scheduled_datetime);
    if (scheduledDate <= new Date()) {
      return sendResponse(res, 400, false, 'Scheduled datetime must be in the future');
    }

    // Calculate total fare and per-person fare
    const fareCalculation = await FirestoreService.calculateFare({
      pickup_coordinates: pickup_location,
      dropoff_coordinates: dropoff_location,
      ride_type: 'group',
      user_type: user.userType || 'student'
    });

    const totalFare = fareCalculation.total_fare;
    const perPersonFare = fare_per_person || Math.round(totalFare / max_passengers * 100) / 100;

    const carpoolData = {
      user_id,
      creator_id: user_id,
      pickup_location,
      dropoff_location,
      scheduled_datetime: scheduledDate,
      max_passengers,
      current_passengers: 1, // Creator is the first passenger
      fare_per_person: perPersonFare,
      total_fare: totalFare,
      notes: notes || '',
      vehicle_preferences: vehicle_preferences || [],
      status: 'open',
      passengers: [{
        user_id,
        joined_at: new Date(),
        status: 'confirmed'
      }],
      created_at: new Date(),
      updated_at: new Date()
    };

    const carpool = await FirestoreService.createCarpool(carpoolData);

    return sendResponse(res, 201, true, 'Carpool created successfully', {
      carpool,
      fare_breakdown: {
        total_fare: totalFare,
        per_person_fare: perPersonFare,
        max_passengers,
        savings_per_person: totalFare - perPersonFare
      }
    });

  } catch (error: any) {
    console.error('Error creating carpool:', error);
    return sendResponse(res, 500, false, 'Failed to create carpool', null, error.message);
  }
};

// GET /api/v1/carpool/available - Find available carpool rides
export const getAvailableCarpools = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const {
      pickup_latitude,
      pickup_longitude,
      dropoff_latitude,
      dropoff_longitude,
      radius = 5,
      max_fare_per_person,
      date_range,
      page = 1,
      limit = 10
    } = req.query;

    if (!pickup_latitude || !pickup_longitude || !dropoff_latitude || !dropoff_longitude) {
      return sendResponse(res, 400, false, 'Pickup and dropoff coordinates are required');
    }

    const carpools = await FirestoreService.getAvailableCarpools({
      pickup_coordinates: {
        latitude: parseFloat(pickup_latitude as string),
        longitude: parseFloat(pickup_longitude as string)
      },
      dropoff_coordinates: {
        latitude: parseFloat(dropoff_latitude as string),
        longitude: parseFloat(dropoff_longitude as string)
      },
      radius: parseFloat(radius as string),
      max_fare_per_person: max_fare_per_person ? parseFloat(max_fare_per_person as string) : undefined,
      date_range: date_range as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    });

    return sendResponse(res, 200, true, 'Available carpools retrieved successfully', {
      carpools: carpools.data,
      pagination: carpools.pagination
    });

  } catch (error: any) {
    console.error('Error getting available carpools:', error);
    return sendResponse(res, 500, false, 'Failed to get available carpools', null, error.message);
  }
};

// POST /api/v1/carpool/:id/join - Join a carpool ride
export const joinCarpool = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const { user_id, notes } = req.body;

    // Validate user exists
    const user = await FirestoreService.getUserById(user_id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    // Get carpool details
    const carpool = await FirestoreService.getCarpoolById(id);
    if (!carpool) {
      return sendResponse(res, 404, false, 'Carpool not found');
    }

    // Check if carpool is still open
    if (carpool.status !== 'open') {
      return sendResponse(res, 400, false, 'Carpool is no longer accepting passengers');
    }

    // Check if carpool is full
    if (carpool.current_passengers >= carpool.max_passengers) {
      return sendResponse(res, 400, false, 'Carpool is full');
    }

    // Check if user is already in the carpool
    const existingPassenger = carpool.passengers.find(p => p.user_id === user_id);
    if (existingPassenger) {
      return sendResponse(res, 400, false, 'User is already in this carpool');
    }

    // Check if scheduled time is still in the future
    if (carpool.scheduled_datetime <= new Date()) {
      return sendResponse(res, 400, false, 'Cannot join carpool that has already started');
    }

    // Add passenger to carpool
    const newPassenger = {
      user_id,
      joined_at: new Date(),
      status: 'pending',
      notes: notes || ''
    };

    const updatedCarpool = await FirestoreService.addPassengerToCarpool(id, newPassenger);

    return sendResponse(res, 200, true, 'Successfully joined carpool', {
      carpool: updatedCarpool,
      passenger: newPassenger
    });

  } catch (error: any) {
    console.error('Error joining carpool:', error);
    return sendResponse(res, 500, false, 'Failed to join carpool', null, error.message);
  }
};

// DELETE /api/v1/carpool/:id/leave - Leave a carpool ride
export const leaveCarpool = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const { user_id, reason } = req.body;

    // Get carpool details
    const carpool = await FirestoreService.getCarpoolById(id);
    if (!carpool) {
      return sendResponse(res, 404, false, 'Carpool not found');
    }

    // Check if user is in the carpool
    const passengerIndex = carpool.passengers.findIndex(p => p.user_id === user_id);
    if (passengerIndex === -1) {
      return sendResponse(res, 400, false, 'User is not in this carpool');
    }

    // Check if user is the creator
    if (carpool.creator_id === user_id) {
      return sendResponse(res, 400, false, 'Creator cannot leave carpool. Cancel the carpool instead.');
    }

    // Remove passenger from carpool
    const updatedCarpool = await FirestoreService.removePassengerFromCarpool(id, user_id, reason);

    return sendResponse(res, 200, true, 'Successfully left carpool', {
      carpool: updatedCarpool
    });

  } catch (error: any) {
    console.error('Error leaving carpool:', error);
    return sendResponse(res, 500, false, 'Failed to leave carpool', null, error.message);
  }
};

// GET /api/v1/carpool/my-rides - Get user's carpool rides
export const getMyCarpoolRides = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { user_id } = req.query;
    const { page = 1, limit = 10, status, type = 'all' } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'user_id is required');
    }

    const carpools = await FirestoreService.getUserCarpoolRides(
      user_id as string,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string,
        type: type as string
      }
    );

    return sendResponse(res, 200, true, 'Carpool rides retrieved successfully', {
      carpools: carpools.data,
      pagination: carpools.pagination
    });

  } catch (error: any) {
    console.error('Error getting user carpool rides:', error);
    return sendResponse(res, 500, false, 'Failed to get carpool rides', null, error.message);
  }
};

// PUT /api/v1/carpool/:id - Update carpool details
export const updateCarpool = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const updateData = req.body;

    // Get carpool details
    const existingCarpool = await FirestoreService.getCarpoolById(id);
    if (!existingCarpool) {
      return sendResponse(res, 404, false, 'Carpool not found');
    }

    // Check if user is the creator
    if (existingCarpool.creator_id !== updateData.user_id) {
      return sendResponse(res, 403, false, 'Only the carpool creator can update details');
    }

    // Check if carpool can be updated
    if (existingCarpool.status === 'completed' || existingCarpool.status === 'cancelled') {
      return sendResponse(res, 400, false, 'Cannot update completed or cancelled carpool');
    }

    // If scheduled time is being updated, validate it's in the future
    if (updateData.scheduled_datetime) {
      const scheduledDate = new Date(updateData.scheduled_datetime);
      if (scheduledDate <= new Date()) {
        return sendResponse(res, 400, false, 'Scheduled datetime must be in the future');
      }
    }

    updateData.updated_at = new Date();

    const updatedCarpool = await FirestoreService.updateCarpool(id, updateData);

    return sendResponse(res, 200, true, 'Carpool updated successfully', {
      carpool: updatedCarpool
    });

  } catch (error: any) {
    console.error('Error updating carpool:', error);
    return sendResponse(res, 500, false, 'Failed to update carpool', null, error.message);
  }
};

// GET /api/v1/carpool/:id/participants - Get carpool participants
export const getCarpoolParticipants = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;

    const carpool = await FirestoreService.getCarpoolById(id);
    if (!carpool) {
      return sendResponse(res, 404, false, 'Carpool not found');
    }

    // Get detailed participant information
    const participants = await Promise.all(
      carpool.passengers.map(async (passenger) => {
        const user = await FirestoreService.getUserById(passenger.user_id);
        return {
          ...passenger,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone_number: user.phone_number,
            userType: user.userType
          } : null
        };
      })
    );

    return sendResponse(res, 200, true, 'Carpool participants retrieved successfully', {
      carpool_id: id,
      participants,
      total_passengers: carpool.current_passengers,
      max_passengers: carpool.max_passengers,
      available_spots: carpool.max_passengers - carpool.current_passengers
    });

  } catch (error: any) {
    console.error('Error getting carpool participants:', error);
    return sendResponse(res, 500, false, 'Failed to get carpool participants', null, error.message);
  }
};

// POST /api/v1/carpool/:id/cancel - Cancel carpool
export const cancelCarpool = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const { user_id, reason } = req.body;

    const carpool = await FirestoreService.getCarpoolById(id);
    if (!carpool) {
      return sendResponse(res, 404, false, 'Carpool not found');
    }

    // Check if user is the creator
    if (carpool.creator_id !== user_id) {
      return sendResponse(res, 403, false, 'Only the carpool creator can cancel the carpool');
    }

    // Check if carpool can be cancelled
    if (carpool.status === 'completed' || carpool.status === 'cancelled') {
      return sendResponse(res, 400, false, 'Carpool cannot be cancelled');
    }

    const updateData = {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancel_reason: reason || 'Creator cancelled',
      updated_at: new Date()
    };

    const cancelledCarpool = await FirestoreService.updateCarpool(id, updateData);

    return sendResponse(res, 200, true, 'Carpool cancelled successfully', {
      carpool: cancelledCarpool
    });

  } catch (error: any) {
    console.error('Error cancelling carpool:', error);
    return sendResponse(res, 500, false, 'Failed to cancel carpool', null, error.message);
  }
};
