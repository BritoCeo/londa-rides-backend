import { db } from '../config/firestore';

// Type definitions
export interface FirestoreUser {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  userType: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreDriver {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  license_number: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_year: number;
  vehicle_color: string;
  vehicle_plate: string;
  status: 'online' | 'offline' | 'busy';
  isActive: boolean;
  rating: number;
  totalRides: number;
  cancelRides: number;
  subscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreRide {
  id: string;
  userId: string;
  driverId?: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentLocationName: string;
  destinationLocationName: string;
  distance: string;
  scheduledTime?: Date;
  passengerCount: number;
  vehicleType: string;
  status: 'pending' | 'accepted' | 'started' | 'completed' | 'cancelled' | 'declined';
  fare: number;
  currency: string;
  isChildRide: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestorePayment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transaction_id: string;
  payment_type: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreDriverLocation {
  id: string;
  driverId: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  status: 'online' | 'busy' | 'offline';
  accuracy?: number;
  heading?: number;
  speed?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreScheduledRide {
  id: string;
  user_id: string;
  pickup_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoff_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduled_date: string;
  scheduled_time: string;
  scheduled_datetime: Date;
  ride_type: 'standard' | 'premium' | 'group';
  passenger_count: number;
  notes?: string;
  recurring_pattern?: 'daily' | 'weekly' | 'weekdays';
  recurring_end_date?: string;
  parent_ride_id?: string;
  estimated_fare: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  driver_id?: string;
  confirmed_at?: Date;
  cancelled_at?: Date;
  cancel_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FirestoreCarpool {
  id: string;
  user_id: string;
  creator_id: string;
  pickup_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoff_location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduled_datetime: Date;
  max_passengers: number;
  current_passengers: number;
  fare_per_person: number;
  total_fare: number;
  notes?: string;
  vehicle_preferences: string[];
  status: 'open' | 'full' | 'completed' | 'cancelled';
  passengers: Array<{
    user_id: string;
    joined_at: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
  }>;
  cancelled_at?: Date;
  cancel_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FirestoreParentSubscription {
  id: string;
  user_id: string;
  subscription_type: 'parent_monthly';
  amount: number;
  currency: string;
  payment_method: string;
  payment_token?: string;
  status: 'active' | 'cancelled' | 'expired';
  start_date: Date;
  end_date: Date;
  auto_renew: boolean;
  rides_limit: 'unlimited';
  rides_used: number;
  children_profiles: string[];
  cancelled_at?: Date;
  cancel_reason?: string;
  created_at: Date;
  updated_at: Date;
}

export interface FirestoreChildProfile {
  id: string;
  user_id: string;
  child_name: string;
  child_age: number;
  school_name: string;
  pickup_address: string;
  dropoff_address: string;
  emergency_contact: {
    name: string;
    phone: string;
    relationship?: string;
  };
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class FirestoreService {
  private static getCollection(collectionName: string) {
    if (!db) {
      console.log(`🔄 Mock database: Simulating ${collectionName} collection`);
      return {
        add: async (data: any) => {
          console.log(`📝 Mock: Adding to ${collectionName}:`, data);
          return { id: `mock_${Date.now()}` };
        },
        doc: (id: string) => ({
          get: async () => ({ exists: false, data: () => null, id }),
          update: async (data: any) => {
            console.log(`📝 Mock: Updating ${collectionName}/${id}:`, data);
            return { id };
          },
          set: async (data: any) => {
            console.log(`📝 Mock: Setting ${collectionName}/${id}:`, data);
            return { id };
          }
        }),
        where: (field: string, operator: string, value: any) => ({
          limit: (n: number) => ({
            get: async () => ({ docs: [], empty: true, size: 0 })
          }),
          get: async () => ({ docs: [], empty: true, size: 0 })
        })
      };
    }
    return db.collection(collectionName);
  }

  // User operations
  static async createUser(userData: Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreUser> {
    try {
      const collection = this.getCollection('users');
      const user = {
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await collection.add(user);
      return { ...user, id: docRef.id };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async getUserById(id: string): Promise<FirestoreUser | null> {
    try {
      const collection = this.getCollection('users');
      const doc = await collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as FirestoreUser;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<FirestoreUser | null> {
    try {
      const collection = this.getCollection('users');
      const snapshot = await collection.where('email', '==', email).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestoreUser;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async getUserByPhone(phone: string): Promise<FirestoreUser | null> {
    try {
      const collection = this.getCollection('users');
      const snapshot = await collection.where('phone_number', '==', phone).limit(1).get();
      
      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestoreUser;
    } catch (error) {
      console.error('Error getting user by phone:', error);
      return null;
    }
  }

  static async updateUser(id: string, updateData: Partial<FirestoreUser>): Promise<FirestoreUser | null> {
    try {
      const collection = this.getCollection('users');
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await collection.doc(id).update(updatePayload);
      return await this.getUserById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  // Driver operations
  static async createDriver(driverData: Omit<FirestoreDriver, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreDriver> {
    try {
      const collection = this.getCollection('drivers');
      const driver = {
        ...driverData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await collection.add(driver);
      return { ...driver, id: docRef.id };
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }

  static async getDriverById(id: string): Promise<FirestoreDriver | null> {
    try {
      const collection = this.getCollection('drivers');
      const doc = await collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as FirestoreDriver;
    } catch (error) {
      console.error('Error getting driver by ID:', error);
      return null;
    }
  }

  static async getDriverByPhone(phone_number: string): Promise<FirestoreDriver | null> {
    try {
      const collection = this.getCollection('drivers');
      const snapshot = await collection.where('phone_number', '==', phone_number).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestoreDriver;
    } catch (error) {
      console.error('Error getting driver by phone:', error);
      return null;
    }
  }

  static async getDriverByEmail(email: string): Promise<FirestoreDriver | null> {
    try {
      const collection = this.getCollection('drivers');
      const snapshot = await collection.where('email', '==', email).get();
      
      if (snapshot.empty) {
        return null;
      }
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestoreDriver;
    } catch (error) {
      console.error('Error getting driver by email:', error);
      return null;
    }
  }

  static async getActiveDrivers(latitude?: number, longitude?: number, radius?: number): Promise<FirestoreDriver[]> {
    try {
      const collection = this.getCollection('drivers');
      const snapshot = await collection.where('isActive', '==', true).get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreDriver));
    } catch (error) {
      console.error('Error getting active drivers:', error);
      return [];
    }
  }

  static async updateDriver(id: string, updateData: Partial<FirestoreDriver>): Promise<FirestoreDriver | null> {
    try {
      const collection = this.getCollection('drivers');
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await collection.doc(id).update(updatePayload);
      return await this.getDriverById(id);
    } catch (error) {
      console.error('Error updating driver:', error);
      return null;
    }
  }

  // Ride operations
  static async createRide(rideData: Omit<FirestoreRide, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreRide> {
    try {
      const collection = this.getCollection('rides');
      const ride: FirestoreRide = {
        ...rideData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await collection.add(ride);
      return { ...ride, id: docRef.id };
    } catch (error) {
      console.error('Error creating ride:', error);
      throw error;
    }
  }

  static async getRideById(id: string): Promise<FirestoreRide | null> {
    try {
      const collection = this.getCollection('rides');
      const doc = await collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }
      
      return { id: doc.id, ...doc.data() } as FirestoreRide;
    } catch (error) {
      console.error('Error getting ride by ID:', error);
      return null;
    }
  }

  static async getRidesByUserId(userId: string): Promise<FirestoreRide[]> {
    try {
      const collection = this.getCollection('rides');
      const snapshot = await collection.where('userId', '==', userId).get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreRide));
    } catch (error) {
      console.error('Error getting rides by user ID:', error);
      return [];
    }
  }

  static async updateRide(id: string, updateData: Partial<FirestoreRide>): Promise<FirestoreRide | null> {
    try {
      const collection = this.getCollection('rides');
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };

      await collection.doc(id).update(updatePayload);
      return await this.getRideById(id);
    } catch (error) {
      console.error('Error updating ride:', error);
      return null;
    }
  }

  // Payment operations
  static async createPayment(paymentData: Omit<FirestorePayment, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestorePayment> {
    try {
      const collection = this.getCollection('payments');
      const payment = {
        ...paymentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await collection.add(payment);
      return { ...payment, id: docRef.id };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  static async getPaymentsByUserId(userId: string): Promise<FirestorePayment[]> {
    try {
      const collection = this.getCollection('payments');
      const snapshot = await collection.where('userId', '==', userId).get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestorePayment));
    } catch (error) {
      console.error('Error getting payments by user ID:', error);
      return [];
    }
  }

  // Notification operations
  static async createNotification(notificationData: Omit<FirestoreNotification, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreNotification> {
    try {
      const collection = this.getCollection('notifications');
      const notification = {
        ...notificationData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await collection.add(notification);
      return { ...notification, id: docRef.id };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  static async getNotificationsByRecipientId(recipientId: string): Promise<FirestoreNotification[]> {
    try {
      const collection = this.getCollection('notifications');
      const snapshot = await collection.where('recipientId', '==', recipientId).get();
      
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreNotification));
    } catch (error) {
      console.error('Error getting notifications by recipient ID:', error);
      return [];
    }
  }

  static async getUserAnalytics(userId: string): Promise<any> {
    try {
      const user = await this.getUserById(userId);
      const rides = await this.getRidesByUserId(userId);
      
      return {
        totalRides: rides.length,
        completedRides: rides.filter(ride => ride.status === 'completed').length,
        averageRating: user?.ratings || 0,
        totalDistance: rides.reduce((sum, ride) => sum + (parseFloat(ride.distance) || 0), 0)
      };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return {};
    }
  }

  // Driver Subscription operations
  static async createDriverSubscription(subscriptionData: any): Promise<any> {
    try {
      const collection = this.getCollection('driverSubscriptions');
      const subscription = {
        ...subscriptionData,
        created_at: new Date(),
        updated_at: new Date()
      };

      const docRef = await collection.add(subscription);
      return { ...subscription, id: docRef.id };
    } catch (error) {
      console.error('Error creating driver subscription:', error);
      throw error;
    }
  }

  static async getDriverSubscription(driverId: string): Promise<any> {
    try {
      const collection = this.getCollection('driverSubscriptions');
      const snapshot = await collection
        .where('driver_id', '==', driverId)
        .get();
      
      if (snapshot.empty) {
        return null;
      }

      // Find the most recent subscription by sorting in memory
      const subscriptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const mostRecent = subscriptions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      return mostRecent;
    } catch (error) {
      console.error('Error getting driver subscription:', error);
      return null;
    }
  }

  static async updateDriverSubscription(subscriptionId: string, updateData: any): Promise<any> {
    try {
      const collection = this.getCollection('driverSubscriptions');
      const updatePayload = {
        ...updateData,
        updated_at: new Date()
      };

      await collection.doc(subscriptionId).update(updatePayload);
      return await this.getDriverSubscriptionById(subscriptionId);
    } catch (error) {
      console.error('Error updating driver subscription:', error);
      return null;
    }
  }

  static async getDriverSubscriptionById(subscriptionId: string): Promise<any> {
    try {
      const collection = this.getCollection('driverSubscriptions');
      const doc = await collection.doc(subscriptionId).get();
      
      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting driver subscription by ID:', error);
      return null;
    }
  }

  static async getDriverSubscriptionHistory(
    driverId: string, 
    pagination: { page: number; limit: number },
    filters: { start_date?: Date; end_date?: Date }
  ): Promise<any> {
    try {
      const collection = this.getCollection('driverSubscriptions');
      let query = collection.where('driver_id', '==', driverId);
      
      if (filters.start_date) {
        query = query.where('created_at', '>=', filters.start_date);
      }
      
      if (filters.end_date) {
        query = query.where('created_at', '<=', filters.end_date);
      }
      
      // Get all matching documents first to avoid composite index requirement
      const snapshot = await query.get();
      
      // Sort in memory to avoid composite index requirement
      let subscriptions = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      subscriptions = subscriptions.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      const paginatedSubscriptions = subscriptions.slice(offset, offset + pagination.limit);
      
      // Calculate total amount
      const totalAmount = subscriptions.reduce((sum: number, sub: any) => sum + (sub.amount || 0), 0);
      
      return {
        subscriptions: paginatedSubscriptions,
        total: subscriptions.length,
        total_amount: totalAmount
      };
    } catch (error) {
      console.error('Error getting driver subscription history:', error);
      return {
        subscriptions: [],
        total: 0,
        total_amount: 0
      };
    }
  }

  // Driver Location operations
  static async updateDriverLocation(
    driverId: string, 
    latitude: number, 
    longitude: number, 
    status: 'online' | 'busy' | 'offline' = 'online',
    accuracy?: number,
    heading?: number,
    speed?: number
  ): Promise<FirestoreDriverLocation> {
    try {
      const collection = this.getCollection('driver_locations');
      
      // Check if location already exists for this driver
      const existingSnapshot = await collection
        .where('driverId', '==', driverId)
        .limit(1)
        .get();

      const locationData = {
        driverId,
        latitude,
        longitude,
        timestamp: new Date(),
        status,
        accuracy,
        heading,
        speed,
        updatedAt: new Date()
      };

      if (!existingSnapshot.empty) {
        // Update existing location
        const doc = existingSnapshot.docs[0];
        await doc.ref.update(locationData);
        return { ...locationData, id: doc.id, createdAt: doc.data().createdAt };
      } else {
        // Create new location record
        const location = {
          ...locationData,
          createdAt: new Date()
        };
        const docRef = await collection.add(location);
        return { ...location, id: docRef.id };
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
      throw error;
    }
  }

  static async getDriverLocation(driverId: string): Promise<FirestoreDriverLocation | null> {
    try {
      const collection = this.getCollection('driver_locations');
      const snapshot = await collection
        .where('driverId', '==', driverId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestoreDriverLocation;
    } catch (error) {
      console.error('Error getting driver location:', error);
      return null;
    }
  }

  static async getActiveDriversWithLocations(
    latitude: number, 
    longitude: number, 
    radius: number = 5
  ): Promise<FirestoreDriverLocation[]> {
    try {
      const collection = this.getCollection('driver_locations');
      
      // Get all active drivers (online or busy)
      const snapshot = await collection
        .where('status', 'in', ['online', 'busy'])
        .orderBy('timestamp', 'desc')
        .get();

      const locations: FirestoreDriverLocation[] = [];
      const driverMap = new Map<string, FirestoreDriverLocation>();

      // Get the latest location for each driver
      snapshot.docs.forEach(doc => {
        const location = { id: doc.id, ...doc.data() } as FirestoreDriverLocation;
        if (!driverMap.has(location.driverId)) {
          driverMap.set(location.driverId, location);
        }
      });

      // Filter by distance
      driverMap.forEach(location => {
        const distance = this.calculateDistance(
          latitude, longitude,
          location.latitude, location.longitude
        );
        
        if (distance <= radius) {
          locations.push({
            ...location,
            distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
          } as any);
        }
      });

      return locations.sort((a, b) => (a as any).distance - (b as any).distance);
    } catch (error) {
      console.error('Error getting active drivers with locations:', error);
      return [];
    }
  }

  static async setDriverOnlineStatus(driverId: string, isOnline: boolean): Promise<boolean> {
    try {
      const collection = this.getCollection('driver_locations');
      const snapshot = await collection
        .where('driverId', '==', driverId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        await doc.ref.update({
          status: isOnline ? 'online' : 'offline',
          updatedAt: new Date()
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error setting driver online status:', error);
      return false;
    }
  }

  static async getDriverLocationHistory(
    driverId: string, 
    startDate?: Date, 
    endDate?: Date, 
    limit: number = 100
  ): Promise<FirestoreDriverLocation[]> {
    try {
      const collection = this.getCollection('driver_locations');
      let query = collection
        .where('driverId', '==', driverId)
        .orderBy('timestamp', 'desc')
        .limit(limit);

      if (startDate) {
        query = query.where('timestamp', '>=', startDate);
      }
      if (endDate) {
        query = query.where('timestamp', '<=', endDate);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreDriverLocation[];
    } catch (error) {
      console.error('Error getting driver location history:', error);
      return [];
    }
  }

  static async cleanupOldDriverLocations(daysToKeep: number = 7): Promise<number> {
    try {
      const collection = this.getCollection('driver_locations');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const snapshot = await collection
        .where('timestamp', '<', cutoffDate)
        .get();

      const batch = db?.batch();
      let deleteCount = 0;

      snapshot.docs.forEach(doc => {
        if (batch) {
          batch.delete(doc.ref);
          deleteCount++;
        }
      });

      if (batch && deleteCount > 0) {
        await batch.commit();
        console.log(`🧹 Cleaned up ${deleteCount} old driver location records`);
      }

      return deleteCount;
    } catch (error) {
      console.error('Error cleaning up old driver locations:', error);
      return 0;
    }
  }

  // Helper method to calculate distance between two points
  private static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // ==================== SCHEDULED RIDES METHODS ====================

  static async createScheduledRide(scheduledRideData: Omit<FirestoreScheduledRide, 'id'>): Promise<FirestoreScheduledRide> {
    try {
      const collection = this.getCollection('scheduled_rides');
      const docRef = await collection.add(scheduledRideData);
      return { ...scheduledRideData, id: docRef.id };
    } catch (error) {
      console.error('Error creating scheduled ride:', error);
      throw error;
    }
  }

  static async getScheduledRideById(id: string): Promise<FirestoreScheduledRide | null> {
    try {
      const collection = this.getCollection('scheduled_rides');
      const doc = await collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as FirestoreScheduledRide;
    } catch (error) {
      console.error('Error getting scheduled ride by ID:', error);
      return null;
    }
  }

  static async getScheduledRides(
    userId: string, 
    options: {
      page: number;
      limit: number;
      status?: string;
      upcoming_only?: boolean;
    }
  ): Promise<{ data: FirestoreScheduledRide[]; pagination: any }> {
    try {
      const collection = this.getCollection('scheduled_rides');
      let query = collection.where('user_id', '==', userId);

      // Apply status filter
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Apply upcoming filter
      if (options.upcoming_only) {
        query = query.where('scheduled_datetime', '>', new Date());
      }

      // Apply pagination
      const offset = (options.page - 1) * options.limit;
      query = query.orderBy('scheduled_datetime', 'asc').offset(offset).limit(options.limit);

      const snapshot = await query.get();
      const scheduledRides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreScheduledRide[];

      return {
        data: scheduledRides,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: scheduledRides.length,
          hasMore: scheduledRides.length === options.limit
        }
      };
    } catch (error) {
      console.error('Error getting scheduled rides:', error);
      return { data: [], pagination: { page: 1, limit: 10, total: 0, hasMore: false } };
    }
  }

  static async updateScheduledRide(id: string, updateData: Partial<FirestoreScheduledRide>): Promise<FirestoreScheduledRide | null> {
    try {
      const collection = this.getCollection('scheduled_rides');
      const docRef = collection.doc(id);
      
      // Add updated_at timestamp
      updateData.updated_at = new Date();
      
      await docRef.update(updateData);
      
      // Return updated document
      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        return null;
      }

      return { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreScheduledRide;
    } catch (error) {
      console.error('Error updating scheduled ride:', error);
      return null;
    }
  }

  static async getDriverScheduledRides(
    driverId: string,
    options: {
      page: number;
      limit: number;
      date?: string;
    }
  ): Promise<{ data: FirestoreScheduledRide[]; pagination: any }> {
    try {
      const collection = this.getCollection('scheduled_rides');
      let query = collection.where('driver_id', '==', driverId);

      // Apply date filter if provided
      if (options.date) {
        const startDate = new Date(options.date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(options.date);
        endDate.setHours(23, 59, 59, 999);
        
        query = query.where('scheduled_datetime', '>=', startDate)
                    .where('scheduled_datetime', '<=', endDate);
      }

      // Apply pagination
      const offset = (options.page - 1) * options.limit;
      query = query.orderBy('scheduled_datetime', 'asc').offset(offset).limit(options.limit);

      const snapshot = await query.get();
      const scheduledRides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreScheduledRide[];

      return {
        data: scheduledRides,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: scheduledRides.length,
          hasMore: scheduledRides.length === options.limit
        }
      };
    } catch (error) {
      console.error('Error getting driver scheduled rides:', error);
      return { data: [], pagination: { page: 1, limit: 10, total: 0, hasMore: false } };
    }
  }

  static async getUpcomingScheduledRides(): Promise<FirestoreScheduledRide[]> {
    try {
      const collection = this.getCollection('scheduled_rides');
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const snapshot = await collection
        .where('status', '==', 'scheduled')
        .where('scheduled_datetime', '>=', now)
        .where('scheduled_datetime', '<=', oneHourFromNow)
        .orderBy('scheduled_datetime', 'asc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreScheduledRide[];
    } catch (error) {
      console.error('Error getting upcoming scheduled rides:', error);
      return [];
    }
  }

  // ==================== CARPOOL METHODS ====================

  static async createCarpool(carpoolData: Omit<FirestoreCarpool, 'id'>): Promise<FirestoreCarpool> {
    try {
      const collection = this.getCollection('carpools');
      const docRef = await collection.add(carpoolData);
      return { ...carpoolData, id: docRef.id };
    } catch (error) {
      console.error('Error creating carpool:', error);
      throw error;
    }
  }

  static async getCarpoolById(id: string): Promise<FirestoreCarpool | null> {
    try {
      const collection = this.getCollection('carpools');
      const doc = await collection.doc(id).get();
      
      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as FirestoreCarpool;
    } catch (error) {
      console.error('Error getting carpool by ID:', error);
      return null;
    }
  }

  static async getAvailableCarpools(options: {
    pickup_coordinates: { latitude: number; longitude: number };
    dropoff_coordinates: { latitude: number; longitude: number };
    radius: number;
    max_fare_per_person?: number;
    date_range?: string;
    page: number;
    limit: number;
  }): Promise<{ data: FirestoreCarpool[]; pagination: any }> {
    try {
      const collection = this.getCollection('carpools');
      let query = collection.where('status', '==', 'open');

      // Apply date range filter
      if (options.date_range) {
        const [startDate, endDate] = options.date_range.split('|');
        if (startDate && endDate) {
          query = query.where('scheduled_datetime', '>=', new Date(startDate))
                      .where('scheduled_datetime', '<=', new Date(endDate));
        }
      } else {
        // Default to future rides only
        query = query.where('scheduled_datetime', '>', new Date());
      }

      // Apply fare filter
      if (options.max_fare_per_person) {
        query = query.where('fare_per_person', '<=', options.max_fare_per_person);
      }

      // Apply pagination
      const offset = (options.page - 1) * options.limit;
      query = query.orderBy('scheduled_datetime', 'asc').offset(offset).limit(options.limit);

      const snapshot = await query.get();
      let carpools = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreCarpool[];

      // Filter by distance (client-side filtering for now)
      carpools = carpools.filter(carpool => {
        const pickupDistance = this.calculateDistance(
          options.pickup_coordinates.latitude,
          options.pickup_coordinates.longitude,
          carpool.pickup_location.latitude,
          carpool.pickup_location.longitude
        );
        
        const dropoffDistance = this.calculateDistance(
          options.dropoff_coordinates.latitude,
          options.dropoff_coordinates.longitude,
          carpool.dropoff_location.latitude,
          carpool.dropoff_location.longitude
        );

        return pickupDistance <= options.radius && dropoffDistance <= options.radius;
      });

      return {
        data: carpools,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: carpools.length,
          hasMore: carpools.length === options.limit
        }
      };
    } catch (error) {
      console.error('Error getting available carpools:', error);
      return { data: [], pagination: { page: 1, limit: 10, total: 0, hasMore: false } };
    }
  }

  static async addPassengerToCarpool(carpoolId: string, passenger: {
    user_id: string;
    joined_at: Date;
    status: 'pending' | 'confirmed' | 'cancelled';
    notes?: string;
  }): Promise<FirestoreCarpool | null> {
    try {
      const collection = this.getCollection('carpools');
      const docRef = collection.doc(carpoolId);
      
      const carpool = await this.getCarpoolById(carpoolId);
      if (!carpool) {
        return null;
      }

      const updatedPassengers = [...carpool.passengers, passenger];
      const updatedCurrentPassengers = carpool.current_passengers + 1;
      
      const updateData = {
        passengers: updatedPassengers,
        current_passengers: updatedCurrentPassengers,
        status: updatedCurrentPassengers >= carpool.max_passengers ? 'full' : 'open',
        updated_at: new Date()
      };

      await docRef.update(updateData);
      
      // Return updated document
      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        return null;
      }

      return { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCarpool;
    } catch (error) {
      console.error('Error adding passenger to carpool:', error);
      return null;
    }
  }

  static async removePassengerFromCarpool(carpoolId: string, userId: string, reason?: string): Promise<FirestoreCarpool | null> {
    try {
      const collection = this.getCollection('carpools');
      const docRef = collection.doc(carpoolId);
      
      const carpool = await this.getCarpoolById(carpoolId);
      if (!carpool) {
        return null;
      }

      const updatedPassengers = carpool.passengers.filter(p => p.user_id !== userId);
      const updatedCurrentPassengers = carpool.current_passengers - 1;
      
      const updateData = {
        passengers: updatedPassengers,
        current_passengers: updatedCurrentPassengers,
        status: 'open', // Always set back to open when someone leaves
        updated_at: new Date()
      };

      await docRef.update(updateData);
      
      // Return updated document
      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        return null;
      }

      return { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCarpool;
    } catch (error) {
      console.error('Error removing passenger from carpool:', error);
      return null;
    }
  }

  static async getUserCarpoolRides(
    userId: string,
    options: {
      page: number;
      limit: number;
      status?: string;
      type: string; // 'created', 'joined', 'all'
    }
  ): Promise<{ data: FirestoreCarpool[]; pagination: any }> {
    try {
      const collection = this.getCollection('carpools');
      let query;

      if (options.type === 'created') {
        query = collection.where('creator_id', '==', userId);
      } else if (options.type === 'joined') {
        // This is more complex - we need to find carpools where user is a passenger but not creator
        query = collection.where('passengers', 'array-contains', { user_id: userId });
      } else {
        // 'all' - find carpools where user is either creator or passenger
        query = collection.where('creator_id', '==', userId);
      }

      // Apply status filter
      if (options.status) {
        query = query.where('status', '==', options.status);
      }

      // Apply pagination
      const offset = (options.page - 1) * options.limit;
      query = query.orderBy('created_at', 'desc').offset(offset).limit(options.limit);

      const snapshot = await query.get();
      let carpools = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreCarpool[];

      // For 'joined' and 'all' types, filter out carpools where user is creator
      if (options.type === 'joined') {
        carpools = carpools.filter(carpool => carpool.creator_id !== userId);
      }

      return {
        data: carpools,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: carpools.length,
          hasMore: carpools.length === options.limit
        }
      };
    } catch (error) {
      console.error('Error getting user carpool rides:', error);
      return { data: [], pagination: { page: 1, limit: 10, total: 0, hasMore: false } };
    }
  }

  static async updateCarpool(id: string, updateData: Partial<FirestoreCarpool>): Promise<FirestoreCarpool | null> {
    try {
      const collection = this.getCollection('carpools');
      const docRef = collection.doc(id);
      
      // Add updated_at timestamp
      updateData.updated_at = new Date();
      
      await docRef.update(updateData);
      
      // Return updated document
      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        return null;
      }

      return { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreCarpool;
    } catch (error) {
      console.error('Error updating carpool:', error);
      return null;
    }
  }

  // ==================== PARENT SUBSCRIPTION METHODS ====================

  static async createParentSubscription(subscriptionData: Omit<FirestoreParentSubscription, 'id'>): Promise<FirestoreParentSubscription> {
    try {
      const collection = this.getCollection('parent_subscriptions');
      const docRef = await collection.add(subscriptionData);
      return { ...subscriptionData, id: docRef.id };
    } catch (error) {
      console.error('Error creating parent subscription:', error);
      throw error;
    }
  }

  static async getParentSubscription(userId: string): Promise<FirestoreParentSubscription | null> {
    try {
      const collection = this.getCollection('parent_subscriptions');
      const snapshot = await collection
        .where('user_id', '==', userId)
        .where('status', 'in', ['active', 'cancelled'])
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestoreParentSubscription;
    } catch (error) {
      console.error('Error getting parent subscription:', error);
      return null;
    }
  }

  static async updateParentSubscription(userId: string, updateData: Partial<FirestoreParentSubscription>): Promise<FirestoreParentSubscription | null> {
    try {
      const subscription = await this.getParentSubscription(userId);
      if (!subscription) {
        return null;
      }

      const collection = this.getCollection('parent_subscriptions');
      const docRef = collection.doc(subscription.id);
      
      // Add updated_at timestamp
      updateData.updated_at = new Date();
      
      await docRef.update(updateData);
      
      // Return updated document
      const updatedDoc = await docRef.get();
      if (!updatedDoc.exists) {
        return null;
      }

      return { id: updatedDoc.id, ...updatedDoc.data() } as FirestoreParentSubscription;
    } catch (error) {
      console.error('Error updating parent subscription:', error);
      return null;
    }
  }

  static async getParentSubscriptionUsage(userId: string, targetDate?: Date): Promise<any> {
    try {
      const startDate = targetDate ? new Date(targetDate.getFullYear(), targetDate.getMonth(), 1) : new Date();
      const endDate = targetDate ? new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0) : new Date();

      const collection = this.getCollection('rides');
      const snapshot = await collection
        .where('userId', '==', userId)
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .where('status', '==', 'completed')
        .get();

      const rides = snapshot.docs.map(doc => doc.data());
      
      return {
        total_rides: rides.length,
        total_fare_saved: rides.reduce((sum, ride) => sum + (ride.fare || 0), 0),
        average_rides_per_day: rides.length / Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))),
        rides_by_day: this.groupRidesByDay(rides),
        estimated_savings: rides.length * 13 // NAD 13 per ride saved
      };
    } catch (error) {
      console.error('Error getting parent subscription usage:', error);
      return {
        total_rides: 0,
        total_fare_saved: 0,
        average_rides_per_day: 0,
        rides_by_day: {},
        estimated_savings: 0
      };
    }
  }

  static async getChildrenProfiles(userId: string): Promise<FirestoreChildProfile[]> {
    try {
      const collection = this.getCollection('child_profiles');
      const snapshot = await collection
        .where('user_id', '==', userId)
        .where('is_active', '==', true)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FirestoreChildProfile[];
    } catch (error) {
      console.error('Error getting children profiles:', error);
      return [];
    }
  }

  static async createChildProfile(childData: Omit<FirestoreChildProfile, 'id'>): Promise<FirestoreChildProfile> {
    try {
      const collection = this.getCollection('child_profiles');
      const docRef = await collection.add(childData);
      return { ...childData, id: docRef.id };
    } catch (error) {
      console.error('Error creating child profile:', error);
      throw error;
    }
  }

  static async getChildProfileById(childId: string): Promise<FirestoreChildProfile | null> {
    try {
      const collection = this.getCollection('child_profiles');
      const doc = await collection.doc(childId).get();
      
      if (!doc.exists) {
        return null;
      }

      return { id: doc.id, ...doc.data() } as FirestoreChildProfile;
    } catch (error) {
      console.error('Error getting child profile by ID:', error);
      return null;
    }
  }

  static async getChildRideHistory(
    childId: string,
    options: {
      page: number;
      limit: number;
      date_range?: string;
    }
  ): Promise<{ data: any[]; pagination: any }> {
    try {
      const collection = this.getCollection('rides');
      let query = collection.where('child_profile_id', '==', childId);

      // Apply date range filter
      if (options.date_range) {
        const [startDate, endDate] = options.date_range.split('|');
        if (startDate && endDate) {
          query = query.where('createdAt', '>=', new Date(startDate))
                      .where('createdAt', '<=', new Date(endDate));
        }
      }

      // Apply pagination
      const offset = (options.page - 1) * options.limit;
      query = query.orderBy('createdAt', 'desc').offset(offset).limit(options.limit);

      const snapshot = await query.get();
      const rides = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return {
        data: rides,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: rides.length,
          hasMore: rides.length === options.limit
        }
      };
    } catch (error) {
      console.error('Error getting child ride history:', error);
      return { data: [], pagination: { page: 1, limit: 10, total: 0, hasMore: false } };
    }
  }

  // Helper method to group rides by day
  private static groupRidesByDay(rides: any[]): { [key: string]: number } {
    const grouped: { [key: string]: number } = {};
    
    rides.forEach(ride => {
      const date = new Date(ride.createdAt).toISOString().split('T')[0];
      grouped[date] = (grouped[date] || 0) + 1;
    });
    
    return grouped;
  }
}
