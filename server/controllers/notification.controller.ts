import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';

// Notification APIs

// POST /api/v1/notifications/send - Send push notification
export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { recipient_id, recipient_type, title, message, data, type } = req.body;

    if (!recipient_id || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: recipient_id, title, message'
      });
    }

    const notificationData = {
      senderId: 'system',
      recipientId: recipient_id,
      title,
      message,
      data: data || {},
      type: type || 'general',
      status: 'sent',
      sent_at: new Date()
    };

    const notification = await FirestoreService.createNotification(notificationData);

    // Send push notification (mock implementation)
    const pushResult = await sendPushNotification(recipient_id, title, message, data);

    res.status(200).json({
      success: true,
      message: 'Notification sent successfully',
      data: {
        notification,
        push_result: pushResult
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification',
      error: error.message
    });
  }
};

// GET /api/v1/notifications - Get notification history
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const { recipient_id, page = 1, limit = 20, unread_only = false } = req.query;

    if (!recipient_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: recipient_id'
      });
    }

    const notifications = await FirestoreService.getNotificationsByRecipientId(
      recipient_id as string,
      parseInt(page as string),
      parseInt(limit as string),
      unread_only === 'true'
    );

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: {
        notifications,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: notifications.length
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

// PUT /api/v1/notifications/read - Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notification_id, recipient_id } = req.body;

    if (!notification_id || !recipient_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: notification_id, recipient_id'
      });
    }

    // Get notification to verify ownership
    const notification = await FirestoreService.getNotificationById(notification_id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.recipientId !== recipient_id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to mark this notification as read'
      });
    }

    const updatedNotification = await FirestoreService.updateNotification(notification_id, {
      isRead: true,
      read_at: new Date(),
      updated_at: new Date()
    });

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: updatedNotification
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Helper function to send push notification
async function sendPushNotification(recipientId: string, title: string, message: string, data: any) {
  // Mock push notification - in real implementation, integrate with FCM or similar
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📱 Push notification sent to ${recipientId}: ${title} - ${message}`);
      resolve({
        success: true,
        message_id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });
    }, 500);
  });
}
