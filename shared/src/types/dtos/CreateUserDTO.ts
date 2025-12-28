import { UserType } from '../enums/UserType';

/**
 * Data Transfer Object for creating a user
 */
export interface CreateUserDTO {
  name?: string;
  email?: string;
  phoneNumber: string;
  userType?: UserType;
  password?: string;
}

/**
 * Factory method to create DTO from request body
 */
export class CreateUserDTOFactory {
  public static fromRequest(body: any): CreateUserDTO {
    return {
      name: body.name,
      email: body.email,
      phoneNumber: body.phone_number || body.phoneNumber,
      userType: body.userType || body.user_type || UserType.STUDENT,
      password: body.password
    };
  }
}

