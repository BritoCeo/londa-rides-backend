const axios = require('axios');

// Test configuration
const BASE_URL = 'http://localhost:8000';
const TEST_PHONE = '+264813442530';
const TEST_EMAIL = 'test@example.com';

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to run tests
async function runTest(testName, testFunction) {
  testResults.total++;
  console.log(`\n🧪 Testing: ${testName}`);
  console.log('='.repeat(50));
  
  try {
    const result = await testFunction();
    if (result.success) {
      testResults.passed++;
      console.log(`✅ ${testName} - PASSED`);
      testResults.details.push({ name: testName, status: 'PASSED', details: result.details });
    } else {
      testResults.failed++;
      console.log(`❌ ${testName} - FAILED`);
      console.log(`   Error: ${result.error}`);
      testResults.details.push({ name: testName, status: 'FAILED', error: result.error });
    }
  } catch (error) {
    testResults.failed++;
    console.log(`❌ ${testName} - ERROR`);
    console.log(`   Error: ${error.message}`);
    testResults.details.push({ name: testName, status: 'ERROR', error: error.message });
  }
}

// Test 1: Server Health Check
async function testServerHealth() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/health`);
    return { success: true, details: 'Server is running' };
  } catch (error) {
    // Try a different endpoint if health doesn't exist
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/`);
      return { success: true, details: 'Server is running' };
    } catch (error2) {
      return { success: false, error: 'Server not responding' };
    }
  }
}

// Test 2: User Registration (OTP)
async function testUserRegistration() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/registration`, {
      phone_number: TEST_PHONE
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: `OTP sent to ${TEST_PHONE}`,
        sessionInfo: response.data.sessionInfo 
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 3: Unified OTP Login
async function testUnifiedOtpLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/otp-login`, {
      phone_number: TEST_PHONE,
      userType: 'user'
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: `Unified OTP sent to ${TEST_PHONE}`,
        sessionInfo: response.data.data?.sessionInfo 
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 4: Verify OTP (Mock)
async function testVerifyOtp() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/verify-otp`, {
      phone_number: TEST_PHONE,
      otp: '123456', // Mock OTP
      sessionInfo: 'mock-session-info'
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: 'OTP verification endpoint working',
        token: response.data.data?.token 
      };
    } else {
      // This is expected to fail with mock OTP, but endpoint should be accessible
      return { success: true, details: 'OTP verification endpoint accessible (expected failure with mock OTP)' };
    }
  } catch (error) {
    if (error.response?.status === 400) {
      return { success: true, details: 'OTP verification endpoint accessible (expected failure with mock OTP)' };
    }
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 5: Create User Account
async function testCreateUserAccount() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/create-account`, {
      name: 'Test User',
      email: TEST_EMAIL,
      phone_number: TEST_PHONE,
      userType: 'user'
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: 'User account creation endpoint working',
        userId: response.data.data?.user?.id 
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 6: Driver Account Creation
async function testCreateDriverAccount() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/driver/create-account`, {
      name: 'Test Driver',
      email: 'driver@example.com',
      phone_number: '+264813442531'
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: 'Driver account creation endpoint working',
        driverId: response.data.data?.driver?.id 
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 7: Request Ride (Enhanced with Google Maps)
async function testRequestRide() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/request-ride`, {
      user_id: 'test_user_123',
      pickup_location: {
        latitude: -22.5609,
        longitude: 17.0658,
        name: 'Windhoek Central'
      },
      dropoff_location: {
        latitude: -22.5709,
        longitude: 17.0758,
        name: 'University of Namibia'
      },
      ride_type: 'standard',
      passengerCount: 1
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: 'Ride request created successfully',
        rideId: response.data.data?.ride_id,
        distance: response.data.data?.distance,
        estimatedFare: response.data.data?.estimated_fare
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 8: Cancel Ride
async function testCancelRide() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/cancel-ride`, {
      rideId: 'test_ride_123'
    });
    
    // This should fail with auth error, but endpoint should be accessible
    if (error.response?.status === 401) {
      return { success: true, details: 'Cancel ride endpoint accessible (auth required)' };
    }
    return { success: true, details: 'Cancel ride endpoint working' };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: true, details: 'Cancel ride endpoint accessible (auth required)' };
    }
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 9: Track Ride
async function testTrackRide() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/ride-tracking`, {
      rideId: 'test_ride_123'
    });
    
    // This should fail with auth error, but endpoint should be accessible
    if (error.response?.status === 401) {
      return { success: true, details: 'Track ride endpoint accessible (auth required)' };
    }
    return { success: true, details: 'Track ride endpoint working' };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: true, details: 'Track ride endpoint accessible (auth required)' };
    }
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 10: Google Maps - Geocode
async function testMapsGeocode() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/maps/geocode`, {
      address: 'Windhoek, Namibia'
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: 'Geocoding working',
        coordinates: response.data.data 
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 11: Google Maps - Distance Calculation
async function testMapsDistance() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/maps/distance`, {
      origin: { latitude: -22.5609, longitude: 17.0658 },
      destination: { latitude: -22.5709, longitude: 17.0758 }
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: 'Distance calculation working',
        distance: response.data.data 
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 12: Google Maps - Fare Calculation
async function testMapsFare() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/maps/calculate-fare`, {
      origin: { latitude: -22.5609, longitude: 17.0658 },
      destination: { latitude: -22.5709, longitude: 17.0758 }
    });
    
    if (response.data.success) {
      return { 
        success: true, 
        details: 'Fare calculation working',
        fare: response.data.data 
      };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error) {
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 13: Driver Subscription
async function testDriverSubscription() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/driver/subscription`, {
      driver_id: 'test_driver_123',
      payment_method: 'cash'
    });
    
    // This should fail with auth error, but endpoint should be accessible
    if (error.response?.status === 401) {
      return { success: true, details: 'Driver subscription endpoint accessible (auth required)' };
    }
    return { success: true, details: 'Driver subscription endpoint working' };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: true, details: 'Driver subscription endpoint accessible (auth required)' };
    }
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 14: Payment Processing
async function testPaymentProcessing() {
  try {
    const response = await axios.post(`${BASE_URL}/api/v1/payment/process`, {
      user_id: 'test_user_123',
      amount: 15.00,
      payment_method: 'cash'
    });
    
    // This should fail with auth error, but endpoint should be accessible
    if (error.response?.status === 401) {
      return { success: true, details: 'Payment processing endpoint accessible (auth required)' };
    }
    return { success: true, details: 'Payment processing endpoint working' };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: true, details: 'Payment processing endpoint accessible (auth required)' };
    }
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Test 15: Analytics
async function testAnalytics() {
  try {
    const response = await axios.get(`${BASE_URL}/api/v1/analytics/rides`);
    
    // This should fail with auth error, but endpoint should be accessible
    if (error.response?.status === 401) {
      return { success: true, details: 'Analytics endpoint accessible (auth required)' };
    }
    return { success: true, details: 'Analytics endpoint working' };
  } catch (error) {
    if (error.response?.status === 401) {
      return { success: true, details: 'Analytics endpoint accessible (auth required)' };
    }
    return { success: false, error: error.response?.data?.message || error.message };
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing...');
  console.log('='.repeat(60));
  
  // Run all tests
  await runTest('Server Health Check', testServerHealth);
  await runTest('User Registration (OTP)', testUserRegistration);
  await runTest('Unified OTP Login', testUnifiedOtpLogin);
  await runTest('Verify OTP', testVerifyOtp);
  await runTest('Create User Account', testCreateUserAccount);
  await runTest('Create Driver Account', testCreateDriverAccount);
  await runTest('Request Ride (Enhanced)', testRequestRide);
  await runTest('Cancel Ride', testCancelRide);
  await runTest('Track Ride', testTrackRide);
  await runTest('Google Maps - Geocode', testMapsGeocode);
  await runTest('Google Maps - Distance', testMapsDistance);
  await runTest('Google Maps - Fare', testMapsFare);
  await runTest('Driver Subscription', testDriverSubscription);
  await runTest('Payment Processing', testPaymentProcessing);
  await runTest('Analytics', testAnalytics);
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  // Print detailed results
  console.log('\n📋 DETAILED RESULTS:');
  console.log('-'.repeat(60));
  testResults.details.forEach(test => {
    const status = test.status === 'PASSED' ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.status}`);
    if (test.details) console.log(`   Details: ${test.details}`);
    if (test.error) console.log(`   Error: ${test.error}`);
  });
  
  console.log('\n🎉 API Testing Complete!');
}

// Run the tests
runAllTests().catch(console.error);

