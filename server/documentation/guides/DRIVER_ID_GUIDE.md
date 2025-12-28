# 🚗 Driver ID Guide - How to Get Driver ID for Subscription

## 📋 **How to Get Driver ID**

### **Method 1: Complete Driver Registration Flow** (Recommended)

#### **Step 1: Send OTP to Driver Phone**
```bash
POST /api/v1/driver/send-otp
Content-Type: application/json

{
  "phone_number": "+264813442530"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully (Firebase Development mode)",
  "sessionInfo": "session_123456789"
}
```

#### **Step 2: Verify OTP**
```bash
POST /api/v1/driver/verify-otp
Content-Type: application/json

{
  "phone_number": "+264813442530",
  "otp": "1234",
  "sessionInfo": "session_123456789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "driver": {
      "id": "driver_abc123xyz",
      "phone_number": "+264813442530",
      "isVerified": true
    }
  }
}
```

#### **Step 3: Complete Driver Registration**
```bash
POST /api/v1/driver/registration-driver
Content-Type: application/json

{
  "otp": "1234",
  "token": "jwt_token_from_step2"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Driver registered successfully",
  "data": {
    "driver": {
      "id": "driver_abc123xyz",
      "name": "John Driver",
      "phone_number": "+264813442530",
      "email": "john@example.com",
      "license_number": "DL123456789",
      "vehicle_type": "Car",
      "vehicle_model": "Toyota Corolla",
      "vehicle_year": 2020,
      "vehicle_color": "White",
      "vehicle_plate": "NA12345",
      "isVerified": true
    }
  }
}
```

#### **Step 4: Use Driver ID for Subscription**
```bash
POST /api/v1/driver/subscription
Content-Type: application/json
Authorization: Bearer YOUR_AUTH_TOKEN

{
  "driver_id": "driver_abc123xyz",
  "payment_method": "cash"
}
```

### **Method 2: Direct Driver Creation** (For Testing)

If you need a driver ID for testing purposes, you can create one directly:

```bash
POST /api/v1/create-account
Content-Type: application/json

{
  "name": "Test Driver",
  "email": "driver@example.com",
  "phone_number": "+264813442530",
  "userType": "driver"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User account created successfully",
  "data": {
    "user": {
      "id": "user_abc123xyz",
      "name": "Test Driver",
      "email": "driver@example.com",
      "phone_number": "+264813442530",
      "userType": "driver",
      "isVerified": false
    }
  }
}
```

Then use the user ID as the driver ID:
```bash
POST /api/v1/driver/subscription
Content-Type: application/json

{
  "driver_id": "user_abc123xyz",
  "payment_method": "cash"
}
```

## 🔧 **Available Driver Endpoints**

### **Driver Registration:**
- ✅ `POST /api/v1/driver/send-otp` - Send OTP to driver phone
- ✅ `POST /api/v1/driver/verify-otp` - Verify OTP for registration
- ✅ `POST /api/v1/driver/registration-driver` - Complete driver registration

### **Driver Subscription:**
- ✅ `POST /api/v1/driver/subscription` - Create driver subscription
- ✅ `GET /api/v1/driver/subscription/{driver_id}` - Get subscription status
- ✅ `PUT /api/v1/driver/subscription/{driver_id}` - Update subscription
- ✅ `POST /api/v1/driver/subscription/payment` - Process subscription payment
- ✅ `GET /api/v1/driver/subscription/history/{driver_id}` - Get subscription history

### **Driver Management:**
- ✅ `GET /api/v1/driver/me` - Get driver profile (requires auth)
- ✅ `PUT /api/v1/driver/update-status` - Update driver status (requires auth)
- ✅ `GET /api/v1/driver/available-rides` - Get available rides (requires auth)

## 🧪 **Testing with Postman**

### **1. Import Collection**
Import the `Londa_Rides_API_Collection.postman_collection.json` file into Postman.

### **2. Set Variables**
- `base_url`: `http://localhost:8000`
- `driver_id`: Will be set automatically after driver creation

### **3. Test Flow**
1. **Send Driver OTP**: `POST /api/v1/driver/send-otp`
2. **Verify Driver OTP**: `POST /api/v1/driver/verify-otp`
3. **Complete Registration**: `POST /api/v1/driver/registration-driver`
4. **Create Subscription**: `POST /api/v1/driver/subscription`

## 🎯 **Quick Test Commands**

### **Using curl:**
```bash
# Step 1: Send OTP
curl -X POST http://localhost:8000/api/v1/driver/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+264813442530"}'

# Step 2: Verify OTP (use sessionInfo from step 1)
curl -X POST http://localhost:8000/api/v1/driver/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone_number": "+264813442530", "otp": "1234", "sessionInfo": "session_123456789"}'

# Step 3: Create subscription (use driver_id from step 2)
curl -X POST http://localhost:8000/api/v1/driver/subscription \
  -H "Content-Type: application/json" \
  -d '{"driver_id": "driver_abc123xyz", "payment_method": "cash"}'
```

## 🚨 **Common Issues**

### **1. "Route not found"**
- ✅ Use correct endpoint: `/api/v1/driver/send-otp` (not `/registration`)
- ✅ Check server is running on port 8000

### **2. "Invalid session"**
- ✅ Include `sessionInfo` from OTP response
- ✅ Use the same phone number in both requests

### **3. "Bearer token invalid"**
- ✅ Complete the full registration flow
- ✅ Use the driver ID from registration response

## 🎉 **Result**

Once you complete the driver registration flow, you'll get a `driver_id` that you can use for the subscription endpoint:

```json
{
  "driver_id": "driver_abc123xyz",
  "payment_method": "cash"
}
```

The driver ID is generated during the registration process and is unique for each driver! 🚀
