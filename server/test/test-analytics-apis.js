const http = require('http');

console.log('📊 Testing Analytics APIs...\n');

// Test 1: Get Driver Earnings
function testGetDriverEarnings() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing get driver earnings...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/analytics/earnings?driver_id=test_driver_123&period=week',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get driver earnings: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Driver earnings retrieved successfully');
          console.log(`   💰 Total earnings: $${response.data.totalEarnings}`);
          console.log(`   📊 Total rides: ${response.data.totalRides}`);
          console.log(`   📊 Completed rides: ${response.data.completedRides}`);
          console.log(`   📊 Completion rate: ${response.data.completionRate}%`);
          resolve({ test: 'Get Driver Earnings', passed: true });
        } else {
          console.log('   ❌ Get driver earnings failed');
          resolve({ test: 'Get Driver Earnings', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get driver earnings failed: ${error.message}`);
      resolve({ test: 'Get Driver Earnings', passed: false });
    });
    
    req.end();
  });
}

// Test 2: Get Ride Statistics
function testGetRideStatistics() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing get ride statistics...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/analytics/rides?user_id=test_user_123&period=month',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get ride statistics: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Ride statistics retrieved successfully');
          console.log(`   📊 Total rides: ${response.data.totalRides}`);
          console.log(`   📊 Completed rides: ${response.data.completedRides}`);
          console.log(`   📊 Cancelled rides: ${response.data.cancelledRides}`);
          console.log(`   📊 Completion rate: ${response.data.completionRate}%`);
          resolve({ test: 'Get Ride Statistics', passed: true });
        } else {
          console.log('   ❌ Get ride statistics failed');
          resolve({ test: 'Get Ride Statistics', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get ride statistics failed: ${error.message}`);
      resolve({ test: 'Get Ride Statistics', passed: false });
    });
    
    req.end();
  });
}

// Test 3: Get Performance Metrics
function testGetPerformanceMetrics() {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing get performance metrics...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/analytics/performance?driver_id=test_driver_123&period=week',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get performance metrics: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Performance metrics retrieved successfully');
          console.log(`   📊 Total rides: ${response.data.totalRides}`);
          console.log(`   📊 Completed rides: ${response.data.completedRides}`);
          console.log(`   ⭐ Average rating: ${response.data.averageRating}`);
          console.log(`   📊 Completion rate: ${response.data.completionRate}%`);
          resolve({ test: 'Get Performance Metrics', passed: true });
        } else {
          console.log('   ❌ Get performance metrics failed');
          resolve({ test: 'Get Performance Metrics', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get performance metrics failed: ${error.message}`);
      resolve({ test: 'Get Performance Metrics', passed: false });
    });
    
    req.end();
  });
}

// Test 4: Get Analytics with Date Range
function testGetAnalyticsWithDateRange() {
  return new Promise((resolve) => {
    console.log('4️⃣ Testing get analytics with date range...');
    
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: `/api/v1/analytics/earnings?driver_id=test_driver_123&start_date=${startDate}&end_date=${endDate}`,
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get analytics with date range: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Analytics with date range retrieved successfully');
          console.log(`   📅 Period: ${startDate} to ${endDate}`);
          console.log(`   💰 Total earnings: $${response.data.totalEarnings}`);
          resolve({ test: 'Get Analytics with Date Range', passed: true });
        } else {
          console.log('   ❌ Get analytics with date range failed');
          resolve({ test: 'Get Analytics with Date Range', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get analytics with date range failed: ${error.message}`);
      resolve({ test: 'Get Analytics with Date Range', passed: false });
    });
    
    req.end();
  });
}

// Run all analytics tests
async function runAnalyticsTests() {
  console.log('🚀 Starting analytics API tests...\n');
  
  const results = [];
  
  // Test 1: Get Driver Earnings
  const earningsResult = await testGetDriverEarnings();
  results.push(earningsResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Get Ride Statistics
  const statisticsResult = await testGetRideStatistics();
  results.push(statisticsResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Get Performance Metrics
  const performanceResult = await testGetPerformanceMetrics();
  results.push(performanceResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Get Analytics with Date Range
  const dateRangeResult = await testGetAnalyticsWithDateRange();
  results.push(dateRangeResult);
  
  // Summary
  console.log('\n📊 Analytics API Test Results:');
  console.log('═'.repeat(40));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All analytics API tests passed!');
  } else {
    console.log('⚠️  Some analytics API tests failed.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAnalyticsTests().catch(console.error);
}

module.exports = { runAnalyticsTests };
