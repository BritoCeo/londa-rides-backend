# 🚀 Londa Rides API Endpoints Documentation

## 📋 Overview

This document provides comprehensive documentation for all API endpoints in the Londa Rides application. The API is built with Express.js and uses Firebase Firestore as the database.

## 🔗 Base URL
```
http://localhost:8000/api/v1
```

## 🔐 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## 📚 API Categories

### 1. 🚗 User Ride Booking APIs
### 2. 👨‍💼 Driver Ride Management APIs  
### 3. 📍 Real-time Location APIs
### 4. 💳 Payment APIs
### 5. 🔔 Notification APIs
### 6. 👤 Profile Management APIs
### 7. 📊 Analytics APIs

---

## 🚗 User Ride Booking APIs

### POST /request-ride
Create a new ride request.

**Request Body:**
```json
{
  "user_id": "string",
  "pickup_location": {
    "latitude": "number",
    "longitude": "number",
    "address": "string"
  },
  "dropoff_location": {
    "latitude": "number", 
    "longitude": "number",
    "address": "string"
  },
  "ride_type": "standard|premium|xl|pool",
  "estimated_fare": "number"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride request created successfully",
  "data": {
    "ride_id": "string",
    "user_id": "string",
    "pickup_location": "object",
    "dropoff_location": "object",
    "ride_type": "string",
    "estimated_fare": "number",
    "status": "pending",
    "created_at": "datetime"
  }
}
```

### GET /nearby-drivers
Find available drivers near user location.

**Query Parameters:**
- `latitude` (required): User latitude
- `longitude` (required): User longitude  
- `radius` (optional): Search radius in km (default: 5)

**Response:**
```json
{
  "success": true,
  "message": "Nearby drivers retrieved successfully",
  "data": {
    "drivers": [
      {
        "id": "string",
        "name": "string",
        "phone_number": "string",
        "vehicle_type": "string",
        "location": {
          "latitude": "number",
          "longitude": "number"
        },
        "rating": "number"
      }
    ],
    "count": "number"
  }
}
```

### POST /cancel-ride
Cancel an existing ride request.

**Request Body:**
```json
{
  "ride_id": "string",
  "user_id": "string", 
  "reason": "string"
}
```

### PUT /rate-ride
Rate a completed ride.

**Request Body:**
```json
{
  "ride_id": "string",
  "user_id": "string",
  "rating": "number (1-5)",
  "review": "string"
}
```

---

## 👨‍💼 Driver Ride Management APIs

### GET /driver/available-rides
Get pending ride requests for drivers.

**Query Parameters:**
- `driver_id` (required): Driver ID

**Response:**
```json
{
  "success": true,
  "message": "Available rides retrieved successfully", 
  "data": {
    "rides": [
      {
        "id": "string",
        "user_id": "string",
        "pickup_location": "object",
        "dropoff_location": "object",
        "fare": "number",
        "status": "pending"
      }
    ],
    "count": "number"
  }
}
```

### POST /driver/accept-ride
Accept a ride request.

**Request Body:**
```json
{
  "ride_id": "string",
  "driver_id": "string"
}
```

### POST /driver/decline-ride
Decline a ride request.

**Request Body:**
```json
{
  "ride_id": "string",
  "driver_id": "string",
  "reason": "string"
}
```

### POST /driver/start-ride
Start a ride (pickup).

**Request Body:**
```json
{
  "ride_id": "string",
  "driver_id": "string"
}
```

### POST /driver/complete-ride
Complete a ride (dropoff).

**Request Body:**
```json
{
  "ride_id": "string",
  "driver_id": "string",
  "final_fare": "number"
}
```

---

## 📍 Real-time Location APIs

### POST /update-location
Update driver or user location.

**Request Body:**
```json
{
  "user_id": "string (optional)",
  "driver_id": "string (optional)",
  "latitude": "number",
  "longitude": "number",
  "type": "user|driver"
}
```

### GET /ride-status/{rideId}
Get current ride status and locations.

**Response:**
```json
{
  "success": true,
  "message": "Ride status retrieved successfully",
  "data": {
    "ride": {
      "id": "string",
      "status": "string",
      "user_id": "string",
      "driver_id": "string",
      "pickup_location": "object",
      "dropoff_location": "object"
    },
    "driver_location": {
      "latitude": "number",
      "longitude": "number"
    }
  }
}
```

### POST /ride-tracking
Get real-time ride tracking data.

**Request Body:**
```json
{
  "ride_id": "string",
  "user_id": "string (optional)",
  "driver_id": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Ride tracking data retrieved successfully",
  "data": {
    "ride": "object",
    "user_location": "object",
    "driver_location": "object", 
    "distance_km": "number"
  }
}
```

---

## 💳 Payment APIs

### POST /payment/calculate-fare
Calculate ride fare based on distance and ride type.

**Request Body:**
```json
{
  "pickup_location": {
    "latitude": "number",
    "longitude": "number"
  },
  "dropoff_location": {
    "latitude": "number",
    "longitude": "number"
  },
  "ride_type": "standard|premium|xl|pool",
  "distance_km": "number (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Fare calculated successfully",
  "data": {
    "base_fare": "number",
    "distance_km": "number",
    "per_km_rate": "number",
    "surge_multiplier": "number",
    "total_fare": "number",
    "currency": "USD"
  }
}
```

### POST /payment/process
Process payment for a completed ride.

**Request Body:**
```json
{
  "ride_id": "string",
  "user_id": "string",
  "amount": "number",
  "payment_method": "card|cash|wallet",
  "payment_token": "string"
}
```

### GET /payment/history
Get payment history for a user.

**Query Parameters:**
- `user_id` (required): User ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

---

## 🔔 Notification APIs

### POST /notifications/send
Send push notification to user or driver.

**Request Body:**
```json
{
  "recipient_id": "string",
  "recipient_type": "user|driver",
  "title": "string",
  "message": "string",
  "data": "object (optional)",
  "type": "general|ride|payment|system"
}
```

### GET /notifications
Get notification history.

**Query Parameters:**
- `recipient_id` (required): Recipient ID
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unread_only` (optional): Filter unread only (default: false)

### PUT /notifications/read
Mark notification as read.

**Request Body:**
```json
{
  "notification_id": "string",
  "recipient_id": "string"
}
```

---

## 👤 Profile Management APIs

### PUT /update-profile
Update user or driver profile.

**Request Body:**
```json
{
  "user_id": "string (optional)",
  "driver_id": "string (optional)",
  "profile_data": {
    "name": "string",
    "email": "string",
    "phone_number": "string",
    "profile_picture": "string"
  }
}
```

### POST /upload-document
Upload driver documents.

**Request Body:**
```json
{
  "driver_id": "string",
  "document_type": "license|insurance|registration|background_check|vehicle_inspection",
  "document_data": "object (optional)",
  "file_url": "string (optional)"
}
```

### GET /documents
Get uploaded documents for a driver.

**Query Parameters:**
- `driver_id` (required): Driver ID
- `document_type` (optional): Document type filter
- `status` (optional): Document status filter

---

## 📊 Analytics APIs

### GET /analytics/earnings
Get driver earnings analytics.

**Query Parameters:**
- `driver_id` (required): Driver ID
- `period` (optional): week|month|year (default: week)
- `start_date` (optional): Start date (YYYY-MM-DD)
- `end_date` (optional): End date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "message": "Driver earnings retrieved successfully",
  "data": {
    "totalRides": "number",
    "completedRides": "number",
    "cancelledRides": "number",
    "pendingRides": "number",
    "completionRate": "number",
    "totalEarnings": "number",
    "period": "string"
  }
}
```

### GET /analytics/rides
Get ride statistics for user or driver.

**Query Parameters:**
- `user_id` (optional): User ID
- `driver_id` (optional): Driver ID
- `period` (optional): week|month|year (default: week)
- `start_date` (optional): Start date
- `end_date` (optional): End date

### GET /analytics/performance
Get driver performance metrics.

**Query Parameters:**
- `driver_id` (required): Driver ID
- `period` (optional): week|month|year (default: week)
- `start_date` (optional): Start date
- `end_date` (optional): End date

**Response:**
```json
{
  "success": true,
  "message": "Performance metrics retrieved successfully",
  "data": {
    "totalRides": "number",
    "completedRides": "number",
    "averageRating": "number",
    "completionRate": "number",
    "period": "string"
  }
}
```

---

## 🧪 Testing

### Run All Tests
```bash
npm run test
```

### Run Specific Test Categories
```bash
npm run test:api          # Basic API tests
npm run test:user         # User API tests
npm run test:driver       # Driver API tests
npm run test:ride         # Ride API tests
npm run test:payment      # Payment API tests
npm run test:location     # Location API tests
npm run test:notification # Notification API tests
npm run test:analytics    # Analytics API tests
npm run test:integration  # Integration tests
npm run test:firestore    # Firestore connection tests
```

---

## 📝 Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔧 Development

### Server Setup
```bash
npm install
npm run dev
```

### Database
- **Production**: Firebase Firestore
- **Development**: Mock database (when Firestore not configured)

### Environment Variables
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_KEY=./service-account-key.json
NODE_ENV=development
```

---

## 📞 Support

For API support and questions, please refer to the test files in the `/test` directory or check the server logs for detailed error information.
