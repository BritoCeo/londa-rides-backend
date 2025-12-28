import { Router } from 'express';
import {
  getDriverEarnings,
  getRideStatistics,
  getPerformanceMetrics
} from '../controllers/analytics.controller';

const router = Router();

// Analytics APIs
router.get('/analytics/earnings', getDriverEarnings);
router.get('/analytics/rides', getRideStatistics);
router.get('/analytics/performance', getPerformanceMetrics);

export default router;
