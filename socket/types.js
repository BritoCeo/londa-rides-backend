/**
 * WebSocket Message Types and Schemas for Londa Rides
 * Defines all message types used in real-time communication
 */

const MessageTypes = {
  // Driver events
  DRIVER_ONLINE: 'driverOnline',
  DRIVER_OFFLINE: 'driverOffline',
  LOCATION_UPDATE: 'locationUpdate',
  
  // Ride events
  REQUEST_RIDE: 'requestRide',
  RIDE_REQUESTED: 'rideRequested',
  ACCEPT_RIDE: 'acceptRide',
  RIDE_ACCEPTED: 'rideAccepted',
  START_RIDE: 'startRide',
  RIDE_STARTED: 'rideStarted',
  COMPLETE_RIDE: 'completeRide',
  RIDE_COMPLETED: 'rideCompleted',
  CANCEL_RIDE: 'cancelRide',
  RIDE_CANCELLED: 'rideCancelled',
  DRIVER_ARRIVING: 'driverArriving',
  
  // Query events
  NEARBY_DRIVERS: 'nearbyDrivers',
  DRIVER_LOCATION: 'driverLocation',
  
  // System events
  HEARTBEAT: 'heartbeat',
  ERROR: 'error',
  CONNECTION_STATUS: 'connectionStatus'
};

// Message schemas for validation
const MessageSchemas = {
  driverOnline: {
    type: 'object',
    required: ['type', 'role', 'driverId', 'data'],
    properties: {
      type: { type: 'string', enum: [MessageTypes.DRIVER_ONLINE] },
      role: { type: 'string', enum: ['driver'] },
      driverId: { type: 'string' },
      data: {
        type: 'object',
        required: ['latitude', 'longitude', 'status'],
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          status: { type: 'string', enum: ['online', 'busy'] }
        }
      }
    }
  },

  locationUpdate: {
    type: 'object',
    required: ['type', 'role', 'driverId', 'data'],
    properties: {
      type: { type: 'string', enum: [MessageTypes.LOCATION_UPDATE] },
      role: { type: 'string', enum: ['driver'] },
      driverId: { type: 'string' },
      data: {
        type: 'object',
        required: ['latitude', 'longitude'],
        properties: {
          latitude: { type: 'number' },
          longitude: { type: 'number' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  },

  requestRide: {
    type: 'object',
    required: ['type', 'role', 'latitude', 'longitude', 'pickupLocation', 'destinationLocation'],
    properties: {
      type: { type: 'string', enum: [MessageTypes.REQUEST_RIDE] },
      role: { type: 'string', enum: ['user'] },
      latitude: { type: 'number' },
      longitude: { type: 'number' },
      pickupLocation: { type: 'string' },
      destinationLocation: { type: 'string' },
      rideType: { type: 'string', enum: ['standard', 'premium', 'group'] },
      userId: { type: 'string' }
    }
  },

  acceptRide: {
    type: 'object',
    required: ['type', 'role', 'rideId', 'driverId'],
    properties: {
      type: { type: 'string', enum: [MessageTypes.ACCEPT_RIDE] },
      role: { type: 'string', enum: ['driver'] },
      rideId: { type: 'string' },
      driverId: { type: 'string' },
      eta: { type: 'number' }
    }
  },

  startRide: {
    type: 'object',
    required: ['type', 'role', 'rideId', 'driverId'],
    properties: {
      type: { type: 'string', enum: [MessageTypes.START_RIDE] },
      role: { type: 'string', enum: ['driver'] },
      rideId: { type: 'string' },
      driverId: { type: 'string' }
    }
  },

  completeRide: {
    type: 'object',
    required: ['type', 'role', 'rideId', 'driverId'],
    properties: {
      type: { type: 'string', enum: [MessageTypes.COMPLETE_RIDE] },
      role: { type: 'string', enum: ['driver'] },
      rideId: { type: 'string' },
      driverId: { type: 'string' },
      fare: { type: 'number' }
    }
  },

  cancelRide: {
    type: 'object',
    required: ['type', 'role', 'rideId', 'reason'],
    properties: {
      type: { type: 'string', enum: [MessageTypes.CANCEL_RIDE] },
      role: { type: 'string', enum: ['driver', 'user'] },
      rideId: { type: 'string' },
      reason: { type: 'string' }
    }
  }
};

// Helper functions
const createMessage = (type, role, data) => ({
  type,
  role,
  timestamp: new Date().toISOString(),
  ...data
});

const validateMessage = (message, schema) => {
  // Basic validation - in production, use a proper JSON schema validator
  if (!message.type || !message.role) {
    return false;
  }
  
  const requiredFields = schema.required || [];
  return requiredFields.every(field => message.hasOwnProperty(field));
};

module.exports = {
  MessageTypes,
  MessageSchemas,
  createMessage,
  validateMessage
};
