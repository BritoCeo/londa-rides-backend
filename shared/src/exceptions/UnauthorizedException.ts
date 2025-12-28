import { AppException } from './AppException';

/**
 * Unauthorized exception
 */
export class UnauthorizedException extends AppException {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED', true);
  }
}

