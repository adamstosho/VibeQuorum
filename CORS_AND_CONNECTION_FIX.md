# 🔧 CORS and Connection Configuration - Complete Fix

This document explains the fixes applied to ensure your app works perfectly on both **localhost** and **production (Vercel)**.

## ✅ What Was Fixed

### 1. **Smart API URL Detection (Frontend)**
The frontend now automatically detects the environment and uses the correct API URL:

- **Production (Vercel)**: Uses relative URLs (same domain) - no CORS issues
- **Localhost**: Uses `http://localhost:4000` explicitly
- **Override**: Can still use `NEXT_PUBLIC_API_URL` environment variable

### 2. **Enhanced CORS Configuration (Backend)**
The backend CORS now handles all scenarios:

- ✅ Same-origin requests (production - same domain)
- ✅ Localhost development (all localhost ports)
- ✅ Vercel preview deployments (all `*.vercel.app` domains)
- ✅ Custom frontend URLs via `FRONTEND_URL` environment variable
- ✅ No-origin requests (API tools, curl, etc.)

### 3. **Better Logging**
Added enhanced logging for debugging:
- Request origin tracking
- CORS status in logs
- Health check with environment info
- Development-only detailed logs

## 🚀 How It Works

### Production (Vercel)

**Frontend:**
- Automatically detects it's on Vercel
- Uses relative URLs (e.g., `/api/questions` instead of `https://vibequorum0.vercel.app/api/questions`)
- No CORS issues because same-origin

**Backend:**
- Detects serverless environment (`VERCEL=1`)
- Allows all `*.vercel.app` domains
- Allows same-origin requests (no origin header)

### Localhost Development

**Frontend:**
- Detects `localhost` or `127.0.0.1`
- Uses `http://localhost:4000` explicitly
- Connects to local backend server

**Backend:**
- Allows all localhost origins
- Allows all `127.0.0.1` origins
- Development-friendly CORS

## 📋 Configuration Checklist

### For Local Development

**Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:4000
```

**Frontend:**
```bash
cd VibeQuorum-frontend
# No NEXT_PUBLIC_API_URL needed - auto-detects localhost
pnpm dev
# Frontend runs on http://localhost:3000
```

### For Production (Vercel)

**Backend Environment Variables (Vercel Dashboard):**
- ✅ `MONGODB_URI` - Your MongoDB connection
- ✅ `FRONTEND_URL` - Optional: `https://vibequorum0.vercel.app` (for explicit CORS)
- ✅ Other required variables (see DEPLOYMENT_CHECKLIST.md)

**Frontend Environment Variables (Vercel Dashboard):**
- ✅ `NEXT_PUBLIC_API_URL` - **NOT NEEDED** (auto-detects)
- ✅ OR set to empty string or same domain if you want explicit control
- ✅ Other required variables

**Important:** Since both frontend and backend are on the same Vercel domain, you don't need to set `NEXT_PUBLIC_API_URL` in production. The app will automatically use relative URLs.

## 🔍 Troubleshooting

### Issue: Frontend can't connect to backend on localhost

**Symptoms:**
- Error: "Cannot connect to backend server"
- Network tab shows failed requests to `http://localhost:4000`

**Fix:**
1. Ensure backend is running: `cd backend && npm run dev`
2. Test backend: `curl http://localhost:4000/health`
3. Check browser console for API URL: Should show `http://localhost:4000`
4. Verify no port conflicts: `./backend/scripts/fix-port.sh`

### Issue: CORS errors in production

**Symptoms:**
- Browser console: "CORS: Origin ... is not allowed"
- Network tab shows CORS preflight failures

**Fix:**
1. Check backend logs for rejected origins
2. Add `FRONTEND_URL` environment variable in Vercel backend settings
3. Or set `ALLOW_ALL_ORIGINS=true` temporarily (development only)
4. Verify frontend is using relative URLs (check browser console)

### Issue: API requests fail silently

**Symptoms:**
- No errors in console
- Data doesn't load
- Network tab shows 404 or other errors

**Fix:**
1. Check browser Network tab for actual request URLs
2. Verify backend routes in `vercel.json`
3. Test backend directly: `curl https://vibequorum0.vercel.app/health`
4. Check Vercel function logs for errors

### Issue: Different behavior on localhost vs production

**Symptoms:**
- Works locally but not in production (or vice versa)

**Fix:**
1. Check environment detection:
   - Localhost: Browser console should show `🔗 API URL: http://localhost:4000`
   - Production: Browser console should show `🔗 API URL: (relative - same origin)`
2. Verify CORS allows both:
   - Localhost: Check backend allows localhost origins
   - Production: Check backend allows Vercel domains
3. Check environment variables are set correctly in Vercel

## 🧪 Testing

### Test Localhost Connection

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd VibeQuorum-frontend
pnpm dev

# Terminal 3: Test backend
curl http://localhost:4000/health

# Browser: Open http://localhost:3000
# Check console: Should see "🔗 API URL: http://localhost:4000"
# Check Network tab: Requests should go to http://localhost:4000/api/...
```

### Test Production Connection

```bash
# Test backend health
curl https://vibequorum0.vercel.app/health

# Test API endpoint
curl https://vibequorum0.vercel.app/api/questions

# Browser: Open https://vibequorum0.vercel.app
# Check console: Should see "🔗 API URL: (relative - same origin)"
# Check Network tab: Requests should go to /api/... (relative URLs)
```

## 📝 Code Changes Summary

### Frontend (`VibeQuorum-frontend/lib/api.ts`)
- ✅ Smart API URL detection function
- ✅ Automatic localhost vs production detection
- ✅ Relative URL support for same-domain production
- ✅ Better error messages

### Frontend (`VibeQuorum-frontend/lib/api-health.ts`)
- ✅ Same smart API URL detection
- ✅ Relative URL support

### Backend (`backend/src/app.ts`)
- ✅ Enhanced CORS with serverless detection
- ✅ Vercel domain pattern matching
- ✅ Better localhost handling
- ✅ Enhanced logging with origin tracking
- ✅ Improved health check endpoint

## 🎯 Key Points

1. **No Configuration Needed**: The app auto-detects environment and works out of the box
2. **Same Domain = No CORS**: In production, same-domain requests don't trigger CORS
3. **Localhost = Explicit URL**: In development, explicit `localhost:4000` URL is used
4. **Override Available**: Can still use `NEXT_PUBLIC_API_URL` if needed
5. **Better Debugging**: Enhanced logs help identify connection issues quickly

## 🚨 Important Notes

- **Environment Variables**: In Vercel, `NEXT_PUBLIC_*` variables are baked at build time
- **Redeploy Required**: After changing environment variables, redeploy frontend
- **CORS Logs**: CORS rejections are logged in development, silent in production
- **Health Check**: Use `/health` endpoint to verify backend is running

---

## Need Help?

1. Check browser console for API URL detection
2. Check browser Network tab for actual request URLs
3. Check Vercel function logs for backend errors
4. Test backend directly with `curl`
5. Verify environment variables in Vercel dashboard
