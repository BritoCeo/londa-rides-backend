const { MongoClient, ServerApiVersion } = require('mongodb');

// MongoDB connection string
const uri = "mongodb+srv://LondaRides:LondaRides344$@cluster0.oxeu63b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log('🚀 Testing MongoDB Integration');
console.log('===================================\n');

// Create client with enhanced options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
});

async function testMongoDBIntegration() {
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    console.log('👤 User: LondaRides');
    console.log('📍 Cluster: cluster0.oxeu63b.mongodb.net');
    console.log('🗄️ Database: londa_rides');
    console.log('');

    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');

    // Test database access
    const db = client.db('londa_rides');
    console.log('✅ Database access confirmed');

    // Test ping
    await db.admin().ping();
    console.log('✅ Ping successful - connection is stable');

    // Test collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections in database`);

    // Test user operations
    console.log('\n👥 Testing User Operations...');
    const usersCollection = db.collection('users');
    
    // Create a test user
    const testUser = {
      phone_number: '+264813442530',
      name: 'Test User',
      email: 'test@example.com',
      firebase_uid: 'test_firebase_uid',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      ratings: 0,
      totalRides: 0
    };
    
    const userResult = await usersCollection.insertOne(testUser);
    console.log('✅ User created successfully:', userResult.insertedId);
    
    // Find the user
    const foundUser = await usersCollection.findOne({ _id: userResult.insertedId });
    console.log('✅ User found successfully:', foundUser?.name);
    
    // Update the user
    await usersCollection.updateOne(
      { _id: userResult.insertedId },
      { $set: { name: 'Updated Test User', updatedAt: new Date() } }
    );
    console.log('✅ User updated successfully');
    
    // Clean up test user
    await usersCollection.deleteOne({ _id: userResult.insertedId });
    console.log('✅ Test user cleaned up');

    // Test driver operations
    console.log('\n🚗 Testing Driver Operations...');
    const driversCollection = db.collection('drivers');
    
    const testDriver = {
      name: 'Test Driver',
      country: 'Namibia',
      phone_number: '+264813442531',
      email: 'driver@example.com',
      vehicle_type: 'Car',
      registration_number: 'TEST123',
      registration_date: new Date(),
      driving_license: 'DL123456',
      vehicle_color: 'Blue',
      rate: 13.00,
      status: 'offline',
      totalEarning: 0,
      totalRides: 0,
      ratings: 0,
      cancelRides: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };
    
    const driverResult = await driversCollection.insertOne(testDriver);
    console.log('✅ Driver created successfully:', driverResult.insertedId);
    
    // Clean up test driver
    await driversCollection.deleteOne({ _id: driverResult.insertedId });
    console.log('✅ Test driver cleaned up');

    // Test ride operations
    console.log('\n🚙 Testing Ride Operations...');
    const ridesCollection = db.collection('rides');
    
    const testRide = {
      userId: userResult.insertedId,
      pickupLocation: JSON.stringify({ lat: -22.5609, lng: 17.0658, name: 'Windhoek' }),
      dropoffLocation: JSON.stringify({ lat: -22.5709, lng: 17.0758, name: 'Downtown' }),
      currentLocationName: 'Windhoek',
      destinationLocationName: 'Downtown',
      distance: '5.2 km',
      fare: 13.00,
      currency: 'NAD',
      status: 'pending',
      passengerCount: 1,
      vehicleType: 'Car',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const rideResult = await ridesCollection.insertOne(testRide);
    console.log('✅ Ride created successfully:', rideResult.insertedId);
    
    // Clean up test ride
    await ridesCollection.deleteOne({ _id: rideResult.insertedId });
    console.log('✅ Test ride cleaned up');

    console.log('\n🎉 SUCCESS! MongoDB Integration Test Completed');
    console.log('✅ Connection: CONFIRMED');
    console.log('✅ Database Access: CONFIRMED');
    console.log('✅ User Operations: CONFIRMED');
    console.log('✅ Driver Operations: CONFIRMED');
    console.log('✅ Ride Operations: CONFIRMED');
    console.log('✅ CRUD Operations: CONFIRMED');

    console.log('\n🚀 Your MongoDB integration is ready for production!');
    console.log('You can now start your server with: npm run dev');

  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('\n🚨 TIMEOUT ERROR - IP whitelisting required');
      console.log('Please ensure your IP address is whitelisted in MongoDB Atlas');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n🚨 AUTHENTICATION ERROR');
      console.log('Please verify your MongoDB credentials');
    } else {
      console.log('\n🚨 UNKNOWN ERROR');
      console.log('Error details:', error.message);
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testMongoDBIntegration().catch(console.error);
