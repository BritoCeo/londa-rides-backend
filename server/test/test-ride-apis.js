const http = require('http');

console.log('🚗 Testing Ride APIs...\n');

// Test 1: Request Ride
function testRequestRide() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing request ride...');
    
    const postData = JSON.stringify({
      user_id: 'test_user_123',
      pickup_location: {
        latitude: -22.9576,
        longitude: 18.4904,
        address: 'Windhoek, Namibia'
      },
      dropoff_location: {
        latitude: -22.9676,
        longitude: 18.5004,
        address: 'Windhoek CBD, Namibia'
      },
      ride_type: 'standard',
      estimated_fare: 15.50
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/request-ride',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Request ride: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Ride request created successfully');
          console.log(`   📝 Ride ID: ${response.data.ride_id}`);
          resolve({ test: 'Request Ride', passed: true, rideId: response.data.ride_id });
        } else {
          console.log('   ❌ Ride request failed');
          resolve({ test: 'Request Ride', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Request ride failed: ${error.message}`);
      resolve({ test: 'Request Ride', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 2: Get Nearby Drivers
function testGetNearbyDrivers() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing get nearby drivers...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/nearby-drivers?latitude=-22.9576&longitude=18.4904&radius=5',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get nearby drivers: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log(`   ✅ Found ${response.data.count} nearby drivers`);
          resolve({ test: 'Get Nearby Drivers', passed: true });
        } else {
          console.log('   ❌ Get nearby drivers failed');
          resolve({ test: 'Get Nearby Drivers', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get nearby drivers failed: ${error.message}`);
      resolve({ test: 'Get Nearby Drivers', passed: false });
    });
    
    req.end();
  });
}

// Test 3: Cancel Ride
function testCancelRide(rideId) {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing cancel ride...');
    
    const postData = JSON.stringify({
      ride_id: rideId || 'test_ride_123',
      user_id: 'test_user_123',
      reason: 'User cancelled'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/cancel-ride',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Cancel ride: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Ride cancelled successfully');
          resolve({ test: 'Cancel Ride', passed: true });
        } else {
          console.log('   ❌ Cancel ride failed');
          resolve({ test: 'Cancel Ride', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Cancel ride failed: ${error.message}`);
      resolve({ test: 'Cancel Ride', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 4: Rate Ride
function testRateRide() {
  return new Promise((resolve) => {
    console.log('4️⃣ Testing rate ride...');
    
    const postData = JSON.stringify({
      ride_id: 'test_ride_123',
      user_id: 'test_user_123',
      rating: 5,
      review: 'Excellent service!'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/rate-ride',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Rate ride: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Ride rated successfully');
          resolve({ test: 'Rate Ride', passed: true });
        } else {
          console.log('   ❌ Rate ride failed');
          resolve({ test: 'Rate Ride', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Rate ride failed: ${error.message}`);
      resolve({ test: 'Rate Ride', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 5: Driver Accept Ride
function testDriverAcceptRide() {
  return new Promise((resolve) => {
    console.log('5️⃣ Testing driver accept ride...');
    
    const postData = JSON.stringify({
      ride_id: 'test_ride_123',
      driver_id: 'test_driver_123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/driver/accept-ride',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Driver accept ride: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Ride accepted successfully');
          resolve({ test: 'Driver Accept Ride', passed: true });
        } else {
          console.log('   ❌ Driver accept ride failed');
          resolve({ test: 'Driver Accept Ride', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Driver accept ride failed: ${error.message}`);
      resolve({ test: 'Driver Accept Ride', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Run all ride tests
async function runRideTests() {
  console.log('🚀 Starting ride API tests...\n');
  
  const results = [];
  
  // Test 1: Request Ride
  const requestResult = await testRequestRide();
  results.push(requestResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Get Nearby Drivers
  const nearbyResult = await testGetNearbyDrivers();
  results.push(nearbyResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Cancel Ride
  const cancelResult = await testCancelRide(requestResult.rideId);
  results.push(cancelResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Rate Ride
  const rateResult = await testRateRide();
  results.push(rateResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 5: Driver Accept Ride
  const acceptResult = await testDriverAcceptRide();
  results.push(acceptResult);
  
  // Summary
  console.log('\n📊 Ride API Test Results:');
  console.log('═'.repeat(40));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All ride API tests passed!');
  } else {
    console.log('⚠️  Some ride API tests failed.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runRideTests().catch(console.error);
}

module.exports = { runRideTests };
