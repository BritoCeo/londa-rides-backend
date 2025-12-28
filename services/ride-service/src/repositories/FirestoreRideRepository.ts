import { injectable } from 'tsyringe';
import { Firestore } from 'firebase-admin/firestore';
import { BaseRepository } from '@londa-rides/shared';
import { ILogger } from '@londa-rides/shared';
import { Ride } from '../models/Ride';
import { IRideRepository } from './IRideRepository';

@injectable()
export class FirestoreRideRepository extends BaseRepository<Ride> implements IRideRepository {
  private readonly collectionName = 'rides';

  constructor(
    private readonly firestore: Firestore,
    logger: ILogger
  ) {
    super(logger);
  }

  public async save(ride: Ride): Promise<void> {
    try {
      const rideData = {
        id: ride.getId(),
        userId: ride.getUserId(),
        driverId: ride.getDriverId(),
        childId: ride.getChildId(),
        pickupLocation: JSON.stringify(ride.getPickupLocation()),
        dropoffLocation: JSON.stringify(ride.getDropoffLocation()),
        fare: ride.getFare(),
        status: ride.getStatus(),
        createdAt: ride.getCreatedAt(),
        updatedAt: ride.getUpdatedAt()
      };
      await this.firestore.collection(this.collectionName).doc(ride.getId()).set(rideData, { merge: true });
    } catch (error) {
      this.handleError('save ride', error);
    }
  }

  public async findById(id: string): Promise<Ride | null> {
    try {
      const doc = await this.firestore.collection(this.collectionName).doc(id).get();
      if (!doc.exists) return null;
      return Ride.fromPersistence({ id: doc.id, ...doc.data() });
    } catch (error) {
      this.handleError('find ride by ID', error);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.firestore.collection(this.collectionName).doc(id).delete();
    } catch (error) {
      this.handleError('delete ride', error);
    }
  }
}

