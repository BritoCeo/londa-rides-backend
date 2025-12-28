import { Router } from 'express';
import {
  subscribeToParentPackage,
  getParentSubscription,
  updateParentSubscription,
  cancelParentSubscription,
  getParentUsageStats,
  getChildrenProfiles,
  addChildProfile,
  getChildRideHistory
} from '../controllers/parent-subscription.controller';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { asyncHandler } from '../middleware/errorHandler';
import { body, param, query } from 'express-validator';

const router = Router();

// ==================== PARENT SUBSCRIPTION ROUTES ====================

// Subscribe to parent package (NAD 1000 monthly)
router.post('/subscribe',
  isAuthenticated,
  [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('payment_method').isIn(['card', 'bank_transfer', 'mobile_money']).withMessage('Invalid payment method'),
    body('payment_token').optional().isString().withMessage('Payment token must be a string'),
    body('children_profiles').optional().isArray().withMessage('Children profiles must be an array')
  ],
  asyncHandler(subscribeToParentPackage)
);

// Get parent subscription status
router.get('/subscription',
  isAuthenticated,
  [
    query('user_id').isString().notEmpty().withMessage('User ID is required')
  ],
  asyncHandler(getParentSubscription)
);

// Update parent subscription
router.put('/subscription',
  isAuthenticated,
  [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('auto_renew').optional().isBoolean().withMessage('Auto renew must be a boolean'),
    body('payment_method').optional().isIn(['card', 'bank_transfer', 'mobile_money']).withMessage('Invalid payment method'),
    body('children_profiles').optional().isArray().withMessage('Children profiles must be an array'),
    body('notification_preferences').optional().isObject().withMessage('Notification preferences must be an object')
  ],
  asyncHandler(updateParentSubscription)
);

// Cancel parent subscription
router.delete('/subscription',
  isAuthenticated,
  [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('reason').optional().isString().withMessage('Reason must be a string')
  ],
  asyncHandler(cancelParentSubscription)
);

// Get monthly usage statistics
router.get('/usage',
  isAuthenticated,
  [
    query('user_id').isString().notEmpty().withMessage('User ID is required'),
    query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    query('year').optional().isInt({ min: 2020, max: 2030 }).withMessage('Year must be between 2020 and 2030')
  ],
  asyncHandler(getParentUsageStats)
);

// Get children profiles
router.get('/children',
  isAuthenticated,
  [
    query('user_id').isString().notEmpty().withMessage('User ID is required')
  ],
  asyncHandler(getChildrenProfiles)
);

// Add child profile
router.post('/children',
  isAuthenticated,
  [
    body('user_id').isString().notEmpty().withMessage('User ID is required'),
    body('child_name').isString().notEmpty().withMessage('Child name is required'),
    body('child_age').isInt({ min: 5, max: 18 }).withMessage('Child age must be between 5 and 18'),
    body('school_name').isString().notEmpty().withMessage('School name is required'),
    body('pickup_address').isString().notEmpty().withMessage('Pickup address is required'),
    body('dropoff_address').isString().notEmpty().withMessage('Dropoff address is required'),
    body('emergency_contact').isObject().withMessage('Emergency contact must be an object'),
    body('emergency_contact.name').isString().notEmpty().withMessage('Emergency contact name is required'),
    body('emergency_contact.phone').isString().notEmpty().withMessage('Emergency contact phone is required')
  ],
  asyncHandler(addChildProfile)
);

// Get child's ride history
router.get('/children/:id/rides',
  isAuthenticated,
  [
    param('id').isString().notEmpty().withMessage('Child ID is required'),
    query('user_id').isString().notEmpty().withMessage('User ID is required'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('date_range').optional().isString().withMessage('Date range must be a string')
  ],
  asyncHandler(getChildRideHistory)
);

export default router;
