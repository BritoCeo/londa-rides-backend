import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Custom phone number validator for Namibian numbers
const validateNamibianPhone = (value: string) => {
  // Accept formats like: +264811234567, +264 81 123 4567, 0811234567
  const phoneRegex = /^(\+264|0)?[0-9]{9}$/;
  const cleanPhone = value.replace(/\s+/g, '');
  
  if (!phoneRegex.test(cleanPhone)) {
    throw new Error('Phone number must be a valid Namibian mobile number (e.g., +264811234567)');
  }
  return true;
};

// Validation result handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined
      }))
    });
  }
  next();
};

// User validation schemas
export const validateUserRegistration = [
  body('phone_number')
    .custom(validateNamibianPhone),
  body('name')
    .optional()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email must be a valid email address'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('phone_number')
    .custom(validateNamibianPhone),
  body('otp')
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 4-6 digits'),
  handleValidationErrors
];

// Driver validation schemas
export const validateDriverRegistration = [
  body('phone_number')
    .custom(validateNamibianPhone),
  body('name')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('country')
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Email must be a valid email address'),
  body('vehicle_type')
    .isIn(['Car', 'Motorcycle', 'CNG'])
    .withMessage('Vehicle type must be Car, Motorcycle, or CNG'),
  body('registration_number')
    .isLength({ min: 5, max: 20 })
    .withMessage('Registration number must be between 5 and 20 characters'),
  body('driving_license')
    .isLength({ min: 5, max: 20 })
    .withMessage('Driving license must be between 5 and 20 characters'),
  body('rate')
    .isNumeric()
    .withMessage('Rate must be a number'),
  handleValidationErrors
];

// Ride validation schemas
export const validateRequestRide = [
  body('user_id')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
  body('pickup_location')
    .isObject()
    .withMessage('Pickup location must be an object'),
  body('pickup_location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Pickup latitude must be between -90 and 90'),
  body('pickup_location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Pickup longitude must be between -180 and 180'),
  body('dropoff_location')
    .isObject()
    .withMessage('Dropoff location must be an object'),
  body('dropoff_location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Dropoff latitude must be between -90 and 90'),
  body('dropoff_location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Dropoff longitude must be between -180 and 180'),
  body('ride_type')
    .optional()
    .isIn(['standard', 'premium', 'xl', 'pool'])
    .withMessage('Ride type must be standard, premium, xl, or pool'),
  body('estimated_fare')
    .optional()
    .isNumeric()
    .withMessage('Estimated fare must be a number'),
  handleValidationErrors
];

export const validateCancelRide = [
  body('rideId')
    .isString()
    .notEmpty()
    .withMessage('Ride ID is required'),
  body('reason')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Reason must be between 1 and 200 characters'),
  handleValidationErrors
];

export const validateRateRide = [
  body('ride_id')
    .isString()
    .notEmpty()
    .withMessage('Ride ID is required'),
  body('user_id')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('review')
    .optional()
    .isLength({ min: 1, max: 500 })
    .withMessage('Review must be between 1 and 500 characters'),
  handleValidationErrors
];

// Location validation schemas
export const validateUpdateLocation = [
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  body('driver_id')
    .optional()
    .isString()
    .withMessage('Driver ID must be a string'),
  body().custom((value, { req }) => {
    if (!req.body.user_id && !req.body.driver_id) {
      throw new Error('Either user_id or driver_id is required');
    }
    return true;
  }),
  handleValidationErrors
];

export const validateRideId = [
  param('rideId')
    .isString()
    .notEmpty()
    .withMessage('Ride ID is required'),
  handleValidationErrors
];

// Payment validation schemas
export const validateCalculateFare = [
  body('pickup_location')
    .isObject()
    .withMessage('Pickup location must be an object'),
  body('pickup_location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Pickup latitude must be between -90 and 90'),
  body('pickup_location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Pickup longitude must be between -180 and 180'),
  body('dropoff_location')
    .isObject()
    .withMessage('Dropoff location must be an object'),
  body('dropoff_location.latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Dropoff latitude must be between -90 and 90'),
  body('dropoff_location.longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Dropoff longitude must be between -180 and 180'),
  body('ride_type')
    .optional()
    .isIn(['standard', 'premium', 'xl', 'pool'])
    .withMessage('Ride type must be standard, premium, xl, or pool'),
  body('distance_km')
    .optional()
    .isNumeric()
    .withMessage('Distance must be a number'),
  handleValidationErrors
];

export const validateProcessPayment = [
  body('ride_id')
    .isString()
    .notEmpty()
    .withMessage('Ride ID is required'),
  body('user_id')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number'),
  body('payment_method')
    .isIn(['cash'])
    .withMessage('Payment method must be cash'),
  body('payment_token')
    .optional()
    .isString()
    .withMessage('Payment token must be a string'),
  handleValidationErrors
];

// Notification validation schemas
export const validateSendNotification = [
  body('recipient_id')
    .isString()
    .notEmpty()
    .withMessage('Recipient ID is required'),
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('message')
    .isLength({ min: 1, max: 500 })
    .withMessage('Message must be between 1 and 500 characters'),
  body('recipient_type')
    .optional()
    .isIn(['user', 'driver'])
    .withMessage('Recipient type must be user or driver'),
  body('type')
    .optional()
    .isIn(['general', 'ride', 'payment', 'system'])
    .withMessage('Type must be general, ride, payment, or system'),
  handleValidationErrors
];

export const validateMarkNotificationAsRead = [
  body('notification_id')
    .isString()
    .notEmpty()
    .withMessage('Notification ID is required'),
  body('recipient_id')
    .isString()
    .notEmpty()
    .withMessage('Recipient ID is required'),
  handleValidationErrors
];

// Profile validation schemas
export const validateUpdateProfile = [
  body('profile_data')
    .isObject()
    .withMessage('Profile data must be an object'),
  body('user_id')
    .optional()
    .isString()
    .withMessage('User ID must be a string'),
  body('driver_id')
    .optional()
    .isString()
    .withMessage('Driver ID must be a string'),
  body().custom((value, { req }) => {
    if (!req.body.user_id && !req.body.driver_id) {
      throw new Error('Either user_id or driver_id is required');
    }
    return true;
  }),
  handleValidationErrors
];

export const validateUploadDocument = [
  body('driver_id')
    .isString()
    .notEmpty()
    .withMessage('Driver ID is required'),
  body('document_type')
    .isIn(['license', 'insurance', 'registration', 'background_check', 'vehicle_inspection'])
    .withMessage('Document type must be license, insurance, registration, background_check, or vehicle_inspection'),
  body('document_data')
    .optional()
    .isObject()
    .withMessage('Document data must be an object'),
  body('file_url')
    .optional()
    .isURL()
    .withMessage('File URL must be a valid URL'),
  body().custom((value, { req }) => {
    if (!req.body.document_data && !req.body.file_url) {
      throw new Error('Either document_data or file_url is required');
    }
    return true;
  }),
  handleValidationErrors
];

// Analytics validation schemas
export const validateAnalyticsQuery = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'year', 'all'])
    .withMessage('Period must be week, month, year, or all'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

// Driver Subscription validation
export const validateDriverSubscription = [
  body('driver_id').notEmpty().withMessage('Driver ID is required'),
  body('payment_method').isIn(['cash']).withMessage('Payment method must be cash'),
  body('payment_token').optional().isString().withMessage('Payment token must be a string'),
  handleValidationErrors
];

export const validateDriverSubscriptionUpdate = [
  body('auto_renew').optional().isBoolean().withMessage('Auto renew must be a boolean'),
  body('payment_method').optional().isIn(['cash']).withMessage('Payment method must be cash'),
  body('notification_preferences').optional().isObject().withMessage('Notification preferences must be an object'),
  handleValidationErrors
];

export const validateSubscriptionPayment = [
  body('driver_id').notEmpty().withMessage('Driver ID is required'),
  body('payment_method').isIn(['cash']).withMessage('Payment method must be cash'),
  body('payment_token').optional().isString().withMessage('Payment token must be a string'),
  body('amount').isFloat({ min: 150, max: 150 }).withMessage('Amount must be exactly 150.00 NAD'),
  handleValidationErrors
];
