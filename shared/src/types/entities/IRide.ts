import { RideStatus } from '../enums/RideStatus';
import { PaymentMethod } from '../enums/PaymentMethod';

/**
 * Ride entity interface
 */
export interface IRide {
  getId(): string;
  getUserId(): string;
  getDriverId(): string | null;
  getChildId(): string | null;
  getPickupLocation(): ILocation;
  getDropoffLocation(): ILocation;
  getCurrentLocationName(): string | null;
  getDestinationLocationName(): string | null;
  getDistance(): string | null;
  getFare(): number;
  getCurrency(): string;
  getStatus(): RideStatus;
  getRating(): number | null;
  getReview(): string | null;
  getScheduledTime(): Date | null;
  getPassengerCount(): number;
  getVehicleType(): string;
  isChildRide(): boolean;
  getCreatedAt(): Date;
  getUpdatedAt(): Date;
  accept(driverId: string): void;
  start(): void;
  complete(): void;
  cancel(reason?: string): void;
  rate(rating: number, review?: string): void;
}

/**
 * Location interface
 */
export interface ILocation {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

