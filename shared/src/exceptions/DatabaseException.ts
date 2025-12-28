import { AppException } from './AppException';

/**
 * Database exception
 */
export class DatabaseException extends AppException {
  constructor(message: string, originalError?: any) {
    super(message, 500, 'DATABASE_ERROR', false, { originalError });
  }
}

