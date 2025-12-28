/**
 * Integration Tests for Server-Socket Communication
 * Tests the integration between main server and socket server
 */

const axios = require('axios');
const WebSocket = require('ws');

const MAIN_SERVER_URL = 'http://localhost:8000';
const SOCKET_HTTP_URL = 'http://localhost:3001';
const SOCKET_WS_URL = 'ws://localhost:8080';

// Test configuration
const TEST_CONFIG = {
  driverId: 'test-driver-123',
  userId: 'test-user-456',
  rideId: 'test-ride-789',
  coordinates: {
    latitude: -22.9576,
    longitude: 18.4904
  }
};

class IntegrationTester {
  constructor() {
    this.results = [];
    this.wsConnection = null;
  }

  async runAllTests() {
    console.log('🧪 Starting Server-Socket Integration Tests...\n');

    try {
      await this.testServerHealth();
      await this.testSocketHealth();
      await this.testWebSocketConnection();
      await this.testDriverValidation();
      await this.testNearbyDrivers();
      await this.testRideLifecycle();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }
  }

  async testServerHealth() {
    console.log('1️⃣ Testing Main Server Health...');
    try {
      const response = await axios.get(`${MAIN_SERVER_URL}/health`);
      this.addResult('Main Server Health', response.status === 200, response.data);
    } catch (error) {
      this.addResult('Main Server Health', false, error.message);
    }
  }

  async testSocketHealth() {
    console.log('2️⃣ Testing Socket Server Health...');
    try {
      const response = await axios.get(`${SOCKET_HTTP_URL}/api/health`);
      this.addResult('Socket Server Health', response.status === 200, response.data);
    } catch (error) {
      this.addResult('Socket Server Health', false, error.message);
    }
  }

  async testWebSocketConnection() {
    console.log('3️⃣ Testing WebSocket Connection...');
    return new Promise((resolve) => {
      try {
        this.wsConnection = new WebSocket(SOCKET_WS_URL);
        
        this.wsConnection.on('open', () => {
          console.log('   ✅ WebSocket connected');
          this.addResult('WebSocket Connection', true, 'Connected successfully');
          this.wsConnection.close();
          resolve();
        });

        this.wsConnection.on('error', (error) => {
          console.log('   ❌ WebSocket connection failed');
          this.addResult('WebSocket Connection', false, error.message);
          resolve();
        });

        this.wsConnection.on('message', (data) => {
          const message = JSON.parse(data.toString());
          console.log('   📨 Received message:', message.type);
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          if (this.wsConnection.readyState === WebSocket.CONNECTING) {
            this.wsConnection.close();
            this.addResult('WebSocket Connection', false, 'Connection timeout');
            resolve();
          }
        }, 5000);

      } catch (error) {
        this.addResult('WebSocket Connection', false, error.message);
        resolve();
      }
    });
  }

  async testDriverValidation() {
    console.log('4️⃣ Testing Driver Validation...');
    try {
      const response = await axios.get(`${MAIN_SERVER_URL}/api/v1/socket/driver/${TEST_CONFIG.driverId}/validate`, {
        headers: {
          'X-Socket-Secret': 'londa-socket-secret-2024'
        }
      });
      // Accept 200 (driver found) or 404 (driver not found) as success
      const isSuccess = response.status === 200 || response.status === 404;
      this.addResult('Driver Validation', isSuccess, response.data);
    } catch (error) {
      // Check if it's a 404 error (expected for non-existent driver)
      if (error.response && error.response.status === 404) {
        this.addResult('Driver Validation', true, 'Driver not found (expected)');
      } else {
        this.addResult('Driver Validation', false, error.message);
      }
    }
  }

  async testNearbyDrivers() {
    console.log('5️⃣ Testing Nearby Drivers API...');
    try {
      const response = await axios.get(`${SOCKET_HTTP_URL}/api/nearby-drivers`, {
        params: {
          lat: TEST_CONFIG.coordinates.latitude,
          lon: TEST_CONFIG.coordinates.longitude,
          radius: 5
        }
      });
      this.addResult('Nearby Drivers API', response.status === 200, response.data);
    } catch (error) {
      this.addResult('Nearby Drivers API', false, error.message);
    }
  }

  async testRideLifecycle() {
    console.log('6️⃣ Testing Ride Lifecycle Integration...');
    
    try {
      // Test ride event endpoint
      const response = await axios.post(`${MAIN_SERVER_URL}/api/v1/socket/ride-event`, {
        rideId: TEST_CONFIG.rideId,
        event: 'test',
        data: { test: true }
      }, {
        headers: {
          'X-Socket-Secret': 'londa-socket-secret-2024',
          'Content-Type': 'application/json'
        }
      });
      
      // Accept 200 (ride processed) or 404 (ride not found) as success
      const isSuccess = response.status === 200 || response.status === 404;
      this.addResult('Ride Event Integration', isSuccess, response.data);
    } catch (error) {
      // Check if it's a 404 error (expected for non-existent ride)
      if (error.response && error.response.status === 404) {
        this.addResult('Ride Event Integration', true, 'Ride not found (expected)');
      } else {
        this.addResult('Ride Event Integration', false, error.message);
      }
    }
  }

  addResult(testName, passed, details) {
    const result = {
      test: testName,
      passed,
      details: typeof details === 'string' ? details : JSON.stringify(details, null, 2)
    };
    
    this.results.push(result);
    
    const status = passed ? '✅' : '❌';
    console.log(`   ${status} ${testName}: ${passed ? 'PASSED' : 'FAILED'}`);
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('='.repeat(50));
    
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.test}`);
      if (!result.passed) {
        console.log(`   Details: ${result.details}`);
      }
    });
    
    console.log('='.repeat(50));
    console.log(`📈 Overall: ${passed}/${total} tests passed (${Math.round(passed/total*100)}%)`);
    
    if (passed === total) {
      console.log('🎉 All integration tests passed! Server-Socket integration is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the details above and ensure both servers are running.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = IntegrationTester;
