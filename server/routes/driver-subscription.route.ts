import { Router } from 'express';
import {
  createDriverSubscription,
  getDriverSubscription,
  getCurrentDriverSubscription,
  updateDriverSubscription,
  processSubscriptionPayment,
  getDriverSubscriptionHistory
} from '../controllers/driver-subscription.controller';
import { isAuthenticated, isAuthenticatedDriver } from '../middleware/isAuthenticated';
import { asyncHandler } from '../middleware/errorHandler';
import {
  validateDriverSubscription,
  validateDriverSubscriptionUpdate,
  validateSubscriptionPayment,
  validatePagination
} from '../middleware/validation';

const router = Router();

// ==================== DRIVER SUBSCRIPTION ROUTES ====================

// Create driver subscription
router.post('/subscription', 
  isAuthenticatedDriver,
  validateDriverSubscription,
  asyncHandler(createDriverSubscription)
);

// Get current driver's subscription status
router.get('/subscription', 
  isAuthenticatedDriver,
  asyncHandler(getCurrentDriverSubscription)
);

// Get driver subscription status by ID
router.get('/subscription/:driver_id', 
  isAuthenticatedDriver,
  asyncHandler(getDriverSubscription)
);

// Update driver subscription
router.put('/subscription/:driver_id', 
  isAuthenticatedDriver,
  validateDriverSubscriptionUpdate,
  asyncHandler(updateDriverSubscription)
);

// Process subscription payment
router.post('/subscription/payment', 
  isAuthenticatedDriver,
  validateSubscriptionPayment,
  asyncHandler(processSubscriptionPayment)
);

// Get subscription history
router.get('/subscription/history/:driver_id', 
  isAuthenticatedDriver,
  validatePagination,
  asyncHandler(getDriverSubscriptionHistory)
);

export default router;
