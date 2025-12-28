import { Request, Response, NextFunction } from 'express';
import { AppException } from '@londa-rides/shared';
import { ILogger } from '@londa-rides/shared';
import { Container, TYPES } from '@londa-rides/shared';

/**
 * Error handling middleware
 */
export const errorHandler = (
  error: Error | AppException,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Check if response was already sent or connection was closed
  if (res.headersSent || req.aborted) {
    const logger = Container.resolve<ILogger>(TYPES.Logger);
    logger.warn('Cannot send error response - headers already sent or request aborted', {
      error: error.message,
      path: req.path
    });
    return;
  }

  const logger = Container.resolve<ILogger>(TYPES.Logger);
  
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;

  // Handle specific error types
  if (error.name === 'BadRequestError' && error.message.includes('request aborted')) {
    // Client disconnected - don't send response
    logger.warn('Request aborted by client', { path: req.path });
    return;
  }

  if (error instanceof AppException) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code;
    details = error.details;
  } else {
    logger.error('Unhandled error', { 
      error: error.message, 
      stack: error.stack,
      name: error.name,
      path: req.path,
      method: req.method
    });
  }

  try {
    res.status(statusCode).json({
      success: false,
      message,
      code,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (sendError: any) {
    // If we can't send the response, just log it
    logger.error('Failed to send error response', {
      originalError: error.message,
      sendError: sendError.message
    });
  }
};

