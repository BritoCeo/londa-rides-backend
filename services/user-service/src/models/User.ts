import { IUser, IUserProfile, UserType } from '@londa-rides/shared';
import { IdGenerator } from '@londa-rides/shared';

/**
 * User domain model (OOP class)
 */
export class User implements IUser {
  private constructor(
    private readonly id: string,
    private name: string | null,
    private email: string | null,
    private phoneNumber: string,
    private userType: UserType,
    private _isVerified: boolean,
    private ratings: number,
    private totalRides: number,
    private notificationToken: string | null,
    private readonly createdAt: Date,
    private updatedAt: Date
  ) {}

  /**
   * Factory method to create a new user
   */
  public static create(data: {
    name?: string;
    email?: string;
    phoneNumber: string;
    userType?: UserType;
    notificationToken?: string;
  }): User {
    return new User(
      IdGenerator.generate(),
      data.name || null,
      data.email || null,
      data.phoneNumber,
      data.userType || UserType.STUDENT,
      false,
      0,
      0,
      data.notificationToken || null,
      new Date(),
      new Date()
    );
  }

  /**
   * Factory method to restore from persistence
   */
  public static fromPersistence(data: any): User {
    return new User(
      data.id,
      data.name || null,
      data.email || null,
      data.phoneNumber,
      data.userType || UserType.STUDENT,
      data.isVerified || false,
      data.ratings || 0,
      data.totalRides || 0,
      data.notificationToken || null,
      data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
      data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
    );
  }

  // Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string | null {
    return this.name;
  }

  public getEmail(): string | null {
    return this.email;
  }

  public getPhoneNumber(): string {
    return this.phoneNumber;
  }

  public getUserType(): UserType {
    return this.userType;
  }

  public isVerified(): boolean {
    return this._isVerified;
  }

  public getRatings(): number {
    return this.ratings;
  }

  public getTotalRides(): number {
    return this.totalRides;
  }

  public getNotificationToken(): string | null {
    return this.notificationToken;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  // Business logic methods
  public updateVerificationStatus(verified: boolean): void {
    this._isVerified = verified;
    this.updatedAt = new Date();
  }

  public updateProfile(data: IUserProfile): void {
    if (data.name !== undefined) {
      this.name = data.name;
    }
    if (data.email !== undefined) {
      this.email = data.email;
    }
    if (data.notificationToken !== undefined) {
      this.notificationToken = data.notificationToken;
    }
    this.updatedAt = new Date();
  }

  public incrementTotalRides(): void {
    this.totalRides++;
    this.updatedAt = new Date();
  }

  public updateRating(newRating: number): void {
    // Calculate average rating
    const totalRatings = this.totalRides;
    if (totalRatings > 0) {
      this.ratings = ((this.ratings * (totalRatings - 1)) + newRating) / totalRatings;
    } else {
      this.ratings = newRating;
    }
    this.updatedAt = new Date();
  }
}

