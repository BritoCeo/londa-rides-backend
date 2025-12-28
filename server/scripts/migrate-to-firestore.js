const { FirestoreService } = require('../utils/firestore-service');
const { MongoClient } = require('mongodb');
require('dotenv').config();

async function migrateData() {
  console.log('🚀 Starting MongoDB to Firestore migration...');
  
  let mongoClient;
  
  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    mongoClient = new MongoClient(process.env.DATABASE_URL || 'mongodb://localhost:27017/londa-rides');
    await mongoClient.connect();
    const db = mongoClient.db('londa-rides');
    
    console.log('✅ Connected to MongoDB');
    
    // Migrate users
    console.log('👥 Migrating users...');
    const users = await db.collection('users').find().toArray();
    console.log(`Found ${users.length} users to migrate`);
    
    for (const user of users) {
      try {
        await FirestoreService.createUser({
          phone_number: user.phone_number,
          name: user.name,
          email: user.email,
          firebase_uid: user.firebase_uid,
          userType: user.userType || 'STUDENT',
          notificationToken: user.notificationToken,
          ratings: user.ratings || 0,
          totalRides: user.totalRides || 0,
          isVerified: user.isVerified || false
        });
        console.log(`✅ Migrated user: ${user.phone_number}`);
      } catch (error) {
        console.error(`❌ Failed to migrate user ${user.phone_number}:`, error.message);
      }
    }
    
    // Migrate drivers
    console.log('🚗 Migrating drivers...');
    const drivers = await db.collection('drivers').find().toArray();
    console.log(`Found ${drivers.length} drivers to migrate`);
    
    for (const driver of drivers) {
      try {
        await FirestoreService.createDriver({
          name: driver.name,
          country: driver.country,
          phone_number: driver.phone_number,
          email: driver.email,
          vehicle_type: driver.vehicle_type,
          registration_number: driver.registration_number,
          registration_date: driver.registration_date,
          driving_license: driver.driving_license,
          vehicle_color: driver.vehicle_color,
          rate: driver.rate,
          notificationToken: driver.notificationToken,
          ratings: driver.ratings || 0,
          totalEarning: driver.totalEarning || 0,
          totalRides: driver.totalRides || 0,
          pendingRides: driver.pendingRides || 0,
          cancelRides: driver.cancelRides || 0,
          status: driver.status || 'inactive'
        });
        console.log(`✅ Migrated driver: ${driver.name}`);
      } catch (error) {
        console.error(`❌ Failed to migrate driver ${driver.name}:`, error.message);
      }
    }
    
    // Migrate rides
    console.log('🚖 Migrating rides...');
    const rides = await db.collection('rides').find().toArray();
    console.log(`Found ${rides.length} rides to migrate`);
    
    for (const ride of rides) {
      try {
        await FirestoreService.createRide({
          userId: ride.userId,
          childId: ride.childId,
          driverId: ride.driverId,
          pickupLocation: ride.pickupLocation,
          dropoffLocation: ride.dropoffLocation,
          currentLocationName: ride.currentLocationName,
          destinationLocationName: ride.destinationLocationName,
          distance: ride.distance,
          fare: ride.fare || 13.00,
          currency: ride.currency || 'NAD',
          status: ride.status || 'pending',
          rating: ride.rating,
          review: ride.review,
          scheduledTime: ride.scheduledTime,
          passengerCount: ride.passengerCount || 1,
          vehicleType: ride.vehicleType || 'Car',
          isChildRide: ride.isChildRide || false
        });
        console.log(`✅ Migrated ride: ${ride.id}`);
      } catch (error) {
        console.error(`❌ Failed to migrate ride ${ride.id}:`, error.message);
      }
    }
    
    // Migrate payments
    console.log('💳 Migrating payments...');
    const payments = await db.collection('payments').find().toArray();
    console.log(`Found ${payments.length} payments to migrate`);
    
    for (const payment of payments) {
      try {
        await FirestoreService.createPayment({
          userId: payment.userId,
          rideId: payment.rideId,
          amount: payment.amount,
          currency: payment.currency || 'NAD',
          paymentMethod: payment.paymentMethod,
          status: payment.status || 'pending',
          transactionId: payment.transactionId
        });
        console.log(`✅ Migrated payment: ${payment.id}`);
      } catch (error) {
        console.error(`❌ Failed to migrate payment ${payment.id}:`, error.message);
      }
    }
    
    // Migrate notifications
    console.log('🔔 Migrating notifications...');
    const notifications = await db.collection('notifications').find().toArray();
    console.log(`Found ${notifications.length} notifications to migrate`);
    
    for (const notification of notifications) {
      try {
        await FirestoreService.createNotification({
          senderId: notification.senderId,
          recipientId: notification.recipientId,
          title: notification.title,
          message: notification.message,
          type: notification.type || 'general',
          isRead: notification.isRead || false
        });
        console.log(`✅ Migrated notification: ${notification.id}`);
      } catch (error) {
        console.error(`❌ Failed to migrate notification ${notification.id}:`, error.message);
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Drivers: ${drivers.length}`);
    console.log(`- Rides: ${rides.length}`);
    console.log(`- Payments: ${payments.length}`);
    console.log(`- Notifications: ${notifications.length}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('📡 MongoDB connection closed');
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateData().catch(console.error);
}

module.exports = { migrateData };
