const http = require('http');

console.log('💳 Testing Payment APIs...\n');

// Test 1: Calculate Fare
function testCalculateFare() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing calculate fare...');
    
    const postData = JSON.stringify({
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
      distance_km: 5.2
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/payment/calculate-fare',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Calculate fare: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log(`   ✅ Fare calculated: $${response.data.total_fare}`);
          console.log(`   📊 Base fare: $${response.data.base_fare}`);
          console.log(`   📊 Distance: ${response.data.distance_km}km`);
          console.log(`   📊 Surge multiplier: ${response.data.surge_multiplier}x`);
          resolve({ test: 'Calculate Fare', passed: true, fare: response.data.total_fare });
        } else {
          console.log('   ❌ Calculate fare failed');
          resolve({ test: 'Calculate Fare', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Calculate fare failed: ${error.message}`);
      resolve({ test: 'Calculate Fare', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 2: Process Payment
function testProcessPayment() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing process payment...');
    
    const postData = JSON.stringify({
      ride_id: 'test_ride_123',
      user_id: 'test_user_123',
      amount: 15.50,
      payment_method: 'card',
      payment_token: 'tok_test_123456789'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/payment/process',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Process payment: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Payment processed successfully');
          console.log(`   📝 Transaction ID: ${response.data.transaction_id}`);
          resolve({ test: 'Process Payment', passed: true, transactionId: response.data.transaction_id });
        } else {
          console.log('   ❌ Process payment failed');
          resolve({ test: 'Process Payment', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Process payment failed: ${error.message}`);
      resolve({ test: 'Process Payment', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 3: Get Payment History
function testGetPaymentHistory() {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing get payment history...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/payment/history?user_id=test_user_123&page=1&limit=10',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get payment history: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log(`   ✅ Payment history retrieved: ${response.data.payments.length} payments`);
          console.log(`   📊 Total payments: ${response.data.pagination.total}`);
          resolve({ test: 'Get Payment History', passed: true });
        } else {
          console.log('   ❌ Get payment history failed');
          resolve({ test: 'Get Payment History', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get payment history failed: ${error.message}`);
      resolve({ test: 'Get Payment History', passed: false });
    });
    
    req.end();
  });
}

// Run all payment tests
async function runPaymentTests() {
  console.log('🚀 Starting payment API tests...\n');
  
  const results = [];
  
  // Test 1: Calculate Fare
  const fareResult = await testCalculateFare();
  results.push(fareResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Process Payment
  const paymentResult = await testProcessPayment();
  results.push(paymentResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Get Payment History
  const historyResult = await testGetPaymentHistory();
  results.push(historyResult);
  
  // Summary
  console.log('\n📊 Payment API Test Results:');
  console.log('═'.repeat(40));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All payment API tests passed!');
  } else {
    console.log('⚠️  Some payment API tests failed.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPaymentTests().catch(console.error);
}

module.exports = { runPaymentTests };
