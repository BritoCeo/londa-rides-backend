import { Router } from 'express';
import {
  createCarpool,
  getAvailableCarpools,
  joinCarpool,
  leaveCarpool,
  getMyCarpoolRides,
  updateCarpool,
  getCarpoolParticipants,
  cancelCarpool
} from '../controllers/carpool.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { asyncHandler } from '../middleware/errorHandler';
import { body, param, query } from 'express-validator';

const router = Router();

// ==================== CARPOOL ROUTES ====================

// Create carpool ride
router.post('/create',
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
    body('scheduled_datetime').isISO8601().withMessage('Scheduled datetime must be a valid date'),
    body('max_passengers').optional().isInt({ min: 2, max: 8 }).withMessage('Max passengers must be between 2 and 8'),
    body('fare_per_person').optional().isFloat({ min: 0 }).withMessage('Fare per person must be a positive number'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('vehicle_preferences').optional().isArray().withMessage('Vehicle preferences must be an array')
  ],
  asyncHandler(createCarpool)
);

// Find available carpool rides
router.get('/available',
  isAuthenticated,
  [
    query('pickup_latitude').isFloat().withMessage('Pickup latitude is required'),
    query('pickup_longitude').isFloat().withMessage('Pickup longitude is required'),
    query('dropoff_latitude').isFloat().withMessage('Dropoff latitude is required'),
    query('dropoff_longitude').isFloat().withMessage('Dropoff longitude is required'),
    query('radius').optional().isFloat({ min: 1, max: 50 }).withMessage('Radius must be between 1 and 50 km'),
    query('max_fare_per_person').optional().isFloat({ min: 0 }).withMessage('Max fare per person must be a positive number'),
    query('date_range').optional().isString().withMessage('Date range must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  asyncHandler(getAvailableCarpools)
);

// Join a carpool ride
router.post('/:id/join',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Carpool ID is required'),
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('notes').optional().isString().withMessage('Notes must be a string')
  ],
  asyncHandler(joinCarpool)
);

// Leave a carpool ride
router.delete('/:id/leave',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Carpool ID is required'),
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  asyncHandler(leaveCarpool)
);

// Get user's carpool rides
router.get('/my-rides',
  isAuthenticated,
  [
    query('user_id').isString().notEmpty().withMessage('User ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('status').optional().isIn(['open', 'full', 'completed', 'cancelled']).withMessage('Invalid status'),
    query('type').optional().isIn(['created', 'joined', 'all']).withMessage('Invalid type')
  ],
  asyncHandler(getMyCarpoolRides)
);

// Update carpool details
router.put('/:id',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Carpool ID is required'),
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('pickup_location').optional().isObject().withMessage('Pickup location must be an object'),
    body('dropoff_location').optional().isObject().withMessage('Dropoff location must be an object'),
    body('scheduled_datetime').optional().isISO8601().withMessage('Scheduled datetime must be a valid date'),
    body('max_passengers').optional().isInt({ min: 2, max: 8 }).withMessage('Max passengers must be between 2 and 8'),
    body('fare_per_person').optional().isFloat({ min: 0 }).withMessage('Fare per person must be a positive number'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    body('vehicle_preferences').optional().isArray().withMessage('Vehicle preferences must be an array')
  ],
  asyncHandler(updateCarpool)
);

// Get carpool participants
router.get('/:id/participants',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Carpool ID is required')
  ],
  asyncHandler(getCarpoolParticipants)
);

// Cancel carpool
router.post('/:id/cancel',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Carpool ID is required'),
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  asyncHandler(cancelCarpool)
);

export default router;
