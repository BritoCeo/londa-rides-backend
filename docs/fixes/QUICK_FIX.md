# Quick Fix for Running Services

## Issue 1: Missing Dependencies

Some services don't have `ts-node-dev` installed. 

### Solution: Install Dependencies

**Option A - Use PowerShell script:**
```powershell
.\INSTALL_ALL_SERVICES.ps1
```

**Option B - Manual installation:**
```powershell
cd services/driver-service && npm install && cd ../..
cd services/auth-service && npm install && cd ../..
cd services/ride-service && npm install && cd ../..
cd services/api-gateway && npm install && cd ../..
```

**Option C - Use npm script (after fixing paths):**
```powershell
npm run install:all
```

## Issue 2: DI Container Error

Fixed the StructuredLogger registration issue. The service should now start properly.

## After Installing Dependencies

1. **Create .env files** for each service (see [Setup Guide](../setup/SETUP_AND_RUN_GUIDE.md))

2. **Run services:**
```powershell
npm run dev:all
```

## Expected Output

Once fixed, you should see:
- ✅ All services starting
- ✅ Health endpoints responding
- ⚠️  Firebase warnings (if not configured) - this is OK for development

