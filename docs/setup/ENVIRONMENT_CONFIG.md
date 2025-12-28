# Environment Configuration Guide

## Overview

The Londa Rides backend uses environment-specific configuration files to manage different deployment environments (Development, UAT, Production). All services support three environments: `dev`, `uat`, and `prd`.

## Architecture: Single Port Entry Point

**Important:** Only port **8000** is exposed externally through the API Gateway. All microservices run on internal ports and are accessible only through the gateway.

```
┌─────────────────────────────────────────┐
│         Client Requests                 │
│      Port 8000 (External Only)          │
└──────────────┬──────────────────────────┘
               │
      ┌────────▼────────┐
      │   API Gateway   │
      │   Port 8000     │
      └───┬───┬───┬───┬─┘
          │   │   │   │
    ┌─────┘   │   │   └─────┐
    │         │   │         │
┌───▼───┐ ┌──▼───▼──┐ ┌───▼───┐
│ Auth  │ │ User/   │ │ Ride  │
│ :8001 │ │ Driver/ │ │ :8004 │
│(intl) │ │ :8002/3 │ │(intl) │
└───────┘ └─────────┘ └───────┘
```

## Environment Files Structure

Each service has three environment configuration files:

- `.env.dev` - Development environment
- `.env.uat` - User Acceptance Testing environment  
- `.env.prd` - Production environment

### File Locations

```
backend/
├── services/
│   ├── api-gateway/
│   │   ├── .env.dev
│   │   ├── .env.uat
│   │   └── .env.prd
│   ├── user-service/
│   │   ├── .env.dev
│   │   ├── .env.uat
│   │   └── .env.prd
│   ├── driver-service/
│   │   ├── .env.dev
│   │   ├── .env.uat
│   │   └── .env.prd
│   ├── auth-service/
│   │   ├── .env.dev
│   │   ├── .env.uat
│   │   └── .env.prd
│   └── ride-service/
│       ├── .env.dev
│       ├── .env.uat
│       └── .env.prd
```

## Environment File Loading

The system automatically loads the appropriate environment file based on the `NODE_ENV` environment variable:

1. If `NODE_ENV=dev`, loads `.env.dev`
2. If `NODE_ENV=uat`, loads `.env.uat`
3. If `NODE_ENV=prd`, loads `.env.prd`
4. If `NODE_ENV` is not set, defaults to `dev` and loads `.env.dev`
5. Falls back to `.env` if environment-specific file doesn't exist

## Environment Variables by Service

### API Gateway

**File:** `services/api-gateway/.env.{env}`

```env
NODE_ENV=dev|uat|prd
PORT=8000
USER_SERVICE_URL=http://localhost:8002
DRIVER_SERVICE_URL=http://localhost:8003
AUTH_SERVICE_URL=http://localhost:8001
RIDE_SERVICE_URL=http://localhost:8004
LOG_LEVEL=debug|info|error
```

**Notes:**
- `PORT` is always `8000` (the only externally exposed port)
- Service URLs point to internal service ports
- `LOG_LEVEL` varies by environment (debug for dev, info for uat, error for prd)

### User Service

**File:** `services/user-service/.env.{env}`

```env
NODE_ENV=dev|uat|prd
PORT=8002
FIREBASE_SERVICE_ACCOUNT_KEY=../../server/service-account-key.json
FIREBASE_PROJECT_ID=londa-cd054
LOG_LEVEL=debug|info|error
```

### Driver Service

**File:** `services/driver-service/.env.{env}`

```env
NODE_ENV=dev|uat|prd
PORT=8003
FIREBASE_SERVICE_ACCOUNT_KEY=../../server/service-account-key.json
FIREBASE_PROJECT_ID=londa-cd054
LOG_LEVEL=debug|info|error
```

### Auth Service

**File:** `services/auth-service/.env.{env}`

```env
NODE_ENV=dev|uat|prd
PORT=8001
JWT_SECRET=your-{env}-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=24h
LOG_LEVEL=debug|info|error
```

**Security Note:** Update `JWT_SECRET` with strong, unique values for each environment, especially in production.

### Ride Service

**File:** `services/ride-service/.env.{env}`

```env
NODE_ENV=dev|uat|prd
PORT=8004
FIREBASE_SERVICE_ACCOUNT_KEY=../../server/service-account-key.json
FIREBASE_PROJECT_ID=londa-cd054
LOG_LEVEL=debug|info|error
```

## Running Services with Different Environments

### Development Environment (Default)

```bash
# Run all services in dev mode
npm run dev:all:dev

# Or run individual service
cd services/user-service
npm run dev:dev
```

### UAT Environment

```bash
# Run all services in UAT mode
npm run dev:all:uat

# Or run individual service
cd services/user-service
npm run dev:uat
```

### Production Environment

```bash
# Run all services in production mode
npm run dev:all:prd

# Or run individual service
cd services/user-service
npm run dev:prd
```

### Production Deployment

For production deployment, build and run with production environment:

```bash
# Build all services
npm run build:all

# Run with production environment
cd services/api-gateway
npm run start:prd
```

## Service Ports Summary

| Service | Internal Port | External Access | Notes |
|---------|--------------|-----------------|-------|
| API Gateway | 8000 | ✅ **Yes** | Only exposed port |
| Auth Service | 8001 | ❌ No | Internal only |
| User Service | 8002 | ❌ No | Internal only |
| Driver Service | 8003 | ❌ No | Internal only |
| Ride Service | 8004 | ❌ No | Internal only |

**Security Best Practice:** In production, configure firewall/network policies to block direct access to internal ports (8001-8004). All external traffic should only access port 8000.

## Environment-Specific Configurations

### Development (dev)

- **Log Level:** `debug` - Detailed logging for development
- **JWT Secrets:** Can use simple/test values (not for production)
- **Firebase:** Development/test project
- **Ports:** All services on localhost

### UAT (uat)

- **Log Level:** `info` - Standard logging
- **JWT Secrets:** Should use secure values (different from production)
- **Firebase:** UAT/test project
- **Ports:** All services on localhost (or UAT server)

### Production (prd)

- **Log Level:** `error` - Only error logging
- **JWT Secrets:** Must use strong, unique secrets
- **Firebase:** Production project
- **Ports:** Services on production infrastructure
- **Security:** Internal ports must be blocked from external access

## Updating Environment Files

### For Development

1. Edit `.env.dev` files in each service directory
2. Update values as needed (Firebase paths, JWT secrets, etc.)
3. Restart services to apply changes

### For UAT/Production

1. **Never commit `.env.prd` files to version control**
2. Use secure secret management (e.g., AWS Secrets Manager, Azure Key Vault)
3. Update `.env.uat` and `.env.prd` files on deployment servers
4. Ensure proper file permissions (read-only for application user)

## Security Considerations

### Production Environment Files

1. **Never commit `.env.prd` files** - Add to `.gitignore`
2. **Use strong secrets** - Generate cryptographically secure random strings for JWT secrets
3. **Restrict file permissions** - Only application user should have read access
4. **Use secret management** - Consider using cloud secret management services
5. **Rotate secrets regularly** - Update JWT secrets periodically

### Network Security

1. **Block internal ports** - Configure firewall to block ports 8001-8004 from external access
2. **Use HTTPS** - In production, use HTTPS for the API Gateway (port 8000)
3. **Service-to-service communication** - Can remain HTTP on internal network, or use mTLS for enhanced security

## Troubleshooting

### Issue: Wrong environment file loaded

**Solution:** Check `NODE_ENV` environment variable:
```bash
# Windows PowerShell
$env:NODE_ENV="dev"

# Linux/Mac
export NODE_ENV=dev
```

### Issue: Environment variables not loading

**Solution:** 
1. Verify the `.env.{env}` file exists in the service directory
2. Check file naming (must be exactly `.env.dev`, `.env.uat`, or `.env.prd`)
3. Ensure `NODE_ENV` is set correctly before starting the service

### Issue: Services can't connect to each other

**Solution:**
1. Verify service URLs in API Gateway `.env.{env}` file
2. Check that all services are running
3. Verify internal ports match the configuration

## Best Practices

1. **Environment Isolation:** Keep dev, uat, and prd configurations completely separate
2. **Secret Management:** Use proper secret management tools in production
3. **Configuration Validation:** Validate all required environment variables on service startup
4. **Documentation:** Document any custom environment variables in this file
5. **Version Control:** Only commit `.env.dev` files (if needed), never `.env.prd`
6. **Backup:** Keep secure backups of production environment configurations

---

For more information, see:
- [Setup and Run Guide](./SETUP_AND_RUN_GUIDE.md)
- [Architecture Documentation](./docs/architecture/ARCHITECTURE.md)

