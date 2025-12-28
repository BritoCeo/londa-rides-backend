# 🔑 Google Maps API Key Setup Guide

## 🚀 Quick Start

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Sign in** with your Google account
3. **Create a new project** or select existing one
4. **Name your project**: "Londa Rides Maps" (or similar)

### Step 2: Enable Required APIs

Go to **APIs & Services** → **Library** and enable these APIs:

#### 🗺️ **Required APIs:**
- **Maps JavaScript API** - For interactive maps
- **Geocoding API** - Convert addresses to coordinates
- **Distance Matrix API** - Calculate distances between points
- **Directions API** - Get turn-by-turn directions
- **Places API** - Find nearby places

#### 📋 **How to Enable Each API:**
1. Search for the API name (e.g., "Maps JavaScript API")
2. Click on the API
3. Click **"Enable"**
4. Repeat for all 5 APIs

### Step 3: Create API Key

1. **Go to APIs & Services** → **Credentials**
2. **Click "Create Credentials"** → **"API Key"**
3. **Copy the API key** (starts with "AIza...")
4. **Click "Restrict Key"** for security

### Step 4: Secure Your API Key (Recommended)

#### 🔒 **Restrict by HTTP Referrers:**
1. **Go to your API key** in Credentials
2. **Click "Restrict Key"**
3. **Select "HTTP referrers"**
4. **Add your domains:**
   - `localhost:8000/*`
   - `yourdomain.com/*`
   - `*.yourdomain.com/*`

#### 🔒 **Restrict by IP Addresses:**
1. **Select "IP addresses"**
2. **Add your server IPs:**
   - Your development machine IP
   - Your production server IP

### Step 5: Add to Your Environment

1. **Open your `.env` file** in the `server/` directory
2. **Find this line:**
   ```env
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
   ```
3. **Replace with your actual key:**
   ```env
   GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Step 6: Test the Integration

Run the test script to verify everything works:

```bash
node test-google-maps.js
```

## 💰 **Pricing Information**

### 🆓 **Free Tier:**
- **$200/month credit** (Google Maps)
- **28,000 map loads** per month
- **40,000 geocoding requests** per month
- **40,000 distance matrix requests** per month

### 💵 **Paid Usage:**
- **Maps JavaScript API**: $7 per 1,000 loads
- **Geocoding API**: $5 per 1,000 requests
- **Distance Matrix API**: $5 per 1,000 requests
- **Directions API**: $5 per 1,000 requests
- **Places API**: $17 per 1,000 requests

## 🔧 **Troubleshooting**

### ❌ **Common Issues:**

#### **"API key not valid"**
- Check if the API key is correct
- Verify the APIs are enabled
- Check if the key is restricted to wrong domains

#### **"This API project is not authorized"**
- Enable the required APIs in Google Cloud Console
- Wait a few minutes for changes to propagate

#### **"Quota exceeded"**
- Check your usage in Google Cloud Console
- Consider upgrading your billing plan
- Implement caching to reduce API calls

### ✅ **Verification Steps:**

1. **Check API Key**: Go to Google Cloud Console → Credentials
2. **Check APIs**: Go to APIs & Services → Library
3. **Check Usage**: Go to APIs & Services → Quotas
4. **Check Billing**: Go to Billing → Overview

## 🚀 **Features You'll Get**

Once configured, your Londa Rides API will have:

### 🗺️ **Enhanced Ride Request:**
- **Automatic distance calculation**
- **Real-time fare calculation**
- **Traffic-aware routing**
- **Accurate travel time estimates**

### 📍 **Location Services:**
- **Address geocoding** (address → coordinates)
- **Reverse geocoding** (coordinates → address)
- **Nearby places search**
- **Route optimization**

### 💰 **Smart Pricing:**
- **Distance-based pricing**
- **Time-based pricing**
- **Traffic-aware pricing**
- **Dynamic fare calculation**

## 📊 **API Endpoints Available**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/maps/geocode` | POST | Convert address to coordinates |
| `/api/v1/maps/reverse-geocode` | POST | Convert coordinates to address |
| `/api/v1/maps/distance` | POST | Calculate distance between points |
| `/api/v1/maps/directions` | POST | Get turn-by-turn directions |
| `/api/v1/maps/nearby-places` | POST | Find nearby establishments |
| `/api/v1/maps/calculate-fare` | POST | Calculate ride fare |
| `/api/v1/request-ride` | POST | Enhanced ride request with Maps |

## 🎯 **Example Usage**

### **Geocode an Address:**
```bash
curl -X POST http://localhost:8000/api/v1/maps/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Windhoek, Namibia"}'
```

### **Calculate Distance:**
```bash
curl -X POST http://localhost:8000/api/v1/maps/distance \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"latitude": -22.5609, "longitude": 17.0658},
    "destination": {"latitude": -22.5709, "longitude": 17.0758}
  }'
```

### **Enhanced Ride Request:**
```bash
curl -X POST http://localhost:8000/api/v1/request-ride \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "pickup_location": {
      "latitude": -22.5609,
      "longitude": 17.0658,
      "name": "Windhoek Central"
    },
    "dropoff_location": {
      "latitude": -22.5709,
      "longitude": 17.0758,
      "name": "University of Namibia"
    },
    "ride_type": "standard",
    "passengerCount": 1
  }'
```

## 🔐 **Security Best Practices**

1. **Never commit API keys to version control**
2. **Use environment variables**
3. **Restrict API keys to specific domains/IPs**
4. **Monitor usage regularly**
5. **Set up billing alerts**
6. **Use different keys for dev/prod**

## 📞 **Support**

If you encounter issues:

1. **Check Google Cloud Console** for API status
2. **Verify billing** is set up correctly
3. **Check API quotas** and usage
4. **Review error logs** in your application
5. **Test with a simple request** first

---

**🎉 Once set up, your Londa Rides API will have powerful location-based features!**
