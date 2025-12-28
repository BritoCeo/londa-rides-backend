import { Router } from 'express';
import {
  requestRide,
  getNearbyDrivers,
  cancelRide,
  rateRide,
  getAvailableRides,
  acceptRide,
  declineRide,
  startRide,
  completeRide
} from '../controllers/ride.controller';

const router = Router();

// User Ride Booking APIs
router.post('/request-ride', requestRide);
router.get('/nearby-drivers', getNearbyDrivers);
router.post('/cancel-ride', cancelRide);
router.put('/rate-ride', rateRide);

// Driver Ride Management APIs
router.get('/driver/available-rides', getAvailableRides);
router.post('/driver/accept-ride', acceptRide);
router.post('/driver/decline-ride', declineRide);
router.post('/driver/start-ride', startRide);
router.post('/driver/complete-ride', completeRide);

export default router;
