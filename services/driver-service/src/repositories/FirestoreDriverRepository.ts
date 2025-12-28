import { injectable } from 'tsyringe';
import { Firestore } from 'firebase-admin/firestore';
import { BaseRepository } from '@londa-rides/shared';
import { ILogger } from '@londa-rides/shared';
import { Driver } from '../models/Driver';
import { IDriverRepository } from './IDriverRepository';

@injectable()
export class FirestoreDriverRepository extends BaseRepository<Driver> implements IDriverRepository {
  private readonly collectionName = 'drivers';

  constructor(
    private readonly firestore: Firestore,
    logger: ILogger
  ) {
    super(logger);
  }

  public async save(driver: Driver): Promise<void> {
    try {
      const driverData = this.toFirestoreData(driver);
      await this.firestore.collection(this.collectionName).doc(driver.getId()).set(driverData, { merge: true });
      this.logger.info('Driver saved', { driverId: driver.getId() });
    } catch (error) {
      this.handleError('save driver', error);
    }
  }

  public async findById(id: string): Promise<Driver | null> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      if (!doc.exists) return null;
      return Driver.fromPersistence({ id: doc.id, ...doc.data() });
    } catch (error) {
      this.handleError('find driver by ID', error);
    }
  }

  public async findByPhoneNumber(phoneNumber: string): Promise<Driver | null> {
    try {
      const snapshot = await this.firestore.collection(this.collectionName)
        .where('phoneNumber', '==', phoneNumber).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return Driver.fromPersistence({ id: doc.id, ...doc.data() });
    } catch (error) {
      this.handleError('find driver by phone', error);
    }
  }

  public async findByEmail(email: string): Promise<Driver | null> {
    try {
      const snapshot = await this.firestore.collection(this.collectionName)
        .where('email', '==', email).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return Driver.fromPersistence({ id: doc.id, ...doc.data() });
    } catch (error) {
      this.handleError('find driver by email', error);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.firestore.collection(this.collectionName).doc(id).delete();
      this.logger.info('Driver deleted', { driverId: id });
    } catch (error) {
      this.handleError('delete driver', error);
    }
  }

  private toFirestoreData(driver: Driver): any {
    return {
      id: driver.getId(),
      name: driver.getName(),
      phoneNumber: driver.getPhoneNumber(),
      email: driver.getEmail(),
      vehicleType: driver.getVehicleType(),
      registrationNumber: driver.getRegistrationNumber(),
      status: driver.getStatus(),
      ratings: driver.getRatings(),
      totalEarning: driver.getTotalEarning(),
      totalRides: driver.getTotalRides(),
      notificationToken: driver.getNotificationToken(),
      createdAt: driver.getCreatedAt(),
      updatedAt: driver.getUpdatedAt()
    };
  }
}

