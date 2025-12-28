/**
 * Socket Server Configuration
 * Centralized configuration management for the socket server
 */

const config = {
  // Server ports
  HTTP_PORT: process.env.HTTP_PORT || 3001,
  WS_PORT: process.env.WEBSOCKET_PORT || 8080,
  
  // Main server connection
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:8000',
  API_SECRET: process.env.API_SECRET || 'londa-socket-secret-2024',
  
  // Sync intervals
  FIRESTORE_SYNC_INTERVAL: parseInt(process.env.FIRESTORE_SYNC_INTERVAL) || 30000,
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 300000, // 5 minutes
  LOCATION_CLEANUP_INTERVAL: parseInt(process.env.LOCATION_CLEANUP_INTERVAL) || 300000, // 5 minutes
  
  // CORS configuration
  CORS_ORIGINS: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000',
    'http://localhost:19006',
    'http://localhost:8081'
  ],
  
  // Connection limits
  MAX_CONNECTIONS: parseInt(process.env.MAX_CONNECTIONS) || 1000,
  MAX_DRIVER_CONNECTIONS: parseInt(process.env.MAX_DRIVER_CONNECTIONS) || 500,
  MAX_USER_CONNECTIONS: parseInt(process.env.MAX_USER_CONNECTIONS) || 500,
  
  // Location settings
  DEFAULT_SEARCH_RADIUS: parseFloat(process.env.DEFAULT_SEARCH_RADIUS) || 5.0, // km
  MAX_SEARCH_RADIUS: parseFloat(process.env.MAX_SEARCH_RADIUS) || 50.0, // km
  LOCATION_TIMEOUT: parseInt(process.env.LOCATION_TIMEOUT) || 300000, // 5 minutes
  
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

module.exports = config;
