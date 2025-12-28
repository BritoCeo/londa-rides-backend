const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Running Londa Rides Server Tests...\n');

const tests = [
  {
    name: 'Basic API Test',
    file: 'test-api.js',
    description: 'Tests basic server connectivity'
  },
  {
    name: 'User API Test',
    file: 'test-user-api.js',
    description: 'Tests user registration endpoint'
  },
  {
    name: 'Driver API Test',
    file: 'test-driver-api.js',
    description: 'Tests driver registration and login endpoints'
  },
  {
    name: 'Ride APIs Test',
    file: 'test-ride-apis.js',
    description: 'Tests ride booking and management endpoints'
  },
  {
    name: 'Payment APIs Test',
    file: 'test-payment-apis.js',
    description: 'Tests payment processing endpoints'
  },
  {
    name: 'Location APIs Test',
    file: 'test-location-apis.js',
    description: 'Tests real-time location endpoints'
  },
  {
    name: 'Notification APIs Test',
    file: 'test-notification-apis.js',
    description: 'Tests notification system endpoints'
  },
      {
        name: 'Analytics APIs Test',
        file: 'test-analytics-apis.js',
        description: 'Tests analytics and reporting endpoints'
      },
      {
        name: 'Driver Subscription APIs Test',
        file: 'test-driver-subscription-apis.js',
        description: 'Tests driver subscription management endpoints'
      },
  {
    name: 'Integration Test',
    file: 'test-integration.js',
    description: 'Tests complete API workflow'
  },
  {
    name: 'Firestore Setup Test',
    file: 'test-firestore-setup.js',
    description: 'Tests Firestore connection and operations'
  },
  {
    name: 'Simple Connection Test',
    file: 'test-connection-simple.js',
    description: 'Tests basic Firestore connection'
  }
];

async function runTest(test) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Running: ${test.name}`);
    console.log(`📝 Description: ${test.description}`);
    console.log('─'.repeat(50));
    
    const testProcess = spawn('node', [test.file], {
      cwd: __dirname,
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} - PASSED\n`);
        resolve({ name: test.name, status: 'PASSED' });
      } else {
        console.log(`❌ ${test.name} - FAILED (exit code: ${code})\n`);
        resolve({ name: test.name, status: 'FAILED' });
      }
    });
    
    testProcess.on('error', (error) => {
      console.log(`❌ ${test.name} - ERROR: ${error.message}\n`);
      resolve({ name: test.name, status: 'ERROR' });
    });
  });
}

async function runAllTests() {
  console.log('🚀 Starting test suite...\n');
  
  const results = [];
  
  for (const test of tests) {
    const result = await runTest(test);
    results.push(result);
  }
  
  // Summary
  console.log('📊 Test Results Summary');
  console.log('═'.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASSED').length;
  const failed = results.filter(r => r.status === 'FAILED').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  results.forEach(result => {
    const status = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
    console.log(`${status} ${result.name} - ${result.status}`);
  });
  
  console.log('\n📈 Summary:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Errors: ${errors}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed === 0 && errors === 0) {
    console.log('\n🎉 All tests passed! Server is ready for production.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the issues above.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { runAllTests, runTest };
