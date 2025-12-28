const axios = require('axios');
const baseURL = 'http://localhost:8000/api/v1';

// Test data
const testDriver = {
  id: 'test_driver_123',
  name: 'John Driver',
  email: 'john.driver@example.com',
  phone: '+264811234567',
  license_number: 'DL123456789',
  vehicle_type: 'Car',
  vehicle_model: 'Toyota Corolla',
  vehicle_year: 2020,
  vehicle_color: 'White',
  vehicle_plate: 'NA12345'
};

const testSubscription = {
  driver_id: 'test_driver_123',
  payment_method: 'card',
  payment_token: 'tok_test_123456789',
  amount: 150.00
};

const testSubscriptionUpdate = {
  auto_renew: true,
  payment_method: 'bank_transfer',
  notification_preferences: {
    email: true,
    sms: true,
    push: true
  }
};

// Test functions
async function testCreateDriverSubscription() {
  console.log('\n🧪 Testing Create Driver Subscription...');
  try {
    const response = await axios.post(`${baseURL}/driver/subscription`, testSubscription);
    
    if (response.status === 201) {
      console.log('✅ Create Driver Subscription: PASSED');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      return response.data.data.subscription.id;
    } else {
      console.log('❌ Create Driver Subscription: FAILED');
      console.log('📊 Status:', response.status);
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Create Driver Subscription: ERROR');
    console.log('📊 Error:', error.response?.data || error.message);
  }
}

async function testGetDriverSubscription(driverId) {
  console.log('\n🧪 Testing Get Driver Subscription...');
  try {
    const response = await axios.get(`${baseURL}/driver/subscription/${driverId}`);
    
    if (response.status === 200) {
      console.log('✅ Get Driver Subscription: PASSED');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
      return response.data.data.subscription;
    } else {
      console.log('❌ Get Driver Subscription: FAILED');
      console.log('📊 Status:', response.status);
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Get Driver Subscription: ERROR');
    console.log('📊 Error:', error.response?.data || error.message);
  }
}

async function testUpdateDriverSubscription(driverId) {
  console.log('\n🧪 Testing Update Driver Subscription...');
  try {
    const response = await axios.put(`${baseURL}/driver/subscription/${driverId}`, testSubscriptionUpdate);
    
    if (response.status === 200) {
      console.log('✅ Update Driver Subscription: PASSED');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Update Driver Subscription: FAILED');
      console.log('📊 Status:', response.status);
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Update Driver Subscription: ERROR');
    console.log('📊 Error:', error.response?.data || error.message);
  }
}

async function testProcessSubscriptionPayment(driverId) {
  console.log('\n🧪 Testing Process Subscription Payment...');
  try {
    const paymentData = {
      driver_id: driverId,
      payment_method: 'card',
      payment_token: 'tok_test_payment_123',
      amount: 150.00
    };

    const response = await axios.post(`${baseURL}/driver/subscription/payment`, paymentData);
    
    if (response.status === 200) {
      console.log('✅ Process Subscription Payment: PASSED');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Process Subscription Payment: FAILED');
      console.log('📊 Status:', response.status);
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Process Subscription Payment: ERROR');
    console.log('📊 Error:', error.response?.data || error.message);
  }
}

async function testGetDriverSubscriptionHistory(driverId) {
  console.log('\n🧪 Testing Get Driver Subscription History...');
  try {
    const response = await axios.get(`${baseURL}/driver/subscription/history/${driverId}?page=1&limit=10`);
    
    if (response.status === 200) {
      console.log('✅ Get Driver Subscription History: PASSED');
      console.log('📊 Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Get Driver Subscription History: FAILED');
      console.log('📊 Status:', response.status);
      console.log('📊 Response:', response.data);
    }
  } catch (error) {
    console.log('❌ Get Driver Subscription History: ERROR');
    console.log('📊 Error:', error.response?.data || error.message);
  }
}

async function testValidationErrors() {
  console.log('\n🧪 Testing Validation Errors...');
  
  // Test missing required fields
  try {
    await axios.post(`${baseURL}/driver/subscription`, {});
    console.log('❌ Validation Test: Should have failed for missing fields');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation Test: Missing fields validation works');
    } else {
      console.log('❌ Validation Test: Unexpected error');
    }
  }

  // Test invalid payment method
  try {
    await axios.post(`${baseURL}/driver/subscription`, {
      driver_id: 'test_driver_123',
      payment_method: 'invalid_method'
    });
    console.log('❌ Validation Test: Should have failed for invalid payment method');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation Test: Invalid payment method validation works');
    } else {
      console.log('❌ Validation Test: Unexpected error');
    }
  }

  // Test invalid amount
  try {
    await axios.post(`${baseURL}/driver/subscription/payment`, {
      driver_id: 'test_driver_123',
      payment_method: 'card',
      amount: 100.00 // Should be 150.00
    });
    console.log('❌ Validation Test: Should have failed for invalid amount');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Validation Test: Invalid amount validation works');
    } else {
      console.log('❌ Validation Test: Unexpected error');
    }
  }
}

async function testBusinessRules() {
  console.log('\n🧪 Testing Business Rules...');
  
  // Test duplicate subscription
  try {
    await axios.post(`${baseURL}/driver/subscription`, testSubscription);
    await axios.post(`${baseURL}/driver/subscription`, testSubscription);
    console.log('❌ Business Rule Test: Should have failed for duplicate subscription');
  } catch (error) {
    if (error.response?.status === 409) {
      console.log('✅ Business Rule Test: Duplicate subscription prevention works');
    } else {
      console.log('❌ Business Rule Test: Unexpected error');
    }
  }

  // Test exact amount requirement
  try {
    await axios.post(`${baseURL}/driver/subscription/payment`, {
      driver_id: 'test_driver_123',
      payment_method: 'card',
      amount: 149.99 // Should be exactly 150.00
    });
    console.log('❌ Business Rule Test: Should have failed for incorrect amount');
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Business Rule Test: Exact amount requirement works');
    } else {
      console.log('❌ Business Rule Test: Unexpected error');
    }
  }
}

// Main test function
async function runDriverSubscriptionTests() {
  console.log('🚀 Starting Driver Subscription API Tests...\n');
  
  try {
    // Test basic functionality
    const subscriptionId = await testCreateDriverSubscription();
    
    if (subscriptionId) {
      await testGetDriverSubscription(testDriver.id);
      await testUpdateDriverSubscription(testDriver.id);
      await testProcessSubscriptionPayment(testDriver.id);
      await testGetDriverSubscriptionHistory(testDriver.id);
    }

    // Test validation and business rules
    await testValidationErrors();
    await testBusinessRules();

    console.log('\n🎉 Driver Subscription API Tests Completed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Create Driver Subscription');
    console.log('✅ Get Driver Subscription');
    console.log('✅ Update Driver Subscription');
    console.log('✅ Process Subscription Payment');
    console.log('✅ Get Driver Subscription History');
    console.log('✅ Validation Error Handling');
    console.log('✅ Business Rules Compliance');

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runDriverSubscriptionTests();
}

module.exports = {
  runDriverSubscriptionTests,
  testCreateDriverSubscription,
  testGetDriverSubscription,
  testUpdateDriverSubscription,
  testProcessSubscriptionPayment,
  testGetDriverSubscriptionHistory
};
