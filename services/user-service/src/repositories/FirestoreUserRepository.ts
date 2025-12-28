import { injectable, inject } from 'tsyringe';
import { Firestore } from 'firebase-admin/firestore';
import { BaseRepository, ILogger, TYPES } from '@londa-rides/shared';
import { User } from '../models/User';
import { IUserRepository } from './IUserRepository';

/**
 * Firestore implementation of UserRepository
 */
@injectable()
export class FirestoreUserRepository extends BaseRepository<User> implements IUserRepository {
  private readonly collectionName = 'users';

  constructor(
    @inject(TYPES.Firestore) private readonly firestore: Firestore,
    @inject(TYPES.Logger) logger: ILogger
  ) {
    super(logger);
  }

  public async save(user: User): Promise<void> {
    try {
      const userData = this.toFirestoreData(user);
      await this.firestore
        .collection(this.collectionName)
        .doc(user.getId())
        .set(userData, { merge: true });
      
      this.logger.info('User saved to Firestore', { userId: user.getId() });
    } catch (error) {
      this.handleError('save user', error);
    }
  }

  public async findById(id: string): Promise<User | null> {
    try {
      const doc = await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .get();

      if (!doc.exists) {
        return null;
      }

      return User.fromPersistence({ id: doc.id, ...doc.data() });
    } catch (error) {
      this.handleError('find user by ID', error);
    }
  }

  public async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('phoneNumber', '==', phoneNumber)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return User.fromPersistence({ id: doc.id, ...doc.data() });
    } catch (error) {
      this.handleError('find user by phone number', error);
    }
  }

  public async findByEmail(email: string): Promise<User | null> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .where('email', '==', email)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return User.fromPersistence({ id: doc.id, ...doc.data() });
    } catch (error) {
      this.handleError('find user by email', error);
    }
  }

  public async delete(id: string): Promise<void> {
    try {
      await this.firestore
        .collection(this.collectionName)
        .doc(id)
        .delete();

      this.logger.info('User deleted from Firestore', { userId: id });
    } catch (error) {
      this.handleError('delete user', error);
    }
  }

  public async findAll(limit: number = 10, offset: number = 0): Promise<User[]> {
    try {
      const snapshot = await this.firestore
        .collection(this.collectionName)
        .limit(limit)
        .offset(offset)
        .get();

      return snapshot.docs.map(doc => 
        User.fromPersistence({ id: doc.id, ...doc.data() })
      );
    } catch (error) {
      this.handleError('find all users', error);
    }
  }

  private toFirestoreData(user: User): any {
    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      phoneNumber: user.getPhoneNumber(),
      userType: user.getUserType(),
      isVerified: user.isVerified(),
      ratings: user.getRatings(),
      totalRides: user.getTotalRides(),
      notificationToken: user.getNotificationToken(),
      createdAt: user.getCreatedAt(),
      updatedAt: user.getUpdatedAt()
    };
  }
}

