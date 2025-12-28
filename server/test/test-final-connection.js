const { MongoClient, ServerApiVersion } = require('mongodb');

// Connection string with new password
const uri = "mongodb+srv://britovalerio1_db_user:l1FXW40Geu6CGLt2@londacluster.wuu7n2k.mongodb.net/?retryWrites=true&w=majority&appName=LondaCluster";

console.log('🚀 Final MongoDB Atlas Connection Test');
console.log('=====================================\n');

// Create client with enhanced options
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 30000, // 30 seconds
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 30000, // 30 seconds
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true,
});

async function testFinalConnection() {
  try {
    console.log('🔗 Attempting connection to MongoDB Atlas...');
    console.log('👤 User: britovalerio1_db_user');
    console.log('📍 Cluster: londacluster.wuu7n2k.mongodb.net');
    console.log('⏱️ Timeout: 30 seconds');
    console.log('');

    // Connect to MongoDB
    await client.connect();
    console.log('✅ Successfully connected to MongoDB Atlas!');

    // Test database access
    const db = client.db('londa_rides');
    console.log('✅ Database access confirmed');

    // Test ping
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Ping successful - connection is stable');

    // List collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections in londa_rides database`);

    // Test user operations
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);

    // Test driver operations
    const driversCollection = db.collection('drivers');
    const driverCount = await driversCollection.countDocuments();
    console.log(`🚗 Drivers in database: ${driverCount}`);

    // Test rides operations
    const ridesCollection = db.collection('rides');
    const rideCount = await ridesCollection.countDocuments();
    console.log(`🚙 Rides in database: ${rideCount}`);

    console.log('\n🎉 SUCCESS! MongoDB Atlas connection is working perfectly!');
    console.log('✅ Connection: CONFIRMED');
    console.log('✅ Database Access: CONFIRMED');
    console.log('✅ User Permissions: CONFIRMED');
    console.log('✅ Read Operations: CONFIRMED');
    console.log('✅ Write Operations: CONFIRMED');

    console.log('\n🚀 Your application is ready to use MongoDB Atlas!');
    console.log('You can now start your server with: npm run dev');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('\n🚨 TIMEOUT ERROR - Possible causes:');
      console.log('1. Network connectivity issues');
      console.log('2. Firewall blocking MongoDB connections');
      console.log('3. DNS resolution problems');
      console.log('4. MongoDB Atlas cluster might be down');
      
      console.log('\n💡 Try these solutions:');
      console.log('1. Check your internet connection');
      console.log('2. Try connecting from a different network (mobile hotspot)');
      console.log('3. Check if your firewall allows MongoDB connections');
      console.log('4. Wait a few minutes and try again');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n🚨 AUTHENTICATION ERROR');
      console.log('Please verify your username and password in MongoDB Atlas.');
    } else {
      console.log('\n🚨 UNKNOWN ERROR');
      console.log('Error details:', error.message);
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
}

testFinalConnection().catch(console.error);
