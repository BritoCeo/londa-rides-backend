const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = "mongodb+srv://britovalerio1_db_user:qFPLQJbZ9ZQwPE3O@londacluster.wuu7n2k.mongodb.net/londa_rides?retryWrites=true&w=majority&appName=LondaCluster";

// Create a MongoClient with enhanced options for debugging
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add connection timeout and retry options
  connectTimeoutMS: 10000, // 10 seconds
  serverSelectionTimeoutMS: 10000, // 10 seconds
  socketTimeoutMS: 10000, // 10 seconds
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true,
});

async function testConnection() {
  try {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    console.log('📍 Cluster: londacluster.wuu7n2k.mongodb.net');
    console.log('👤 User: britovalerio1_db_user');
    console.log('🗄️ Database: londa_rides');
    console.log('⏱️ Timeout: 10 seconds');
    console.log('');
    
    // Connect with timeout
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Test database access
    const db = client.db('londa_rides');
    console.log('✅ Database access confirmed');
    
    // Test collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(col => col.name));
    
    // Test user permissions by creating a test document
    const testCollection = db.collection('connection_test');
    const testDoc = {
      test: true,
      timestamp: new Date(),
      message: 'Connection test successful'
    };
    
    const insertResult = await testCollection.insertOne(testDoc);
    console.log('✅ Write permission confirmed - Document ID:', insertResult.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('✅ Delete permission confirmed');
    
    // Test user collection operations
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log('👥 Users in database:', userCount);
    
    // Test driver collection operations
    const driversCollection = db.collection('drivers');
    const driverCount = await driversCollection.countDocuments();
    console.log('🚗 Drivers in database:', driverCount);
    
    // Test rides collection operations
    const ridesCollection = db.collection('rides');
    const rideCount = await ridesCollection.countDocuments();
    console.log('🚙 Rides in database:', rideCount);
    
    console.log('');
    console.log('🎉 All tests passed! Your MongoDB connection is working perfectly.');
    console.log('✅ User permissions: CONFIRMED');
    console.log('✅ Database access: CONFIRMED');
    console.log('✅ Read/Write operations: CONFIRMED');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('');
    console.log('🔍 Troubleshooting steps:');
    console.log('1. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('   - Go to Security > Database & Network Access');
    console.log('   - Add your current IP address or 0.0.0.0/0 for development');
    console.log('');
    console.log('2. Verify your connection string:');
    console.log('   - Username: britovalerio1_db_user');
    console.log('   - Password: qFPLQJbZ9ZQwPE3O');
    console.log('   - Cluster: londacluster.wuu7n2k.mongodb.net');
    console.log('');
    console.log('3. Check your network connection');
    console.log('4. Ensure MongoDB Atlas cluster is running');
    console.log('');
    console.log('💡 Common solutions:');
    console.log('   - Add 0.0.0.0/0 to IP whitelist for development');
    console.log('   - Check if your firewall is blocking the connection');
    console.log('   - Try connecting from a different network');
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('');
      console.log('🚨 TIMEOUT ERROR DETECTED:');
      console.log('   This usually means your IP is not whitelisted.');
      console.log('   Go to MongoDB Atlas > Security > Database & Network Access');
      console.log('   and add your IP address or 0.0.0.0/0 for development.');
    }
    
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection().catch(console.dir);
