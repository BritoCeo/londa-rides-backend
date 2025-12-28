const axios = require('axios');

async function testSpecificEndpoints() {
  console.log('🔍 Testing specific API endpoints for error types...\n');

  const endpoints = [
    // Test non-existent endpoints (should return 404)
    { method: 'GET', url: 'http://localhost:8000/api/v1/nonexistent', name: 'Non-existent endpoint' },
    { method: 'GET', url: 'http://localhost:8000/api/v1/invalid-route', name: 'Invalid route' },
    
    // Test existing endpoints without auth (should return 401)
    { method: 'GET', url: 'http://localhost:8000/api/v1/scheduled-rides', name: 'Scheduled rides (no auth)' },
    { method: 'GET', url: 'http://localhost:8000/api/v1/carpool/available', name: 'Carpool available (no auth)' },
    { method: 'GET', url: 'http://localhost:8000/api/v1/parent/subscription', name: 'Parent subscription (no auth)' },
    
    // Test with invalid auth token (should return 401)
    { method: 'GET', url: 'http://localhost:8000/api/v1/scheduled-rides', name: 'Scheduled rides (invalid token)', headers: { 'Authorization': 'Bearer invalid-token' } },
    
    // Test health endpoints (should return 200)
    { method: 'GET', url: 'http://localhost:8000/health', name: 'Health check' },
    { method: 'GET', url: 'http://localhost:8000/test', name: 'Test endpoint' },
  ];

  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method,
        url: endpoint.url,
        headers: endpoint.headers || {}
      };

      const response = await axios(config);
      console.log(`✅ ${endpoint.name}: ${response.status} - ${response.statusText}`);
      
    } catch (error) {
      const status = error.response?.status || 'No response';
      const message = error.response?.data?.message || error.message;
      
      if (status === 404) {
        console.log(`❌ ${endpoint.name}: ${status} - Route not found`);
      } else if (status === 500) {
        console.log(`❌ ${endpoint.name}: ${status} - Internal server error`);
      } else if (status === 401) {
        console.log(`🔐 ${endpoint.name}: ${status} - Authentication required (${message})`);
      } else if (status === 429) {
        console.log(`⏰ ${endpoint.name}: ${status} - Rate limited`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`🔌 ${endpoint.name}: Connection refused`);
      } else {
        console.log(`⚠️  ${endpoint.name}: ${status} - ${message}`);
      }
    }
  }
}

testSpecificEndpoints();
