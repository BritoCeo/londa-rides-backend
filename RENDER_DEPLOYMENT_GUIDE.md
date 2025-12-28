# Render Deployment Guide

This guide explains how to deploy the Londa Rides backend microservices to Render.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in [https://github.com/BritoCeo/londa-rides-backend](https://github.com/BritoCeo/londa-rides-backend)
3. **Firebase Service Account Key**: JSON file for Firestore access
4. **Environment Variables**: Prepare all required environment variables

## Deployment Options

### Option 1: Using render.yaml (Recommended)

The repository includes a `render.yaml` file that automatically configures all services.

#### Steps:

1. **Connect Repository to Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository: `BritoCeo/londa-rides-backend`
   - Render will automatically detect `render.yaml`

2. **Configure Environment Variables**:
   - After connecting, Render will show all services
   - For each service, add the required environment variables (see below)

3. **Deploy**:
   - Click "Apply" to deploy all services
   - Render will build and deploy all 5 services automatically

### Option 2: Manual Service Creation

If you prefer to create services manually:

1. Create each service individually
2. Use the build and start commands from `render.yaml`
3. Configure environment variables manually

## Environment Variables

### API Gateway

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `8000` | Yes |
| `USER_SERVICE_URL` | Auto-set by Render | Yes |
| `DRIVER_SERVICE_URL` | Auto-set by Render | Yes |
| `AUTH_SERVICE_URL` | Auto-set by Render | Yes |
| `RIDE_SERVICE_URL` | Auto-set by Render | Yes |
| `LOG_LEVEL` | `info` | No |

### Auth Service

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `8001` | Yes |
| `JWT_SECRET` | Your secret key | **Yes** |
| `JWT_EXPIRES_IN` | `24h` | No |
| `LOG_LEVEL` | `info` | No |

### User Service

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `8002` | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON content | **Yes** |
| `FIREBASE_PROJECT_ID` | Your project ID | **Yes** |
| `LOG_LEVEL` | `info` | No |

### Driver Service

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `8003` | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON content | **Yes** |
| `FIREBASE_PROJECT_ID` | Your project ID | **Yes** |
| `LOG_LEVEL` | `info` | No |

### Ride Service

| Variable | Value | Required |
|----------|-------|----------|
| `NODE_ENV` | `production` | Yes |
| `PORT` | `8004` | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | JSON content | **Yes** |
| `FIREBASE_PROJECT_ID` | Your project ID | **Yes** |
| `LOG_LEVEL` | `info` | No |

## Setting Firebase Service Account Key

**Important**: The current code expects `FIREBASE_SERVICE_ACCOUNT_KEY` to be a **file path**. For Render deployment, you have two options:

### Option 1: Store JSON Content as Environment Variable (Recommended)

You'll need to modify the Firebase initialization code to accept JSON content directly. Update `services/*/src/server.ts` to handle JSON string:

```typescript
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    // Try parsing as JSON string first (for Render)
    let serviceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    } catch {
      // Fallback to file path (for local development)
      const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      serviceAccount = require(serviceAccountPath);
    }
    initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'londa-cd054',
    });
  } catch (error) {
    // Error handling
  }
}
```

Then in Render, set `FIREBASE_SERVICE_ACCOUNT_KEY` to the **entire JSON content as a string**.

### Option 2: Use File Path (Alternative)

If you prefer to keep the file path approach, you can:
1. Store the service account key file in your repository (not recommended for security)
2. Or use Render's file system to store it

**For now, the `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable should contain the **entire JSON content** of your Firebase service account key file as a string.**

### Option 1: JSON String (Recommended)

1. Open your `service-account-key.json` file
2. Copy the entire JSON content
3. Paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY` in Render

**Note**: Make sure to escape quotes if needed, or use Render's "Secret File" option.

### Option 2: Base64 Encoded

Alternatively, you can base64 encode the file:

```bash
# On Mac/Linux
base64 -i service-account-key.json

# On Windows (PowerShell)
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account-key.json"))
```

Then decode it in your application code.

### Option 3: Environment Variable File Path

If your service account key is stored as a file path, you'll need to modify the code to read from an environment variable that contains the file path or JSON content directly.

## Service URLs

After deployment, Render will provide URLs for each service:

- **API Gateway**: `https://api-gateway-xxxx.onrender.com` (Public URL - use this for all API requests)
- **Auth Service**: `https://auth-service-xxxx.onrender.com` (Internal)
- **User Service**: `https://user-service-xxxx.onrender.com` (Internal)
- **Driver Service**: `https://driver-service-xxxx.onrender.com` (Internal)
- **Ride Service**: `https://ride-service-xxxx.onrender.com` (Internal)

**Important**: Only the API Gateway URL should be used externally. Other services are internal and should not be accessed directly.

## Build Process

The build process for each service:

1. Install root dependencies: `npm install`
2. Build shared package: `cd shared && npm install && npm run build`
3. Build service: `cd services/[service-name] && npm install && npm run build`

## Health Checks

Each service has a health check endpoint at `/health`:

- API Gateway: `https://api-gateway-xxxx.onrender.com/health`
- Auth Service: `https://auth-service-xxxx.onrender.com/health`
- User Service: `https://user-service-xxxx.onrender.com/health`
- Driver Service: `https://driver-service-xxxx.onrender.com/health`
- Ride Service: `https://ride-service-xxxx.onrender.com/health`

## Troubleshooting

### Build Failures

1. **"Cannot find module '@londa-rides/shared'"**:
   - Ensure shared package is built before service builds
   - Check that build commands are in correct order

2. **TypeScript Compilation Errors**:
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed

3. **Firebase Initialization Errors**:
   - Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is set correctly
   - Check `FIREBASE_PROJECT_ID` matches your Firebase project
   - Ensure service account has proper permissions

### Runtime Errors

1. **Service Connection Errors**:
   - Verify service URLs are correctly set in API Gateway
   - Check that all services are deployed and running
   - Review service logs in Render dashboard

2. **Port Conflicts**:
   - Render automatically assigns ports, but ensure `PORT` env var matches
   - Check that services are using the correct ports

3. **Environment Variable Issues**:
   - Verify all required environment variables are set
   - Check for typos in variable names
   - Ensure sensitive values (JWT_SECRET) are set

## Custom Domain Setup

To use a custom domain for the API Gateway:

1. Go to API Gateway service in Render dashboard
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `api.londarides.com`)
4. Follow DNS configuration instructions

## Monitoring

Render provides:

- **Logs**: Real-time logs for each service
- **Metrics**: CPU, memory, and request metrics
- **Alerts**: Set up alerts for service failures

## Cost Considerations

- **Starter Plan**: $7/month per service (5 services = $35/month)
- **Free Tier**: Available but with limitations (sleeps after inactivity)
- **Consider**: Using free tier for development, starter for production

## Security Best Practices

1. **Never commit** `.env.prd` files or service account keys
2. **Use Render Secrets** for sensitive environment variables
3. **Enable HTTPS** (automatic on Render)
4. **Set strong JWT secrets** in production
5. **Regularly rotate** secrets and API keys

## Updating Services

To update services after code changes:

1. Push changes to GitHub
2. Render will automatically detect changes (if auto-deploy is enabled)
3. Or manually trigger deployment from Render dashboard

## Support

For issues:
1. Check Render service logs
2. Review build logs for errors
3. Verify environment variables are set correctly
4. Check service health endpoints

---

**Next Steps**:
1. Connect repository to Render
2. Configure environment variables
3. Deploy services
4. Test API Gateway endpoint
5. Set up custom domain (optional)

For more information, see [Render Documentation](https://render.com/docs).

