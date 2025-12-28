import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';
import { AppError, sendResponse } from '../middleware/errorHandler';

// Driver Subscription Management APIs

// POST /api/v1/driver/subscription - Create driver subscription
export const createDriverSubscription = async (req: Request, res: Response) => {
  try {
    const { driver_id, payment_method, payment_token } = req.body;

    if (!driver_id || !payment_method) {
      return sendResponse(res, 400, false, 'Missing required fields: driver_id, payment_method');
    }

    // Check if driver exists
    const driver = await FirestoreService.getDriverById(driver_id);
    if (!driver) {
      return sendResponse(res, 404, false, 'Driver not found');
    }

    // Check if driver already has an active subscription
    const existingSubscription = await FirestoreService.getDriverSubscription(driver_id);
    if (existingSubscription && existingSubscription.status === 'active') {
      return sendResponse(res, 409, false, 'Driver already has an active subscription');
    }

    // Create subscription data
    const subscriptionData = {
      driver_id,
      amount: 150.00, // NAD 150.00 as per business rules
      currency: 'NAD',
      payment_method,
      payment_token: payment_token || null,
      status: 'pending',
      subscription_type: 'monthly',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      created_at: new Date(),
      updated_at: new Date()
    };

    // Process payment (mock implementation)
    const paymentResult = await processSubscriptionPaymentHelper(payment_method, payment_token, 150.00);

    if (!paymentResult.success) {
      return sendResponse(res, 400, false, 'Payment processing failed', null, {
        error: paymentResult.error,
        payment_method,
        amount: 150.00
      });
    }

    // Create subscription record
    const subscription = await FirestoreService.createDriverSubscription(subscriptionData);

    // Update subscription with payment details
    const updatedSubscription = await FirestoreService.updateDriverSubscription(subscription.id, {
      payment_id: paymentResult.payment_id,
      transaction_id: paymentResult.transaction_id,
      status: 'active',
      payment_date: new Date(),
      updated_at: new Date()
    });

    // Update driver status to active
    await FirestoreService.updateDriver(driver_id, {
      subscriptionId: subscription.id,
      updated_at: new Date()
    });

    sendResponse(res, 201, true, 'Driver subscription created successfully', {
      subscription: updatedSubscription,
      payment: {
        transaction_id: paymentResult.transaction_id,
        amount: 150.00,
        currency: 'NAD',
        status: 'completed'
      }
    });
  } catch (error: any) {
    console.error('Create driver subscription error:', error);
    sendResponse(res, 500, false, 'Failed to create driver subscription', null, {
      error: error.message
    });
  }
};

// GET /api/v1/driver/subscription - Get current driver's subscription status
export const getCurrentDriverSubscription = async (req: Request, res: Response) => {
  try {
    const driver_id = req.driver?.id; // Get driver ID from authenticated driver

    if (!driver_id) {
      return sendResponse(res, 401, false, 'Driver not authenticated');
    }

    const subscription = await FirestoreService.getDriverSubscription(driver_id);

    if (!subscription) {
      return sendResponse(res, 404, false, 'No subscription found for this driver');
    }

    // Calculate days remaining
    const now = new Date();
    
    // Handle different date formats from Firestore
    const parseDate = (dateValue: any) => {
      if (dateValue instanceof Date) {
        return dateValue;
      } else if (dateValue && dateValue.seconds) {
        // Firestore Timestamp
        return new Date(dateValue.seconds * 1000);
      } else if (typeof dateValue === 'string') {
        return new Date(dateValue);
      } else if (dateValue && dateValue._seconds) {
        // Firestore Timestamp alternative format
        return new Date(dateValue._seconds * 1000);
      }
      return new Date();
    };
    
    const startDate = parseDate(subscription.start_date);
    const endDate = parseDate(subscription.end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Format dates in ISO 8601 format with timezone
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '+0000');
    };

    sendResponse(res, 200, true, 'Driver subscription retrieved successfully', {
      subscription: {
        ...subscription,
        startDate: formatDate(startDate),
        expiryDate: formatDate(endDate)
      },
      status: {
        is_active: subscription.status === 'active',
        days_remaining: daysRemaining,
        expires_on: subscription.end_date,
        auto_renew: subscription.auto_renew || false
      }
    });
  } catch (error: any) {
    console.error('Get current driver subscription error:', error);
    sendResponse(res, 500, false, 'Failed to get driver subscription', null, {
      error: error.message
    });
  }
};

// GET /api/v1/driver/subscription/:driver_id - Get driver subscription status by ID
export const getDriverSubscription = async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.params;

    if (!driver_id) {
      return sendResponse(res, 400, false, 'Missing required parameter: driver_id');
    }

    const subscription = await FirestoreService.getDriverSubscription(driver_id);

    if (!subscription) {
      return sendResponse(res, 404, false, 'No subscription found for this driver');
    }

    // Calculate days remaining
    const now = new Date();
    
    // Handle different date formats from Firestore
    const parseDate = (dateValue: any) => {
      if (dateValue instanceof Date) {
        return dateValue;
      } else if (dateValue && dateValue.seconds) {
        // Firestore Timestamp
        return new Date(dateValue.seconds * 1000);
      } else if (typeof dateValue === 'string') {
        return new Date(dateValue);
      } else if (dateValue && dateValue._seconds) {
        // Firestore Timestamp alternative format
        return new Date(dateValue._seconds * 1000);
      }
      return new Date();
    };
    
    const startDate = parseDate(subscription.start_date);
    const endDate = parseDate(subscription.end_date);
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Format dates in ISO 8601 format with timezone
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, '+0000');
    };

    sendResponse(res, 200, true, 'Driver subscription retrieved successfully', {
      subscription: {
        ...subscription,
        startDate: formatDate(startDate),
        expiryDate: formatDate(endDate)
      },
      status: {
        is_active: subscription.status === 'active',
        days_remaining: daysRemaining,
        expires_on: subscription.end_date,
        auto_renew: subscription.auto_renew || false
      }
    });
  } catch (error: any) {
    console.error('Get driver subscription error:', error);
    sendResponse(res, 500, false, 'Failed to get driver subscription', null, {
      error: error.message
    });
  }
};

// PUT /api/v1/driver/subscription - Update subscription
export const updateDriverSubscription = async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.params;
    const { auto_renew, payment_method, notification_preferences } = req.body;

    if (!driver_id) {
      return sendResponse(res, 400, false, 'Missing required parameter: driver_id');
    }

    const subscription = await FirestoreService.getDriverSubscription(driver_id);
    if (!subscription) {
      return sendResponse(res, 404, false, 'Subscription not found');
    }

    const updateData: any = {
      updated_at: new Date()
    };

    if (auto_renew !== undefined) {
      updateData.auto_renew = auto_renew;
    }

    if (payment_method) {
      updateData.payment_method = payment_method;
    }

    if (notification_preferences) {
      updateData.notification_preferences = notification_preferences;
    }

    const updatedSubscription = await FirestoreService.updateDriverSubscription(subscription.id, updateData);

    sendResponse(res, 200, true, 'Driver subscription updated successfully', {
      subscription: updatedSubscription
    });
  } catch (error: any) {
    console.error('Update driver subscription error:', error);
    sendResponse(res, 500, false, 'Failed to update driver subscription', null, {
      error: error.message
    });
  }
};

// POST /api/v1/driver/subscription/payment - Process subscription payment
export const processSubscriptionPayment = async (req: Request, res: Response) => {
  try {
    const { driver_id, payment_method, payment_token, amount } = req.body;

    if (!driver_id || !payment_method || !amount) {
      return sendResponse(res, 400, false, 'Missing required fields: driver_id, payment_method, amount');
    }

    // Validate amount
    if (parseFloat(amount) !== 150.00) {
      return sendResponse(res, 400, false, 'Invalid amount. Driver subscription fee is NAD 150.00');
    }

    const subscription = await FirestoreService.getDriverSubscription(driver_id);
    if (!subscription) {
      return sendResponse(res, 404, false, 'Subscription not found');
    }

    // Process payment
    const paymentResult = await processSubscriptionPaymentHelper(payment_method, payment_token, parseFloat(amount));

    if (!paymentResult.success) {
      return sendResponse(res, 400, false, 'Payment processing failed', null, {
        error: paymentResult.error
      });
    }

    // Update subscription with new payment
    const updatedSubscription = await FirestoreService.updateDriverSubscription(subscription.id, {
      payment_method,
      payment_id: paymentResult.payment_id,
      transaction_id: paymentResult.transaction_id,
      status: 'active',
      payment_date: new Date(),
      updated_at: new Date()
    });

    // Create payment record
    const paymentRecord = await FirestoreService.createPayment({
      userId: driver_id,
      amount: parseFloat(amount),
      currency: 'NAD',
      paymentMethod: payment_method,
      status: 'completed',
      transaction_id: paymentResult.transaction_id,
      payment_type: 'driver_subscription'
    });

    sendResponse(res, 200, true, 'Subscription payment processed successfully', {
      subscription: updatedSubscription,
      payment: paymentRecord
    });
  } catch (error: any) {
    console.error('Process subscription payment error:', error);
    sendResponse(res, 500, false, 'Failed to process subscription payment', null, {
      error: error.message
    });
  }
};

// GET /api/v1/driver/subscription/history - Get subscription history
export const getDriverSubscriptionHistory = async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.params;
    const { page = 1, limit = 10, start_date, end_date } = req.query;

    if (!driver_id) {
      return sendResponse(res, 400, false, 'Missing required parameter: driver_id');
    }

    const pagination = {
      page: parseInt(page as string),
      limit: parseInt(limit as string)
    };

    const filters = {
      start_date: start_date ? new Date(start_date as string) : undefined,
      end_date: end_date ? new Date(end_date as string) : undefined
    };

    const history = await FirestoreService.getDriverSubscriptionHistory(
      driver_id,
      pagination,
      filters
    );

    sendResponse(res, 200, true, 'Driver subscription history retrieved successfully', {
      history: history.subscriptions,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: history.total,
        total_pages: Math.ceil(history.total / pagination.limit)
      },
      summary: {
        total_payments: history.total,
        total_amount: history.total_amount,
        currency: 'NAD'
      }
    });
  } catch (error: any) {
    console.error('Get driver subscription history error:', error);
    sendResponse(res, 500, false, 'Failed to get driver subscription history', null, {
      error: error.message
    });
  }
};

// Helper function to process subscription payment
async function processSubscriptionPaymentHelper(paymentMethod: string, paymentToken: string | null, amount: number) {
  // Cash payment processing - no external payment gateway needed
  return new Promise((resolve) => {
    setTimeout(() => {
      if (paymentMethod === 'cash') {
        resolve({
          success: true,
          payment_id: `cash_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          transaction_id: `cash_txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });
      } else {
        resolve({
          success: false,
          error: 'Only cash payments are accepted'
        });
      }
    }, 500); // Faster processing for cash payments
  });
}
