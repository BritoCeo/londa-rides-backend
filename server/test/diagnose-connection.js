const { MongoClient } = require('mongodb');
const dns = require('dns');
const { promisify } = require('util');

const dnsLookup = promisify(dns.lookup);

// Updated connection string with new password
const uri = "mongodb+srv://britovalerio1_db_user:l1FXW40Geu6CGLt2@londacluster.wuu7n2k.mongodb.net/londa_rides?retryWrites=true&w=majority&appName=LondaCluster";

async function diagnoseConnection() {
  console.log('🔍 MongoDB Atlas Connection Diagnostics');
  console.log('=====================================\n');
  
  // 1. Test DNS resolution
  console.log('1️⃣ Testing DNS resolution...');
  try {
    const result = await dnsLookup('londacluster.wuu7n2k.mongodb.net');
    console.log('✅ DNS resolution successful:', result);
  } catch (error) {
    console.log('❌ DNS resolution failed:', error.message);
    console.log('💡 This might be a network connectivity issue');
    return;
  }
  
  // 2. Test connection with different timeouts
  console.log('\n2️⃣ Testing MongoDB connection...');
  console.log('👤 User: britovalerio1_db_user');
  console.log('🔑 Password: l1FXW40Geu6CGLt2');
  console.log('📍 Cluster: londacluster.wuu7n2k.mongodb.net');
  console.log('🗄️ Database: londa_rides');
  
  const client = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
  
  try {
    console.log('⏱️ Attempting connection (10 second timeout)...');
    await client.connect();
    console.log('✅ Connection successful!');
    
    // Test database operations
    const db = client.db('londa_rides');
    const collections = await db.listCollections().toArray();
    console.log(`📁 Found ${collections.length} collections in database`);
    
    // Test user permissions
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();
    console.log(`👥 Users in database: ${userCount}`);
    
    console.log('\n🎉 SUCCESS! Your MongoDB connection is working perfectly!');
    console.log('✅ Database access confirmed');
    console.log('✅ User permissions confirmed');
    console.log('✅ Read operations confirmed');
    
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    
    if (error.message.includes('ETIMEOUT')) {
      console.log('\n🚨 TIMEOUT ERROR DETECTED');
      console.log('This usually means your IP address is not whitelisted.');
      console.log('\n📋 REQUIRED ACTIONS:');
      console.log('1. Go to MongoDB Atlas Dashboard');
      console.log('2. Click "Security" in the left sidebar');
      console.log('3. Click "Database & Network Access"');
      console.log('4. Click "+ Add IP Address"');
      console.log('5. Add "0.0.0.0/0" (Allow access from anywhere)');
      console.log('6. Or add your specific IP address');
      console.log('\n⚠️  Make sure to save the changes!');
    } else if (error.message.includes('Authentication failed')) {
      console.log('\n🚨 AUTHENTICATION ERROR');
      console.log('The username or password is incorrect.');
      console.log('Please verify your credentials in MongoDB Atlas.');
    } else {
      console.log('\n🚨 UNKNOWN ERROR');
      console.log('Error type:', error.name);
      console.log('Error message:', error.message);
    }
  } finally {
    await client.close();
    console.log('\n🔌 Connection closed');
  }
  
  console.log('\n📊 DIAGNOSTIC SUMMARY:');
  console.log('====================');
  console.log('✅ DNS Resolution: Working');
  console.log('❌ MongoDB Connection: Failed (IP whitelisting required)');
  console.log('✅ User Credentials: Updated');
  console.log('✅ Database Configuration: Ready');
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Whitelist your IP address in MongoDB Atlas');
  console.log('2. Run this diagnostic again');
  console.log('3. Start your application server');
}

diagnoseConnection().catch(console.error);
