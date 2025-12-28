/**
 * HTTP Client for Socket Server to communicate with Main Server
 * Handles all API calls to the main Londa Rides server with robust error handling
 */

const axios = require('axios');

class ServerHttpClient {
  constructor() {
    this.baseURL = process.env.SERVER_URL || 'http://localhost:8000';
    this.apiSecret = process.env.API_SECRET || 'londa-socket-secret-2024';
    
    // Connection state management
    this.isConnected = false;
    this.lastConnectionAttempt = 0;
    this.connectionRetryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000; // Start with 1 second
    this.maxRetryDelay = 30000; // Max 30 seconds
    
    // Circuit breaker state
    this.circuitBreakerState = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.circuitBreakerThreshold = 5;
    this.circuitBreakerTimeout = 60000; // 1 minute
    this.circuitBreakerFailures = 0;
    this.circuitBreakerLastFailure = 0;
    
    // Create axios instance with robust config
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 15000, // Increased timeout
      maxRedirects: 3,
      // Connection pooling
      httpAgent: new (require('http').Agent)({
        keepAlive: true,
        keepAliveMsecs: 30000,
        maxSockets: 10,
        maxFreeSockets: 5
      }),
      headers: {
        'Content-Type': 'application/json',
        'X-Socket-Secret': this.apiSecret,
        'User-Agent': 'Londa-Socket-Server/1.0',
        'Connection': 'keep-alive'
      }
    });

    // Add request interceptor with circuit breaker
    this.client.interceptors.request.use(
      (config) => {
        // Check circuit breaker state
        if (this.circuitBreakerState === 'OPEN') {
          const now = Date.now();
          if (now - this.circuitBreakerLastFailure < this.circuitBreakerTimeout) {
            return Promise.reject(new Error('Circuit breaker is OPEN - main server unavailable'));
          } else {
            this.circuitBreakerState = 'HALF_OPEN';
            console.log('🔄 Circuit breaker moving to HALF_OPEN state');
          }
        }

        const url = config.url || config.baseURL || 'unknown';
        console.log(`🌐 HTTP Request: ${config.method?.toUpperCase()} ${url}`);
        return config;
      },
      (error) => {
        console.error('❌ HTTP Request Error:', error.message);
        this.handleCircuitBreakerFailure();
        return Promise.reject(error);
      }
    );

    // Add response interceptor with circuit breaker
    this.client.interceptors.response.use(
      (response) => {
        const url = response.config?.url || response.config?.baseURL || 'unknown';
        console.log(`✅ HTTP Response: ${response.status} ${url}`);
        
        // Reset circuit breaker on successful response
        if (this.circuitBreakerState === 'HALF_OPEN') {
          this.circuitBreakerState = 'CLOSED';
          this.circuitBreakerFailures = 0;
          console.log('✅ Circuit breaker reset to CLOSED state');
        }
        
        return response;
      },
      (error) => {
        const url = error.config?.url || error.config?.baseURL || 'unknown';
        const status = error.response?.status || 'no response';
        console.error(`❌ HTTP Response Error: ${status} ${url}`);
        
        this.handleCircuitBreakerFailure();
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle circuit breaker failure
   */
  handleCircuitBreakerFailure() {
    this.circuitBreakerFailures++;
    this.circuitBreakerLastFailure = Date.now();
    
    if (this.circuitBreakerFailures >= this.circuitBreakerThreshold) {
      this.circuitBreakerState = 'OPEN';
      console.log(`🚨 Circuit breaker OPEN - ${this.circuitBreakerFailures} consecutive failures`);
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  calculateBackoffDelay() {
    const delay = Math.min(
      this.retryDelay * Math.pow(2, this.connectionRetryCount),
      this.maxRetryDelay
    );
    return delay + Math.random() * 1000; // Add jitter
  }

  /**
   * Sleep utility for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test connection to main server with exponential backoff retry
   */
  async testConnection() {
    const startTime = Date.now();
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`🔍 Connection attempt ${attempt}/${this.maxRetries} to main server...`);
        
        const response = await this.client.get('/test', {
          timeout: 10000,
          headers: {
            'X-Connection-Test': 'true',
            'X-Attempt': attempt.toString()
          }
        });
        
        // Success!
        this.isConnected = true;
        this.connectionRetryCount = 0;
        this.lastConnectionAttempt = Date.now();
        
        console.log(`✅ Main server connection successful (attempt ${attempt})`);
        return {
          success: true,
          data: response.data,
          attempt: attempt,
          duration: Date.now() - startTime
        };
        
      } catch (error) {
        this.connectionRetryCount = attempt;
        this.lastConnectionAttempt = Date.now();
        
        console.error(`❌ Connection attempt ${attempt} failed:`, error.message);
        
        // If this is the last attempt, return error
        if (attempt === this.maxRetries) {
          return {
            success: false,
            error: this.getDetailedErrorMessage(error),
            attempts: attempt,
            duration: Date.now() - startTime
          };
        }
        
        // Calculate delay for next attempt
        const delay = this.calculateBackoffDelay();
        console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
        
        await this.sleep(delay);
      }
    }
  }

  /**
   * Get detailed error message based on error type
   */
  getDetailedErrorMessage(error) {
    if (error.code === 'ECONNREFUSED') {
      return 'Connection refused - main server may not be running or port 8000 is not accessible';
    } else if (error.code === 'ENOTFOUND') {
      return 'Host not found - check SERVER_URL configuration and network connectivity';
    } else if (error.code === 'ETIMEDOUT') {
      return 'Connection timeout - main server may be slow to start or overloaded';
    } else if (error.code === 'ECONNRESET') {
      return 'Connection reset - main server closed the connection unexpectedly';
    } else if (error.code === 'EHOSTUNREACH') {
      return 'Host unreachable - network routing issue or firewall blocking connection';
    } else if (error.response) {
      return `Server error: ${error.response.status} ${error.response.statusText}`;
    } else {
      return error.message || 'Unknown connection error';
    }
  }

  /**
   * Validate driver credentials and subscription status
   */
  async validateDriver(driverId) {
    try {
      const response = await this.client.get(`/api/v1/socket/driver/${driverId}/validate`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Driver validation failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Driver validation failed'
      };
    }
  }

  /**
   * Get ride details by ID
   */
  async getRideDetails(rideId) {
    try {
      const response = await this.client.get(`/api/v1/socket/ride/${rideId}`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get ride details failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get ride details'
      };
    }
  }

  /**
   * Notify server of ride events
   */
  async notifyRideEvent(rideId, event, data) {
    try {
      const response = await this.client.post('/api/v1/socket/ride-event', {
        rideId,
        event,
        data,
        timestamp: new Date().toISOString()
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Ride event notification failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to notify ride event'
      };
    }
  }

  /**
   * Update driver status (online/offline)
   */
  async updateDriverStatus(driverId, status, location = null) {
    try {
      const payload = {
        driverId,
        status,
        timestamp: new Date().toISOString()
      };

      if (location) {
        payload.location = location;
      }

      const response = await this.client.post('/api/v1/socket/driver-status', payload);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Driver status update failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update driver status'
      };
    }
  }

  /**
   * Sync driver location to Firestore
   */
  async syncDriverLocation(driverId, latitude, longitude, status = 'online') {
    try {
      const response = await this.client.post('/api/v1/socket/driver-location', {
        driverId,
        latitude,
        longitude,
        status,
        timestamp: new Date().toISOString()
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Driver location sync failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to sync driver location'
      };
    }
  }

  /**
   * Get active drivers with locations from Firestore
   */
  async getActiveDriversWithLocations(latitude, longitude, radius = 5) {
    try {
      const response = await this.client.get('/api/v1/socket/active-drivers', {
        params: { latitude, longitude, radius }
      });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('Get active drivers failed:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get active drivers'
      };
    }
  }

  /**
   * Health check to main server
   */
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Health check failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get connection status and health metrics
   */
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      circuitBreakerState: this.circuitBreakerState,
      circuitBreakerFailures: this.circuitBreakerFailures,
      lastConnectionAttempt: this.lastConnectionAttempt,
      retryCount: this.connectionRetryCount,
      baseURL: this.baseURL
    };
  }

  /**
   * Periodic health check (can be called by external scheduler)
   */
  async performHealthCheck() {
    if (this.circuitBreakerState === 'OPEN') {
      const now = Date.now();
      if (now - this.circuitBreakerLastFailure >= this.circuitBreakerTimeout) {
        console.log('🔄 Attempting health check after circuit breaker timeout');
        const result = await this.testConnection();
        return result;
      }
      return {
        success: false,
        error: 'Circuit breaker is OPEN - skipping health check',
        circuitBreakerState: this.circuitBreakerState
      };
    }
    
    return await this.testConnection();
  }
}

// Export singleton instance
module.exports = new ServerHttpClient();
