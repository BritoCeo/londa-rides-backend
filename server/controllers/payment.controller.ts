import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';

// Payment APIs

// POST /api/v1/payment/calculate-fare - Calculate ride fare
export const calculateFare = async (req: Request, res: Response) => {
  try {
    const { pickup_location, dropoff_location, ride_type = 'standard', distance_km } = req.body;

    if (!pickup_location || !dropoff_location) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pickup_location, dropoff_location'
      });
    }

    // Calculate distance if not provided
    let distance = distance_km;
    if (!distance) {
      distance = calculateDistance(
        pickup_location.latitude,
        pickup_location.longitude,
        dropoff_location.latitude,
        dropoff_location.longitude
      );
    }

    // Base fare calculation
    const baseFare = getBaseFare(ride_type);
    const perKmRate = getPerKmRate(ride_type);
    const totalFare = baseFare + (distance * perKmRate);

    // Add surge pricing if applicable
    const surgeMultiplier = getSurgeMultiplier();
    const finalFare = Math.round(totalFare * surgeMultiplier * 100) / 100;

    res.status(200).json({
      success: true,
      message: 'Fare calculated successfully',
      data: {
        base_fare: baseFare,
        distance_km: distance,
        per_km_rate: perKmRate,
        surge_multiplier: surgeMultiplier,
        total_fare: finalFare,
        currency: 'USD'
      }
    });
  } catch (error) {
    console.error('Calculate fare error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fare',
      error: error.message
    });
  }
};

// POST /api/v1/payment/process - Process payment
export const processPayment = async (req: Request, res: Response) => {
  try {
    const { ride_id, user_id, amount, payment_method, payment_token } = req.body;

    if (!ride_id || !user_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: ride_id, user_id, amount, payment_method'
      });
    }

    // Verify ride exists and is completed
    const ride = await FirestoreService.getRideById(ride_id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    if (ride.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only process payment for completed rides'
      });
    }

    // Process payment (mock implementation)
    const paymentResult = await processPaymentMethod(payment_method, payment_token, amount);

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment processing failed',
        error: paymentResult.error
      });
    }

    // Create payment record
    const paymentData = {
      userId: user_id,
      amount: parseFloat(amount),
      currency: 'NAD',
      paymentMethod: payment_method,
      status: 'completed',
      transaction_id: paymentResult.transaction_id,
      payment_type: 'ride_payment'
    };

    const payment = await FirestoreService.createPayment(paymentData);

    // Update ride with payment information
    await FirestoreService.updateRide(ride_id, {
      paymentId: payment.id,
      payment_status: 'completed',
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    console.error('Process payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment',
      error: error.message
    });
  }
};

// GET /api/v1/payment/history - Payment history
export const getPaymentHistory = async (req: Request, res: Response) => {
  try {
    const { user_id, driver_id, page = 1, limit = 10 } = req.query;

    if (!user_id && !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: user_id or driver_id'
      });
    }

    const payments = await FirestoreService.getPaymentsByUserId(
      user_id as string || driver_id as string,
      parseInt(page as string),
      parseInt(limit as string)
    );

    res.status(200).json({
      success: true,
      message: 'Payment history retrieved successfully',
      data: {
        payments,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: payments.length
        }
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
};

// Helper functions

function getBaseFare(rideType: string): number {
  const baseFares = {
    standard: 2.50,
    premium: 4.00,
    xl: 3.50,
    pool: 1.50
  };
  return baseFares[rideType] || baseFares.standard;
}

function getPerKmRate(rideType: string): number {
  const perKmRates = {
    standard: 1.20,
    premium: 2.00,
    xl: 1.80,
    pool: 0.80
  };
  return perKmRates[rideType] || perKmRates.standard;
}

function getSurgeMultiplier(): number {
  // Mock surge pricing - in real implementation, this would be dynamic
  const currentHour = new Date().getHours();
  if (currentHour >= 7 && currentHour <= 9) return 1.5; // Morning rush
  if (currentHour >= 17 && currentHour <= 19) return 1.8; // Evening rush
  if (currentHour >= 22 || currentHour <= 6) return 1.3; // Night time
  return 1.0; // Normal pricing
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

async function processPaymentMethod(method: string, token: string, amount: number) {
  // Cash payment processing - no external payment gateway needed
  return new Promise((resolve) => {
    setTimeout(() => {
      if (method === 'cash') {
        resolve({
          success: true,
          transaction_id: `cash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
