# Londa Rides Socket Server

Real-time WebSocket server for the Londa Rides application, handling driver location tracking, ride requests, and live communication between drivers and users.

## 🚀 Features

- **Real-time Communication**: WebSocket-based messaging system
- **Driver Location Tracking**: Live GPS location updates and management
- **Ride Management**: Complete ride lifecycle handling (request, accept, start, complete, cancel)
- **Connection Management**: Robust connection handling with automatic cleanup
- **Health Monitoring**: Comprehensive health checks and status reporting
- **Circuit Breaker**: Fault-tolerant connection to main server
- **REST API**: HTTP endpoints for location queries and monitoring

## 📁 Project Structure

```
socket/
├── server.js              # Original server (legacy)
├── server-clean.js         # Clean, modular server implementation
├── config.js              # Configuration management
├── logger.js              # Centralized logging utility
├── connection-manager.js   # WebSocket connection management
├── location-manager.js    # Driver location tracking
├── message-handler.js     # WebSocket message routing
├── http-client.js         # HTTP client for main server communication
├── types.js              # Message types and schemas
├── test-robust-connection.js # Connection testing utility
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🛠️ Installation

```bash
cd socket
npm install
```

## 🚀 Usage

### Development
```bash
# Run original server
npm run dev

# Run clean, modular server
npm run dev:clean
```

### Production
```bash
# Run original server
npm start

# Run clean, modular server
npm run start:clean
```

### Testing
```bash
# Test connection robustness
npm test

# Check server health
npm run health

# Get detailed status
npm run status
```

## ⚙️ Configuration

Environment variables (`.env` file):

```env
# Server Ports
HTTP_PORT=3001
WEBSOCKET_PORT=8080

# Main Server Connection
SERVER_URL=http://localhost:8000
API_SECRET=londa-socket-secret-2024

# Sync Intervals (milliseconds)
FIRESTORE_SYNC_INTERVAL=30000
HEALTH_CHECK_INTERVAL=300000
LOCATION_CLEANUP_INTERVAL=300000

# CORS Origins
CORS_ORIGIN=http://localhost:3000,http://localhost:19006

# Connection Limits
MAX_CONNECTIONS=1000
MAX_DRIVER_CONNECTIONS=500
MAX_USER_CONNECTIONS=500

# Location Settings
DEFAULT_SEARCH_RADIUS=5.0
MAX_SEARCH_RADIUS=50.0
LOCATION_TIMEOUT=300000

# Environment
NODE_ENV=development
LOG_LEVEL=info
```

## 📡 API Endpoints

### Health & Status
- `GET /api/health` - Basic health check
- `GET /api/status` - Detailed server status

### Driver Locations
- `GET /api/nearby-drivers?lat=40.7128&lon=-74.0060&radius=5` - Find nearby drivers
- `GET /api/driver/:driverId/location` - Get specific driver location
- `GET /api/drivers/locations?status=online` - Get all driver locations

## 🔌 WebSocket Messages

### Message Types
- `driverOnline` - Driver comes online
- `driverOffline` - Driver goes offline
- `locationUpdate` - Driver location update
- `requestRide` - User requests a ride
- `acceptRide` - Driver accepts ride
- `startRide` - Ride starts
- `completeRide` - Ride completes
- `cancelRide` - Ride cancelled
- `nearbyDrivers` - Query nearby drivers
- `heartbeat` - Keep-alive ping

### Message Format
```json
{
  "type": "locationUpdate",
  "role": "driver",
  "driverId": "driver_123",
  "data": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "status": "online",
    "accuracy": 10,
    "heading": 45,
    "speed": 25
  },
  "timestamp": 1640995200000
}
```

## 🏗️ Architecture

### Modular Design
The clean implementation (`server-clean.js`) uses a modular architecture:

1. **SocketServer** - Main server class orchestrating all components
2. **ConnectionManager** - Manages WebSocket connections and client state
3. **LocationManager** - Handles driver location tracking and queries
4. **MessageHandler** - Routes and processes WebSocket messages
5. **Logger** - Centralized logging with different levels
6. **Config** - Environment-based configuration management

### Connection Management
- Automatic connection cleanup for stale clients
- Connection limits and rate limiting
- Heartbeat/ping-pong for connection health
- Graceful connection handling

### Location Tracking
- Real-time GPS coordinate validation
- Distance calculations using geolib
- Nearby driver search with configurable radius
- Stale location cleanup

### Error Handling
- Circuit breaker pattern for main server communication
- Exponential backoff retry logic
- Comprehensive error logging
- Graceful degradation when main server is unavailable

## 🔧 Development

### Adding New Message Types
1. Add message type to `types.js`
2. Add schema validation
3. Add handler method to `MessageHandler`
4. Update routing logic

### Adding New API Endpoints
1. Add route to `setupRoutes()` in `SocketServer`
2. Implement handler logic
3. Add error handling
4. Update documentation

### Testing
- Use `test-robust-connection.js` for connection testing
- Monitor logs for debugging
- Use health endpoints for status monitoring

## 📊 Monitoring

### Health Checks
- Automatic health checks every 5 minutes
- Circuit breaker status monitoring
- Connection statistics tracking
- Memory usage monitoring

### Logging
- Structured logging with timestamps
- Different log levels (error, warn, info, debug)
- Request/response logging
- WebSocket event logging

## 🚨 Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if main server is running
   - Verify SERVER_URL configuration
   - Check network connectivity

2. **WebSocket Connection Failed**
   - Verify WEBSOCKET_PORT is available
   - Check CORS configuration
   - Ensure client is connecting to correct port

3. **Location Updates Not Working**
   - Verify coordinate validation
   - Check driver authentication
   - Monitor location cleanup logs

### Debug Mode
Set `LOG_LEVEL=debug` for detailed logging.

## 📈 Performance

### Optimization Features
- Connection pooling for HTTP requests
- In-memory location caching
- Efficient distance calculations
- Automatic cleanup of stale data
- Connection limits and rate limiting

### Scalability
- Horizontal scaling support
- Load balancer friendly
- Stateless design (except in-memory caches)
- Configurable connection limits

## 🔒 Security

- CORS configuration
- API secret authentication
- Input validation and sanitization
- Rate limiting on connections
- Error message sanitization

## 📝 License

ISC License - See LICENSE file for details.
