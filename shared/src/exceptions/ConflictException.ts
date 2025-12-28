import { AppException } from './AppException';

/**
 * Conflict exception (e.g., duplicate resource)
 */
export class ConflictException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', true, details);
  }
}

