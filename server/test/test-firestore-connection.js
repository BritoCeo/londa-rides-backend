const { FirestoreService } = require('../utils/firestore-service.ts');
require('dotenv').config();

async function testFirestoreConnection() {
  console.log('🧪 Testing Firestore connection...');
  
  try {
    // Test user operations
    console.log('👤 Testing user operations...');
    const testUser = await FirestoreService.createUser({
      phone_number: '+1234567890',
      name: 'Test User',
      email: 'test@example.com',
      firebase_uid: 'test-uid-123'
    });
    console.log('✅ User created:', testUser.id);
    
    const retrievedUser = await FirestoreService.getUserById(testUser.id);
    console.log('✅ User retrieved:', retrievedUser?.name);
    
    const userByPhone = await FirestoreService.getUserByPhone('+1234567890');
    console.log('✅ User found by phone:', userByPhone?.name);
    
    // Test driver operations
    console.log('🚗 Testing driver operations...');
    const testDriver = await FirestoreService.createDriver({
      name: 'Test Driver',
      country: 'Namibia',
      phone_number: '+1234567891',
      email: 'driver@example.com',
      vehicle_type: 'Car',
      registration_number: 'TEST123',
      registration_date: '2024-01-01',
      driving_license: 'DL123456',
      vehicle_color: 'Blue',
      rate: '13.00'
    });
    console.log('✅ Driver created:', testDriver.id);
    
    const retrievedDriver = await FirestoreService.getDriverById(testDriver.id);
    console.log('✅ Driver retrieved:', retrievedDriver?.name);
    
    // Test ride operations
    console.log('🚖 Testing ride operations...');
    const testRide = await FirestoreService.createRide({
      userId: testUser.id,
      driverId: testDriver.id,
      pickupLocation: JSON.stringify({ lat: -22.9576, lng: 18.4904 }),
      dropoffLocation: JSON.stringify({ lat: -22.9576, lng: 18.4904 }),
      currentLocationName: 'Test Pickup',
      destinationLocationName: 'Test Destination',
      distance: '5 km',
      fare: 13.00,
      status: 'pending'
    });
    console.log('✅ Ride created:', testRide.id);
    
    const retrievedRide = await FirestoreService.getRideById(testRide.id);
    console.log('✅ Ride retrieved:', retrievedRide?.status);
    
    // Test payment operations
    console.log('💳 Testing payment operations...');
    const testPayment = await FirestoreService.createPayment({
      userId: testUser.id,
      rideId: testRide.id,
      amount: 13.00,
      paymentMethod: 'cash',
      status: 'completed'
    });
    console.log('✅ Payment created:', testPayment.id);
    
    // Test notification operations
    console.log('🔔 Testing notification operations...');
    const testNotification = await FirestoreService.createNotification({
      senderId: testDriver.id,
      recipientId: testUser.id,
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'ride'
    });
    console.log('✅ Notification created:', testNotification.id);
    
    // Test analytics
    console.log('📊 Testing analytics...');
    const userAnalytics = await FirestoreService.getUserAnalytics(testUser.id);
    console.log('✅ User analytics:', userAnalytics);
    
    const driverAnalytics = await FirestoreService.getDriverAnalytics(testDriver.id);
    console.log('✅ Driver analytics:', driverAnalytics);
    
    console.log('🎉 All tests passed! Firestore is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFirestoreConnection().catch(console.error);
}

module.exports = { testFirestoreConnection };
