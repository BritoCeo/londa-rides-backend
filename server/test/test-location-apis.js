const http = require('http');

console.log('📍 Testing Location APIs...\n');

// Test 1: Update Location (User)
function testUpdateUserLocation() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing update user location...');
    
    const postData = JSON.stringify({
      user_id: 'test_user_123',
      latitude: -22.9576,
      longitude: 18.4904,
      type: 'user'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/update-location',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Update user location: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ User location updated successfully');
          resolve({ test: 'Update User Location', passed: true });
        } else {
          console.log('   ❌ Update user location failed');
          resolve({ test: 'Update User Location', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Update user location failed: ${error.message}`);
      resolve({ test: 'Update User Location', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 2: Update Location (Driver)
function testUpdateDriverLocation() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing update driver location...');
    
    const postData = JSON.stringify({
      driver_id: 'test_driver_123',
      latitude: -22.9476,
      longitude: 18.4804,
      type: 'driver'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/update-location',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Update driver location: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Driver location updated successfully');
          resolve({ test: 'Update Driver Location', passed: true });
        } else {
          console.log('   ❌ Update driver location failed');
          resolve({ test: 'Update Driver Location', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Update driver location failed: ${error.message}`);
      resolve({ test: 'Update Driver Location', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 3: Get Ride Status
function testGetRideStatus() {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing get ride status...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/ride-status/test_ride_123',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get ride status: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log(`   ✅ Ride status retrieved: ${response.data.ride.status}`);
          if (response.data.driver_location) {
            console.log('   📍 Driver location available');
          }
          resolve({ test: 'Get Ride Status', passed: true });
        } else {
          console.log('   ❌ Get ride status failed');
          resolve({ test: 'Get Ride Status', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get ride status failed: ${error.message}`);
      resolve({ test: 'Get Ride Status', passed: false });
    });
    
    req.end();
  });
}

// Test 4: Track Ride
function testTrackRide() {
  return new Promise((resolve) => {
    console.log('4️⃣ Testing track ride...');
    
    const postData = JSON.stringify({
      ride_id: 'test_ride_123',
      user_id: 'test_user_123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/ride-tracking',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Track ride: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Ride tracking data retrieved');
          if (response.data.distance_km) {
            console.log(`   📏 Distance: ${response.data.distance_km}km`);
          }
          resolve({ test: 'Track Ride', passed: true });
        } else {
          console.log('   ❌ Track ride failed');
          resolve({ test: 'Track Ride', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Track ride failed: ${error.message}`);
      resolve({ test: 'Track Ride', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Run all location tests
async function runLocationTests() {
  console.log('🚀 Starting location API tests...\n');
  
  const results = [];
  
  // Test 1: Update User Location
  const userLocationResult = await testUpdateUserLocation();
  results.push(userLocationResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Update Driver Location
  const driverLocationResult = await testUpdateDriverLocation();
  results.push(driverLocationResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Get Ride Status
  const statusResult = await testGetRideStatus();
  results.push(statusResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Track Ride
  const trackResult = await testTrackRide();
  results.push(trackResult);
  
  // Summary
  console.log('\n📊 Location API Test Results:');
  console.log('═'.repeat(40));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All location API tests passed!');
  } else {
    console.log('⚠️  Some location API tests failed.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runLocationTests().catch(console.error);
}

module.exports = { runLocationTests };
