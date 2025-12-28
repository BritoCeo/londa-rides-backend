import { ConflictException } from './ConflictException';

/**
 * Driver already exists exception
 */
export class DriverAlreadyExistsException extends ConflictException {
  constructor(identifier: string, field: string = 'phoneNumber') {
    super(`Driver with ${field} ${identifier} already exists`, { field, identifier });
  }
}

