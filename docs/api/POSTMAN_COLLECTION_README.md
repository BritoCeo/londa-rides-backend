# Postman Collection for Londa Rides Microservices

This directory contains Postman collections and environments for testing all Londa Rides microservices.

## Files

- **Londa_Rides_Microservices.postman_collection.json** - Complete API collection with all endpoints
- **Londa_Rides_Local.postman_environment.json** - Local development environment configuration

## Import Instructions

### 1. Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose `Londa_Rides_Microservices.postman_collection.json`
5. Click **Import**

### 2. Import Environment

1. In Postman, click the **Environments** icon (left sidebar)
2. Click **Import**
3. Choose `Londa_Rides_Local.postman_environment.json`
4. Click **Import**
5. Select the environment from the dropdown (top right) to activate it

## Collection Structure

The collection is organized into the following folders:

### 1. Health Checks
- API Gateway Health
- User Service Health
- Driver Service Health
- Auth Service Health
- Ride Service Health

### 2. User Service (via Gateway)
- Create User
- Get User by ID
- Get User by Phone Number
- Get All Users (with pagination)
- Update User
- Delete User

### 3. User Service (Direct)
- Direct access to User Service endpoints (bypassing gateway)

### 4. Driver Service (via Gateway)
- Create Driver
- Get Driver by ID

### 5. Driver Service (Direct)
- Direct access to Driver Service endpoints

### 6. Auth Service (via Gateway)
- Login
- Refresh Token

### 7. Auth Service (Direct)
- Direct access to Auth Service endpoints

### 8. Ride Service (via Gateway)
- Create Ride
- Get Ride by ID
- Accept Ride
- Start Ride
- Complete Ride

### 9. Ride Service (Direct)
- Direct access to Ride Service endpoints

## Environment Variables

The environment includes the following variables:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `gateway_url` | `http://localhost:8000` | API Gateway base URL |
| `user_service_url` | `http://localhost:8002` | User Service direct URL |
| `driver_service_url` | `http://localhost:8003` | Driver Service direct URL |
| `auth_service_url` | `http://localhost:8001` | Auth Service direct URL |
| `ride_service_url` | `http://localhost:8004` | Ride Service direct URL |
| `auth_token` | (empty) | Authentication token (auto-populated after login) |
| `user_id` | (empty) | User ID (auto-populated after creating user) |
| `driver_id` | (empty) | Driver ID (auto-populated after creating driver) |
| `ride_id` | (empty) | Ride ID (auto-populated after creating ride) |

## Auto-Populated Variables

The collection includes test scripts that automatically populate variables:

- **`auth_token`** - Set after successful login
- **`user_id`** - Set after creating a user
- **`driver_id`** - Set after creating a driver
- **`ride_id`** - Set after creating a ride

## Usage Examples

### 1. Test Health Checks

Start by testing all health endpoints to ensure services are running:

```
1. Health Checks → API Gateway Health
2. Health Checks → User Service Health
3. Health Checks → Driver Service Health
4. Health Checks → Auth Service Health
5. Health Checks → Ride Service Health
```

### 2. Create and Authenticate User

```
1. User Service (via Gateway) → Create User
2. Auth Service (via Gateway) → Login
   (auth_token will be auto-populated)
```

### 3. Create Driver

```
1. Driver Service (via Gateway) → Create Driver
   (driver_id will be auto-populated)
```

### 4. Create and Manage Ride

```
1. Ride Service (via Gateway) → Create Ride
   (ride_id will be auto-populated)
2. Ride Service (via Gateway) → Accept Ride
3. Ride Service (via Gateway) → Start Ride
4. Ride Service (via Gateway) → Complete Ride
```

## Request Examples

### Create User Request Body

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+264813442539",
  "userType": "STUDENT",
  "password": "securePassword123"
}
```

### Create Driver Request Body

```json
{
  "name": "Driver Smith",
  "email": "driver.smith@example.com",
  "phoneNumber": "+264813442541",
  "licenseNumber": "DL123456",
  "vehicleType": "CAR",
  "vehicleModel": "Toyota Corolla",
  "vehiclePlateNumber": "ABC-123"
}
```

### Login Request Body

```json
{
  "phoneNumber": "+264813442539",
  "password": "securePassword123"
}
```

### Create Ride Request Body

```json
{
  "userId": "{{user_id}}",
  "childId": null,
  "pickupLocation": {
    "latitude": -22.5700,
    "longitude": 17.0836,
    "address": "123 Main Street, Windhoek",
    "name": "Pickup Location"
  },
  "dropoffLocation": {
    "latitude": -22.5800,
    "longitude": 17.0936,
    "address": "456 University Road, Windhoek",
    "name": "Dropoff Location"
  },
  "rideType": "standard",
  "estimatedFare": 13.00,
  "passengerCount": 1,
  "vehicleType": "Car"
}
```

## Service Ports

| Service | Port | URL |
|---------|------|-----|
| API Gateway | 8000 | http://localhost:8000 |
| Auth Service | 8001 | http://localhost:8001 |
| User Service | 8002 | http://localhost:8002 |
| Driver Service | 8003 | http://localhost:8003 |
| Ride Service | 8004 | http://localhost:8004 |

## Tips

1. **Use Gateway Endpoints**: For production-like testing, use endpoints via the API Gateway
2. **Use Direct Endpoints**: For debugging, use direct service endpoints
3. **Check Variables**: After running requests, check the environment variables to see auto-populated values
4. **Update Environment**: Modify environment variables for different environments (staging, production)
5. **Collection Runner**: Use Postman Collection Runner to run all requests in sequence

## Troubleshooting

### Services Not Responding

1. Ensure all services are running: `npm run dev:all`
2. Check service health endpoints first
3. Verify environment variables are correct

### Authentication Errors

1. Make sure you've logged in first (Auth Service → Login)
2. Check that `auth_token` variable is populated
3. Verify token is included in request headers (if required)

### Variable Not Populated

1. Check the test script in the request
2. Verify the response structure matches expected format
3. Manually set the variable if needed

## Next Steps

1. Create additional environments for staging/production
2. Add more test cases and assertions
3. Set up automated testing with Newman (Postman CLI)
4. Add request/response examples
5. Document authentication flow

