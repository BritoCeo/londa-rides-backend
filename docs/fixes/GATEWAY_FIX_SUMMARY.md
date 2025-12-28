# API Gateway Request Aborted Error - Fix Summary

## Issue
When making POST requests to create a user through the API Gateway, the request was being aborted with the error:
```
BadRequestError: request aborted
```

## Root Causes Identified

1. **Short Timeout**: Gateway timeout was set to only 5 seconds, which might be too short for some operations
2. **Poor Error Handling**: Gateway wasn't properly handling client disconnections and service errors
3. **Header Issues**: Some headers weren't being forwarded correctly
4. **Request Aborted Handling**: User service error handler wasn't checking if the request was aborted before sending responses

## Fixes Applied

### 1. API Gateway Improvements (`services/api-gateway/src/gateway/Gateway.ts`)

#### Increased Timeout
- Changed from 5 seconds to 30 seconds for all services
- Gives services more time to process requests

#### Better Error Handling
- Added check for `res.headersSent` before sending error responses
- Added specific handling for different error types:
  - `ECONNREFUSED` - Service unavailable
  - `ETIMEDOUT` - Gateway timeout
  - Service error responses
  - Unknown errors

#### Improved Request Forwarding
- Better header handling (removes problematic headers like `host`, `connection`)
- Properly sets `content-type` for JSON requests
- Better URL construction with query parameters
- Added logging for debugging

#### Client Disconnection Handling
- Listens for `req.on('close')` events
- Logs when clients disconnect
- Prevents sending responses after disconnection

### 2. User Service Error Handler Improvements (`services/user-service/src/middleware/errorHandler.ts`)

#### Request Aborted Detection
- Checks if `res.headersSent` or `req.aborted` before sending responses
- Specifically handles `BadRequestError` with "request aborted" message
- Returns early if request was aborted (doesn't try to send response)

#### Better Error Logging
- Logs request path and method for better debugging
- Handles errors when sending error responses

### 3. User Service App Improvements (`services/user-service/src/app.ts`)

#### JSON Parsing Error Handling
- Added error handler for JSON parsing errors
- Returns proper 400 error for invalid JSON
- Checks `res.headersSent` before sending response

#### Body Parser Configuration
- Increased body size limit to 10mb
- Proper error handling for malformed JSON

## Testing

After these fixes, test the create user endpoint:

```bash
POST http://localhost:8000/api/v1/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "+264813442539",
  "userType": "STUDENT",
  "password": "securePassword123"
}
```

## Expected Behavior

1. **Successful Request**: Should return 201 with user data
2. **Service Unavailable**: Should return 503 with clear error message
3. **Timeout**: Should return 504 with timeout message
4. **Invalid JSON**: Should return 400 with validation error
5. **Client Disconnect**: Should log warning and not crash

## Additional Notes

- The gateway now properly handles all error scenarios
- Services have better error recovery
- Timeout increased to handle slower operations
- Better logging for debugging connection issues

## Next Steps

If you still experience issues:

1. Check service logs for detailed error messages
2. Verify all services are running: `npm run dev:all`
3. Test direct service endpoints (bypassing gateway)
4. Check network connectivity between gateway and services
5. Verify Firebase is properly configured (if using database operations)

