import { AppException } from './AppException';

/**
 * Not found exception
 */
export class NotFoundException extends AppException {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND', true);
  }
}

