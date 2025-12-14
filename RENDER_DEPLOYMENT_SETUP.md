# 🚀 Render Deployment Setup Guide

This guide helps you configure your backend on Render and ensure it works with your Vercel frontend.

## Current Configuration

- **Frontend URL:** `https://vibequorum0.vercel.app`
- **Backend URL:** `https://vibequorum.onrender.com`

## Render Backend Configuration

### 1. Environment Variables (Set in Render Dashboard)

Go to your Render Dashboard → Your Backend Service → Environment → Add Environment Variable

**Required Variables:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vibequorum
ADMIN_PRIVATE_KEY=0x...
VIBE_TOKEN_ADDRESS=0x...
REWARD_MANAGER_ADDRESS=0x...
RPC_URL=https://sepolia.base.org
JWT_SECRET=your-random-secret-string
NODE_ENV=production
```

**CORS Configuration:**
```
FRONTEND_URL=https://vibequorum0.vercel.app
```

**Optional:**
```
HUGGINGFACE_API_KEY=your-key-here
LOG_LEVEL=info
ALLOW_ALL_ORIGINS=false
```

### 2. Render Service Settings

**Build Command:**
```bash
cd backend && npm install && npm run build
```

**Start Command:**
```bash
cd backend && npm start
```

**Root Directory:**
```
/backend
```

**Environment:**
- Node: 18.x or higher

### 3. Health Check

Render will automatically check `/health` endpoint. Make sure it's accessible:
```bash
curl https://vibequorum.onrender.com/health
```

Should return:
```json
{
  "success": true,
  "message": "VibeQuorum API is running",
  "timestamp": "..."
}
```

## Vercel Frontend Configuration

### 1. Environment Variables (Set in Vercel Dashboard)

Go to your Vercel Dashboard → Your Frontend Project → Settings → Environment Variables

**Required:**
```
NEXT_PUBLIC_API_URL=https://vibequorum.onrender.com
```

**Also set:**
```
NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_REWARD_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_RPC_URL=https://sepolia.base.org
```

### 2. Important Notes

- **After adding environment variables, you MUST redeploy** both frontend and backend
- Environment variables are baked into the build at build time
- Clear browser cache after redeployment

## Local Development Setup

### Backend (.env in backend/)
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your-mongodb-uri
# ... other variables
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local in VibeQuorum-frontend/)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
# ... other variables
```

## Testing the Connection

### 1. Test Backend Health
```bash
curl https://vibequorum.onrender.com/health
```

### 2. Test CORS
```bash
curl -H "Origin: https://vibequorum0.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://vibequorum.onrender.com/health -v
```

Should see:
```
< access-control-allow-origin: https://vibequorum0.vercel.app
```

### 3. Test API Endpoint
```bash
curl -H "Origin: https://vibequorum0.vercel.app" \
     https://vibequorum.onrender.com/api/questions?limit=1
```

### 4. Test from Browser

1. Open `https://vibequorum0.vercel.app`
2. Open Browser DevTools → Console
3. Look for: `🔗 API URL: https://vibequorum.onrender.com`
4. Check Network tab for API requests
5. Verify no CORS errors

## Troubleshooting

### Issue: CORS Error

**Error:** `CORS: Origin https://vibequorum0.vercel.app is not allowed`

**Fix:**
1. Add `FRONTEND_URL=https://vibequorum0.vercel.app` in Render environment variables
2. Redeploy backend
3. The code automatically adds this to allowed origins

### Issue: Backend Not Responding

**Symptoms:** 502 Bad Gateway or timeout

**Fix:**
1. Check Render logs for errors
2. Verify all environment variables are set
3. Check MongoDB connection
4. Verify build command completed successfully

### Issue: Frontend Still Using localhost:4000

**Symptoms:** Browser console shows `🔗 API URL: http://localhost:4000`

**Fix:**
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel dashboard
2. **Redeploy frontend** (environment variables are baked at build time)
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: API Returns 404

**Symptoms:** `404 Not Found` when calling API endpoints

**Fix:**
1. Verify routes are correct (should start with `/api/`)
2. Test backend directly: `curl https://vibequorum.onrender.com/api/questions`
3. Check Render logs for routing issues

## Render-Specific Notes

### Auto-Deploy
- Render automatically deploys on git push to main branch
- Manual deploys available in dashboard

### Health Checks
- Render uses `/health` endpoint for health checks
- Service will restart if health checks fail

### Environment Variables
- Set variables in Render dashboard (not in code)
- Variables are available at runtime
- Changes require redeployment

### Logs
- View logs in Render dashboard → Logs tab
- Logs are real-time
- Use `logger.info()`, `logger.error()` in code

## Quick Checklist

- [ ] Backend deployed on Render and accessible
- [ ] All environment variables set in Render dashboard
- [ ] `FRONTEND_URL` set to `https://vibequorum0.vercel.app`
- [ ] Backend health check passes: `curl https://vibequorum.onrender.com/health`
- [ ] CORS test passes (see Testing section)
- [ ] `NEXT_PUBLIC_API_URL` set to `https://vibequorum.onrender.com` in Vercel
- [ ] Frontend redeployed after setting environment variables
- [ ] Browser console shows correct API URL
- [ ] No CORS errors in browser console
- [ ] API requests succeed in Network tab

## Support

If issues persist:
1. Check Render logs for backend errors
2. Check Vercel logs for frontend errors
3. Test backend endpoints directly with curl
4. Verify all environment variables are correct
5. Ensure both services are redeployed after changes
