const axios = require('axios');

async function testServer() {
  try {
    console.log('🧪 Testing server endpoints...');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:8000/health');
    console.log('✅ Health check:', healthResponse.status, healthResponse.data);
    
    // Test test endpoint
    console.log('2. Testing test endpoint...');
    const testResponse = await axios.get('http://localhost:8000/test');
    console.log('✅ Test endpoint:', testResponse.status, testResponse.data);
    
    // Test scheduled rides endpoint
    console.log('3. Testing scheduled rides endpoint...');
    try {
      const scheduledResponse = await axios.get('http://localhost:8000/api/v1/scheduled-rides');
      console.log('✅ Scheduled rides:', scheduledResponse.status);
    } catch (error) {
      console.log('⚠️ Scheduled rides (expected 400):', error.response?.status || error.message);
    }
    
    // Test carpool endpoint
    console.log('4. Testing carpool endpoint...');
    try {
      const carpoolResponse = await axios.get('http://localhost:8000/api/v1/carpool/available');
      console.log('✅ Carpool:', carpoolResponse.status);
    } catch (error) {
      console.log('⚠️ Carpool (expected 400):', error.response?.status || error.message);
    }
    
    // Test parent subscription endpoint
    console.log('5. Testing parent subscription endpoint...');
    try {
      const parentResponse = await axios.get('http://localhost:8000/api/v1/parent/subscription');
      console.log('✅ Parent subscription:', parentResponse.status);
    } catch (error) {
      console.log('⚠️ Parent subscription (expected 400):', error.response?.status || error.message);
    }
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running on port 8000');
    }
  }
}

testServer();
