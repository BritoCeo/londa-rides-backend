import { ILogger } from '../utils/Logger';
import { DatabaseException } from '../exceptions/DatabaseException';

/**
 * Base repository class
 * Provides common repository functionality
 */
export abstract class BaseRepository<T> {
  protected readonly logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  /**
   * Handle database errors
   */
  protected handleError(operation: string, error: any): never {
    this.logger.error(`Database error during ${operation}`, { error });
    throw new DatabaseException(`Failed to ${operation}`, error);
  }

  /**
   * Abstract methods to be implemented by subclasses
   */
  abstract save(entity: T): Promise<void>;
  abstract findById(id: string): Promise<T | null>;
  abstract delete(id: string): Promise<void>;
}

