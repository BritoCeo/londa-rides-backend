const http = require('http');

function testUserRegistration() {
  console.log('🧪 Testing User Registration API...');
  
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
    console.log(`✅ User Registration API: ${res.statusCode}`);
    res.on('data', (data) => {
      console.log('Response:', data.toString());
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ User Registration API test failed:', error.message);
  });
  
  req.write(postData);
  req.end();
}

testUserRegistration();
