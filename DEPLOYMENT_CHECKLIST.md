# ✅ Vercel Deployment Checklist

Use this checklist to ensure your Vercel deployment works perfectly.

## Pre-Deployment Checklist

### 1. Code Changes ✅
- [x] Serverless function handler created (`backend/api/index.ts`)
- [x] File system operations fixed for serverless
- [x] Logger configured for serverless environment
- [x] AI service uses `/tmp` for file writes
- [x] Vercel configuration file created (`vercel.json`)
- [x] TypeScript config updated to include API directory

### 2. Environment Variables (Set in Vercel Dashboard)

**Required Variables:**
- [ ] `MONGODB_URI` - Your MongoDB connection string
- [ ] `ADMIN_PRIVATE_KEY` - Wallet private key (starts with 0x)
- [ ] `VIBE_TOKEN_ADDRESS` - Deployed VibeToken contract address
- [ ] `REWARD_MANAGER_ADDRESS` - Deployed RewardManager contract address
- [ ] `RPC_URL` - Base Sepolia RPC URL (e.g., `https://sepolia.base.org`)
- [ ] `JWT_SECRET` - Random secret string for JWT tokens
- [ ] `CORS_ORIGIN` - Your frontend URL (or set `ALLOW_ALL_ORIGINS=true`)

**Optional Variables:**
- [ ] `HUGGINGFACE_API_KEY` - For AI features (if using)
- [ ] `OPENAI_API_KEY` - Alternative AI provider (if using)
- [ ] `FRONTEND_URL` - Frontend URL for CORS
- [ ] `LOG_LEVEL` - Logging level (default: `info`)
- [ ] `ALLOW_ALL_ORIGINS` - Set to `true` to allow all origins (dev only)

**Note:** Vercel automatically sets `NODE_ENV=production` and `VERCEL=1`

### 3. Vercel Project Settings

**Build & Development Settings:**
- [ ] Root Directory: `/` (root of monorepo)
- [ ] Build Command: `cd backend && npm install && npm run build`
- [ ] Output Directory: Leave empty
- [ ] Install Command: `cd backend && npm install`
- [ ] Node.js Version: 18.x or higher

**Environment:**
- [ ] All environment variables set for Production
- [ ] All environment variables set for Preview (optional)
- [ ] All environment variables set for Development (optional)

### 4. Database Configuration

**MongoDB Atlas (if using):**
- [ ] Network Access: Allow connections from `0.0.0.0/0` (all IPs)
- [ ] Database User: Created with proper permissions
- [ ] Connection String: Format: `mongodb+srv://username:password@cluster.mongodb.net/database`
- [ ] Database name matches your connection string

### 5. Blockchain Configuration

**Base Sepolia:**
- [ ] Contracts deployed to Base Sepolia
- [ ] Contract addresses copied correctly
- [ ] RPC URL is accessible
- [ ] Admin wallet has sufficient ETH for gas fees
- [ ] MINTER_ROLE granted to RewardManager contract

## Deployment Steps

1. **Commit and Push Changes**
   ```bash
   git add .
   git commit -m "feat: add Vercel serverless support"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to Vercel Dashboard
   - Your project should auto-deploy on push
   - Or manually trigger deployment

3. **Monitor Deployment**
   - Watch build logs in Vercel Dashboard
   - Check for any build errors
   - Verify function is created successfully

4. **Test Deployment**
   - Health check: `https://your-project.vercel.app/health`
   - API endpoint: `https://your-project.vercel.app/api/questions`
   - Check function logs for any errors

## Post-Deployment Verification

### 1. Health Check ✅
```bash
curl https://your-project.vercel.app/health
```
Expected response:
```json
{
  "success": true,
  "message": "VibeQuorum API is running",
  "timestamp": "2025-01-15T..."
}
```

### 2. API Endpoints ✅
```bash
# Test questions endpoint
curl https://your-project.vercel.app/api/questions

# Should return list of questions or empty array
```

### 3. Function Logs ✅
- Go to Vercel Dashboard → Your Project → Functions
- Click on the function → View Logs
- Check for:
  - ✅ Database connection successful
  - ✅ Express app initialized
  - ❌ Any error messages

### 4. Database Connection ✅
- Check logs for: `✅ Database connected (serverless)`
- If connection fails, verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access settings

## Common Issues & Solutions

### Issue: Function Crashes Immediately
**Solution:**
- Check environment variables are set correctly
- Verify MongoDB connection string format
- Check function logs for specific error

### Issue: Database Connection Fails
**Solution:**
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Ensure database user has proper permissions
- Check network access in MongoDB Atlas dashboard

### Issue: CORS Errors
**Solution:**
- Add frontend URL to `CORS_ORIGIN` environment variable
- Or set `ALLOW_ALL_ORIGINS=true` for development
- Check `backend/src/app.ts` CORS configuration

### Issue: Build Fails
**Solution:**
- Verify Node.js version is 18+
- Check all dependencies are in `package.json`
- Ensure TypeScript compiles without errors
- Check build logs for specific errors

### Issue: Function Timeout
**Solution:**
- Check function logs for slow operations
- Increase timeout in `vercel.json` (max 30 seconds)
- Optimize database queries
- Consider using background jobs for long operations

### Issue: File System Errors
**Solution:**
- File logging is disabled in serverless (expected)
- AI logs use `/tmp` directory (temporary)
- Check console logs instead of file logs

## Monitoring

### Vercel Dashboard
- **Functions**: View function invocations and errors
- **Logs**: Real-time function logs
- **Analytics**: Request metrics and performance
- **Deployments**: Deployment history and status

### Health Monitoring
- Set up uptime monitoring (e.g., UptimeRobot)
- Monitor `/health` endpoint
- Set up alerts for function errors

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Function Logs**: Vercel Dashboard → Functions → Logs
- **Deployment Guide**: See `VERCEL_DEPLOYMENT.md`
- **Troubleshooting**: Check function logs first

## Success Indicators ✅

Your deployment is successful when:
- ✅ Health endpoint returns 200 OK
- ✅ API endpoints respond correctly
- ✅ Database connects successfully
- ✅ No errors in function logs
- ✅ CORS works with your frontend
- ✅ Blockchain transactions work (if tested)

---

**Good luck with your deployment! 🚀**

If you encounter any issues, check the function logs first - they contain detailed error messages that will help diagnose the problem.

