import { VehicleType } from '../enums/VehicleType';
import { DriverStatus } from '../enums/DriverStatus';

/**
 * Driver entity interface
 */
export interface IDriver {
  getId(): string;
  getName(): string;
  getEmail(): string;
  getPhoneNumber(): string;
  getVehicleType(): VehicleType;
  getRegistrationNumber(): string;
  getStatus(): DriverStatus;
  getRatings(): number;
  getTotalEarning(): number;
  getTotalRides(): number;
  getPendingRides(): number;
  getCancelRides(): number;
  getNotificationToken(): string | null;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
  updateStatus(status: DriverStatus): void;
  updateLocation(latitude: number, longitude: number): void;
}

