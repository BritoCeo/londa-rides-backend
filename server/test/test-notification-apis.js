const http = require('http');

console.log('🔔 Testing Notification APIs...\n');

// Test 1: Send Notification
function testSendNotification() {
  return new Promise((resolve) => {
    console.log('1️⃣ Testing send notification...');
    
    const postData = JSON.stringify({
      recipient_id: 'test_user_123',
      recipient_type: 'user',
      title: 'Ride Request Accepted',
      message: 'Your ride request has been accepted by a driver',
      data: {
        ride_id: 'test_ride_123',
        driver_name: 'John Doe',
        estimated_arrival: '5 minutes'
      },
      type: 'ride'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/notifications/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Send notification: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Notification sent successfully');
          console.log(`   📝 Push result: ${response.data.push_result.success ? 'Success' : 'Failed'}`);
          resolve({ test: 'Send Notification', passed: true, notificationId: response.data.notification.id });
        } else {
          console.log('   ❌ Send notification failed');
          resolve({ test: 'Send Notification', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Send notification failed: ${error.message}`);
      resolve({ test: 'Send Notification', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Test 2: Get Notifications
function testGetNotifications() {
  return new Promise((resolve) => {
    console.log('2️⃣ Testing get notifications...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/notifications?recipient_id=test_user_123&page=1&limit=10',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get notifications: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log(`   ✅ Notifications retrieved: ${response.data.notifications.length} notifications`);
          console.log(`   📊 Total: ${response.data.pagination.total}`);
          resolve({ test: 'Get Notifications', passed: true });
        } else {
          console.log('   ❌ Get notifications failed');
          resolve({ test: 'Get Notifications', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get notifications failed: ${error.message}`);
      resolve({ test: 'Get Notifications', passed: false });
    });
    
    req.end();
  });
}

// Test 3: Get Unread Notifications
function testGetUnreadNotifications() {
  return new Promise((resolve) => {
    console.log('3️⃣ Testing get unread notifications...');
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/notifications?recipient_id=test_user_123&unread_only=true',
      method: 'GET'
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Get unread notifications: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log(`   ✅ Unread notifications retrieved: ${response.data.notifications.length} unread`);
          resolve({ test: 'Get Unread Notifications', passed: true });
        } else {
          console.log('   ❌ Get unread notifications failed');
          resolve({ test: 'Get Unread Notifications', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Get unread notifications failed: ${error.message}`);
      resolve({ test: 'Get Unread Notifications', passed: false });
    });
    
    req.end();
  });
}

// Test 4: Mark Notification as Read
function testMarkNotificationAsRead() {
  return new Promise((resolve) => {
    console.log('4️⃣ Testing mark notification as read...');
    
    const postData = JSON.stringify({
      notification_id: 'test_notification_123',
      recipient_id: 'test_user_123'
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/notifications/read',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Mark notification as read: ${res.statusCode}`);
      res.on('data', (data) => {
        const response = JSON.parse(data.toString());
        if (response.success) {
          console.log('   ✅ Notification marked as read');
          resolve({ test: 'Mark Notification as Read', passed: true });
        } else {
          console.log('   ❌ Mark notification as read failed');
          resolve({ test: 'Mark Notification as Read', passed: false });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`   ❌ Mark notification as read failed: ${error.message}`);
      resolve({ test: 'Mark Notification as Read', passed: false });
    });
    
    req.write(postData);
    req.end();
  });
}

// Run all notification tests
async function runNotificationTests() {
  console.log('🚀 Starting notification API tests...\n');
  
  const results = [];
  
  // Test 1: Send Notification
  const sendResult = await testSendNotification();
  results.push(sendResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Get Notifications
  const getResult = await testGetNotifications();
  results.push(getResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: Get Unread Notifications
  const unreadResult = await testGetUnreadNotifications();
  results.push(unreadResult);
  
  // Wait between tests
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 4: Mark Notification as Read
  const markResult = await testMarkNotificationAsRead();
  results.push(markResult);
  
  // Summary
  console.log('\n📊 Notification API Test Results:');
  console.log('═'.repeat(40));
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.test}`);
  });
  
  console.log(`\n📈 Summary: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All notification API tests passed!');
  } else {
    console.log('⚠️  Some notification API tests failed.');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runNotificationTests().catch(console.error);
}

module.exports = { runNotificationTests };
