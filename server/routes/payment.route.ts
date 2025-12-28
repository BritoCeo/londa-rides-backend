import { Router } from 'express';
import {
  calculateFare,
  processPayment,
  getPaymentHistory
} from '../controllers/payment.controller';
import { validateProcessPayment } from '../middleware/validation';

const router = Router();

// Payment APIs
router.post('/payment/calculate-fare', calculateFare);
router.post('/payment/process', validateProcessPayment, processPayment);
router.get('/payment/history', getPaymentHistory);

export default router;
