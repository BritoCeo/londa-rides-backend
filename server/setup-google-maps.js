#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗺️ Google Maps API Setup Helper\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('📝 Creating .env file...');
  
  const envContent = `# Database Configuration
FIRESTORE_PROJECT_ID=londa-cd054
FIRESTORE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"
FIRESTORE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@londa-cd054.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Google Maps API - ADD YOUR KEY HERE
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Firebase Auth
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=londa-cd054.firebaseapp.com
FIREBASE_PROJECT_ID=londa-cd054

# Server Configuration
PORT=8000
NODE_ENV=development

# Nylas Configuration
NYLAS_API_KEY=your-nylas-api-key`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
} else {
  console.log('✅ .env file already exists');
}

console.log('\n🔑 Next Steps:');
console.log('1. Get your Google Maps API key from: https://console.cloud.google.com/');
console.log('2. Enable these APIs:');
console.log('   - Maps JavaScript API');
console.log('   - Geocoding API');
console.log('   - Distance Matrix API');
console.log('   - Directions API');
console.log('   - Places API');
console.log('3. Replace "your-google-maps-api-key-here" in .env with your actual key');
console.log('4. Run: node test-google-maps.js to test the integration');

console.log('\n📚 For detailed setup instructions, see: ENVIRONMENT_SETUP.md');
