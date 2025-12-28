const http = require('http');

console.log('🧪 Running Integration Tests for Londa Rides API...\n');

// Test 1: Basic Server Health
function testServerHealth() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing server health...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/test',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Server health: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.succcess) {
          console.log('   ✅ Server is responding correctly');
          resolve(true);
        } else {
          console.log('   ❌ Server response unexpected');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Server health check failed: ${error.message}`);
      resolve(false);
    });
    
    req.end();
  });
}

// Test 2: User Registration
function testUserRegistration() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing user registration...');
    
    const postData = JSON.stringify({
      phone_number: '+1234567890'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/registration',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ User registration: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ User registration working');
          resolve(true);
        } else {
          console.log('   ❌ User registration failed');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ User registration test failed: ${error.message}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 3: Driver Registration
function testDriverRegistration() {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing driver registration...');
    
    const postData = JSON.stringify({
      phone_number: '+1234567891'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/driver/registration',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Driver registration: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Driver registration working');
          resolve(true);
        } else {
          console.log('   ❌ Driver registration failed');
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Driver registration test failed: ${error.message}`);
      resolve(false);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run all integration tests
async function runIntegrationTests() {
  console.log('🚀 Starting integration tests...\n');
  
  const results = [];
  
  // Test 1: Server Health
  const healthResult = await testServerHealth();
  results.push({ test: 'Server Health', passed: healthResult });
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: User Registration
  const userResult = await testUserRegistration();
  results.push({ test: 'User Registration', passed: userResult });
  
  // Wait a bit between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Driver Registration
  const driverResult = await testDriverRegistration();
  results.push({ test: 'Driver Registration', passed: driverResult });
  
  // Summary
  console.log('\n📊 Integration Test Results:');
  console.log('═'.repeat(40));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All integration tests passed! API is ready for use.');
  } else {
    console.log('⚠️  Some integration tests failed. Please check the issues above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runIntegrationTests().catch(console.error);
}

module.exports = { runIntegrationTests };
