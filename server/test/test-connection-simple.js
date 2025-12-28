const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();

async function testFirestoreConnection() {
  console.log('🧪 Testing Firestore connection...');
  
  try {
    // Initialize Firebase Admin
    if (!admin.apps.length) {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'londa-cd054',
      });
    }
    
    const db = getFirestore();
    console.log('✅ Firebase Admin initialized');
    
    // Test basic Firestore operations
    console.log('📝 Testing Firestore write operation...');
    const testCollection = db.collection('test');
    const testDoc = await testCollection.add({
      message: 'Hello Firestore!',
      timestamp: new Date(),
      test: true
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
    
  } catch (error) {
    console.error('❌ Firestore test failed:', error.message);
    console.error('Stack trace:', error.stack);
    
    if (error.code === 'PERMISSION_DENIED') {
      console.log('💡 Tip: Make sure Firestore is enabled in your Firebase Console');
      console.log('💡 Tip: Check your security rules');
    } else if (error.code === 'NOT_FOUND') {
      console.log('💡 Tip: Make sure your Firebase project ID is correct');
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testFirestoreConnection().catch(console.error);
}

module.exports = { testFirestoreConnection };
