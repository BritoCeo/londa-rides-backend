# Londa Rides API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### User Service

#### Create User
```
POST /users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "userType": "STUDENT"
}
```

#### Get User by ID
```
GET /users/:id
```

#### Update User
```
PUT /users/:id
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

### Driver Service

#### Create Driver
```
POST /drivers
Content-Type: application/json

{
  "name": "Driver Name",
  "phoneNumber": "+1234567890",
  "email": "driver@example.com",
  "vehicleType": "Car",
  "registrationNumber": "ABC123"
}
```

### Auth Service

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "phoneNumber": "+1234567890",
  "password": "password123",
  "type": "user"
}
```

#### Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

### Ride Service

#### Create Ride
```
POST /rides
Content-Type: application/json

{
  "userId": "user123",
  "pickupLocation": {
    "latitude": -22.5700,
    "longitude": 17.0836,
    "name": "Pickup Address"
  },
  "dropoffLocation": {
    "latitude": -22.5800,
    "longitude": 17.0900,
    "name": "Dropoff Address"
  },
  "fare": 13.00
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

