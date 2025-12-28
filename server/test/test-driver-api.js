const http = require('http');

function testDriverRegistration() {
  console.log('🧪 Testing Driver Registration API...');
  
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
    console.log(`✅ Driver Registration API: ${res.statusCode}`);
    res.on('data', (data) => {
      console.log('Response:', data.toString());
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Driver Registration API test failed:', error.message);
  });
  
  req.write(postData);
  req.end();
}

function testDriverLogin() {
  console.log('🧪 Testing Driver Login API...');
  
  const postData = JSON.stringify({
    phone_number: '+1234567891',
    otp: '123456',
    sessionInfo: 'test-session'
  });
  
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/driver/verify-otp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  const req = http.request(options, (res) => {
    console.log(`✅ Driver Login API: ${res.statusCode}`);
    res.on('data', (data) => {
      console.log('Response:', data.toString());
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Driver Login API test failed:', error.message);
  });
  
  req.write(postData);
  req.end();
}

// Run tests
console.log('🚗 Testing Driver APIs...\n');
testDriverRegistration();
setTimeout(() => {
  testDriverLogin();
}, 1000);
