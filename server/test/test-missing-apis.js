#!/usr/bin/env node

/**
 * Comprehensive API Testing Script for Londa Rides Missing APIs
 * Tests all new endpoints: Scheduled Rides, Carpooling, Parent Subscriptions
 */

const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000';
const API_VERSION = '/api/v1';

// Test data
const TEST_USER = {
  id: 'test-user-123',
  name: 'Test User',
  email: 'test@londa.com',
  phone_number: '+264811234567',
  userType: 'parent'
};

const TEST_DRIVER = {
  id: 'test-driver-456',
  name: 'Test Driver',
  email: 'driver@londa.com',
  phone_number: '+264812345678',
  license_number: 'DRV123456',
  vehicle_type: 'sedan',
  vehicle_model: 'Toyota Corolla',
  vehicle_year: 2020,
  vehicle_color: 'White',
  vehicle_plate: 'WND123',
  status: 'online'
};

// Mock authentication token for testing
const MOCK_TOKEN = 'mock-jwt-token-for-testing';

// Helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'success':
      console.log(`✅ [${timestamp}] ${message}`.green);
      break;
    case 'error':
      console.log(`❌ [${timestamp}] ${message}`.red);
      break;
    case 'warning':
      console.log(`⚠️  [${timestamp}] ${message}`.yellow);
      break;
    default:
      console.log(`ℹ️  [${timestamp}] ${message}`.blue);
  }
};

const makeRequest = async (method, endpoint, data = null, params = null, useAuth = true) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${useAuth ? API_VERSION : ''}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authentication header for API endpoints
    if (useAuth) {
      config.headers['Authorization'] = `Bearer ${MOCK_TOKEN}`;
    }

    if (data) config.data = data;
    if (params) config.params = params;

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test suites
class APITestSuite {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runTest(testName, testFunction) {
    this.results.total++;
    log(`Running test: ${testName}`);
    
    try {
      const result = await testFunction();
      if (result.success) {
        this.results.passed++;
        this.results.tests.push({ name: testName, status: 'PASSED', result });
        log(`✓ ${testName} - PASSED`, 'success');
      } else {
        this.results.failed++;
        this.results.tests.push({ name: testName, status: 'FAILED', result });
        const errorMsg = typeof result.error === 'object' ? JSON.stringify(result.error) : result.error;
        log(`✗ ${testName} - FAILED: ${errorMsg}`, 'error');
      }
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'ERROR', error: error.message });
      log(`✗ ${testName} - ERROR: ${error.message}`, 'error');
    }
  }

  // ==================== SCHEDULED RIDES TESTS ====================

  async testScheduledRides() {
    log('🚗 Testing Scheduled Rides APIs...', 'info');

    // Test 1: Create scheduled ride
    await this.runTest('Create Scheduled Ride', async () => {
      const scheduledRideData = {
        user_id: TEST_USER.id,
        pickup_location: {
          latitude: -22.9576,
          longitude: 17.4909,
          address: 'Windhoek Central, Namibia'
        },
        dropoff_location: {
          latitude: -22.9576,
          longitude: 17.4909,
          address: 'University of Namibia, Windhoek'
        },
        scheduled_date: '2024-02-15',
        scheduled_time: '08:00',
        ride_type: 'standard',
        passenger_count: 1,
        notes: 'Test scheduled ride',
        recurring_pattern: 'weekdays',
        recurring_end_date: '2024-03-15'
      };

      return await makeRequest('POST', '/scheduled-rides', scheduledRideData);
    });

    // Test 2: Get user's scheduled rides
    await this.runTest('Get User Scheduled Rides', async () => {
      return await makeRequest('GET', '/scheduled-rides', null, {
        user_id: TEST_USER.id,
        page: 1,
        limit: 10,
        upcoming_only: true
      });
    });

    // Test 3: Update scheduled ride
    await this.runTest('Update Scheduled Ride', async () => {
      const updateData = {
        notes: 'Updated test scheduled ride',
        passenger_count: 2
      };
      return await makeRequest('PUT', '/scheduled-rides/test-ride-123', updateData);
    });

    // Test 4: Cancel scheduled ride
    await this.runTest('Cancel Scheduled Ride', async () => {
      return await makeRequest('DELETE', '/scheduled-rides/test-ride-123', {
        reason: 'Test cancellation'
      });
    });

    // Test 5: Confirm scheduled ride
    await this.runTest('Confirm Scheduled Ride', async () => {
      return await makeRequest('POST', '/scheduled-rides/test-ride-123/confirm', {
        driver_id: TEST_DRIVER.id
      });
    });

    // Test 6: Get driver's scheduled rides
    await this.runTest('Get Driver Scheduled Rides', async () => {
      return await makeRequest('GET', '/scheduled-rides/driver/scheduled-rides', null, {
        driver_id: TEST_DRIVER.id,
        page: 1,
        limit: 10,
        date: '2024-02-15'
      });
    });
  }

  // ==================== CARPOOL TESTS ====================

  async testCarpool() {
    log('🚗 Testing Carpool APIs...', 'info');

    // Test 1: Create carpool
    await this.runTest('Create Carpool', async () => {
      const carpoolData = {
        user_id: TEST_USER.id,
        pickup_location: {
          latitude: -22.9576,
          longitude: 17.4909,
          address: 'Windhoek Central, Namibia'
        },
        dropoff_location: {
          latitude: -22.9576,
          longitude: 17.4909,
          address: 'University of Namibia, Windhoek'
        },
        scheduled_datetime: '2024-02-15T08:00:00Z',
        max_passengers: 4,
        fare_per_person: 8.50,
        notes: 'Test carpool ride',
        vehicle_preferences: ['sedan', 'suv']
      };

      return await makeRequest('POST', '/carpool/create', carpoolData);
    });

    // Test 2: Find available carpools
    await this.runTest('Find Available Carpools', async () => {
      return await makeRequest('GET', '/carpool/available', null, {
        pickup_latitude: -22.9576,
        pickup_longitude: 17.4909,
        dropoff_latitude: -22.9576,
        dropoff_longitude: 17.4909,
        radius: 5,
        max_fare_per_person: 10,
        page: 1,
        limit: 10
      });
    });

    // Test 3: Join carpool
    await this.runTest('Join Carpool', async () => {
      return await makeRequest('POST', '/carpool/test-carpool-123/join', {
        user_id: TEST_USER.id,
        notes: 'Test join request'
      });
    });

    // Test 4: Leave carpool
    await this.runTest('Leave Carpool', async () => {
      return await makeRequest('DELETE', '/carpool/test-carpool-123/leave', {
        user_id: TEST_USER.id,
        reason: 'Test leave request'
      });
    });

    // Test 5: Get user's carpool rides
    await this.runTest('Get User Carpool Rides', async () => {
      return await makeRequest('GET', '/carpool/my-rides', null, {
        user_id: TEST_USER.id,
        page: 1,
        limit: 10,
        type: 'all'
      });
    });

    // Test 6: Update carpool
    await this.runTest('Update Carpool', async () => {
      const updateData = {
        user_id: TEST_USER.id,
        max_passengers: 6,
        fare_per_person: 7.50,
        notes: 'Updated carpool details'
      };
      return await makeRequest('PUT', '/carpool/test-carpool-123', updateData);
    });

    // Test 7: Get carpool participants
    await this.runTest('Get Carpool Participants', async () => {
      return await makeRequest('GET', '/carpool/test-carpool-123/participants');
    });

    // Test 8: Cancel carpool
    await this.runTest('Cancel Carpool', async () => {
      return await makeRequest('POST', '/carpool/test-carpool-123/cancel', {
        user_id: TEST_USER.id,
        reason: 'Test cancellation'
      });
    });
  }

  // ==================== PARENT SUBSCRIPTION TESTS ====================

  async testParentSubscription() {
    log('👨‍👩‍👧‍👦 Testing Parent Subscription APIs...', 'info');

    // Test 1: Subscribe to parent package
    await this.runTest('Subscribe to Parent Package', async () => {
      const subscriptionData = {
        user_id: TEST_USER.id,
        payment_method: 'card',
        payment_token: 'mock_token_' + Date.now(),
        children_profiles: []
      };

      return await makeRequest('POST', '/parent/subscribe', subscriptionData);
    });

    // Test 2: Get parent subscription status
    await this.runTest('Get Parent Subscription Status', async () => {
      return await makeRequest('GET', '/parent/subscription', null, {
        user_id: TEST_USER.id
      });
    });

    // Test 3: Update parent subscription
    await this.runTest('Update Parent Subscription', async () => {
      const updateData = {
        user_id: TEST_USER.id,
        auto_renew: true,
        notification_preferences: {
          email: true,
          sms: true,
          push: true
        }
      };
      return await makeRequest('PUT', '/parent/subscription', updateData);
    });

    // Test 4: Get monthly usage statistics
    await this.runTest('Get Monthly Usage Statistics', async () => {
      return await makeRequest('GET', '/parent/usage', null, {
        user_id: TEST_USER.id,
        month: 2,
        year: 2024
      });
    });

    // Test 5: Get children profiles
    await this.runTest('Get Children Profiles', async () => {
      return await makeRequest('GET', '/parent/children', null, {
        user_id: TEST_USER.id
      });
    });

    // Test 6: Add child profile
    await this.runTest('Add Child Profile', async () => {
      const childData = {
        user_id: TEST_USER.id,
        child_name: 'Test Child',
        child_age: 12,
        school_name: 'Test School',
        pickup_address: '123 Test Street, Windhoek',
        dropoff_address: 'Test School, Windhoek',
        emergency_contact: {
          name: 'Emergency Contact',
          phone: '+264811234567',
          relationship: 'Parent'
        }
      };

      return await makeRequest('POST', '/parent/children', childData);
    });

    // Test 7: Get child's ride history
    await this.runTest('Get Child Ride History', async () => {
      return await makeRequest('GET', '/parent/children/test-child-123/rides', null, {
        user_id: TEST_USER.id,
        page: 1,
        limit: 10,
        date_range: '2024-01-01|2024-12-31'
      });
    });

    // Test 8: Cancel parent subscription
    await this.runTest('Cancel Parent Subscription', async () => {
      return await makeRequest('DELETE', '/parent/subscription', {
        user_id: TEST_USER.id,
        reason: 'Test cancellation'
      });
    });
  }

  // ==================== HEALTH CHECK TESTS ====================

  async testHealthChecks() {
    log('🏥 Testing Health Check APIs...', 'info');

    // Test 1: Main server health
    await this.runTest('Main Server Health Check', async () => {
      return await makeRequest('GET', '/health', null, null, false);
    });

    // Test 2: API test endpoint
    await this.runTest('API Test Endpoint', async () => {
      return await makeRequest('GET', '/test', null, null, false);
    });
  }

  // ==================== MAIN TEST RUNNER ====================

  async runAllTests() {
    log('🚀 Starting Comprehensive API Tests for Londa Rides Missing APIs', 'info');
    log(`Testing against: ${BASE_URL}${API_VERSION}`, 'info');
    log('', 'info');

    const startTime = Date.now();

    try {
      await this.testHealthChecks();
      await this.testScheduledRides();
      await this.testCarpool();
      await this.testParentSubscription();

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      this.printResults(duration);
    } catch (error) {
      log(`Test suite failed with error: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  printResults(duration) {
    log('', 'info');
    log('='.repeat(60), 'info');
    log('📊 TEST RESULTS SUMMARY', 'info');
    log('='.repeat(60), 'info');
    
    const passRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
    
    log(`Total Tests: ${this.results.total}`, 'info');
    log(`Passed: ${this.results.passed}`.green, 'success');
    log(`Failed: ${this.results.failed}`.red, 'error');
    log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'success' : 'warning');
    log(`Duration: ${duration.toFixed(2)}s`, 'info');
    
    log('', 'info');
    log('📋 DETAILED RESULTS:', 'info');
    log('-'.repeat(60), 'info');
    
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      log(`${status} ${test.name}`, test.status === 'PASSED' ? 'success' : 'error');
    });

    log('', 'info');
    log('='.repeat(60), 'info');
    
    if (this.results.failed === 0) {
      log('🎉 All tests passed! APIs are working correctly.', 'success');
    } else {
      log(`⚠️  ${this.results.failed} test(s) failed. Please check the implementation.`, 'warning');
    }
    
    log('='.repeat(60), 'info');
  }
}

// Run the tests
if (require.main === module) {
  const testSuite = new APITestSuite();
  testSuite.runAllTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = APITestSuite;
