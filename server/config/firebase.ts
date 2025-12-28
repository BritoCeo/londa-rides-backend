import admin from 'firebase-admin';

// Firebase configuration from GoogleService-Info.plist
export const firebaseConfig = {
  apiKey: "AIzaSyCjhkfFyZJu9Bji4LDBjlMwE-AeHWJxwYg",
  projectId: "londa-cd054",
  storageBucket: "londa-cd054.firebasestorage.app",
  appId: "1:183357466741:ios:780c53eaf5066570a8303c",
  messagingSenderId: "183357466741"
};

// Note: For production, you would initialize Firebase Admin SDK here
// For development, we're using the simulation service
console.log('🔥 Firebase configured for project:', firebaseConfig.projectId);

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId,
  });
}

export const auth = admin.auth();
export default admin; 