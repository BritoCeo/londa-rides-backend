import { IDriver, VehicleType, DriverStatus } from '@londa-rides/shared';
import { IdGenerator } from '@londa-rides/shared';

/**
 * Driver domain model (OOP class)
 */
export class Driver implements IDriver {
  private constructor(
    private readonly id: string,
    private name: string,
    private country: string,
    private phoneNumber: string,
    private email: string,
    private vehicleType: VehicleType,
    private registrationNumber: string,
    private registrationDate: string,
    private drivingLicense: string,
    private vehicleColor: string | null,
    private rate: string,
    private status: DriverStatus,
    private ratings: number,
    private totalEarning: number,
    private totalRides: number,
    private pendingRides: number,
    private cancelRides: number,
    private notificationToken: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(data: {
    name: string;
    country: string;
    phoneNumber: string;
    email: string;
    vehicleType: VehicleType;
    registrationNumber: string;
    registrationDate: string;
    drivingLicense: string;
    vehicleColor?: string;
    rate: string;
  }): Driver {
    return new Driver(
      IdGenerator.generate(),
      data.name,
      data.country,
      data.phoneNumber,
      data.email,
      data.vehicleType,
      data.registrationNumber,
      data.registrationDate,
      data.drivingLicense,
      data.vehicleColor || null,
      data.rate,
      DriverStatus.INACTIVE,
      0,
      0,
      0,
      0,
      0,
      null,
      new Date(),
      new Date()
    );
  }

  public static fromPersistence(data: any): Driver {
    return new Driver(
      data.id,
      data.name,
      data.country,
      data.phoneNumber,
      data.email,
      data.vehicleType,
      data.registrationNumber,
      data.registrationDate,
      data.drivingLicense,
      data.vehicleColor || null,
      data.rate,
      data.status || DriverStatus.INACTIVE,
      data.ratings || 0,
      data.totalEarning || 0,
      data.totalRides || 0,
      data.pendingRides || 0,
      data.cancelRides || 0,
      data.notificationToken || null,
      data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
    );
  }

  // Getters
  public getId(): string { return this.id; }
  public getName(): string { return this.name; }
  public getEmail(): string { return this.email; }
  public getPhoneNumber(): string { return this.phoneNumber; }
  public getVehicleType(): VehicleType { return this.vehicleType; }
  public getRegistrationNumber(): string { return this.registrationNumber; }
  public getStatus(): DriverStatus { return this.status; }
  public getRatings(): number { return this.ratings; }
  public getTotalEarning(): number { return this.totalEarning; }
  public getTotalRides(): number { return this.totalRides; }
  public getPendingRides(): number { return this.pendingRides; }
  public getCancelRides(): number { return this.cancelRides; }
  public getNotificationToken(): string | null { return this.notificationToken; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getUpdatedAt(): Date { return this.updatedAt; }

  // Business logic
  public updateStatus(status: DriverStatus): void {
    this.status = status;
    this.updatedAt = new Date();
  }

  public updateLocation(latitude: number, longitude: number): void {
    // Location is stored separately, this is a placeholder
    this.updatedAt = new Date();
  }
}

