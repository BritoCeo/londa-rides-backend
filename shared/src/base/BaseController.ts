import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../utils/Logger';
import { AppException } from '../exceptions/AppException';

/**
 * Base controller class
 * Provides common controller functionality
 */
export abstract class BaseController {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Standard success response
   */
  protected sendSuccess(
    res: Response,
    data: any,
    message: string = 'Success',
    statusCode: number = 200
  ): void {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Standard error response
   */
  protected sendError(
    res: Response,
    error: AppException | Error,
    statusCode?: number
  ): void {
    if (error instanceof AppException) {
      res.status(statusCode || error.statusCode).json({
        success: false,
        message: error.message,
        code: error.code,
        details: error.details,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(statusCode || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Async handler wrapper
   */
  protected asyncHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }
}

