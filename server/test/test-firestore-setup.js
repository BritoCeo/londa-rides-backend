const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
require('dotenv').config();

async function testFirestoreSetup() {
  console.log('🧪 Testing Firestore setup...');
  console.log('📋 Configuration:');
  console.log(`- Project ID: ${process.env.FIREBASE_PROJECT_ID || 'londa-cd054'}`);
  console.log(`- Service Account Key: ${process.env.FIREBASE_SERVICE_ACCOUNT_KEY || 'Not set'}`);
  console.log(`- Node Environment: ${process.env.NODE_ENV || 'development'}`);
  
  try {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY !== '') {
        console.log('🔑 Using service account key for authentication...');
        const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || 'londa-cd054',
        });
      } else {
        console.log('🔑 Using google-services.json for authentication...');
        const googleServices = require('../../google-services.json');
        
        admin.initializeApp({
          projectId: googleServices.project_info.project_id,
          storageBucket: googleServices.project_info.storage_bucket,
        });
      }
    }
    
    const db = getFirestore();
    console.log('✅ Firebase Admin initialized');
    
    // Test basic Firestore operations
    console.log('📝 Testing Firestore write operation...');
    const testCollection = db.collection('test');
    const testDoc = await testCollection.add({
      message: 'Hello Firestore!',
      timestamp: new Date(),
      test: true,
      project: 'londa-cd054'
    });
    console.log('✅ Test document created:', testDoc.id);
    
    // Test read operation
    console.log('📖 Testing Firestore read operation...');
    const doc = await testCollection.doc(testDoc.id).get();
    if (doc.exists) {
      console.log('✅ Test document read successfully:', doc.data());
    } else {
      console.log('❌ Test document not found');
    }
    
    // Test query operation
    console.log('🔍 Testing Firestore query operation...');
    const snapshot = await testCollection.where('test', '==', true).get();
    console.log('✅ Query executed successfully, found', snapshot.size, 'documents');
    
    // Clean up test document
    console.log('🧹 Cleaning up test document...');
    await testCollection.doc(testDoc.id).delete();
    console.log('✅ Test document deleted');
    
    console.log('🎉 All Firestore tests passed!');
    console.log('📊 Firestore is working correctly and ready for your application.');
    console.log('🚀 You can now start your server with: npm run dev');
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.code === 'PERMISSION_DENIED') {
      console.log('💡 Tip: Make sure Firestore is enabled in your Firebase Console');
      console.log('💡 Tip: Check your security rules');
    } else if (error.code === 'NOT_FOUND') {
      console.log('💡 Tip: Make sure your Firebase project ID is correct');
    } else if (error.message.includes('Could not load the default credentials')) {
      console.log('💡 Tip: You need to set up Firebase authentication');
      console.log('💡 Steps:');
      console.log('1. Go to Firebase Console → Project Settings → Service Accounts');
      console.log('2. Generate new private key');
      console.log('3. Download the JSON file');
      console.log('4. Save it as service-account-key.json in your server directory');
      console.log('5. Update your .env file with: FIREBASE_SERVICE_ACCOUNT_KEY=./service-account-key.json');
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFirestoreSetup().catch(console.error);
}

module.exports = { testFirestoreSetup };
