# Install Service Dependencies

## Quick Fix

The services need their dependencies installed. Run this command:

```powershell
# From backend/ directory
npm run install:all
```

If that doesn't work, install each service manually:

```powershell
cd services/user-service
npm install
cd ../driver-service
npm install
cd ../auth-service
npm install
cd ../ride-service
npm install
cd ../api-gateway
npm install
cd ../..
```

## After Installation

Once all dependencies are installed, you can run:

```powershell
npm run dev:all
```

## Firebase Setup

Make sure you have `.env` files in each service directory with:

- `FIREBASE_SERVICE_ACCOUNT_KEY` - Path to your service account key
- `FIREBASE_PROJECT_ID` - Your Firebase project ID

See [Setup Guide](./SETUP_AND_RUN_GUIDE.md) for complete environment variable setup.

