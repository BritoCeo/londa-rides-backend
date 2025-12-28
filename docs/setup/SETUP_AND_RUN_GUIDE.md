# Londa Rides Backend - Setup and Run Guide

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project with Firestore enabled
- Firebase service account key file

## 🚀 Quick Start

### Step 1: Install Dependencies

#### 1.1 Install Shared Package Dependencies
```bash
cd shared
npm install
npm run build
```

#### 1.2 Install Service Dependencies

**User Service:**
```bash
cd ../services/user-service
npm install
```

**Driver Service:**
```bash
cd ../driver-service
npm install
```

**Auth Service:**
```bash
cd ../auth-service
npm install
```

**Ride Service:**
```bash
cd ../ride-service
npm install
```

**API Gateway:**
```bash
cd ../api-gateway
npm install
```

### Step 2: Environment Configuration

The project uses environment-specific configuration files. Each service has `.env.dev`, `.env.uat`, and `.env.prd` files for different environments.

**Important:** Only port **8000** is exposed externally through the API Gateway. All microservices run on internal ports (8001-8004) and are only accessible through the gateway.

#### Environment Files Structure

Each service has three environment files:
- `.env.dev` - Development environment
- `.env.uat` - User Acceptance Testing environment
- `.env.prd` - Production environment

The system automatically loads the appropriate file based on `NODE_ENV` environment variable.

#### Quick Setup

Environment files are already created in each service directory. You may need to update values like Firebase credentials and JWT secrets.

For detailed environment configuration, see [ENVIRONMENT_CONFIG.md](./ENVIRONMENT_CONFIG.md).

**Note:** In production, ensure `.env.prd` files are properly secured and not committed to version control.

### Step 3: Build Shared Package

The shared package must be built before running any service:

```bash
cd shared
npm run build
```

This creates the `dist/` directory with compiled TypeScript.

### Step 4: Run Services

#### Option A: Run Services Individually (Development)

Open separate terminal windows/tabs for each service:

**Terminal 1 - User Service:**
```bash
cd services/user-service
npm run dev
```

**Terminal 2 - Driver Service:**
```bash
cd services/driver-service
npm run dev
```

**Terminal 3 - Auth Service:**
```bash
cd services/auth-service
npm run dev
```

**Terminal 4 - Ride Service:**
```bash
cd services/ride-service
npm run dev
```

**Terminal 5 - API Gateway:**
```bash
cd services/api-gateway
npm run dev
```

#### Option B: Run All Services with npm scripts (Recommended)

Run all services with environment-specific configurations:

```bash
# Install all dependencies
npm run install:all

# Build shared package
npm run build:shared

# Run all services in development mode (default)
npm run dev:all

# Or specify environment explicitly:
npm run dev:all:dev   # Development environment
npm run dev:all:uat   # UAT environment
npm run dev:all:prd   # Production environment
```

**Note:** The default `dev:all` command runs in development mode. Use environment-specific commands for UAT or production testing.

### Step 5: Verify Services are Running

Check each service health endpoint:

- **API Gateway**: http://localhost:8000/health
- **User Service**: http://localhost:8002/health
- **Driver Service**: http://localhost:8003/health
- **Auth Service**: http://localhost:8001/health
- **Ride Service**: http://localhost:8004/health

## 📝 Service Ports

**Architecture:** Single-port entry point through API Gateway

| Service | Port | Access | Notes |
|---------|------|--------|-------|
| API Gateway | 8000 | **External** | Only exposed port - all client requests go here |
| Auth Service | 8001 | Internal | Accessible only through gateway |
| User Service | 8002 | Internal | Accessible only through gateway |
| Driver Service | 8003 | Internal | Accessible only through gateway |
| Ride Service | 8004 | Internal | Accessible only through gateway |

**Important:** In production, internal service ports (8001-8004) should be blocked by firewall/network policies. All external traffic should only access port 8000.

## 🔧 Development Commands

### Build Commands

**Shared Package:**
```bash
cd shared
npm run build
```

**Individual Services:**
```bash
cd services/[service-name]
npm run build
```

### Run Commands

**Development (with hot reload):**
```bash
npm run dev          # Default: dev environment
npm run dev:dev      # Explicitly dev environment
npm run dev:uat      # UAT environment
npm run dev:prd      # Production environment
```

**Production:**
```bash
npm run build
npm start            # Uses NODE_ENV from environment
npm start:dev        # Explicitly dev environment
npm start:uat        # UAT environment
npm start:prd        # Production environment
```

## 🐛 Troubleshooting

### Issue: "Cannot find module '@londa-rides/shared'"

**Solution:**
1. Make sure you've built the shared package:
   ```bash
   cd shared
   npm run build
   ```

2. Verify the shared package is properly linked in service `package.json`:
   ```json
   "@londa-rides/shared": "file:../../shared"
   ```

### Issue: "Firestore initialization failed"

**Solution:**
1. Check that `FIREBASE_SERVICE_ACCOUNT_KEY` path is correct
2. Verify the service account key file exists
3. Ensure Firebase project ID is correct

### Issue: "Port already in use"

**Solution:**
1. Check which process is using the port:
   ```bash
   # Windows
   netstat -ano | findstr :8000
   
   # Linux/Mac
   lsof -i :8000
   ```

2. Kill the process or change the port in `.env`

### Issue: "TypeScript compilation errors"

**Solution:**
1. Make sure all dependencies are installed
2. Rebuild the shared package
3. Check TypeScript version compatibility

## 📦 Production Deployment

### Build All Services

```bash
# Build shared package
cd shared
npm run build

# Build each service
cd ../services/user-service && npm run build
cd ../driver-service && npm run build
cd ../auth-service && npm run build
cd ../ride-service && npm run build
cd ../api-gateway && npm run build
```

### Run in Production

```bash
# Option 1: Set NODE_ENV and run
export NODE_ENV=prd  # or 'uat' for UAT environment

# Run each service
cd services/user-service && npm start:prd
cd services/driver-service && npm start:prd
cd services/auth-service && npm start:prd
cd services/ride-service && npm start:prd
cd services/api-gateway && npm start:prd

# Option 2: Use root script (recommended)
npm run dev:all:prd  # For testing production config locally
```

## 🧪 Testing

### Run Tests

```bash
# Shared package tests
cd shared
npm test

# Service-specific tests (when implemented)
cd services/user-service
npm test
```

## 📚 Next Steps

1. **Configure Firebase**: Set up your Firestore database
2. **Set Environment Variables**: Update all `.env` files with your actual values
3. **Run Services**: Start all services in development mode
4. **Test API**: Use the API Gateway at http://localhost:8000/api/v1
5. **Check Documentation**: See `docs/api/API_DOCUMENTATION.md` for API endpoints

## 🔗 Useful Links

- API Documentation: `docs/api/API_DOCUMENTATION.md`
- Architecture Docs: `docs/architecture/ARCHITECTURE.md`
- Environment Configuration: `docs/setup/ENVIRONMENT_CONFIG.md`
- Cleanup Guide: `docs/guides/CLEANUP_GUIDE.md`

---

**Need Help?** Check the troubleshooting section or review the architecture documentation.

