import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';
import { AppError, sendResponse } from '../middleware/errorHandler';
import { body, param, query, validationResult } from 'express-validator';

// Parent Package Management APIs (NAD 1000 monthly package)

// POST /api/v1/parent/subscribe - Subscribe to parent package
export const subscribeToParentPackage = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const {
      user_id,
      payment_method,
      payment_token,
      children_profiles
    } = req.body;

    // Validate user exists and is a parent
    const user = await FirestoreService.getUserById(user_id);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    }

    if (user.userType !== 'parent') {
      return sendResponse(res, 400, false, 'Only parents can subscribe to the monthly package');
    }

    // Check if user already has an active subscription
    const existingSubscription = await FirestoreService.getParentSubscription(user_id);
    if (existingSubscription && existingSubscription.status === 'active') {
      return sendResponse(res, 409, false, 'User already has an active parent subscription');
    }

    // Process payment (NAD 1000)
    const paymentResult = await processParentPackagePayment(payment_method, payment_token, 1000.00);

    if (!paymentResult.success) {
      return sendResponse(res, 400, false, 'Payment processing failed', null, {
        error: paymentResult.error,
        payment_method,
        amount: 1000.00
      });
    }

    // Create subscription data
    const subscriptionData = {
      user_id,
      subscription_type: 'parent_monthly',
      amount: 1000.00, // NAD 1000 as per Londa rules
      currency: 'NAD',
      payment_method,
      payment_token: payment_token || null,
      status: 'active',
      start_date: new Date(),
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      auto_renew: true,
      rides_limit: 'unlimited',
      rides_used: 0,
      children_profiles: children_profiles || [],
      created_at: new Date(),
      updated_at: new Date()
    };

    const subscription = await FirestoreService.createParentSubscription(subscriptionData);

    return sendResponse(res, 201, true, 'Parent subscription created successfully', {
      subscription,
      payment: {
        transaction_id: paymentResult.transaction_id,
        amount: 1000.00,
        currency: 'NAD',
        status: 'completed'
      }
    });

  } catch (error: any) {
    console.error('Error creating parent subscription:', error);
    return sendResponse(res, 500, false, 'Failed to create parent subscription', null, error.message);
  }
};

// GET /api/v1/parent/subscription - Get parent subscription status
export const getParentSubscription = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { user_id } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'user_id is required');
    }

    const subscription = await FirestoreService.getParentSubscription(user_id as string);

    if (!subscription) {
      return sendResponse(res, 404, false, 'No parent subscription found');
    }

    // Calculate usage statistics
    const usageStats = await FirestoreService.getParentSubscriptionUsage(user_id as string);

    return sendResponse(res, 200, true, 'Parent subscription retrieved successfully', {
      subscription,
      usage_stats: usageStats,
      status: {
        is_active: subscription.status === 'active',
        days_remaining: Math.ceil((subscription.end_date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        expires_on: subscription.end_date,
        auto_renew: subscription.auto_renew
      }
    });

  } catch (error: any) {
    console.error('Error getting parent subscription:', error);
    return sendResponse(res, 500, false, 'Failed to get parent subscription', null, error.message);
  }
};

// PUT /api/v1/parent/subscription - Update parent subscription
export const updateParentSubscription = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { user_id } = req.body;
    const updateData = req.body;

    // Get existing subscription
    const existingSubscription = await FirestoreService.getParentSubscription(user_id);
    if (!existingSubscription) {
      return sendResponse(res, 404, false, 'Parent subscription not found');
    }

    // Check if user is the owner
    if (existingSubscription.user_id !== user_id) {
      return sendResponse(res, 403, false, 'Unauthorized to update this subscription');
    }

    // Validate updateable fields
    const allowedUpdates = ['auto_renew', 'payment_method', 'children_profiles', 'notification_preferences'];
    const filteredUpdates = Object.keys(updateData)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    filteredUpdates.updated_at = new Date();

    const updatedSubscription = await FirestoreService.updateParentSubscription(user_id, filteredUpdates);

    return sendResponse(res, 200, true, 'Parent subscription updated successfully', {
      subscription: updatedSubscription
    });

  } catch (error: any) {
    console.error('Error updating parent subscription:', error);
    return sendResponse(res, 500, false, 'Failed to update parent subscription', null, error.message);
  }
};

// DELETE /api/v1/parent/subscription - Cancel parent subscription
export const cancelParentSubscription = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { user_id, reason } = req.body;

    // Get existing subscription
    const existingSubscription = await FirestoreService.getParentSubscription(user_id);
    if (!existingSubscription) {
      return sendResponse(res, 404, false, 'Parent subscription not found');
    }

    // Check if subscription can be cancelled
    if (existingSubscription.status === 'cancelled') {
      return sendResponse(res, 400, false, 'Subscription is already cancelled');
    }

    const updateData = {
      status: 'cancelled',
      cancelled_at: new Date(),
      cancel_reason: reason || 'User cancelled',
      auto_renew: false,
      updated_at: new Date()
    };

    const cancelledSubscription = await FirestoreService.updateParentSubscription(user_id, updateData);

    return sendResponse(res, 200, true, 'Parent subscription cancelled successfully', {
      subscription: cancelledSubscription
    });

  } catch (error: any) {
    console.error('Error cancelling parent subscription:', error);
    return sendResponse(res, 500, false, 'Failed to cancel parent subscription', null, error.message);
  }
};

// GET /api/v1/parent/usage - Get monthly usage statistics
export const getParentUsageStats = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { user_id } = req.query;
    const { month, year } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'user_id is required');
    }

    const targetDate = month && year 
      ? new Date(parseInt(year as string), parseInt(month as string) - 1, 1)
      : new Date();

    const usageStats = await FirestoreService.getParentSubscriptionUsage(
      user_id as string,
      targetDate
    );

    return sendResponse(res, 200, true, 'Parent usage statistics retrieved successfully', {
      usage_stats: usageStats,
      period: {
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear()
      }
    });

  } catch (error: any) {
    console.error('Error getting parent usage stats:', error);
    return sendResponse(res, 500, false, 'Failed to get usage statistics', null, error.message);
  }
};

// GET /api/v1/parent/children - Get children profiles
export const getChildrenProfiles = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { user_id } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'user_id is required');
    }

    const children = await FirestoreService.getChildrenProfiles(user_id as string);

    return sendResponse(res, 200, true, 'Children profiles retrieved successfully', {
      children
    });

  } catch (error: any) {
    console.error('Error getting children profiles:', error);
    return sendResponse(res, 500, false, 'Failed to get children profiles', null, error.message);
  }
};

// POST /api/v1/parent/children - Add child profile
export const addChildProfile = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const {
      user_id,
      child_name,
      child_age,
      school_name,
      pickup_address,
      dropoff_address,
      emergency_contact
    } = req.body;

    // Validate parent has active subscription
    const subscription = await FirestoreService.getParentSubscription(user_id);
    if (!subscription || subscription.status !== 'active') {
      return sendResponse(res, 400, false, 'Active parent subscription required to add children');
    }

    const childProfile = {
      user_id,
      child_name,
      child_age,
      school_name,
      pickup_address,
      dropoff_address,
      emergency_contact,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const createdChild = await FirestoreService.createChildProfile(childProfile);

    // Update subscription with new child
    const updatedChildren = [...(subscription.children_profiles || []), createdChild.id];
    await FirestoreService.updateParentSubscription(user_id, {
      children_profiles: updatedChildren
    });

    return sendResponse(res, 201, true, 'Child profile created successfully', {
      child: createdChild
    });

  } catch (error: any) {
    console.error('Error adding child profile:', error);
    return sendResponse(res, 500, false, 'Failed to add child profile', null, error.message);
  }
};

// GET /api/v1/parent/children/:id/rides - Get child's ride history
export const getChildRideHistory = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', null, errors.array());
    }

    const { id } = req.params;
    const { user_id } = req.query;
    const { page = 1, limit = 10, date_range } = req.query;

    if (!user_id) {
      return sendResponse(res, 400, false, 'user_id is required');
    }

    // Verify child belongs to parent
    const child = await FirestoreService.getChildProfileById(id);
    if (!child || child.user_id !== user_id) {
      return sendResponse(res, 404, false, 'Child profile not found or unauthorized');
    }

    const rides = await FirestoreService.getChildRideHistory(
      id,
      {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        date_range: date_range as string
      }
    );

    return sendResponse(res, 200, true, 'Child ride history retrieved successfully', {
      child_id: id,
      rides: rides.data,
      pagination: rides.pagination
    });

  } catch (error: any) {
    console.error('Error getting child ride history:', error);
    return sendResponse(res, 500, false, 'Failed to get child ride history', null, error.message);
  }
};

// Helper function to process parent package payment
const processParentPackagePayment = async (paymentMethod: string, paymentToken: string | null, amount: number) => {
  try {
    // Mock payment processing - replace with actual payment gateway integration
    console.log(`Processing parent package payment: ${amount} NAD via ${paymentMethod}`);
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful payment
    return {
      success: true,
      transaction_id: `txn_parent_${Date.now()}`,
      amount: amount,
      currency: 'NAD',
      status: 'completed'
    };
  } catch (error) {
    console.error('Payment processing error:', error);
    return {
      success: false,
      error: 'Payment processing failed'
    };
  }
};
