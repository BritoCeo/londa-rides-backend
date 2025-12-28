import { IRide, RideStatus, ILocation } from '@londa-rides/shared';
import { IdGenerator, RIDE } from '@londa-rides/shared';

export class Ride implements IRide {
  private constructor(
    private readonly id: string,
    private userId: string,
    private driverId: string | null,
    private childId: string | null,
    private pickupLocation: ILocation,
    private dropoffLocation: ILocation,
    private currentLocationName: string | null,
    private destinationLocationName: string | null,
    private distance: string | null,
    private fare: number,
    private currency: string,
    private status: RideStatus,
    private rating: number | null,
    private review: string | null,
    private scheduledTime: Date | null,
    private passengerCount: number,
    private vehicleType: string,
    private _isChildRide: boolean,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  public static create(data: {
    userId: string;
    childId?: string;
    pickupLocation: ILocation;
    dropoffLocation: ILocation;
    fare?: number;
    scheduledTime?: Date;
    passengerCount?: number;
    vehicleType?: string;
  }): Ride {
    return new Ride(
      IdGenerator.generate(),
      data.userId,
      null,
      data.childId || null,
      data.pickupLocation,
      data.dropoffLocation,
      data.pickupLocation.name || null,
      data.dropoffLocation.name || null,
      null,
      data.fare || RIDE.DEFAULT_FARE,
      'NAD',
      RideStatus.PENDING,
      null,
      null,
      data.scheduledTime || null,
      data.passengerCount || RIDE.DEFAULT_PASSENGER_COUNT,
      data.vehicleType || RIDE.DEFAULT_VEHICLE_TYPE,
      !!data.childId,
      new Date(),
      new Date()
    );
  }

  public static fromPersistence(data: any): Ride {
    return new Ride(
      data.id,
      data.userId,
      data.driverId || null,
      data.childId || null,
      typeof data.pickupLocation === 'string' ? JSON.parse(data.pickupLocation) : data.pickupLocation,
      typeof data.dropoffLocation === 'string' ? JSON.parse(data.dropoffLocation) : data.dropoffLocation,
      data.currentLocationName || null,
      data.destinationLocationName || null,
      data.distance || null,
      data.fare || RIDE.DEFAULT_FARE,
      data.currency || 'NAD',
      data.status || RideStatus.PENDING,
      data.rating || null,
      data.review || null,
      data.scheduledTime?.toDate ? data.scheduledTime.toDate() : (data.scheduledTime ? new Date(data.scheduledTime) : null),
      data.passengerCount || RIDE.DEFAULT_PASSENGER_COUNT,
      data.vehicleType || RIDE.DEFAULT_VEHICLE_TYPE,
      data.isChildRide || false,
      data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
    );
  }

  // Getters
  public getId(): string { return this.id; }
  public getUserId(): string { return this.userId; }
  public getDriverId(): string | null { return this.driverId; }
  public getChildId(): string | null { return this.childId; }
  public getPickupLocation(): ILocation { return this.pickupLocation; }
  public getDropoffLocation(): ILocation { return this.dropoffLocation; }
  public getCurrentLocationName(): string | null { return this.currentLocationName; }
  public getDestinationLocationName(): string | null { return this.destinationLocationName; }
  public getDistance(): string | null { return this.distance; }
  public getFare(): number { return this.fare; }
  public getCurrency(): string { return this.currency; }
  public getStatus(): RideStatus { return this.status; }
  public getRating(): number | null { return this.rating; }
  public getReview(): string | null { return this.review; }
  public getScheduledTime(): Date | null { return this.scheduledTime; }
  public getPassengerCount(): number { return this.passengerCount; }
  public getVehicleType(): string { return this.vehicleType; }
  public isChildRide(): boolean { return this._isChildRide; }
  public getCreatedAt(): Date { return this.createdAt; }
  public getUpdatedAt(): Date { return this.updatedAt; }

  // Business logic
  public accept(driverId: string): void {
    if (this.status !== RideStatus.PENDING) {
      throw new Error('Ride cannot be accepted in current status');
    }
    this.driverId = driverId;
    this.status = RideStatus.ACCEPTED;
    this.updatedAt = new Date();
  }

  public start(): void {
    if (this.status !== RideStatus.ACCEPTED) {
      throw new Error('Ride must be accepted before starting');
    }
    this.status = RideStatus.STARTED;
    this.updatedAt = new Date();
  }

  public complete(): void {
    if (this.status !== RideStatus.STARTED) {
      throw new Error('Ride must be started before completing');
    }
    this.status = RideStatus.COMPLETED;
    this.updatedAt = new Date();
  }

  public cancel(reason?: string): void {
    if (this.status === RideStatus.COMPLETED || this.status === RideStatus.CANCELLED) {
      throw new Error('Ride cannot be cancelled in current status');
    }
    this.status = RideStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public rate(rating: number, review?: string): void {
    if (this.status !== RideStatus.COMPLETED) {
      throw new Error('Can only rate completed rides');
    }
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    this.rating = rating;
    this.review = review || null;
    this.updatedAt = new Date();
  }
}

