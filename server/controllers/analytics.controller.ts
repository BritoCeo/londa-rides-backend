import { Request, Response } from 'express';
import { FirestoreService } from '../utils/firestore-service';

// Analytics APIs

// GET /api/v1/analytics/earnings - Driver earnings
export const getDriverEarnings = async (req: Request, res: Response) => {
  try {
    const { driver_id, period = 'week', start_date, end_date } = req.query;

    if (!driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: driver_id'
      });
    }

    const earnings = await FirestoreService.getDriverAnalytics(
      driver_id as string,
      period as string,
      start_date as string,
      end_date as string
    );

    res.status(200).json({
      success: true,
      message: 'Driver earnings retrieved successfully',
      data: earnings
    });
  } catch (error: any) {
    console.error('Get driver earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get driver earnings',
      error: error.message
    });
  }
};

// GET /api/v1/analytics/rides - Ride statistics
export const getRideStatistics = async (req: Request, res: Response) => {
  try {
    const { user_id, driver_id, period = 'week', start_date, end_date } = req.query;

    if (!user_id && !driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: user_id or driver_id'
      });
    }

    const statistics = await FirestoreService.getRideStatistics(
      user_id as string || driver_id as string,
      period as string,
      start_date as string,
      end_date as string
    );

    res.status(200).json({
      success: true,
      message: 'Ride statistics retrieved successfully',
      data: statistics
    });
  } catch (error: any) {
    console.error('Get ride statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get ride statistics',
      error: error.message
    });
  }
};

// GET /api/v1/analytics/performance - Performance metrics
export const getPerformanceMetrics = async (req: Request, res: Response) => {
  try {
    const { driver_id, period = 'week', start_date, end_date } = req.query;

    if (!driver_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: driver_id'
      });
    }

    const performance = await FirestoreService.getDriverPerformance(
      driver_id as string,
      period as string,
      start_date as string,
      end_date as string
    );

    res.status(200).json({
      success: true,
      message: 'Performance metrics retrieved successfully',
      data: performance
    });
  } catch (error: any) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get performance metrics',
      error: error.message
    });
  }
};
