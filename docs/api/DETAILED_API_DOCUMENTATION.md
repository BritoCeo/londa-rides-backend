# Londa Rides API - Detailed Documentation

## Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [Request/Response Format](#requestresponse-format)
4. [Error Handling](#error-handling)
5. [User Service APIs](#user-service-apis)
6. [Auth Service APIs](#auth-service-apis)
7. [Driver Service APIs](#driver-service-apis)
8. [Ride Service APIs](#ride-service-apis)
9. [Health Check APIs](#health-check-apis)

---

## Overview

The Londa Rides API is a RESTful API built with microservices architecture. All API requests go through the **API Gateway on port 8000**, which routes requests to the appropriate microservice.

### API Gateway Routes

- `/api/v1/users/*` → User Service (Port 8002)
- `/api/v1/auth/*` → Auth Service (Port 8001)
- `/api/v1/drivers/*` → Driver Service (Port 8003)
- `/api/v1/rides/*` → Ride Service (Port 8004)

---

## Base URL & Authentication

### Base URL

```
Development: http://localhost:8000/api/v1
Production:  https://api.londarides.com/api/v1
```

### Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Note**: Currently, authentication is handled at the service level. Future implementation will include gateway-level authentication.

---

## Request/Response Format

### Request Format

All requests should include:
- **Content-Type**: `application/json`
- **Authorization**: `Bearer <token>` (for protected endpoints)

### Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error details
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |
| 504 | Gateway Timeout | Service did not respond in time |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Input validation failed |
| `NOT_FOUND` | Resource not found |
| `ALREADY_EXISTS` | Resource already exists |
| `UNAUTHORIZED` | Authentication failed |
| `FORBIDDEN` | Insufficient permissions |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Service unavailable |
| `GATEWAY_TIMEOUT` | Gateway timeout |

---

## User Service APIs

**Base Path**: `/api/v1/users`

### 1. Create User

Creates a new user account.

**Endpoint**: `POST /api/v1/users`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+264813442539",
  "userType": "STUDENT",
  "password": "securePassword123"
}
```

**Request Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | User's full name |
| `email` | string | No | User's email address |
| `phoneNumber` | string | **Yes** | User's phone number (must be valid format) |
| `userType` | enum | No | User type: `STUDENT`, `PARENT`, `DRIVER` (default: `STUDENT`) |
| `password` | string | No | User's password (for authentication) |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "usr_1234567890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+264813442539",
    "userType": "STUDENT",
    "isVerified": false,
    "ratings": 0,
    "totalRides": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
  ```json
  {
    "success": false,
    "message": "Phone number is required",
    "code": "VALIDATION_ERROR"
  }
  ```
- `409 Conflict`: User already exists
  ```json
  {
    "success": false,
    "message": "User with phone number +264813442539 already exists",
    "code": "ALREADY_EXISTS",
    "details": {
      "field": "phoneNumber",
      "value": "+264813442539"
    }
  }
  ```

---

### 2. Get User by ID

Retrieves a user by their unique ID.

**Endpoint**: `GET /api/v1/users/:id`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Yes** | User's unique identifier |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "usr_1234567890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+264813442539",
    "userType": "STUDENT",
    "isVerified": false,
    "ratings": 0,
    "totalRides": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found
  ```json
  {
    "success": false,
    "message": "User with id usr_1234567890 not found",
    "code": "NOT_FOUND"
  }
  ```

---

### 3. Get User by Phone Number

Retrieves a user by their phone number.

**Endpoint**: `GET /api/v1/users/phone/:phoneNumber`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `phoneNumber` | string | **Yes** | User's phone number |

**Example**: `GET /api/v1/users/phone/+264813442539`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "usr_1234567890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phoneNumber": "+264813442539",
    "userType": "STUDENT",
    "isVerified": false,
    "ratings": 0,
    "totalRides": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found

---

### 4. Update User

Updates an existing user's information.

**Endpoint**: `PUT /api/v1/users/:id`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Yes** | User's unique identifier |

**Request Body**:
```json
{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

**Request Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated name |
| `email` | string | No | Updated email (must be unique if changed) |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "usr_1234567890",
    "name": "John Updated",
    "email": "john.updated@example.com",
    "phoneNumber": "+264813442539",
    "userType": "STUDENT",
    "isVerified": false,
    "ratings": 0,
    "totalRides": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z"
  },
  "timestamp": "2024-01-01T01:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found
- `409 Conflict`: Email already exists

---

### 5. Delete User

Deletes a user account.

**Endpoint**: `DELETE /api/v1/users/:id`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Yes** | User's unique identifier |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "User deleted successfully",
  "data": null,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: User not found

---

### 6. Get All Users

Retrieves a paginated list of all users.

**Endpoint**: `GET /api/v1/users`

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | number | No | 10 | Maximum number of users to return |
| `offset` | number | No | 0 | Number of users to skip |

**Example**: `GET /api/v1/users?limit=20&offset=0`

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "users": [
      {
        "id": "usr_1234567890",
        "name": "John Doe",
        "email": "john.doe@example.com",
        "phoneNumber": "+264813442539",
        "userType": "STUDENT",
        "isVerified": false,
        "ratings": 0,
        "totalRides": 0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
      // ... more users
    ],
    "count": 20,
    "limit": 20,
    "offset": 0
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Auth Service APIs

**Base Path**: `/api/v1/auth`

### 1. Login

Authenticates a user and returns JWT tokens.

**Endpoint**: `POST /api/v1/auth/login`

**Request Body**:
```json
{
  "phoneNumber": "+264813442539",
  "password": "securePassword123",
  "type": "user"
}
```

**Request Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phoneNumber` | string | **Yes** | User's phone number |
| `password` | string | **Yes** | User's password |
| `type` | string | **Yes** | User type: `user` or `driver` |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h",
    "user": {
      "id": "usr_1234567890",
      "phoneNumber": "+264813442539",
      "type": "user"
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "success": false,
    "message": "Invalid phone number or password",
    "code": "UNAUTHORIZED"
  }
  ```

---

### 2. Refresh Token

Refreshes an access token using a refresh token.

**Endpoint**: `POST /api/v1/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `refreshToken` | string | **Yes** | Valid refresh token |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Invalid or expired refresh token

---

## Driver Service APIs

**Base Path**: `/api/v1/drivers`

### 1. Create Driver

Creates a new driver account.

**Endpoint**: `POST /api/v1/drivers`

**Request Body**:
```json
{
  "name": "Driver Name",
  "phoneNumber": "+264813442539",
  "email": "driver@example.com",
  "vehicleType": "CAR",
  "registrationNumber": "ABC123"
}
```

**Request Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | **Yes** | Driver's full name |
| `phoneNumber` | string | **Yes** | Driver's phone number |
| `email` | string | No | Driver's email address |
| `vehicleType` | enum | No | Vehicle type: `CAR`, `SUV`, `VAN` (default: `CAR`) |
| `registrationNumber` | string | No | Vehicle registration number |

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Driver created",
  "data": {
    "id": "drv_1234567890",
    "name": "Driver Name",
    "phoneNumber": "+264813442539",
    "email": "driver@example.com",
    "vehicleType": "CAR",
    "registrationNumber": "ABC123",
    "status": "AVAILABLE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Driver already exists

---

### 2. Get Driver by ID

Retrieves a driver by their unique ID.

**Endpoint**: `GET /api/v1/drivers/:id`

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | **Yes** | Driver's unique identifier |

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "id": "drv_1234567890",
    "name": "Driver Name",
    "phoneNumber": "+264813442539",
    "email": "driver@example.com",
    "vehicleType": "CAR",
    "registrationNumber": "ABC123",
    "status": "AVAILABLE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Responses**:
- `404 Not Found`: Driver not found

---

## Ride Service APIs

**Base Path**: `/api/v1/rides`

**Note**: The Ride Service is currently partially implemented. The service layer exists, but routes and controllers are not yet implemented. The following APIs are planned:

### Planned Endpoints

#### 1. Create Ride

**Endpoint**: `POST /api/v1/rides`

**Request Body** (Planned):
```json
{
  "userId": "usr_1234567890",
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
  "fare": 13.00,
  "scheduledTime": "2024-01-01T10:00:00.000Z",
  "passengerCount": 1,
  "vehicleType": "CAR"
}
```

#### 2. Get Ride by ID

**Endpoint**: `GET /api/v1/rides/:id`

#### 3. Accept Ride

**Endpoint**: `POST /api/v1/rides/:id/accept`

**Request Body**:
```json
{
  "driverId": "drv_1234567890"
}
```

#### 4. Start Ride

**Endpoint**: `POST /api/v1/rides/:id/start`

#### 5. Complete Ride

**Endpoint**: `POST /api/v1/rides/:id/complete`

---

## Health Check APIs

### API Gateway Health Check

**Endpoint**: `GET /health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Service Health Checks

Each service has its own health check endpoint (internal only):

- Auth Service: `http://localhost:8001/health`
- User Service: `http://localhost:8002/health`
- Driver Service: `http://localhost:8003/health`
- Ride Service: `http://localhost:8004/health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "service": "user-service",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Data Models

### User Model

```typescript
{
  id: string;                    // Unique identifier (e.g., "usr_1234567890")
  name: string | null;           // User's full name
  email: string | null;          // User's email address
  phoneNumber: string;           // User's phone number (required)
  userType: UserType;            // STUDENT | PARENT | DRIVER
  isVerified: boolean;           // Account verification status
  ratings: number;               // Average rating
  totalRides: number;            // Total number of rides
  notificationToken: string | null; // Push notification token
  createdAt: Date;               // Account creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### Driver Model

```typescript
{
  id: string;                    // Unique identifier
  name: string;                  // Driver's full name
  phoneNumber: string;           // Driver's phone number
  email: string | null;          // Driver's email
  vehicleType: VehicleType;      // CAR | SUV | VAN
  registrationNumber: string | null; // Vehicle registration
  status: DriverStatus;          // AVAILABLE | BUSY | OFFLINE
  createdAt: Date;
  updatedAt: Date;
}
```

### Ride Model

```typescript
{
  id: string;                    // Unique identifier
  userId: string;                // User who requested the ride
  driverId: string | null;       // Driver assigned to the ride
  childId: string | null;        // Child ID (for parent rides)
  pickupLocation: ILocation;     // Pickup location
  dropoffLocation: ILocation;    // Dropoff location
  fare: number;                  // Ride fare
  status: RideStatus;            // PENDING | ACCEPTED | IN_PROGRESS | COMPLETED | CANCELLED
  rating: number | null;         // Ride rating
  review: string | null;         // Ride review
  scheduledTime: Date | null;    // Scheduled ride time
  passengerCount: number;        // Number of passengers
  vehicleType: string;           // Vehicle type required
  createdAt: Date;
  updatedAt: Date;
}
```

### Location Model

```typescript
{
  latitude: number;              // Latitude coordinate
  longitude: number;             // Longitude coordinate
  name: string | null;           // Location name/address
}
```

---

## Rate Limiting

**Note**: Rate limiting is planned for future implementation. Currently, there are no rate limits on API endpoints.

---

## Versioning

The API uses URL versioning:
- Current version: `v1`
- Base path: `/api/v1`

Future versions will be added as:
- `/api/v2`
- `/api/v3`
- etc.

---

## Testing

### Using Postman

A Postman collection is available at:
- Collection: `Londa_Rides_Microservices.postman_collection.json`
- Environment: `Londa_Rides_Local.postman_environment.json`

See [POSTMAN_COLLECTION_README.md](./POSTMAN_COLLECTION_README.md) for details.

### Example cURL Requests

#### Create User
```bash
curl -X POST http://localhost:8000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+264813442539",
    "userType": "STUDENT"
  }'
```

#### Get User by ID
```bash
curl -X GET http://localhost:8000/api/v1/users/usr_1234567890
```

#### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+264813442539",
    "password": "securePassword123",
    "type": "user"
  }'
```

---

## Support

For issues or questions:
1. Check the [Architecture Documentation](../architecture/DETAILED_ARCHITECTURE.md)
2. Review the [Setup Guide](../setup/SETUP_AND_RUN_GUIDE.md)
3. Check service logs for detailed error messages

---

**Last Updated**: December 2024
**API Version**: v1

