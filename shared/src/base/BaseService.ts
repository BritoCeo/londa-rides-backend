import { ILogger } from '../utils/Logger';
import { AppException } from '../exceptions/AppException';

/**
 * Base service class
 * Provides common service functionality
 */
export abstract class BaseService {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Handle service errors
   */
  protected handleError(operation: string, error: any): never {
    if (error instanceof AppException) {
      throw error;
    }

    this.logger.error(`Service error during ${operation}`, { error });
    
    // Create a concrete exception instance
    class ServiceException extends AppException {
      constructor(message: string, details?: any) {
        super(message, 500, 'SERVICE_ERROR', false, details);
      }
    }
    
    throw new ServiceException(`Failed to ${operation}`, error);
  }

  /**
   * Log operation start
   */
  protected logOperation(operation: string, meta?: any): void {
    this.logger.info(`Starting ${operation}`, meta);
  }

  /**
   * Log operation success
   */
  protected logSuccess(operation: string, meta?: any): void {
    this.logger.info(`Completed ${operation}`, meta);
  }
}

