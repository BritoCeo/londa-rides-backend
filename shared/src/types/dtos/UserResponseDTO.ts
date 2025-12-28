import { UserType } from '../enums/UserType';
import { IUser } from '../entities/IUser';

/**
 * Data Transfer Object for user response
 */
export interface UserResponseDTO {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string;
  userType: UserType;
  isVerified: boolean;
  ratings: number;
  totalRides: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Factory method to create response DTO from domain entity
 */
export class UserResponseDTOFactory {
  public static fromDomain(user: IUser): UserResponseDTO {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      phoneNumber: user.getPhoneNumber(),
      userType: user.getUserType(),
      isVerified: user.isVerified(),
      ratings: user.getRatings(),
      totalRides: user.getTotalRides(),
      createdAt: user.getCreatedAt().toISOString(),
      updatedAt: user.getUpdatedAt().toISOString()
    };
  }
}

