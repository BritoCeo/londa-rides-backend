/**
 * Test script to demonstrate the robust HTTP client improvements
 * This script tests the circuit breaker, retry logic, and health monitoring
 */

const httpClient = require('./http-client');

async function testRobustConnection() {
  console.log('🧪 Testing Robust HTTP Client Connection\n');
  
  // Test 1: Initial connection test
  console.log('📋 Test 1: Initial Connection Test');
  console.log('=' .repeat(50));
  const initialTest = await httpClient.testConnection();
  console.log('Result:', initialTest);
  console.log('');
  
  // Test 2: Get connection status
  console.log('📋 Test 2: Connection Status');
  console.log('=' .repeat(50));
  const status = httpClient.getConnectionStatus();
  console.log('Status:', JSON.stringify(status, null, 2));
  console.log('');
  
  // Test 3: Health check
  console.log('📋 Test 3: Health Check');
  console.log('=' .repeat(50));
  const healthCheck = await httpClient.performHealthCheck();
  console.log('Health Check:', healthCheck);
  console.log('');
  
  // Test 4: Simulate multiple failures to test circuit breaker
  console.log('📋 Test 4: Circuit Breaker Test (Simulating Failures)');
  console.log('=' .repeat(50));
  
  // Temporarily change baseURL to trigger failures
  const originalURL = httpClient.baseURL;
  httpClient.baseURL = 'http://localhost:9999'; // Non-existent port
  
  for (let i = 1; i <= 6; i++) {
    console.log(`\nAttempt ${i}:`);
    try {
      await httpClient.client.get('/test');
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    
    const currentStatus = httpClient.getConnectionStatus();
    console.log(`Circuit Breaker State: ${currentStatus.circuitBreakerState}`);
    console.log(`Failures: ${currentStatus.circuitBreakerFailures}`);
  }
  
  // Restore original URL
  httpClient.baseURL = originalURL;
  
  // Test 5: Recovery test
  console.log('\n📋 Test 5: Recovery Test');
  console.log('=' .repeat(50));
  console.log('Restoring connection to main server...');
  
  // Wait for circuit breaker timeout
  console.log('Waiting for circuit breaker to reset...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const recoveryTest = await httpClient.testConnection();
  console.log('Recovery Result:', recoveryTest);
  
  console.log('\n✅ All tests completed!');
}

// Run the test
testRobustConnection().catch(console.error);
