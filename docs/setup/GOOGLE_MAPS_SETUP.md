# 🗺️ Google Maps API Integration Setup

## Prerequisites

1. **Google Cloud Console Account**
2. **Google Maps API Key**
3. **Required APIs enabled**

## Step 1: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Geocoding API**
   - **Distance Matrix API**
   - **Directions API**
   - **Places API**

4. Create credentials (API Key)
5. Restrict the API key to your domain/IP for security

## Step 2: Environment Variables

Add to your `.env` file:

```env
# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here
```

## Step 3: API Features Available

### 🎯 **Geocoding**
- Convert addresses to coordinates
- Convert coordinates to addresses

### 📏 **Distance & Duration**
- Calculate travel distance
- Calculate travel time
- Multiple travel modes (driving, walking, transit)

### 🗺️ **Directions**
- Turn-by-turn directions
- Route optimization
- Traffic-aware routing

### 🏪 **Places**
- Find nearby establishments
- Search for specific places
- Get place details

### 💰 **Fare Calculation**
- Distance-based pricing
- Time-based pricing
- Dynamic fare calculation

## Step 4: Usage Examples

### Geocoding an Address
```javascript
const location = await googleMapsService.geocodeAddress("Windhoek, Namibia");
// Returns: { latitude: -22.5609, longitude: 17.0658, formatted_address: "..." }
```

### Calculate Distance
```javascript
const distance = await googleMapsService.calculateDistance(
  { latitude: -22.5609, longitude: 17.0658 },
  { latitude: -22.5709, longitude: 17.0758 }
);
// Returns: { distance: 1500, duration: 300, distance_text: "1.5 km", duration_text: "5 mins" }
```

### Calculate Fare
```javascript
const fare = googleMapsService.calculateFare(1500, 300);
// Returns: { base_fare: 13.00, distance_fare: 3.75, time_fare: 1.50, total_fare: 18.25 }
```

## Step 5: Security Best Practices

1. **Restrict API Key**: Limit to specific domains/IPs
2. **Enable Billing Alerts**: Set up usage alerts
3. **Monitor Usage**: Check API usage regularly
4. **Rate Limiting**: Implement rate limiting in your app

## Step 6: Cost Optimization

- **Caching**: Cache geocoding results
- **Batch Requests**: Use batch geocoding when possible
- **Smart Caching**: Cache directions for common routes
- **Usage Monitoring**: Track API usage and costs
