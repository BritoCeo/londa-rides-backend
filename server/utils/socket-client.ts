/**
 * WebSocket Client Utility for Main Server
 * Handles communication with the Socket Server for real-time features
 */

import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface SocketMessage {
  type: string;
  role: string;
  timestamp: string;
  [key: string]: any;
}

export interface DriverLocationRequest {
  latitude: number;
  longitude: number;
  radius?: number;
}

export interface RideData {
  rideId: string;
  userId: string;
  driverId: string;
  pickupLocation: string;
  destinationLocation: string;
  fare: number;
  rideType: string;
}

export interface RideUpdate {
  rideId: string;
  status: string;
  data: any;
}

class SocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private socketUrl: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private isConnected: boolean = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.socketUrl = process.env.SOCKET_WS_URL || 'ws://localhost:8080';
    this.connect();
  }

  /**
   * Connect to the socket server
   */
  private connect(): void {
    try {
      console.log(`🔌 Connecting to socket server: ${this.socketUrl}`);
      
      this.ws = new WebSocket(this.socketUrl);
      
      this.ws.on('open', () => {
        console.log('✅ Connected to socket server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected');
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: SocketMessage = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Failed to parse socket message:', error);
        }
      });

      this.ws.on('close', (code: number, reason: string) => {
        console.log(`🔌 Socket connection closed: ${code} - ${reason}`);
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected');
        this.reconnect();
      });

      this.ws.on('error', (error: Error) => {
        console.error('❌ Socket connection error:', error);
        this.emit('error', error);
      });

    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
      this.reconnect();
    }
  }

  /**
   * Reconnect with exponential backoff
   */
  private reconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * this.reconnectAttempts;
      
      console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`);
      
      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
    }
  }

  /**
   * Handle incoming messages from socket server
   */
  private handleMessage(message: SocketMessage): void {
    console.log(`📨 Received socket message: ${message.type}`);
    
    switch (message.type) {
      case 'connectionStatus':
        this.emit('connectionStatus', message);
        break;
      case 'heartbeat':
        // Respond to heartbeat
        this.sendHeartbeat();
        break;
      case 'error':
        console.error('Socket server error:', message);
        this.emit('socketError', message);
        break;
      default:
        // Forward other messages to listeners
        this.emit(message.type, message);
    }
  }

  /**
   * Send a message to the socket server
   */
  private sendMessage(message: SocketMessage): boolean {
    if (!this.isConnected || !this.ws) {
      console.error('❌ Socket not connected, cannot send message');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      console.log(`📤 Sent socket message: ${message.type}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send socket message:', error);
      return false;
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 60000); // Send heartbeat every 60 seconds (reduced from 30)
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Send heartbeat message
   */
  private sendHeartbeat(): void {
    this.sendMessage({
      type: 'heartbeat',
      role: 'server',
      timestamp: new Date().toISOString()
    });
  }

  // ==================== PUBLIC API METHODS ====================

  /**
   * Request nearby drivers from socket server
   */
  public requestNearbyDrivers(request: DriverLocationRequest): boolean {
    return this.sendMessage({
      type: 'requestNearbyDrivers',
      role: 'server',
      timestamp: new Date().toISOString(),
      latitude: request.latitude,
      longitude: request.longitude,
      radius: request.radius || 5
    });
  }

  /**
   * Notify driver of a new ride request
   */
  public notifyDriverOfRide(driverId: string, rideData: RideData): boolean {
    return this.sendMessage({
      type: 'notifyDriverOfRide',
      role: 'server',
      timestamp: new Date().toISOString(),
      driverId,
      rideData
    });
  }

  /**
   * Broadcast ride update to all relevant parties
   */
  public broadcastRideUpdate(update: RideUpdate): boolean {
    return this.sendMessage({
      type: 'broadcastRideUpdate',
      role: 'server',
      timestamp: new Date().toISOString(),
      rideId: update.rideId,
      status: update.status,
      data: update.data
    });
  }

  /**
   * Notify user about driver status
   */
  public notifyUserOfDriverStatus(userId: string, driverId: string, status: string, data?: any): boolean {
    return this.sendMessage({
      type: 'notifyUserOfDriverStatus',
      role: 'server',
      timestamp: new Date().toISOString(),
      userId,
      driverId,
      status,
      data
    });
  }

  /**
   * Send ride cancellation notification
   */
  public notifyRideCancellation(rideId: string, reason: string, cancelledBy: string): boolean {
    return this.sendMessage({
      type: 'notifyRideCancellation',
      role: 'server',
      timestamp: new Date().toISOString(),
      rideId,
      reason,
      cancelledBy
    });
  }

  /**
   * Send payment confirmation
   */
  public notifyPaymentConfirmation(userId: string, rideId: string, amount: number, currency: string): boolean {
    return this.sendMessage({
      type: 'notifyPaymentConfirmation',
      role: 'server',
      timestamp: new Date().toISOString(),
      userId,
      rideId,
      amount,
      currency
    });
  }

  /**
   * Send driver location update to user
   */
  public sendDriverLocationUpdate(userId: string, driverId: string, location: { latitude: number; longitude: number }): boolean {
    return this.sendMessage({
      type: 'sendDriverLocationUpdate',
      role: 'server',
      timestamp: new Date().toISOString(),
      userId,
      driverId,
      location
    });
  }

  /**
   * Broadcast system message to all connected clients
   */
  public broadcastSystemMessage(message: string, data?: any): boolean {
    return this.sendMessage({
      type: 'broadcastSystemMessage',
      role: 'server',
      timestamp: new Date().toISOString(),
      message,
      data
    });
  }

  /**
   * Send emergency alert
   */
  public sendEmergencyAlert(userId: string, driverId: string, alertType: string, location?: { latitude: number; longitude: number }): boolean {
    return this.sendMessage({
      type: 'sendEmergencyAlert',
      role: 'server',
      timestamp: new Date().toISOString(),
      userId,
      driverId,
      alertType,
      location
    });
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check if socket is connected
   */
  public isSocketConnected(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  public getConnectionStatus(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'closed';
      default:
        return 'unknown';
    }
  }

  /**
   * Disconnect from socket server
   */
  public disconnect(): void {
    console.log('🔌 Disconnecting from socket server');
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
  }

  /**
   * Force reconnect
   */
  public forceReconnect(): void {
    console.log('🔄 Force reconnecting to socket server');
    this.disconnect();
    this.reconnectAttempts = 0;
    setTimeout(() => this.connect(), 1000);
  }
}

// Export singleton instance
export const socketClient = new SocketClient();
export default SocketClient;
