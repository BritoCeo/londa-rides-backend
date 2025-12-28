# 🚀 Londa Rides API Collection - Postman Testing Guide

## 📋 Overview

This Postman collection contains all the APIs for the Londa Rides CC platform, including the newly implemented **Driver Subscription Management APIs**. The collection is organized into logical groups for easy testing and development.

## 🔧 Setup Instructions

### 1. **Import the Collection**
1. Open Postman
2. Click "Import" button
3. Select the `Londa_Rides_API_Collection.postman_collection.json` file
4. The collection will be imported with all APIs organized

### 2. **Environment Variables**
The collection uses the following variables:
- `base_url`: `http://localhost:8000` (default)
- `auth_token`: JWT token for authentication
- `user_id`: User ID for testing
- `driver_id`: Driver ID for testing
- `ride_id`: Ride ID for testing

### 3. **Server Setup**
Make sure the Londa Rides server is running:
```bash
cd server
npm run dev
```

## 📚 API Categories

### 🏥 **Health & Status**
- **Health Check**: `GET /health` - Server health status
- **API Test**: `GET /test` - Basic API functionality test

### 🔐 **Authentication**
- **Register User**: `POST /api/v1/registration` - User registration with phone
- **Verify OTP**: `POST /api/v1/verify-otp` - OTP verification
- **Create Account**: `POST /api/v1/create-account` - Complete user account creation
- **Get Current User**: `GET /api/v1/me` - Get authenticated user data

### 🚗 **Driver Subscription Management** ⭐
- **Create Driver Subscription**: `POST /api/v1/driver/subscription` - Create NAD 150.00/month subscription
- **Get Driver Subscription**: `GET /api/v1/driver/subscription/{driver_id}` - Get subscription status
- **Update Driver Subscription**: `PUT /api/v1/driver/subscription/{driver_id}` - Update subscription settings
- **Process Subscription Payment**: `POST /api/v1/driver/subscription/payment` - Process payment
- **Get Subscription History**: `GET /api/v1/driver/subscription/history/{driver_id}` - Get payment history

### 🚖 **Ride Management**
- **Request Ride**: `POST /api/v1/request-ride` - Create ride request
- **Get Nearby Drivers**: `GET /api/v1/nearby-drivers` - Find available drivers
- **Cancel Ride**: `POST /api/v1/cancel-ride` - Cancel ride request
- **Rate Ride**: `PUT /api/v1/rate-ride` - Rate completed ride
- **Get Available Rides (Driver)**: `GET /api/v1/driver/available-rides/{driver_id}` - Get pending rides
- **Accept Ride**: `POST /api/v1/driver/accept-ride` - Accept ride request
- **Decline Ride**: `POST /api/v1/driver/decline-ride` - Decline ride request
- **Start Ride**: `POST /api/v1/driver/start-ride` - Start ride (pickup)
- **Complete Ride**: `POST /api/v1/driver/complete-ride` - Complete ride (dropoff)

### 💳 **Payment Management**
- **Calculate Fare**: `POST /api/v1/payment/calculate-fare` - Calculate ride fare
- **Process Payment**: `POST /api/v1/payment/process` - Process payment
- **Get Payment History**: `GET /api/v1/payment/history` - Get payment history

### 📍 **Location & Tracking**
- **Update Location**: `POST /api/v1/update-location` - Update user/driver location
- **Get Ride Status**: `GET /api/v1/ride-status/{ride_id}` - Get current ride status
- **Track Ride**: `POST /api/v1/ride-tracking` - Real-time ride tracking

### 🔔 **Notifications**
- **Send Notification**: `POST /api/v1/notifications/send` - Send push notification
- **Get Notifications**: `GET /api/v1/notifications` - Get notification history
- **Mark as Read**: `PUT /api/v1/notifications/read` - Mark notification as read

### 👤 **Profile Management**
- **Update Profile**: `PUT /api/v1/update-profile` - Update user profile
- **Upload Document**: `POST /api/v1/upload-document` - Upload driver documents
- **Get Documents**: `GET /api/v1/documents` - Get uploaded documents

### 📊 **Analytics & Reports**
- **Get Driver Earnings**: `GET /api/v1/analytics/earnings` - Driver earnings analytics
- **Get Ride Statistics**: `GET /api/v1/analytics/rides` - Ride statistics
- **Get Performance Metrics**: `GET /api/v1/analytics/performance` - Performance metrics

### 🚗 **Driver Management**
- **Register Driver**: `POST /api/v1/driver/registration` - Driver registration
- **Get Driver Profile**: `GET /api/v1/driver/profile/{driver_id}` - Get driver profile
- **Update Driver Status**: `PUT /api/v1/driver/status` - Update driver status

### 👥 **User Management**
- **Get User Rides**: `GET /api/v1/get-rides` - Get user's ride history
- **Subscribe Monthly**: `POST /api/v1/subscribe-monthly` - Monthly subscription (NAD 1000.00)
- **Get User Analytics**: `GET /api/v1/analytics/rides` - User analytics

## 🧪 Testing Workflow

### **1. Basic Setup**
1. Start the server: `npm run dev`
2. Test health: `GET /health`
3. Test API: `GET /test`

### **2. Authentication Flow**
1. **Register User**: `POST /api/v1/registration`
2. **Verify OTP**: `POST /api/v1/verify-otp`
3. **Create Account**: `POST /api/v1/create-account`
4. **Get Current User**: `GET /api/v1/me` (requires auth token)

### **3. Driver Subscription Flow** ⭐
1. **Create Driver Subscription**: `POST /api/v1/driver/subscription`
2. **Get Driver Subscription**: `GET /api/v1/driver/subscription/{driver_id}`
3. **Update Driver Subscription**: `PUT /api/v1/driver/subscription/{driver_id}`
4. **Process Payment**: `POST /api/v1/driver/subscription/payment`
5. **Get History**: `GET /api/v1/driver/subscription/history/{driver_id}`

### **4. Complete Ride Flow**
1. **Request Ride**: `POST /api/v1/request-ride`
2. **Get Nearby Drivers**: `GET /api/v1/nearby-drivers`
3. **Accept Ride**: `POST /api/v1/driver/accept-ride`
4. **Start Ride**: `POST /api/v1/driver/start-ride`
5. **Complete Ride**: `POST /api/v1/driver/complete-ride`
6. **Rate Ride**: `PUT /api/v1/rate-ride`

## 🔑 Authentication

Most APIs require authentication. The collection uses Bearer token authentication:

1. **Get Token**: After successful registration/login, the response will contain a `token`
2. **Set Token**: Copy the token and set it in the `auth_token` variable
3. **Auto-Authentication**: The collection automatically uses the token for authenticated requests

## 📝 Sample Data

### **User Registration**
```json
{
  "phone_number": "+264811234567"
}
```

### **Driver Subscription**
```json
{
  "driver_id": "driver_123",
  "payment_method": "card",
  "payment_token": "tok_test_123456789"
}
```

### **Ride Request**
```json
{
  "user_id": "user_123",
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
  "estimated_fare": 13.00
}
```

## 🎯 Business Rules Testing

### **Driver Subscription Rules**
- ✅ **Amount**: Must be exactly NAD 150.00
- ✅ **Payment Methods**: Card, Bank Transfer, Mobile Money
- ✅ **Duplicate Prevention**: Only one active subscription per driver
- ✅ **Status Management**: Active/Inactive driver status

### **Ride Rules**
- ✅ **Fare**: Fixed NAD 13.00 per ride
- ✅ **Status Flow**: pending → accepted → started → completed
- ✅ **Cancellation**: Available before ride starts
- ✅ **Rating**: Available after ride completion

## 🚨 Error Handling

The collection includes proper error handling for:
- **400 Bad Request**: Validation errors
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Access denied
- **404 Not Found**: Resource not found
- **409 Conflict**: Duplicate resources
- **500 Internal Server Error**: Server errors

## 📊 Response Examples

### **Success Response**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### **Error Response**
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

## 🔧 Environment Configuration

### **Development**
- `base_url`: `http://localhost:8000`
- `auth_token`: Set after login
- `user_id`: Set after user creation
- `driver_id`: Set after driver registration
- `ride_id`: Set after ride creation

### **Production**
- `base_url`: `https://api.londarides.com`
- Update all variables accordingly

## 📈 Testing Tips

1. **Start with Health Check**: Always test `/health` first
2. **Authentication First**: Complete auth flow before testing other APIs
3. **Driver Subscription**: Test the new subscription APIs thoroughly
4. **Complete Workflows**: Test end-to-end ride flows
5. **Error Scenarios**: Test with invalid data to verify error handling
6. **Performance**: Monitor response times during testing

## 🎉 Ready to Test!

The Postman collection is now ready for comprehensive testing of the Londa Rides CC platform. All APIs are organized, documented, and ready for use! 🚀
