const http = require('http');

function testAPI() {
  console.log('🧪 Testing API endpoints...');
  
  // Test basic endpoint
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/test',
    method: 'GET'
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Basic API test: ${res.statusCode}`);
    res.on('data', (data) => {
      console.log('Response:', data.toString());
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ API test failed:', error.message);
  });
  
  req.end();
}

testAPI();
