# 🧪 Test Suite for Londa Rides Server

This directory contains all test scripts for the Londa Rides server application.

## 📁 Test Categories

### **API Tests**
- `test-api.js` - Basic API endpoint testing
- `test-user-api.js` - User registration and authentication testing

### **Database Tests**
- `test-firestore-setup.js` - Firestore connection and operations testing
- `test-firestore-connection.js` - Firestore service testing
- `test-connection-simple.js` - Simple Firestore connection test

### **Legacy MongoDB Tests** (for reference)
- `test-mongodb-connection.js` - MongoDB connection testing
- `test-mongodb-integration.js` - MongoDB integration testing
- `test-db-connection.js` - Database connection testing
- `test-simple-connection.js` - Simple database connection test
- `test-connection-detailed.js` - Detailed connection testing
- `test-connection-alternative.js` - Alternative connection testing
- `test-alternative-connection.js` - Alternative connection methods
- `test-final-connection.js` - Final connection testing
- `test-new-cluster.js` - New cluster testing

### **Diagnostic Tests**
- `diagnose-connection.js` - Connection diagnostics

## 🚀 Running Tests

### **Run All Tests**
```bash
npm run test
```

### **Run Individual Tests**
```bash
# Test API endpoints
node test/test-api.js
node test/test-user-api.js

# Test Firestore connection
node test/test-firestore-setup.js
node test/test-firestore-connection.js

# Test basic connection
node test/test-connection-simple.js
```

### **Test Categories**

#### **1. API Testing**
- Basic server connectivity
- User registration endpoints
- Authentication flows
- Error handling

#### **2. Database Testing**
- Firestore connection
- CRUD operations
- Real-time updates
- Data persistence

#### **3. Integration Testing**
- End-to-end workflows
- Cross-service communication
- Performance testing

## 📊 Test Results

### **✅ Working Tests**
- ✅ Basic API connectivity
- ✅ Firestore connection
- ✅ User registration
- ✅ Database operations

### **🔄 Development Tests**
- Mock database operations
- Service account authentication
- Real-time data sync

## 🛠️ Adding New Tests

1. Create test file in this directory
2. Follow naming convention: `test-[feature].js`
3. Include proper error handling
4. Add to this README

## 📝 Test Environment

- **Server**: http://localhost:8000
- **Database**: Firebase Firestore
- **Authentication**: Firebase Admin SDK
- **Environment**: Development

## 🔧 Troubleshooting

### **Common Issues**
1. **Server not running**: Start with `npm run dev`
2. **Firestore connection failed**: Check service account key
3. **API endpoints not found**: Verify route configuration
4. **Authentication errors**: Check JWT configuration

### **Debug Commands**
```bash
# Check server status
curl http://localhost:8000/test

# Test Firestore connection
node test/test-firestore-setup.js

# Check environment variables
node -e "console.log(process.env.FIREBASE_PROJECT_ID)"
```
