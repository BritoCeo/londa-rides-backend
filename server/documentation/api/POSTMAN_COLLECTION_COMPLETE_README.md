# Londa Rides - Complete API Collection

This Postman collection contains all the APIs for the Londa Rides application, including authentication, user management, driver management, ride booking, subscriptions, payments, and analytics.

## 📋 Collection Overview

### **Environment Variables**
The collection uses the following variables that you need to set:

- `base_url`: `http://localhost:8000/api/v1`
- `user_token`: JWT token for authenticated user requests
- `driver_token`: JWT token for authenticated driver requests
- `user_id`: User ID from OTP verification response
- `driver_id`: Driver ID from OTP verification response
- `ride_id`: Ride ID from ride creation response

## 🔐 Authentication Flow

### **1. Unified OTP Login**
```bash
POST /api/v1/otp-login
{
  "phone_number": "+264813442539",
  "userType": "user" // or "driver"
}
```

### **2. Verify OTP**
```bash
# For Users
POST /api/v1/verify-otp
{
  "phone_number": "+264813442539",
  "otp": "123456",
  "sessionInfo": "session_xxx"
}

# For Drivers
POST /api/v1/driver/verify-otp
{
  "phone_number": "+264813442540",
  "otp": "123456",
  "sessionInfo": "session_xxx"
}
```

### **3. Refresh Token (When Token Expires)**
```bash
POST /api/v1/refresh-token
{
  "user_id": "GD7miVR4Nmep37g9vcUt",
  "userType": "user" // or "driver"
}
```

## 📱 API Categories

### **1. Authentication APIs**
- **Unified OTP Login**: Send OTP to phone number
- **Verify OTP - User**: Verify OTP for users
- **Verify OTP - Driver**: Verify OTP for drivers
- **Refresh Token**: Generate new access token
- **Get Current User**: Get authenticated user data

### **2. User Management APIs**
- **Create User Account**: Create new user account
- **Update User Profile**: Update user information

### **3. Driver Management APIs**
- **Create Driver Account**: Create new driver account
- **Send Driver OTP**: Send OTP to driver phone
- **Get Driver Data**: Get authenticated driver data

### **4. Ride Booking APIs**
- **Request Ride**: Create new ride request
- **Get User Rides**: Get user's ride history
- **Get Nearby Drivers**: Find drivers near location
- **Cancel Ride**: Cancel a ride request
- **Rate Ride**: Rate a completed ride

### **5. Driver Subscription APIs**
- **Create Driver Subscription**: Create monthly subscription
- **Get Current Driver Subscription**: Get current subscription status
- **Get Driver Subscription by ID**: Get specific subscription
- **Update Driver Subscription**: Update subscription settings
- **Process Subscription Payment**: Process payment for subscription
- **Get Driver Subscription History**: Get subscription history

### **6. Payment APIs**
- **Calculate Fare**: Calculate ride fare
- **Process Payment**: Process ride payment
- **Get Payment History**: Get user payment history
- **Subscribe Monthly**: Subscribe to monthly package

### **7. Location & Tracking APIs**
- **Update User Location**: Update user's current location
- **Update Driver Location**: Update driver's current location
- **Get Ride Status**: Get current ride status
- **Track Ride**: Track ride in real-time

### **8. Notification APIs**
- **Send Notification**: Send notification to user
- **Get Notifications**: Get user notifications
- **Mark Notification as Read**: Mark notification as read

### **9. Analytics APIs**
- **Get User Analytics**: Get user ride analytics
- **Get Performance Analytics**: Get user performance data
- **Get Driver Earnings**: Get driver earnings data
- **Get Driver Ride Analytics**: Get driver ride statistics
- **Get Driver Performance Analytics**: Get driver performance data

## 🚀 Quick Start Guide

### **Step 1: Set Up Environment**
1. Import the collection into Postman
2. Set the `base_url` variable to `http://localhost:8000/api/v1`
3. Start your server: `npm run dev`

### **Step 2: User Authentication**
1. Call **Unified OTP Login** with your phone number
2. Copy the `sessionInfo` from the response
3. Call **Verify OTP - User** with the OTP and sessionInfo
4. Copy the `token` and `user.id` from the response
5. Set `user_token` and `user_id` variables

### **Step 3: Driver Authentication**
1. Call **Create Driver Account** to create a driver
2. Call **Send Driver OTP** with the driver's phone number
3. Call **Verify OTP - Driver** with the OTP and sessionInfo
4. Copy the `token` and `driver.id` from the response
5. Set `driver_token` and `driver_id` variables

### **Step 4: Test Ride Booking**
1. Call **Request Ride** with user_id and location data
2. Copy the `ride_id` from the response
3. Test other ride-related APIs

### **Step 5: Test Driver Subscription**
1. Call **Create Driver Subscription** with driver_id
2. Test subscription management APIs

## 📝 Request Examples

### **Request Ride Example**
```json
{
  "user_id": "GD7miVR4Nmep37g9vcUt",
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
  "estimated_fare": 13.00,
  "passengerCount": 1
}
```

### **Driver Subscription Example**
```json
{
  "driver_id": "mcQmsCL6IkaecRB2q7D1",
  "payment_method": "cash"
}
```

### **Refresh Token Example**
```json
{
  "user_id": "GD7miVR4Nmep37g9vcUt",
  "userType": "user"
}
```

## 🔧 Troubleshooting

### **Common Issues:**

1. **"Invalid token"**: Use the refresh token API to get a new token
2. **"User not found"**: Make sure you're using the correct user_id
3. **"Driver not authenticated"**: Ensure you're using driver_token for driver APIs
4. **"Missing required fields"**: Check that all required fields are included in the request body

### **Token Management:**
- User tokens are for user APIs
- Driver tokens are for driver APIs
- Use refresh token API when tokens expire
- Store user_id and driver_id for token refresh

## 📊 Response Formats

### **Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### **Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "message": "Detailed error message"
  }
}
```

## 🌍 Namibian Phone Numbers
All examples use Namibian phone numbers in the format `+264XXXXXXXXX`. Update the phone numbers in the requests to match your test data.

## 💰 Payment Methods
The system currently supports **cash-only** payments. All payment_method fields should be set to "cash".

## 📅 Date Formats
Driver subscription APIs return dates in ISO 8601 format: `YYYYMMDDTHHMMSS+0000`

Example: `"startDate": "20251020T213810+0000"`

---

**Note**: This collection includes all the APIs we've implemented and tested. Make sure your server is running on `http://localhost:8000` before testing the APIs.
