import { Router } from 'express';
import {
  updateLocation,
  getRideStatus,
  trackRide
} from '../controllers/location.controller';

const router = Router();

// Real-time Location APIs
router.post('/update-location', updateLocation);
router.get('/ride-status/:rideId', getRideStatus);
router.post('/ride-tracking', trackRide);

export default router;
