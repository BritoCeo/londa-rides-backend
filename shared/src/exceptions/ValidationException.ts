import { AppException } from './AppException';

/**
 * Validation exception
 */
export class ValidationException extends AppException {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
  }
}

