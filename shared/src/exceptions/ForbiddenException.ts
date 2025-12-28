import { AppException } from './AppException';

/**
 * Forbidden exception
 */
export class ForbiddenException extends AppException {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN', true);
  }
}

