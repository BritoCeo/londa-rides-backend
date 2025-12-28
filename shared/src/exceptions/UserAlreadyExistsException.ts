import { ConflictException } from './ConflictException';

/**
 * User already exists exception
 */
export class UserAlreadyExistsException extends ConflictException {
  constructor(identifier: string, field: string = 'phoneNumber') {
    super(`User with ${field} ${identifier} already exists`, { field, identifier });
  }
}

