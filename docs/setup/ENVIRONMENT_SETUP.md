# 🔧 Environment Configuration Guide

## Required Environment Variables

Create a `.env` file in the `server/` directory with the following variables:

```env
# Database Configuration
FIRESTORE_PROJECT_ID=londa-cd054
FIRESTORE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIRESTORE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@londa-cd054.iam.gserviceaccount.com

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Google Maps API - ADD THIS KEY
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Firebase Auth
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=londa-cd054.firebaseapp.com
FIREBASE_PROJECT_ID=londa-cd054

# Server Configuration
PORT=8000
NODE_ENV=development

# Nylas Configuration
NYLAS_API_KEY=your-nylas-api-key
```

## 🗺️ Google Maps API Key Setup

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable the following APIs**:
   - Maps JavaScript API
   - Geocoding API
   - Distance Matrix API
   - Directions API
   - Places API

### Step 2: Create API Key

1. **Go to Credentials** in Google Cloud Console
2. **Click "Create Credentials"** → "API Key"
3. **Copy the API key**
4. **Restrict the API key** (recommended for security):
   - Go to "Restrict Key"
   - Select "HTTP referrers" or "IP addresses"
   - Add your domain/IP

### Step 3: Add to Environment

Replace `your-google-maps-api-key-here` in your `.env` file with your actual API key:

```env
GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 4: Test the Integration

Run the test script to verify everything works:

```bash
node test-google-maps.js
```

## 🔒 Security Best Practices

1. **Never commit `.env` to version control**
2. **Use environment-specific keys**
3. **Restrict API keys to specific domains/IPs**
4. **Monitor API usage and set up billing alerts**
5. **Use different keys for development and production**

## 🚀 Features Available with Google Maps

Once configured, you'll have access to:

- **Automatic Distance Calculation**: Real-time distance between pickup and dropoff
- **Dynamic Fare Calculation**: Pricing based on actual distance and time
- **Geocoding**: Convert addresses to coordinates
- **Reverse Geocoding**: Convert coordinates to addresses
- **Directions**: Turn-by-turn navigation
- **Nearby Places**: Find restaurants, gas stations, etc.
- **Traffic-Aware Routing**: Real-time traffic conditions

## 📊 API Endpoints Available

- `POST /api/v1/maps/geocode` - Convert address to coordinates
- `POST /api/v1/maps/reverse-geocode` - Convert coordinates to address
- `POST /api/v1/maps/distance` - Calculate distance between points
- `POST /api/v1/maps/directions` - Get turn-by-turn directions
- `POST /api/v1/maps/nearby-places` - Find nearby establishments
- `POST /api/v1/maps/calculate-fare` - Calculate ride fare

## 💰 Cost Management

- **Free Tier**: $200/month credit (Google Maps)
- **Monitor Usage**: Check Google Cloud Console regularly
- **Set Billing Alerts**: Configure spending limits
- **Optimize Calls**: Cache results when possible
