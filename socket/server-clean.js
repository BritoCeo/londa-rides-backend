/**
 * Londa Rides Socket Server
 * Real-time WebSocket server for ride sharing application
 * 
 * Features:
 * - Real-time driver location tracking
 * - Ride request/acceptance flow
 * - WebSocket message handling
 * - HTTP API endpoints
 * - Connection management
 * - Health monitoring
 */

require('dotenv').config();

const express = require('express');
const { WebSocketServer } = require('ws');
const cors = require('cors');

// Import modules
const config = require('./config');
const Logger = require('./logger');
const ConnectionManager = require('./connection-manager');
const LocationManager = require('./location-manager');
const MessageHandler = require('./message-handler');
const httpClient = require('./http-client');
const { MessageTypes, createMessage } = require('./types');

class SocketServer {
  constructor() {
    this.logger = new Logger('SocketServer');
    this.app = express();
    this.connectionManager = new ConnectionManager();
    this.locationManager = new LocationManager();
    this.messageHandler = new MessageHandler(
      this.connectionManager,
      this.locationManager,
      httpClient
    );
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupHealthChecks();
    this.setupCleanupTasks();
  }

  /**
   * Setup Express middleware
   */
  setupMiddleware() {
    this.app.use(cors({
      origin: config.CORS_ORIGINS,
      credentials: true
    }));
    
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging middleware
    this.app.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        this.logger.http(req.method, req.url, res.statusCode, duration);
      });
      next();
    });
  }

  /**
   * Setup HTTP routes
   */
  setupRoutes() {
    // Health check endpoint
    this.app.get('/api/health', (req, res) => {
      const connectionStatus = httpClient.getConnectionStatus();
      const locationStats = this.locationManager.getStats();
      const connectionStats = this.connectionManager.getStats();
      
      res.json({
        success: true,
        message: 'Socket server is healthy',
        timestamp: new Date().toISOString(),
        uptime: Math.round(process.uptime()),
        version: '1.0.0',
        environment: config.NODE_ENV,
        connection: {
          isConnected: connectionStatus.isConnected,
          circuitBreakerState: connectionStatus.circuitBreakerState,
          failures: connectionStatus.circuitBreakerFailures,
          lastAttempt: connectionStatus.lastConnectionAttempt,
          retryCount: connectionStatus.retryCount,
          mainServerURL: connectionStatus.baseURL
        },
        stats: {
          connections: connectionStats,
          locations: locationStats
        },
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        }
      });
    });

    // Detailed status endpoint
    this.app.get('/api/status', async (req, res) => {
      const connectionStatus = httpClient.getConnectionStatus();
      const healthCheck = await httpClient.performHealthCheck();
      const locationStats = this.locationManager.getStats();
      const connectionStats = this.connectionManager.getStats();
      
      res.json({
        server: {
          status: 'running',
          uptime: Math.round(process.uptime()),
          version: '1.0.0',
          environment: config.NODE_ENV,
          nodeVersion: process.version,
          platform: process.platform
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
          port: config.WS_PORT,
          connectedClients: connectionStats.activeConnections,
          totalConnections: connectionStats.totalConnections,
          driverConnections: connectionStats.driverConnections,
          userConnections: connectionStats.userConnections,
          driverLocations: locationStats.totalDrivers
        },
        system: {
          memory: process.memoryUsage(),
          cpu: process.cpuUsage()
        }
      });
    });

    // Get nearby drivers endpoint
    this.app.get('/api/nearby-drivers', (req, res) => {
      try {
        const { lat, lon, radius = config.DEFAULT_SEARCH_RADIUS, status = 'online' } = req.query;
        
        if (!lat || !lon) {
          return res.status(400).json({
            success: false,
            error: 'Latitude and longitude are required'
          });
        }

        const nearbyDrivers = this.locationManager.findNearbyDrivers(
          parseFloat(lat),
          parseFloat(lon),
          parseFloat(radius),
          status
        );

        res.json({
          success: true,
          drivers: nearbyDrivers,
          count: nearbyDrivers.length,
          searchRadius: parseFloat(radius),
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error(error, 'Failed to get nearby drivers');
        res.status(500).json({
          success: false,
          error: 'Failed to get nearby drivers'
        });
      }
    });

    // Get driver location endpoint
    this.app.get('/api/driver/:driverId/location', (req, res) => {
      try {
        const { driverId } = req.params;
        const location = this.locationManager.getDriverLocation(driverId);
        
        if (location) {
          res.json({
            success: true,
            driverId,
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              status: location.status,
              accuracy: location.accuracy,
              heading: location.heading,
              speed: location.speed,
              lastUpdated: location.lastUpdated
            },
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(404).json({
            success: false,
            error: 'Driver location not found'
          });
        }

      } catch (error) {
        this.logger.error(error, 'Failed to get driver location');
        res.status(500).json({
          success: false,
          error: 'Failed to get driver location'
        });
      }
    });

    // Get all driver locations endpoint
    this.app.get('/api/drivers/locations', (req, res) => {
      try {
        const { status } = req.query;
        let locations;
        
        if (status) {
          locations = this.locationManager.getDriversByStatus(status);
        } else {
          locations = this.locationManager.getAllDriverLocations();
        }

        res.json({
          success: true,
          drivers: locations,
          count: locations.length,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        this.logger.error(error, 'Failed to get driver locations');
        res.status(500).json({
          success: false,
          error: 'Failed to get driver locations'
        });
      }
    });

    // Error handling middleware
    this.app.use((error, req, res, next) => {
      this.logger.error(error, 'Express error');
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        timestamp: new Date().toISOString()
      });
    });
  }

  /**
   * Setup WebSocket server
   */
  setupWebSocket() {
    this.wss = new WebSocketServer({ port: config.WS_PORT });
    
    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      
      this.logger.connection(clientId, 'connected');
      
      // Send welcome message
      this.sendMessage(ws, createMessage(MessageTypes.CONNECTION_STATUS, 'system', {
        status: 'connected',
        clientId,
        timestamp: Date.now(),
        message: 'Connected to Londa Rides Socket Server'
      }));

      // Handle incoming messages
      ws.on('message', async (message) => {
        try {
          await this.messageHandler.handleMessage(ws, clientId, message.toString());
        } catch (error) {
          this.logger.error(error, 'Failed to handle WebSocket message');
        }
      });

      // Handle connection close
      ws.on('close', (code, reason) => {
        this.logger.connection(clientId, 'disconnected', { code, reason: reason.toString() });
        this.connectionManager.removeConnection(clientId);
      });

      // Handle connection errors
      ws.on('error', (error) => {
        this.logger.error(error, 'WebSocket error');
        this.connectionManager.removeConnection(clientId);
      });

      // Handle pong (heartbeat response)
      ws.on('pong', () => {
        this.connectionManager.updateActivity(clientId);
      });
    });

    this.logger.info(`WebSocket server listening on port ${config.WS_PORT}`);
  }

  /**
   * Setup health checks and monitoring
   */
  setupHealthChecks() {
    // Test connection to main server on startup
    setTimeout(async () => {
      this.logger.info('Testing connection to main server...');
      const test = await httpClient.testConnection();
      
      if (test.success) {
        this.logger.info('Main server connection successful', {
          attempt: test.attempt,
          duration: test.duration
        });
      } else {
        this.logger.error('Main server connection failed', {
          error: test.error,
          attempts: test.attempts,
          duration: test.duration
        });
        this.logger.warn('Socket server will continue running but may have limited functionality');
      }
    }, 3000);

    // Periodic health check
    setInterval(async () => {
      this.logger.info('Performing periodic health check...');
      const healthCheck = await httpClient.performHealthCheck();
      
      if (healthCheck.success) {
        this.logger.info('Health check passed');
      } else {
        this.logger.warn('Health check failed', { error: healthCheck.error });
      }
    }, config.HEALTH_CHECK_INTERVAL);
  }

  /**
   * Setup cleanup tasks
   */
  setupCleanupTasks() {
    // Clean up stale connections
    setInterval(() => {
      const cleaned = this.connectionManager.cleanupStaleConnections();
      if (cleaned > 0) {
        this.logger.info(`Cleaned up ${cleaned} stale connections`);
      }
    }, config.LOCATION_CLEANUP_INTERVAL);

    // Clean up stale driver locations
    setInterval(() => {
      const cleaned = this.locationManager.cleanupStaleLocations();
      if (cleaned > 0) {
        this.logger.info(`Cleaned up ${cleaned} stale driver locations`);
      }
    }, config.LOCATION_CLEANUP_INTERVAL);

    // Periodic WebSocket ping to keep connections alive
    setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.readyState === 1) { // WebSocket.OPEN
          ws.ping();
        }
      });
    }, 30000); // Every 30 seconds
  }

  /**
   * Generate unique client ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send message to WebSocket
   */
  sendMessage(ws, message) {
    try {
      if (ws.readyState === 1) { // WebSocket.OPEN
        ws.send(JSON.stringify(message));
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(error, 'Failed to send message');
      return false;
    }
  }

  /**
   * Start the server
   */
  start() {
    this.server = this.app.listen(config.HTTP_PORT, () => {
      this.logger.info('Socket Server started', {
        httpPort: config.HTTP_PORT,
        wsPort: config.WS_PORT,
        mainServer: config.SERVER_URL,
        environment: config.NODE_ENV
      });
    });

    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }

  /**
   * Graceful shutdown
   */
  shutdown() {
    this.logger.info('Shutting down socket server...');
    
    // Close WebSocket server
    this.wss.close(() => {
      this.logger.info('WebSocket server closed');
    });

    // Close HTTP server
    this.server.close(() => {
      this.logger.info('HTTP server closed');
      process.exit(0);
    });

    // Force exit after 10 seconds
    setTimeout(() => {
      this.logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  }
}

// Start the server
const socketServer = new SocketServer();
socketServer.start();

module.exports = SocketServer;
