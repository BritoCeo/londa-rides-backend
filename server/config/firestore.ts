import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as path from 'path';

// Check if we should use development mode
const isDevelopmentMode = process.env.NODE_ENV !== 'production';

let db: any = null;

try {
  // Initialize Firebase Admin only if not already initialized
  if (getApps().length === 0) {
    // Check if service account key is available
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_SERVICE_ACCOUNT_KEY !== '') {
      try {
        // Use service account key for authentication
        const serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY));
        
        initializeApp({
          credential: cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID || 'londa-cd054',
        });
        
        db = getFirestore();
        console.log('🔥 Firestore initialized successfully with service account key');
      } catch (error) {
        console.log('🔄 Service account key not found or invalid, using mock database for development');
        db = null;
      }
    } else {
      // Fall back to mock database for development
      console.log('🔄 No service account key found, using mock database for development');
      db = null;
    }
  } else {
    db = getFirestore();
  }
} catch (error) {
  console.error('❌ Firestore initialization failed:', error);
  console.log('🔄 Falling back to mock database for development');
  db = null;
}

export { db };
export default db; 