# Fix Services - Installation Guide

## Issue: Missing Dependencies

Some services don't have `ts-node-dev` installed. You need to install dependencies for each service.

## Quick Fix

Run this from the `backend/` directory:

```powershell
# Install dependencies for all services
cd services/user-service && npm install && cd ../..
cd services/driver-service && npm install && cd ../..
cd services/auth-service && npm install && cd ../..
cd services/ride-service && npm install && cd ../..
cd services/api-gateway && npm install && cd ../..
```

Or use the root script (after fixing the install:all script):

```powershell
npm run install:all
```

## Firebase Configuration

### Create .env files

Each service needs a `.env` file. Create them with:

**services/user-service/.env:**
```env
PORT=8002
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_KEY=../../server/service-account-key.json
FIREBASE_PROJECT_ID=londa-cd054
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
```

**services/driver-service/.env:**
```env
PORT=8003
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_KEY=../../server/service-account-key.json
FIREBASE_PROJECT_ID=londa-cd054
```

**services/auth-service/.env:**
```env
PORT=8001
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-token-secret
```

**services/ride-service/.env:**
```env
PORT=8004
NODE_ENV=development
FIREBASE_SERVICE_ACCOUNT_KEY=../../server/service-account-key.json
FIREBASE_PROJECT_ID=londa-cd054
```

**services/api-gateway/.env:**
```env
PORT=8000
NODE_ENV=development
USER_SERVICE_URL=http://localhost:8002
DRIVER_SERVICE_URL=http://localhost:8003
AUTH_SERVICE_URL=http://localhost:8001
RIDE_SERVICE_URL=http://localhost:8004
```

## After Installation

Once dependencies are installed, try running again:

```powershell
npm run dev:all
```

