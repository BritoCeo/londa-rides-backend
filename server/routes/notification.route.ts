import { Router } from 'express';
import {
  sendNotification,
  getNotifications,
  markNotificationAsRead
} from '../controllers/notification.controller';

const router = Router();

// Notification APIs
router.post('/notifications/send', sendNotification);
router.get('/notifications', getNotifications);
router.put('/notifications/read', markNotificationAsRead);

export default router;
