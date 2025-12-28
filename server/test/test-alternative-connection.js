const { MongoClient } = require('mongodb');

// Test different connection approaches
const connectionStrings = [
  // Original connection string
  "mongodb+srv://britovalerio1_db_user:qFPLQJbZ9ZQwPE3O@londacluster.wuu7n2k.mongodb.net/londa_rides?retryWrites=true&w=majority&appName=LondaCluster",
  
  // Without database name
  "mongodb+srv://britovalerio1_db_user:qFPLQJbZ9ZQwPE3O@londacluster.wuu7n2k.mongodb.net/?retryWrites=true&w=majority&appName=LondaCluster",
  
  // With different timeout settings
  "mongodb+srv://britovalerio1_db_user:qFPLQJbZ9ZQwPE3O@londacluster.wuu7n2k.mongodb.net/londa_rides?retryWrites=true&w=majority&appName=LondaCluster&connectTimeoutMS=60000&serverSelectionTimeoutMS=60000"
];

async function testConnection(uri, testName) {
  console.log(`\n🔗 Testing: ${testName}`);
  console.log(`📍 URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 60000,
  });

  try {
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test database access
    const db = client.db('londa_rides');
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections`);
    
    return true;
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  } finally {
    await client.close();
  }
}

async function runAllTests() {
  console.log('🚀 Testing multiple connection approaches...\n');
  
  const tests = [
    { uri: connectionStrings[0], name: 'Original Connection String' },
    { uri: connectionStrings[1], name: 'Without Database Name' },
    { uri: connectionStrings[2], name: 'Extended Timeout' }
  ];
  
  let successCount = 0;
  
  for (const test of tests) {
    const success = await testConnection(test.uri, test.name);
    if (success) {
      successCount++;
      console.log('🎉 This connection method works!');
      break; // Stop on first success
    }
  }
  
  console.log(`\n📊 Results: ${successCount}/${tests.length} connection methods successful`);
  
  if (successCount === 0) {
    console.log('\n🚨 All connection attempts failed. This suggests:');
    console.log('1. IP address is not properly whitelisted');
    console.log('2. Network/firewall is blocking the connection');
    console.log('3. MongoDB Atlas cluster might be down');
    console.log('4. There might be a DNS issue');
    
    console.log('\n💡 Next steps:');
    console.log('1. Verify IP whitelist in MongoDB Atlas (Security > Database & Network Access)');
    console.log('2. Try adding 0.0.0.0/0 to allow all IPs');
    console.log('3. Check if your network allows MongoDB connections (port 27017)');
    console.log('4. Try connecting from a different network (mobile hotspot)');
  }
}

runAllTests().catch(console.error);
