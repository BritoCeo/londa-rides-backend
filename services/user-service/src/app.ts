import 'reflect-metadata';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Container } from '@londa-rides/shared';
import { TYPES } from '@londa-rides/shared';
import { ILogger } from '@londa-rides/shared';
import { createUserRoutes } from './routes/user.routes';
import { errorHandler } from './middleware/errorHandler';

/**
 * Express application setup
 */
export function createApp(): Application {
  const app = express();

  // Middleware
  app.use(cors());
  
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Handle JSON parsing errors (must be after body parser)
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    if (error instanceof SyntaxError && 'body' in error) {
      const logger = Container.resolve<ILogger>(TYPES.Logger);
      logger.warn('JSON parsing error', { error: error.message, path: req.path });
      if (!res.headersSent) {
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        });
      }
    }
    next(error);
  });

  // Routes - create routes with resolved controller
  const userRoutes = createUserRoutes();
  app.use('/api/v1/users', userRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'User service is healthy',
      timestamp: new Date().toISOString()
    });
  });

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
}

