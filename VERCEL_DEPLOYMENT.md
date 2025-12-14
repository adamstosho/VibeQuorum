# Vercel Deployment Guide

This document explains the changes made to support Vercel serverless deployment.

## Changes Made

### 1. Serverless Function Handler (`backend/api/index.ts`)
- Created a Vercel-compatible serverless function handler
- Handles Express app initialization and database connection
- Implements connection caching to avoid reconnecting on every request
- Properly handles errors and timeouts

### 2. File System Operations Fixed
- **Logger** (`backend/src/utils/logger.ts`):
  - Detects serverless environment (Vercel, AWS Lambda)
  - Disables file logging in serverless (uses console only)
  - Vercel automatically captures console logs

- **AI Service** (`backend/src/services/ai.service.ts`):
  - Uses `/tmp` directory for file writes in serverless environments
  - Gracefully handles file system errors without breaking functionality
  - File logging is optional and non-critical

### 3. Vercel Configuration (`vercel.json`)
- Configured routes to point to the serverless function
- Set function timeout and memory limits
- Configured build and install commands for monorepo

### 4. Environment Variables
Make sure to set these in Vercel Dashboard → Settings → Environment Variables:

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `ADMIN_PRIVATE_KEY` - Wallet private key for blockchain transactions
- `VIBE_TOKEN_ADDRESS` - Deployed VibeToken contract address
- `REWARD_MANAGER_ADDRESS` - Deployed RewardManager contract address
- `RPC_URL` - Base Sepolia RPC URL
- `HUGGINGFACE_API_KEY` - (Optional) For AI features
- `JWT_SECRET` - Secret for JWT tokens
- `CORS_ORIGIN` - Frontend URL (or set `ALLOW_ALL_ORIGINS=true` for development)

**Optional:**
- `NODE_ENV` - Set to `production` (automatically set by Vercel)
- `LOG_LEVEL` - Logging level (default: `info`)
- `FRONTEND_URL` - Frontend URL for CORS
- `ALLOW_ALL_ORIGINS` - Set to `true` to allow all origins (development only)

## Deployment Steps

1. **Connect Repository to Vercel**
   - Go to Vercel Dashboard
   - Import your GitHub repository
   - Select the root directory

2. **Configure Build Settings**
   - Root Directory: `/` (root of monorepo)
   - Build Command: `cd backend && npm install && npm run build`
   - Output Directory: Leave empty (not needed for serverless)
   - Install Command: `cd backend && npm install`

3. **Set Environment Variables**
   - Add all required environment variables listed above
   - Make sure to set them for Production, Preview, and Development

4. **Deploy**
   - Push to your main branch or manually trigger deployment
   - Vercel will automatically build and deploy

## Important Notes

### Database Connection
- Database connection is cached across serverless function invocations
- Cold starts may cause initial connection delays
- Connection retries are handled automatically

### File System Limitations
- Serverless functions have read-only file system (except `/tmp`)
- Log files are written to console (captured by Vercel)
- AI prompt logs use `/tmp` directory in serverless (temporary)

### Function Timeout
- Default timeout: 10 seconds
- Configured timeout: 30 seconds (in `vercel.json`)
- For longer operations, consider using background jobs

### Memory Limits
- Default: 1024 MB (configured in `vercel.json`)
- Can be increased if needed

## Troubleshooting

### Function Crashes
1. Check Vercel logs: Dashboard → Your Project → Functions → View Logs
2. Verify environment variables are set correctly
3. Check database connection string
4. Verify RPC URL is accessible

### Database Connection Issues
- Ensure MongoDB Atlas allows connections from Vercel IPs (0.0.0.0/0)
- Check connection string format
- Verify network access in MongoDB Atlas

### CORS Errors
- Add your frontend URL to `CORS_ORIGIN` environment variable
- Or set `ALLOW_ALL_ORIGINS=true` for development
- Check `backend/src/app.ts` for CORS configuration

### Build Failures
- Ensure all dependencies are in `package.json`
- Check TypeScript compilation errors
- Verify Node.js version (requires 18+)

## Testing Locally

To test the serverless function locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally
vercel dev
```

This will simulate the Vercel environment locally.

## Monitoring

- **Logs**: View in Vercel Dashboard → Functions → Logs
- **Metrics**: View in Vercel Dashboard → Analytics
- **Errors**: Check Vercel Dashboard → Functions → Errors

## Support

If you encounter issues:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connection separately
4. Check CORS configuration
5. Review this guide for common issues

