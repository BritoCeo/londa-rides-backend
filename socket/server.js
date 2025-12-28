require('dotenv').config();
const express = require("express");
const { WebSocketServer } = require("ws");
const geolib = require("geolib");
const cors = require("cors");
const { MessageTypes, MessageSchemas, createMessage, validateMessage } = require('./types');
const httpClient = require('./http-client');

const app = express();
const HTTP_PORT = process.env.HTTP_PORT || 3001;
const WS_PORT = process.env.WEBSOCKET_PORT || 8080;
const SYNC_INTERVAL = parseInt(process.env.FIRESTORE_SYNC_INTERVAL) || 30000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:19006'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Store driver locations and connections
let drivers = {}; // In-memory driver locations
let connections = new Map(); // WebSocket connections by client ID
let driverConnections = new Map(); // Driver WebSocket connections
let userConnections = new Map(); // User WebSocket connections

// Create WebSocket server
const wss = new WebSocketServer({ port: WS_PORT });

// Create HTTP server
const server = app.listen(HTTP_PORT, () => {
  console.log(`🚀 Socket Server running:`);
  console.log(`   HTTP API: http://localhost:${HTTP_PORT}`);
  console.log(`   WebSocket: ws://localhost:${WS_PORT}`);
  console.log(`   Main Server: ${process.env.SERVER_URL}`);
});

// ==================== WEBSOCKET HANDLERS ====================

wss.on("connection", (ws, req) => {
  const clientId = generateClientId();
  connections.set(clientId, ws);
  
  console.log(`🔌 New WebSocket connection: ${clientId}`);
  
  // Send welcome message
  ws.send(JSON.stringify(createMessage(MessageTypes.CONNECTION_STATUS, 'system', {
    status: 'connected',
    clientId,
    timestamp: new Date().toISOString()
  })));

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`📨 Received message from ${clientId}:`, data.type);

      // Validate message format
      if (!data.type || !data.role) {
        ws.send(JSON.stringify(createMessage(MessageTypes.ERROR, 'system', {
          error: 'Invalid message format',
          originalMessage: data
        })));
        return;
      }

      // Route message based on type
      await handleWebSocketMessage(ws, clientId, data);

    } catch (error) {
      console.error(`❌ Failed to parse WebSocket message from ${clientId}:`, error);
      ws.send(JSON.stringify(createMessage(MessageTypes.ERROR, 'system', {
        error: 'Invalid JSON message',
        details: error.message
      })));
    }
  });

  ws.on("close", () => {
    console.log(`🔌 WebSocket connection closed: ${clientId}`);
    connections.delete(clientId);
    
    // Remove from role-specific maps
    driverConnections.delete(clientId);
    userConnections.delete(clientId);
    
    // Clean up driver location if it was a driver
    const driverId = findDriverIdByClientId(clientId);
    if (driverId) {
      delete drivers[driverId];
      console.log(`🚗 Driver ${driverId} went offline`);
    }
  });

  ws.on("error", (error) => {
    console.error(`❌ WebSocket error for ${clientId}:`, error);
  });
});

// ==================== WEBSOCKET MESSAGE HANDLERS ====================

async function handleWebSocketMessage(ws, clientId, data) {
  switch (data.type) {
    case MessageTypes.DRIVER_ONLINE:
      await handleDriverOnline(ws, clientId, data);
      break;
      
    case MessageTypes.DRIVER_OFFLINE:
      await handleDriverOffline(ws, clientId, data);
      break;
      
    case MessageTypes.LOCATION_UPDATE:
      await handleLocationUpdate(ws, clientId, data);
      break;
      
    case MessageTypes.REQUEST_RIDE:
      await handleRequestRide(ws, clientId, data);
      break;
      
    case MessageTypes.ACCEPT_RIDE:
      await handleAcceptRide(ws, clientId, data);
      break;
      
    case MessageTypes.START_RIDE:
      await handleStartRide(ws, clientId, data);
      break;
      
    case MessageTypes.COMPLETE_RIDE:
      await handleCompleteRide(ws, clientId, data);
      break;
      
    case MessageTypes.CANCEL_RIDE:
      await handleCancelRide(ws, clientId, data);
      break;
      
    case MessageTypes.HEARTBEAT:
      handleHeartbeat(ws, clientId, data);
      break;
      
    default:
      console.log(`❓ Unknown message type: ${data.type}`);
      ws.send(JSON.stringify(createMessage(MessageTypes.ERROR, 'system', {
        error: `Unknown message type: ${data.type}`
      })));
  }
}

async function handleDriverOnline(ws, clientId, data) {
  const { driverId, data: locationData } = data;
  
  // Validate driver with main server
  const validation = await httpClient.validateDriver(driverId);
  if (!validation.success) {
    ws.send(JSON.stringify(createMessage(MessageTypes.ERROR, 'system', {
      error: 'Driver validation failed',
      details: validation.error
    })));
    return;
  }

  // Store driver location
  drivers[driverId] = {
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    status: locationData.status || 'online',
    clientId,
    lastUpdate: new Date()
  };

  // Track driver connection
  driverConnections.set(clientId, driverId);

  // Update driver status in main server
  await httpClient.updateDriverStatus(driverId, locationData.status || 'online', locationData);

  console.log(`🚗 Driver ${driverId} is now online at ${locationData.latitude}, ${locationData.longitude}`);
  
  ws.send(JSON.stringify(createMessage(MessageTypes.DRIVER_ONLINE, 'system', {
    success: true,
    message: 'Driver is now online'
  })));
}

async function handleDriverOffline(ws, clientId, data) {
  const { driverId } = data;
  
  // Remove from in-memory store
  delete drivers[driverId];
  driverConnections.delete(clientId);

  // Update driver status in main server
  await httpClient.updateDriverStatus(driverId, 'offline');

  console.log(`🚗 Driver ${driverId} went offline`);
  
  ws.send(JSON.stringify(createMessage(MessageTypes.DRIVER_OFFLINE, 'system', {
    success: true,
    message: 'Driver is now offline'
  })));
}

async function handleLocationUpdate(ws, clientId, data) {
  const { driverId, data: locationData } = data;
  
  // Update in-memory location
  if (drivers[driverId]) {
    drivers[driverId] = {
      ...drivers[driverId],
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      lastUpdate: new Date()
    };
  }

  console.log(`📍 Driver ${driverId} location updated: ${locationData.latitude}, ${locationData.longitude}`);
}

async function handleRequestRide(ws, clientId, data) {
  const { latitude, longitude, pickupLocation, destinationLocation, rideType, userId } = data;
  
  // Track user connection
  userConnections.set(clientId, userId);

  // Find nearby drivers
  const nearbyDrivers = findNearbyDrivers(latitude, longitude);
  
  console.log(`🚗 Ride request from user ${userId}: Found ${nearbyDrivers.length} nearby drivers`);
  
  // Send nearby drivers to user
  ws.send(JSON.stringify(createMessage(MessageTypes.NEARBY_DRIVERS, 'system', {
    drivers: nearbyDrivers,
    count: nearbyDrivers.length
  })));

  // Notify nearby drivers about the ride request
  const rideRequest = {
    userId,
    pickupLocation,
    destinationLocation,
    rideType,
    latitude,
    longitude,
    timestamp: new Date().toISOString()
  };

  nearbyDrivers.forEach(driver => {
    const driverClientId = findClientIdByDriverId(driver.id);
    if (driverClientId && driverConnections.has(driverClientId)) {
      const driverWs = connections.get(driverClientId);
      if (driverWs) {
        driverWs.send(JSON.stringify(createMessage(MessageTypes.RIDE_REQUESTED, 'system', {
          rideRequest,
          distance: driver.distance
        })));
      }
    }
  });
}

async function handleAcceptRide(ws, clientId, data) {
  const { rideId, driverId, eta } = data;
  
  // Get ride details from main server
  const rideDetails = await httpClient.getRideDetails(rideId);
  if (!rideDetails.success) {
    ws.send(JSON.stringify(createMessage(MessageTypes.ERROR, 'system', {
      error: 'Failed to get ride details',
      details: rideDetails.error
    })));
    return;
  }

  // Notify main server about ride acceptance
  await httpClient.notifyRideEvent(rideId, 'accepted', {
    driverId,
    eta,
    timestamp: new Date().toISOString()
  });

  // Notify user about ride acceptance
  const userId = rideDetails.data.userId;
  const userClientId = findClientIdByUserId(userId);
  if (userClientId && userConnections.has(userClientId)) {
    const userWs = connections.get(userClientId);
    if (userWs) {
      userWs.send(JSON.stringify(createMessage(MessageTypes.RIDE_ACCEPTED, 'system', {
        rideId,
        driverId,
        eta,
        driverInfo: {
          name: 'Driver Name', // This would come from main server
          rating: 4.8,
          vehicle: 'Toyota Corolla'
        }
      })));
    }
  }

  console.log(`✅ Driver ${driverId} accepted ride ${rideId}`);
}

async function handleStartRide(ws, clientId, data) {
  const { rideId, driverId } = data;
  
  // Notify main server about ride start
  await httpClient.notifyRideEvent(rideId, 'started', {
    driverId,
    timestamp: new Date().toISOString()
  });

  // Notify user about ride start
  const rideDetails = await httpClient.getRideDetails(rideId);
  if (rideDetails.success) {
    const userId = rideDetails.data.userId;
    const userClientId = findClientIdByUserId(userId);
    if (userClientId && userConnections.has(userClientId)) {
      const userWs = connections.get(userClientId);
      if (userWs) {
        userWs.send(JSON.stringify(createMessage(MessageTypes.RIDE_STARTED, 'system', {
          rideId,
          driverId,
          timestamp: new Date().toISOString()
        })));
      }
    }
  }

  console.log(`🚀 Driver ${driverId} started ride ${rideId}`);
}

async function handleCompleteRide(ws, clientId, data) {
  const { rideId, driverId, fare } = data;
  
  // Notify main server about ride completion
  await httpClient.notifyRideEvent(rideId, 'completed', {
    driverId,
    fare,
    timestamp: new Date().toISOString()
  });

  // Notify user about ride completion
  const rideDetails = await httpClient.getRideDetails(rideId);
  if (rideDetails.success) {
    const userId = rideDetails.data.userId;
    const userClientId = findClientIdByUserId(userId);
    if (userClientId && userConnections.has(userClientId)) {
      const userWs = connections.get(userClientId);
      if (userWs) {
        userWs.send(JSON.stringify(createMessage(MessageTypes.RIDE_COMPLETED, 'system', {
          rideId,
          driverId,
          fare,
          timestamp: new Date().toISOString()
        })));
      }
    }
  }

  console.log(`🏁 Driver ${driverId} completed ride ${rideId}`);
}

async function handleCancelRide(ws, clientId, data) {
  const { rideId, reason } = data;
  
  // Notify main server about ride cancellation
  await httpClient.notifyRideEvent(rideId, 'cancelled', {
    reason,
    cancelledBy: data.role,
    timestamp: new Date().toISOString()
  });

  // Notify all parties about cancellation
  const rideDetails = await httpClient.getRideDetails(rideId);
  if (rideDetails.success) {
    const userId = rideDetails.data.userId;
    const driverId = rideDetails.data.driverId;

    // Notify user
    const userClientId = findClientIdByUserId(userId);
    if (userClientId && userConnections.has(userClientId)) {
      const userWs = connections.get(userClientId);
      if (userWs) {
        userWs.send(JSON.stringify(createMessage(MessageTypes.RIDE_CANCELLED, 'system', {
          rideId,
          reason,
          cancelledBy: data.role
        })));
      }
    }

    // Notify driver
    if (driverId) {
      const driverClientId = findClientIdByDriverId(driverId);
      if (driverClientId && driverConnections.has(driverClientId)) {
        const driverWs = connections.get(driverClientId);
        if (driverWs) {
          driverWs.send(JSON.stringify(createMessage(MessageTypes.RIDE_CANCELLED, 'system', {
            rideId,
            reason,
            cancelledBy: data.role
          })));
        }
      }
    }
  }

  console.log(`❌ Ride ${rideId} cancelled by ${data.role}: ${reason}`);
}

function handleHeartbeat(ws, clientId, data) {
  // Don't respond to heartbeat to avoid ping-pong loop
  // Just log that we received it for debugging
  console.log(`💓 Heartbeat received from ${clientId}`);
}

// ==================== HELPER FUNCTIONS ====================

function findNearbyDrivers(userLat, userLon, radius = 5) {
  return Object.entries(drivers)
    .filter(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        { latitude: location.latitude, longitude: location.longitude }
      );
      return distance <= radius * 1000; // Convert km to meters
    })
    .map(([id, location]) => {
      const distance = geolib.getDistance(
        { latitude: userLat, longitude: userLon },
        { latitude: location.latitude, longitude: location.longitude }
      );
      return {
        id,
        latitude: location.latitude,
        longitude: location.longitude,
        distance: Math.round(distance / 1000 * 10) / 10, // Convert to km with 1 decimal
        eta: calculateETA(distance),
        status: location.status
      };
    });
}

function calculateETA(distanceInMeters) {
  const avgSpeedKmh = 30; // Average city speed
  const timeInHours = (distanceInMeters / 1000) / avgSpeedKmh;
  const timeInMinutes = Math.round(timeInHours * 60);
  return `${timeInMinutes} min`;
}

function generateClientId() {
  return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function findDriverIdByClientId(clientId) {
  for (const [driverId, driver] of Object.entries(drivers)) {
    if (driver.clientId === clientId) {
      return driverId;
    }
  }
  return null;
}

function findClientIdByDriverId(driverId) {
  const driver = drivers[driverId];
  return driver ? driver.clientId : null;
}

function findClientIdByUserId(userId) {
  for (const [clientId, id] of userConnections.entries()) {
    if (id === userId) {
      return clientId;
    }
  }
  return null;
}

// ==================== HTTP API ENDPOINTS ====================

// Health check
app.get('/api/health', (req, res) => {
  const connectionStatus = httpClient.getConnectionStatus();
  const serverUptime = process.uptime();
  
  res.json({
    success: true,
    message: 'Socket server is healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(serverUptime),
    connection: {
      isConnected: connectionStatus.isConnected,
      circuitBreakerState: connectionStatus.circuitBreakerState,
      failures: connectionStatus.circuitBreakerFailures,
      lastAttempt: connectionStatus.lastConnectionAttempt,
      retryCount: connectionStatus.retryCount,
      mainServerURL: connectionStatus.baseURL
    },
    stats: {
      totalConnections: connections.size,
      driverConnections: driverConnections.size,
      userConnections: userConnections.size,
      activeDrivers: Object.keys(drivers).length,
      driverLocations: Object.keys(driverLocations).length
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
    }
  });
});

// Status endpoint for detailed monitoring
app.get('/api/status', async (req, res) => {
  const connectionStatus = httpClient.getConnectionStatus();
  const healthCheck = await httpClient.performHealthCheck();
  
  res.json({
    server: {
      status: 'running',
      uptime: Math.round(process.uptime()),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    },
    mainServer: {
      url: connectionStatus.baseURL,
      isConnected: connectionStatus.isConnected,
      circuitBreakerState: connectionStatus.circuitBreakerState,
      failures: connectionStatus.circuitBreakerFailures,
      lastAttempt: connectionStatus.lastConnectionAttempt,
      retryCount: connectionStatus.retryCount,
      healthCheck: healthCheck
    },
    websocket: {
      port: PORT,
      connectedClients: io.engine.clientsCount,
      totalConnections: totalConnections,
      driverLocations: Object.keys(driverLocations).length
    },
    system: {
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version
    }
  });
});

// Get nearby drivers
app.get('/api/nearby-drivers', (req, res) => {
  const { lat, lon, radius = 5 } = req.query;
  
  if (!lat || !lon) {
    return res.status(400).json({
      success: false,
      message: 'Missing required parameters: lat, lon'
    });
  }

  const nearbyDrivers = findNearbyDrivers(parseFloat(lat), parseFloat(lon), parseFloat(radius));
  
  res.json({
    success: true,
    data: {
      drivers: nearbyDrivers,
      count: nearbyDrivers.length,
      center: { latitude: parseFloat(lat), longitude: parseFloat(lon) },
      radius: parseFloat(radius)
    }
  });
});

// Send message to specific driver
app.post('/api/driver/:id/notify', (req, res) => {
  const { id } = req.params;
  const { message, data } = req.body;
  
  const driverClientId = findClientIdByDriverId(id);
  if (!driverClientId || !driverConnections.has(driverClientId)) {
    return res.status(404).json({
      success: false,
      message: 'Driver not found or not connected'
    });
  }

  const driverWs = connections.get(driverClientId);
  if (driverWs) {
    driverWs.send(JSON.stringify(createMessage(message, 'system', data)));
    res.json({
      success: true,
      message: 'Message sent to driver'
    });
  } else {
    res.status(500).json({
      success: false,
      message: 'Failed to send message to driver'
    });
  }
});

// Broadcast message to all connected clients
app.post('/api/broadcast', (req, res) => {
  const { message, data, role } = req.body;
  
  let sentCount = 0;
  connections.forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(createMessage(message, 'system', data)));
      sentCount++;
    }
  });

  res.json({
    success: true,
    message: `Message broadcasted to ${sentCount} clients`,
    sentCount
  });
});

// Get connection statistics
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalConnections: connections.size,
      driverConnections: driverConnections.size,
      userConnections: userConnections.size,
      activeDrivers: Object.keys(drivers).length,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    }
  });
});

// ==================== BACKGROUND TASKS ====================

// Sync driver locations to Firestore every 30 seconds
setInterval(async () => {
  const activeDrivers = Object.entries(drivers).filter(([id, driver]) => {
    const timeSinceUpdate = Date.now() - driver.lastUpdate.getTime();
    return timeSinceUpdate < 60000; // Only sync drivers updated in last minute
  });

  for (const [driverId, driver] of activeDrivers) {
    try {
      await httpClient.syncDriverLocation(
        driverId,
        driver.latitude,
        driver.longitude,
        driver.status
      );
    } catch (error) {
      console.error(`Failed to sync location for driver ${driverId}:`, error.message);
    }
  }

  if (activeDrivers.length > 0) {
    console.log(`🔄 Synced ${activeDrivers.length} driver locations to Firestore`);
  }
}, SYNC_INTERVAL);

// Clean up stale connections every 5 minutes
setInterval(() => {
  const staleThreshold = 5 * 60 * 1000; // 5 minutes
  const now = Date.now();
  
  Object.entries(drivers).forEach(([driverId, driver]) => {
    const timeSinceUpdate = now - driver.lastUpdate.getTime();
    if (timeSinceUpdate > staleThreshold) {
      delete drivers[driverId];
      console.log(`🧹 Cleaned up stale driver location: ${driverId}`);
    }
  });
}, 5 * 60 * 1000);

// Test connection to main server on startup with improved retry logic
setTimeout(async () => {
  console.log('🔍 Testing connection to main server...');
  const test = await httpClient.testConnection();
  if (test.success) {
    console.log('✅ Main server connection successful');
    console.log(`📊 Connection details: attempt ${test.attempt}, duration ${test.duration}ms`);
  } else {
    console.error('❌ Main server connection failed:', test.error);
    console.log(`📊 Failed after ${test.attempts} attempts, duration ${test.duration}ms`);
    console.log('⚠️ Socket server will continue running but may have limited functionality');
  }
}, 3000); // Reduced initial delay since we have retry logic

// Periodic health check every 5 minutes
setInterval(async () => {
  console.log('🏥 Performing periodic health check...');
  const healthCheck = await httpClient.performHealthCheck();
  if (healthCheck.success) {
    console.log('✅ Health check passed');
  } else {
    console.log('❌ Health check failed:', healthCheck.error);
  }
}, 5 * 60 * 1000); // Every 5 minutes

console.log('🚀 Londa Rides Socket Server initialized successfully!');
