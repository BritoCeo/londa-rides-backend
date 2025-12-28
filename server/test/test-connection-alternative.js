const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://britovalerio1_db_user:qFPLQJbZ9ZQwPE3O@londacluster.wuu7n2k.mongodb.net/?retryWrites=true&w=majority&appName=LondaCluster";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add connection timeout settings
  connectTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
  retryReads: true
});

async function testConnection() {
  try {
    console.log('🔗 Testing MongoDB connection with extended timeouts...');
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    // Test basic operations
    const db = client.db('londa_rides');
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections found:', collections.length);
    
    await client.close();
    console.log('🔌 Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('\n🌐 Network Issue Detected:');
      console.log('1. Check if your firewall is blocking MongoDB connections');
      console.log('2. Try connecting from a different network (mobile hotspot)');
      console.log('3. Contact your ISP if the issue persists');
    }
  }
}

testConnection();
