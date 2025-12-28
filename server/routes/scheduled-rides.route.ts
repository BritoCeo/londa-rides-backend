import { Router } from 'express';
import {
  createScheduledRide,
  getScheduledRides,
  getScheduledRideById,
  updateScheduledRide,
  cancelScheduledRide,
  confirmScheduledRide,
  getDriverScheduledRides
} from '../controllers/scheduled-rides.controller';
import { isAuthenticated, isAuthenticatedDriver } from '../middleware/isAuthenticated';
import { asyncHandler } from '../middleware/errorHandler';
import { body, param, query } from 'express-validator';

const router = Router();

// ==================== SCHEDULED RIDES ROUTES ====================

// Create scheduled ride
router.post('/',
  isAuthenticated,
  [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('pickup_location').isObject().withMessage('Pickup location must be an object'),
    body('pickup_location.latitude').isFloat().withMessage('Pickup latitude must be a number'),
    body('pickup_location.longitude').isFloat().withMessage('Pickup longitude must be a number'),
    body('pickup_location.address').isString().notEmpty().withMessage('Pickup address is required'),
    body('dropoff_location').isObject().withMessage('Dropoff location must be an object'),
    body('dropoff_location.latitude').isFloat().withMessage('Dropoff latitude must be a number'),
    body('dropoff_location.longitude').isFloat().withMessage('Dropoff longitude must be a number'),
    body('dropoff_location.address').isString().notEmpty().withMessage('Dropoff address is required'),
    body('scheduled_date').isISO8601().withMessage('Scheduled date must be a valid date'),
    body('scheduled_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Scheduled time must be in HH:MM format'),
    body('ride_type').optional().isIn(['standard', 'premium', 'group']).withMessage('Invalid ride type'),
    body('passenger_count').optional().isInt({ min: 1, max: 8 }).withMessage('Passenger count must be between 1 and 8'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('recurring_pattern').optional().isIn(['daily', 'weekly', 'weekdays']).withMessage('Invalid recurring pattern'),
    body('recurring_end_date').optional().isISO8601().withMessage('Recurring end date must be a valid date')
  ],
  asyncHandler(createScheduledRide)
);

// Get user's scheduled rides
router.get('/',
  isAuthenticated,
  [
    query('user_id').isString().notEmpty().withMessage('User ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn(['scheduled', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('upcoming_only').optional().isBoolean().withMessage('upcoming_only must be a boolean')
  ],
  asyncHandler(getScheduledRides)
);

// Get specific scheduled ride
router.get('/:id',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Scheduled ride ID is required')
  ],
  asyncHandler(getScheduledRideById)
);

// Update scheduled ride
router.put('/:id',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Scheduled ride ID is required'),
    body('pickup_location').optional().isObject().withMessage('Pickup location must be an object'),
    body('dropoff_location').optional().isObject().withMessage('Dropoff location must be an object'),
    body('scheduled_date').optional().isISO8601().withMessage('Scheduled date must be a valid date'),
    body('scheduled_time').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Scheduled time must be in HH:MM format'),
    body('ride_type').optional().isIn(['standard', 'premium', 'group']).withMessage('Invalid ride type'),
    body('passenger_count').optional().isInt({ min: 1, max: 8 }).withMessage('Passenger count must be between 1 and 8'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  asyncHandler(updateScheduledRide)
);

// Cancel scheduled ride
router.delete('/:id',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Scheduled ride ID is required'),
    body('reason').optional().isString().withMessage('Cancel reason must be a string')
  ],
  asyncHandler(cancelScheduledRide)
);

// Confirm scheduled ride (convert to active ride)
router.post('/:id/confirm',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Scheduled ride ID is required'),
    body('driver_id').optional().isString().withMessage('Driver ID must be a string')
  ],
  asyncHandler(confirmScheduledRide)
);

// ==================== DRIVER SCHEDULED RIDES ROUTES ====================

// Get driver's scheduled rides
router.get('/driver/scheduled-rides',
  isAuthenticatedDriver,
  [
    query('driver_id').isString().notEmpty().withMessage('Driver ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('date').optional().isISO8601().withMessage('Date must be a valid date')
  ],
  asyncHandler(getDriverScheduledRides)
);

export default router;
