# 🔥 Firebase Cloud Firestore Migration Guide

## Overview
This guide will help you migrate from MongoDB to Firebase Cloud Firestore for your Londa Rides application.

## Prerequisites
- Firebase project already set up (`londa-cd054`)
- Firebase Auth already configured
- Node.js and npm installed

## Step 1: Firebase Console Setup

### 1.1 Enable Firestore Database
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `londa-cd054`
3. Navigate to **Firestore Database**
4. Click **"Create database"**
5. Choose **"Start in test mode"** (as you mentioned)
6. Select your preferred location (closest to your users)

### 1.2 Update Security Rules
Replace the default rules with these production-ready rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Drivers collection
    match /drivers/{driverId} {
      allow read, write: if request.auth != null && request.auth.uid == driverId;
    }
    
    // Rides collection
    match /rides/{rideId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.driverId == request.auth.uid);
    }
    
    // Payments collection
    match /payments/{paymentId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null && 
        resource.data.recipientId == request.auth.uid;
    }
  }
}
```

## Step 2: Install Dependencies

```bash
cd server
npm install firebase-admin @google-cloud/firestore
```

## Step 3: Environment Configuration

Create a `.env` file in your server directory:

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=londa-cd054
FIREBASE_SERVICE_ACCOUNT_KEY=./path/to/service-account-key.json
FIREBASE_STORAGE_BUCKET=londa-cd054.firebasestorage.app

# JWT Configuration
ACCESS_TOKEN_SECRET=your-access-token-secret
EMAIL_ACTIVATION_SECRET=your-email-activation-secret

# Email Configuration (Nylas)
USER_GRANT_ID=your-nylas-grant-id

# Twilio Configuration (Optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Server Configuration
PORT=3000
NODE_ENV=development
```

## Step 4: Firebase Service Account Setup

### 4.1 Generate Service Account Key
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Place it in your server directory (e.g., `service-account-key.json`)
5. Update your `.env` file with the correct path

### 4.2 Update Firebase Configuration
The `firestore.ts` file has been updated to use the service account key.

## Step 5: Data Migration

### 5.1 Backup Current Data
Before migrating, backup your current MongoDB data:

```bash
# Export MongoDB data
mongodump --db londa-rides --out ./backup
```

### 5.2 Migration Script
Create a migration script to transfer data from MongoDB to Firestore:

```javascript
// migration-script.js
const { FirestoreService } = require('./utils/firestore-service');
const { MongoClient } = require('mongodb');

async function migrateData() {
  // Connect to MongoDB
  const client = new MongoClient(process.env.DATABASE_URL);
  await client.connect();
  const db = client.db('londa-rides');
  
  // Migrate users
  const users = await db.collection('users').find().toArray();
  for (const user of users) {
    await FirestoreService.createUser({
      phone_number: user.phone_number,
      name: user.name,
      email: user.email,
      firebase_uid: user.firebase_uid,
      ratings: user.ratings || 0,
      totalRides: user.totalRides || 0,
      isVerified: user.isVerified || false
    });
  }
  
  // Migrate drivers
  const drivers = await db.collection('drivers').find().toArray();
  for (const driver of drivers) {
    await FirestoreService.createDriver({
      name: driver.name,
      country: driver.country,
      phone_number: driver.phone_number,
      email: driver.email,
      vehicle_type: driver.vehicle_type,
      registration_number: driver.registration_number,
      registration_date: driver.registration_date,
      driving_license: driver.driving_license,
      vehicle_color: driver.vehicle_color,
      rate: driver.rate
    });
  }
  
  // Migrate rides
  const rides = await db.collection('rides').find().toArray();
  for (const ride of rides) {
    await FirestoreService.createRide({
      userId: ride.userId,
      driverId: ride.driverId,
      pickupLocation: ride.pickupLocation,
      dropoffLocation: ride.dropoffLocation,
      currentLocationName: ride.currentLocationName,
      destinationLocationName: ride.destinationLocationName,
      distance: ride.distance,
      fare: ride.fare,
      status: ride.status,
      rating: ride.rating,
      review: ride.review,
      scheduledTime: ride.scheduledTime,
      passengerCount: ride.passengerCount,
      vehicleType: ride.vehicleType
    });
  }
  
  console.log('Migration completed successfully!');
  await client.close();
}

migrateData().catch(console.error);
```

## Step 6: Testing the Migration

### 6.1 Test Firestore Connection
```bash
cd server
npm run dev
```

### 6.2 Test API Endpoints
Use your existing API endpoints to test:
- User registration/login
- Driver registration/login
- Ride creation
- Payment processing

## Step 7: Cleanup

### 7.1 Remove MongoDB Dependencies
```bash
npm uninstall mongodb @prisma/client prisma
```

### 7.2 Remove Prisma Files
- Delete `prisma/` directory
- Delete `prisma.schema` file
- Remove Prisma imports from controllers

### 7.3 Update Package.json
Remove MongoDB and Prisma related scripts and dependencies.

## Step 8: Production Deployment

### 8.1 Update Security Rules
Before going to production, update your Firestore security rules to be more restrictive:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Add more specific rules based on your requirements
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 8.2 Environment Variables
Set up production environment variables in your hosting platform.

## Troubleshooting

### Common Issues

1. **Firestore Permission Denied**
   - Check your security rules
   - Verify Firebase Auth is working
   - Ensure service account key is correct

2. **Connection Issues**
   - Verify Firebase project ID
   - Check service account key path
   - Ensure Firestore is enabled

3. **Data Migration Issues**
   - Check data types match Firestore requirements
   - Verify all required fields are present
   - Test with small batches first

### Support
If you encounter issues, check:
- Firebase Console for error logs
- Server logs for detailed error messages
- Firestore security rules
- Environment variable configuration

## Benefits of Migration

1. **No Connection Issues**: Firestore is fully managed by Google
2. **Real-time Updates**: Built-in real-time listeners
3. **Scalability**: Automatic scaling
4. **Security**: Built-in security rules
5. **Integration**: Seamless Firebase ecosystem integration

## Next Steps

After successful migration:
1. Monitor performance and usage
2. Set up monitoring and alerts
3. Optimize queries for better performance
4. Consider implementing real-time features
5. Set up backup strategies

---

**Note**: This migration maintains all existing functionality while providing better reliability and scalability through Firebase Cloud Firestore.
