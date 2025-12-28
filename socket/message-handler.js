/**
 * WebSocket Message Handlers
 * Handles all WebSocket message types and routing
 */

const Logger = require('./logger');
const { MessageTypes, createMessage, validateMessage } = require('./types');

class MessageHandler {
  constructor(connectionManager, locationManager, httpClient) {
    this.logger = new Logger('MessageHandler');
    this.connectionManager = connectionManager;
    this.locationManager = locationManager;
    this.httpClient = httpClient;
  }

  /**
   * Handle incoming WebSocket message
   */
  async handleMessage(ws, clientId, message) {
    try {
      // Parse message
      const parsedMessage = JSON.parse(message);
      
      // Validate message
      if (!validateMessage(parsedMessage)) {
        this.logger.warn('Invalid message received', { clientId, message: parsedMessage });
        this.sendError(ws, 'Invalid message format');
        return;
      }

      // Update connection activity
      this.connectionManager.updateActivity(clientId);

      // Route message based on type
      await this.routeMessage(ws, clientId, parsedMessage);

    } catch (error) {
      this.logger.error(error, 'Failed to handle message');
      this.sendError(ws, 'Message processing failed');
    }
  }

  /**
   * Route message to appropriate handler
   */
  async routeMessage(ws, clientId, message) {
    const { type, role, userId } = message;

    switch (type) {
      // Driver events
      case MessageTypes.DRIVER_ONLINE:
        await this.handleDriverOnline(ws, clientId, message);
        break;
      case MessageTypes.DRIVER_OFFLINE:
        await this.handleDriverOffline(ws, clientId, message);
        break;
      case MessageTypes.LOCATION_UPDATE:
        await this.handleLocationUpdate(ws, clientId, message);
        break;

      // Ride events
      case MessageTypes.REQUEST_RIDE:
        await this.handleRequestRide(ws, clientId, message);
        break;
      case MessageTypes.ACCEPT_RIDE:
        await this.handleAcceptRide(ws, clientId, message);
        break;
      case MessageTypes.START_RIDE:
        await this.handleStartRide(ws, clientId, message);
        break;
      case MessageTypes.COMPLETE_RIDE:
        await this.handleCompleteRide(ws, clientId, message);
        break;
      case MessageTypes.CANCEL_RIDE:
        await this.handleCancelRide(ws, clientId, message);
        break;

      // Query events
      case MessageTypes.NEARBY_DRIVERS:
        await this.handleNearbyDrivers(ws, clientId, message);
        break;
      case MessageTypes.DRIVER_LOCATION:
        await this.handleDriverLocation(ws, clientId, message);
        break;

      // System events
      case MessageTypes.HEARTBEAT:
        await this.handleHeartbeat(ws, clientId, message);
        break;

      default:
        this.logger.warn('Unknown message type', { clientId, type });
        this.sendError(ws, `Unknown message type: ${type}`);
    }
  }

  /**
   * Handle driver online event
   */
  async handleDriverOnline(ws, clientId, message) {
    const { driverId, data } = message;
    
    try {
      // Validate driver with main server
      const validation = await this.httpClient.validateDriver(driverId);
      if (!validation.success) {
        this.logger.warn('Driver validation failed', { driverId, error: validation.error });
        this.sendError(ws, 'Driver validation failed');
        return;
      }

      // Update connection with driver role
      this.connectionManager.addConnection(clientId, ws, 'driver', driverId);
      
      // Update driver location
      this.locationManager.updateDriverLocation(driverId, data);

      // Send confirmation
      this.sendMessage(ws, createMessage(MessageTypes.DRIVER_ONLINE, 'system', {
        driverId,
        status: 'online',
        message: 'Driver is now online'
      }));

      this.logger.info('Driver came online', { driverId, clientId });

    } catch (error) {
      this.logger.error(error, 'Failed to handle driver online');
      this.sendError(ws, 'Failed to process driver online');
    }
  }

  /**
   * Handle driver offline event
   */
  async handleDriverOffline(ws, clientId, message) {
    const { driverId } = message;
    
    try {
      // Remove driver location
      this.locationManager.removeDriverLocation(driverId);
      
      // Remove connection
      this.connectionManager.removeConnection(clientId);

      this.logger.info('Driver went offline', { driverId, clientId });

    } catch (error) {
      this.logger.error(error, 'Failed to handle driver offline');
    }
  }

  /**
   * Handle location update
   */
  async handleLocationUpdate(ws, clientId, message) {
    const { driverId, data } = message;
    
    try {
      // Update location
      const success = this.locationManager.updateDriverLocation(driverId, data);
      
      if (success) {
        this.sendMessage(ws, createMessage(MessageTypes.LOCATION_UPDATE, 'system', {
          driverId,
          status: 'updated',
          message: 'Location updated successfully'
        }));
      } else {
        this.sendError(ws, 'Failed to update location');
      }

    } catch (error) {
      this.logger.error(error, 'Failed to handle location update');
      this.sendError(ws, 'Failed to update location');
    }
  }

  /**
   * Handle ride request
   */
  async handleRequestRide(ws, clientId, message) {
    const { userId, data } = message;
    
    try {
      // Find nearby drivers
      const nearbyDrivers = this.locationManager.findNearbyDrivers(
        data.pickupLatitude,
        data.pickupLongitude,
        data.radius || 5
      );

      // Send ride request to nearby drivers
      const driverConnections = this.connectionManager.getConnectionsByRole('driver');
      let notifiedDrivers = 0;

      for (const driver of nearbyDrivers.slice(0, 10)) { // Limit to 10 closest drivers
        const driverConnection = this.connectionManager.getDriverConnection(driver.driverId);
        if (driverConnection) {
          const rideRequest = createMessage(MessageTypes.REQUEST_RIDE, 'user', {
            rideId: data.rideId,
            userId,
            pickupLocation: {
              latitude: data.pickupLatitude,
              longitude: data.pickupLongitude,
              address: data.pickupAddress
            },
            dropoffLocation: {
              latitude: data.dropoffLatitude,
              longitude: data.dropoffLongitude,
              address: data.dropoffAddress
            },
            distance: driver.distance,
            estimatedFare: data.estimatedFare,
            requestedAt: Date.now()
          });

          if (this.connectionManager.sendToConnection(driverConnection.id, rideRequest)) {
            notifiedDrivers++;
          }
        }
      }

      // Send confirmation to user
      this.sendMessage(ws, createMessage(MessageTypes.RIDE_REQUESTED, 'system', {
        rideId: data.rideId,
        notifiedDrivers,
        message: `Ride request sent to ${notifiedDrivers} nearby drivers`
      }));

      this.logger.info('Ride request processed', { 
        userId, 
        rideId: data.rideId, 
        notifiedDrivers 
      });

    } catch (error) {
      this.logger.error(error, 'Failed to handle ride request');
      this.sendError(ws, 'Failed to process ride request');
    }
  }

  /**
   * Handle ride acceptance
   */
  async handleAcceptRide(ws, clientId, message) {
    const { driverId, data } = message;
    
    try {
      // Notify user about ride acceptance
      const userConnection = this.connectionManager.getUserConnection(data.userId);
      if (userConnection) {
        const acceptanceMessage = createMessage(MessageTypes.RIDE_ACCEPTED, 'driver', {
          rideId: data.rideId,
          driverId,
          driverLocation: this.locationManager.getDriverLocation(driverId),
          estimatedArrival: data.estimatedArrival,
          message: 'Your ride has been accepted'
        });

        this.connectionManager.sendToConnection(userConnection.id, acceptanceMessage);
      }

      this.logger.info('Ride accepted', { driverId, rideId: data.rideId });

    } catch (error) {
      this.logger.error(error, 'Failed to handle ride acceptance');
      this.sendError(ws, 'Failed to process ride acceptance');
    }
  }

  /**
   * Handle ride start
   */
  async handleStartRide(ws, clientId, message) {
    const { driverId, data } = message;
    
    try {
      // Notify user about ride start
      const userConnection = this.connectionManager.getUserConnection(data.userId);
      if (userConnection) {
        const startMessage = createMessage(MessageTypes.RIDE_STARTED, 'driver', {
          rideId: data.rideId,
          driverId,
          startedAt: Date.now(),
          message: 'Your ride has started'
        });

        this.connectionManager.sendToConnection(userConnection.id, startMessage);
      }

      this.logger.info('Ride started', { driverId, rideId: data.rideId });

    } catch (error) {
      this.logger.error(error, 'Failed to handle ride start');
      this.sendError(ws, 'Failed to process ride start');
    }
  }

  /**
   * Handle ride completion
   */
  async handleCompleteRide(ws, clientId, message) {
    const { driverId, data } = message;
    
    try {
      // Notify user about ride completion
      const userConnection = this.connectionManager.getUserConnection(data.userId);
      if (userConnection) {
        const completionMessage = createMessage(MessageTypes.RIDE_COMPLETED, 'driver', {
          rideId: data.rideId,
          driverId,
          completedAt: Date.now(),
          fare: data.fare,
          message: 'Your ride has been completed'
        });

        this.connectionManager.sendToConnection(userConnection.id, completionMessage);
      }

      this.logger.info('Ride completed', { driverId, rideId: data.rideId });

    } catch (error) {
      this.logger.error(error, 'Failed to handle ride completion');
      this.sendError(ws, 'Failed to process ride completion');
    }
  }

  /**
   * Handle ride cancellation
   */
  async handleCancelRide(ws, clientId, message) {
    const { userId, data } = message;
    
    try {
      // Notify driver about cancellation
      if (data.driverId) {
        const driverConnection = this.connectionManager.getDriverConnection(data.driverId);
        if (driverConnection) {
          const cancellationMessage = createMessage(MessageTypes.RIDE_CANCELLED, 'user', {
            rideId: data.rideId,
            userId,
            reason: data.reason,
            message: 'Ride has been cancelled'
          });

          this.connectionManager.sendToConnection(driverConnection.id, cancellationMessage);
        }
      }

      this.logger.info('Ride cancelled', { userId, rideId: data.rideId });

    } catch (error) {
      this.logger.error(error, 'Failed to handle ride cancellation');
      this.sendError(ws, 'Failed to process ride cancellation');
    }
  }

  /**
   * Handle nearby drivers query
   */
  async handleNearbyDrivers(ws, clientId, message) {
    const { data } = message;
    
    try {
      const nearbyDrivers = this.locationManager.findNearbyDrivers(
        data.latitude,
        data.longitude,
        data.radius || 5,
        data.status || 'online'
      );

      this.sendMessage(ws, createMessage(MessageTypes.NEARBY_DRIVERS, 'system', {
        drivers: nearbyDrivers,
        count: nearbyDrivers.length,
        searchRadius: data.radius || 5
      }));

    } catch (error) {
      this.logger.error(error, 'Failed to handle nearby drivers query');
      this.sendError(ws, 'Failed to find nearby drivers');
    }
  }

  /**
   * Handle driver location query
   */
  async handleDriverLocation(ws, clientId, message) {
    const { driverId } = message;
    
    try {
      const location = this.locationManager.getDriverLocation(driverId);
      
      if (location) {
        this.sendMessage(ws, createMessage(MessageTypes.DRIVER_LOCATION, 'system', {
          driverId,
          location: {
            latitude: location.latitude,
            longitude: location.longitude,
            status: location.status,
            lastUpdated: location.lastUpdated
          }
        }));
      } else {
        this.sendError(ws, 'Driver location not found');
      }

    } catch (error) {
      this.logger.error(error, 'Failed to handle driver location query');
      this.sendError(ws, 'Failed to get driver location');
    }
  }

  /**
   * Handle heartbeat
   */
  async handleHeartbeat(ws, clientId, message) {
    // Simply acknowledge the heartbeat
    this.sendMessage(ws, createMessage(MessageTypes.HEARTBEAT, 'system', {
      timestamp: Date.now(),
      status: 'alive'
    }));
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
   * Send error message
   */
  sendError(ws, errorMessage, details = null) {
    const errorMsg = createMessage(MessageTypes.ERROR, 'system', {
      error: errorMessage,
      details,
      timestamp: Date.now()
    });
    this.sendMessage(ws, errorMsg);
  }
}

module.exports = MessageHandler;
