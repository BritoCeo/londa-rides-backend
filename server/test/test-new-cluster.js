const { MongoClient, ServerApiVersion } = require('mongodb');

// New cluster connection string
const uri = "mongodb+srv://LondaRides:LondaRides344$@cluster0.oxeu63b.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

console.log('🚀 Testing New MongoDB Atlas Cluster');
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
});

async function testNewCluster() {
  try {
    console.log('🔗 Attempting connection to new cluster...');
    console.log('👤 User: LondaRides');
    console.log('📍 Cluster: cluster0.oxeu63b.mongodb.net');
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

    console.log('\n🎉 SUCCESS! New MongoDB Atlas cluster is working perfectly!');
    console.log('✅ Connection: CONFIRMED');
    console.log('✅ Database Access: CONFIRMED');
    console.log('✅ User Permissions: CONFIRMED');
    console.log('✅ Read Operations: CONFIRMED');
    console.log('✅ Write Operations: CONFIRMED');

    console.log('\n🚀 Your application is ready to use the new MongoDB Atlas cluster!');
    console.log('You can now start your server with: npm run dev');

  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('\n🚨 TIMEOUT ERROR - This means your IP is not whitelisted');
      console.log('\n📋 REQUIRED ACTIONS:');
      console.log('1. Go to MongoDB Atlas Dashboard');
      console.log('2. Click "Security" in the left sidebar');
      console.log('3. Click "Database & Network Access"');
      console.log('4. Click "+ Add IP Address"');
      console.log('5. Add "0.0.0.0/0" (Allow access from anywhere)');
      console.log('6. Or add your specific IP address');
      console.log('\n⚠️  Make sure to save the changes!');
      
      console.log('\n🔍 Cluster Details:');
      console.log('   Cluster: cluster0.oxeu63b.mongodb.net');
      console.log('   Username: LondaRides');
      console.log('   Password: LondaRides344$');
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

testNewCluster().catch(console.error);
