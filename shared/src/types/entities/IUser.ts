import { UserType } from '../enums/UserType';

/**
 * User entity interface
 */
export interface IUser {
  getId(): string;
  getName(): string | null;
  getEmail(): string | null;
  getPhoneNumber(): string;
  getUserType(): UserType;
  isVerified(): boolean;
  getRatings(): number;
  getTotalRides(): number;
  getNotificationToken(): string | null;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
  updateVerificationStatus(verified: boolean): void;
  updateProfile(data: Partial<IUserProfile>): void;
}

/**
 * User profile data
 */
export interface IUserProfile {
  name?: string;
  email?: string;
  notificationToken?: string;
}

