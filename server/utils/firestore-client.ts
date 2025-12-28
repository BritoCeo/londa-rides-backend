import { db } from '../config/firestore';
import { FieldValue } from 'firebase-admin/firestore';

// Firestore client that mimics Prisma API structure
class FirestoreClient {
  user = {
    findUnique: async (params: any) => {
      if (!db) {
        // Mock response for development
        const mockId = params?.where?.id || params?.where?.phone_number || "dev_user_123";
        return {
          id: mockId,
          phone_number: params?.where?.phone_number || "264813442530",
          name: "Dev User",
          email: null,
          firebase_uid: "mock_firebase_uid"
        };
      }

      try {
        let query;
        
        if (params.where.id) {
          const doc = await db.collection('users').doc(params.where.id).get();
          return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } else if (params.where.phone_number) {
          // Search by phone number
          const snapshot = await db.collection('users').where('phone_number', '==', params.where.phone_number).limit(1).get();
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
          }
          return null;
        }
        
        return null;
      } catch (error) {
        console.error('Firestore user findUnique error:', error);
        return null;
      }
    },

    create: async (params: any) => {
      if (!db) {
        // Mock response for development
        return {
          id: "dev_user_" + Date.now(),
          ...params.data,
          createdAt: new Date(),
        };
      }

      try {
        const docRef = db.collection('users').doc();
        const userData = {
          ...params.data,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        
        await docRef.set(userData);
        
        return {
          id: docRef.id,
          ...params.data,
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Firestore user create error:', error);
        throw error;
      }
    },

    update: async (params: any) => {
      if (!db) {
        // Mock response for development
        return {
          id: params.where.id,
          ...params.data,
          updatedAt: new Date(),
        };
      }

      try {
        const docRef = db.collection('users').doc(params.where.id);
        const updateData = {
          ...params.data,
          updatedAt: FieldValue.serverTimestamp(),
        };
        
        await docRef.update(updateData);
        
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        console.error('Firestore user update error:', error);
        throw error;
      }
    },

    findMany: async (params: any = {}) => {
      if (!db) {
        return [];
      }

      try {
        let query = db.collection('users');
        
        // Apply where conditions if provided
        if (params.where) {
          Object.entries(params.where).forEach(([field, value]) => {
            query = query.where(field, '==', value);
          });
        }
        
        // Apply limit if provided
        if (params.take) {
          query = query.limit(params.take);
        }
        
        const snapshot = await query.get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Firestore user findMany error:', error);
        return [];
      }
    },
  };

  driver = {
    findUnique: async (params: any) => {
      if (!db) {
        // Mock response for development
        return null;
      }

      try {
        const doc = await db.collection('drivers').doc(params.where.id || params.where.phone_number).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      } catch (error) {
        console.error('Firestore driver findUnique error:', error);
        return null;
      }
    },

    create: async (params: any) => {
      if (!db) {
        // Mock response for development
        return {
          id: "dev_driver_" + Date.now(),
          ...params.data,
          totalEarning: 0,
          totalRides: 0,
          status: "offline",
          createdAt: new Date(),
        };
      }

      try {
        const docRef = db.collection('drivers').doc();
        const driverData = {
          ...params.data,
          totalEarning: 0,
          totalRides: 0,
          status: "offline",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        
        await docRef.set(driverData);
        
        return {
          id: docRef.id,
          ...driverData,
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Firestore driver create error:', error);
        throw error;
      }
    },

    update: async (params: any) => {
      if (!db) {
        // Mock response for development
        return {
          id: params.where.id,
          ...params.data,
          updatedAt: new Date(),
        };
      }

      try {
        const docRef = db.collection('drivers').doc(params.where.id);
        
        // Handle increment operations
        const updateData: any = { ...params.data };
        if (params.data.totalEarning?.increment) {
          updateData.totalEarning = FieldValue.increment(params.data.totalEarning.increment);
        }
        if (params.data.totalRides?.increment) {
          updateData.totalRides = FieldValue.increment(params.data.totalRides.increment);
        }
        
        updateData.updatedAt = FieldValue.serverTimestamp();
        
        await docRef.update(updateData);
        
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        console.error('Firestore driver update error:', error);
        throw error;
      }
    },

    findMany: async (params: any = {}) => {
      if (!db) {
        return [];
      }

      try {
        let query = db.collection('drivers');
        
        // Apply where conditions
        if (params.where) {
          if (params.where.id?.in) {
            // Handle 'in' queries for multiple IDs
            const chunks = [];
            const ids = params.where.id.in;
            for (let i = 0; i < ids.length; i += 10) {
              chunks.push(ids.slice(i, i + 10));
            }
            
            const allResults = [];
            for (const chunk of chunks) {
              const snapshot = await db.collection('drivers').where('__name__', 'in', chunk).get();
              allResults.push(...snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
            }
            return allResults;
          } else {
            Object.entries(params.where).forEach(([field, value]) => {
              query = query.where(field, '==', value);
            });
          }
        }
        
        if (params.take) {
          query = query.limit(params.take);
        }
        
        const snapshot = await query.get();
        return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error('Firestore driver findMany error:', error);
        return [];
      }
    },
  };

  rides = {
    findUnique: async (params: any) => {
      if (!db) {
        // Mock response for development
        return {
          id: params?.where?.id || "dev_ride_123",
          status: "pending",
          userId: "dev_user",
          driverId: "dev_driver",
          charge: 25.50,
          currentLocationName: "Mock Location A",
          destinationLocationName: "Mock Location B",
          distance: "5.2 km"
        };
      }

      try {
        const doc = await db.collection('rides').doc(params.where.id).get();
        return doc.exists ? { id: doc.id, ...doc.data() } : null;
      } catch (error) {
        console.error('Firestore ride findUnique error:', error);
        return null;
      }
    },

    create: async (params: any) => {
      if (!db) {
        // Mock response for development
        return {
          id: "dev_ride_" + Date.now(),
          ...params.data,
          createdAt: new Date(),
        };
      }

      try {
        const docRef = db.collection('rides').doc();
        const rideData = {
          ...params.data,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        
        await docRef.set(rideData);
        
        return {
          id: docRef.id,
          ...rideData,
          createdAt: new Date(),
        };
      } catch (error) {
        console.error('Firestore ride create error:', error);
        throw error;
      }
    },

    update: async (params: any) => {
      if (!db) {
        // Mock response for development
        return {
          id: params.where.id,
          ...params.data,
          updatedAt: new Date(),
        };
      }

      try {
        const docRef = db.collection('rides').doc(params.where.id);
        const updateData = {
          ...params.data,
          updatedAt: FieldValue.serverTimestamp(),
        };
        
        await docRef.update(updateData);
        
        const doc = await docRef.get();
        return { id: doc.id, ...doc.data() };
      } catch (error) {
        console.error('Firestore ride update error:', error);
        throw error;
      }
    },

    findMany: async (params: any = {}) => {
      if (!db) {
        return [];
      }

      try {
        let query = db.collection('rides');
        
        // Apply where conditions
        if (params.where) {
          Object.entries(params.where).forEach(([field, value]) => {
            query = query.where(field, '==', value);
          });
        }
        
        // Apply ordering
        if (params.orderBy) {
          Object.entries(params.orderBy).forEach(([field, direction]) => {
            query = query.orderBy(field, direction as any);
          });
        }
        
        if (params.take) {
          query = query.limit(params.take);
        }
        
        const snapshot = await query.get();
        const rides = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
        
        // Handle includes (joins) - simplified version
        if (params.include) {
          for (const ride of rides) {
            if (params.include.driver && ride.driverId) {
              const driverDoc = await db.collection('drivers').doc(ride.driverId).get();
              ride.driver = driverDoc.exists ? { id: driverDoc.id, ...driverDoc.data() } : null;
            }
            if (params.include.user && ride.userId) {
              const userDoc = await db.collection('users').doc(ride.userId).get();
              ride.user = userDoc.exists ? { id: userDoc.id, ...userDoc.data() } : null;
            }
          }
        }
        
        return rides;
      } catch (error) {
        console.error('Firestore ride findMany error:', error);
        return [];
      }
    },
  };
}

const firestoreClient = new FirestoreClient();
export default firestoreClient; 