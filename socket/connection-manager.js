/**
 * Connection Manager
 * Manages WebSocket connections and client state
 */

const Logger = require('./logger');
const config = require('./config');

class ConnectionManager {
  constructor() {
    this.logger = new Logger('ConnectionManager');
    
    // Connection storage
    this.connections = new Map(); // All connections by clientId
    this.driverConnections = new Map(); // Driver connections by driverId
    this.userConnections = new Map(); // User connections by userId
    
    // Statistics
    this.stats = {
      totalConnections: 0,
      activeConnections: 0,
      driverConnections: 0,
      userConnections: 0,
      peakConnections: 0
    };
  }

  /**
   * Add a new connection
   */
  addConnection(clientId, ws, role = null, userId = null) {
    try {
      // Check connection limits
      if (this.connections.size >= config.MAX_CONNECTIONS) {
        this.logger.warn('Maximum connections reached', { 
          current: this.connections.size, 
          limit: config.MAX_CONNECTIONS 
        });
        return false;
      }

      // Store connection
      const connection = {
        id: clientId,
        ws,
        role,
        userId,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
        isAlive: true
      };

      this.connections.set(clientId, connection);

      // Store by role
      if (role === 'driver' && userId) {
        if (this.driverConnections.size >= config.MAX_DRIVER_CONNECTIONS) {
          this.logger.warn('Maximum driver connections reached', { 
            current: this.driverConnections.size, 
            limit: config.MAX_DRIVER_CONNECTIONS 
          });
          this.connections.delete(clientId);
          return false;
        }
        this.driverConnections.set(userId, connection);
        this.stats.driverConnections++;
      } else if (role === 'user' && userId) {
        if (this.userConnections.size >= config.MAX_USER_CONNECTIONS) {
          this.logger.warn('Maximum user connections reached', { 
            current: this.userConnections.size, 
            limit: config.MAX_USER_CONNECTIONS 
          });
          this.connections.delete(clientId);
          return false;
        }
        this.userConnections.set(userId, connection);
        this.stats.userConnections++;
      }

      // Update statistics
      this.stats.totalConnections++;
      this.stats.activeConnections++;
      this.stats.peakConnections = Math.max(this.stats.peakConnections, this.stats.activeConnections);

      this.logger.connection(clientId, 'added', { role, userId });
      return true;

    } catch (error) {
      this.logger.error(error, 'Failed to add connection');
      return false;
    }
  }

  /**
   * Remove a connection
   */
  removeConnection(clientId) {
    try {
      const connection = this.connections.get(clientId);
      if (!connection) {
        this.logger.warn('Connection not found for removal', { clientId });
        return false;
      }

      // Remove from role-specific maps
      if (connection.role === 'driver' && connection.userId) {
        this.driverConnections.delete(connection.userId);
        this.stats.driverConnections--;
      } else if (connection.role === 'user' && connection.userId) {
        this.userConnections.delete(connection.userId);
        this.stats.userConnections--;
      }

      // Remove from main connections map
      this.connections.delete(clientId);
      this.stats.activeConnections--;

      this.logger.connection(clientId, 'removed', { 
        role: connection.role, 
        userId: connection.userId,
        duration: Date.now() - connection.connectedAt
      });

      return true;

    } catch (error) {
      this.logger.error(error, 'Failed to remove connection');
      return false;
    }
  }

  /**
   * Get connection by client ID
   */
  getConnection(clientId) {
    return this.connections.get(clientId);
  }

  /**
   * Get driver connection by driver ID
   */
  getDriverConnection(driverId) {
    return this.driverConnections.get(driverId);
  }

  /**
   * Get user connection by user ID
   */
  getUserConnection(userId) {
    return this.userConnections.get(userId);
  }

  /**
   * Update connection activity
   */
  updateActivity(clientId) {
    const connection = this.connections.get(clientId);
    if (connection) {
      connection.lastActivity = Date.now();
      connection.isAlive = true;
    }
  }

  /**
   * Mark connection as inactive
   */
  markInactive(clientId) {
    const connection = this.connections.get(clientId);
    if (connection) {
      connection.isAlive = false;
    }
  }

  /**
   * Get all connections by role
   */
  getConnectionsByRole(role) {
    const connections = [];
    for (const [clientId, connection] of this.connections) {
      if (connection.role === role) {
        connections.push(connection);
      }
    }
    return connections;
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      ...this.stats,
      connections: {
        total: this.connections.size,
        drivers: this.driverConnections.size,
        users: this.userConnections.size
      }
    };
  }

  /**
   * Clean up stale connections
   */
  cleanupStaleConnections(timeout = 300000) { // 5 minutes default
    const now = Date.now();
    const staleConnections = [];

    for (const [clientId, connection] of this.connections) {
      if (now - connection.lastActivity > timeout) {
        staleConnections.push(clientId);
      }
    }

    staleConnections.forEach(clientId => {
      this.logger.warn('Cleaning up stale connection', { clientId });
      this.removeConnection(clientId);
    });

    return staleConnections.length;
  }

  /**
   * Broadcast message to all connections
   */
  broadcast(message, excludeClientId = null) {
    let sent = 0;
    for (const [clientId, connection] of this.connections) {
      if (excludeClientId && clientId === excludeClientId) continue;
      
      if (connection.ws.readyState === 1) { // WebSocket.OPEN
        try {
          connection.ws.send(JSON.stringify(message));
          sent++;
        } catch (error) {
          this.logger.error(error, `Failed to send message to ${clientId}`);
          this.removeConnection(clientId);
        }
      }
    }
    return sent;
  }

  /**
   * Send message to specific connection
   */
  sendToConnection(clientId, message) {
    const connection = this.connections.get(clientId);
    if (!connection) {
      this.logger.warn('Connection not found for message', { clientId });
      return false;
    }

    if (connection.ws.readyState === 1) { // WebSocket.OPEN
      try {
        connection.ws.send(JSON.stringify(message));
        this.updateActivity(clientId);
        return true;
      } catch (error) {
        this.logger.error(error, `Failed to send message to ${clientId}`);
        this.removeConnection(clientId);
        return false;
      }
    }

    return false;
  }
}

module.exports = ConnectionManager;
