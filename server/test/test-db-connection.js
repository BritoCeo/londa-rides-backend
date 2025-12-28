const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  const uri = process.env.DATABASE_URL;
  
  if (!uri) {
    console.error('❌ DATABASE_URL not found in environment variables');
    return;
  }

  console.log('🔗 Testing MongoDB connection...');
  console.log('📍 Connection string:', uri.replace(/\/\/.*@/, '//***:***@')); // Hide credentials

  try {
    const client = new MongoClient(uri);
    await client.connect();
    
    // Test the connection
    await client.db().admin().ping();
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // List databases
    const databases = await client.db().admin().listDatabases();
    console.log('📊 Available databases:', databases.databases.map(db => db.name));
    
    await client.close();
    console.log('🔌 Connection closed successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('1. Make sure to replace <db_password> with your actual password');
    console.log('2. Check if your IP address is whitelisted in MongoDB Atlas');
    console.log('3. Verify the connection string format');
  }
}

testConnection();
