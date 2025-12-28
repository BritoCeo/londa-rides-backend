const { MongoClient } = require('mongodb');

// Simple connection test
const uri = "mongodb+srv://britovalerio1_db_user:qFPLQJbZ9ZQwPE3O@londacluster.wuu7n2k.mongodb.net/londa_rides?retryWrites=true&w=majority&appName=LondaCluster";

console.log('🔗 Testing MongoDB connection...');
console.log('📍 URI:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

const client = new MongoClient(uri, {
  connectTimeoutMS: 30000, // 30 seconds
  serverSelectionTimeoutMS: 30000, // 30 seconds
  socketTimeoutMS: 30000, // 30 seconds
});

async function testSimpleConnection() {
  try {
    console.log('⏱️ Attempting connection (30 second timeout)...');
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test basic operations
    const db = client.db('londa_rides');
    console.log('✅ Database access confirmed');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    
    // Test a simple operation
    const result = await db.admin().ping();
    console.log('✅ Ping successful:', result);
    
    console.log('🎉 MongoDB connection is working perfectly!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('\n🚨 TIMEOUT ERROR - Possible causes:');
      console.log('1. IP address not whitelisted in MongoDB Atlas');
      console.log('2. Network firewall blocking connection');
      console.log('3. MongoDB Atlas cluster is down');
      console.log('4. DNS resolution issues');
      
      console.log('\n💡 Try these solutions:');
      console.log('1. Verify IP whitelist in MongoDB Atlas');
      console.log('2. Try connecting from a different network');
      console.log('3. Check if your firewall allows MongoDB connections');
      console.log('4. Wait a few minutes for DNS propagation');
    }
    
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testSimpleConnection();
