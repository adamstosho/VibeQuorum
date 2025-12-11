# Fixing "Failed to fetch" Error

## Common Causes and Solutions

### 1. Backend Server Not Running

**Check:**
```bash
# In backend directory
cd backend
npm run dev
```

**Verify backend is running:**
- Open browser: `http://localhost:4000/health`
- Should return: `{"success":true,"message":"VibeQuorum API is running",...}`

### 2. CORS Configuration Issue

**Backend CORS is configured in `backend/src/app.ts`:**

```typescript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: [
    'Content-Type',
    'x-wallet-address',
    'x-signature',
    'x-timestamp',
  ],
})
```

**Fix:**
1. Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
2. If running on different port, update environment variable

### 3. API URL Misconfiguration

**Frontend API URL is set in `VibeQuorum-frontend/lib/api.ts`:**

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
```

**Fix:**
1. Create `.env.local` in `VibeQuorum-frontend/`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

2. Restart Next.js dev server after adding environment variable

### 4. Network/Firewall Issues

**Check:**
- Firewall blocking port 4000
- Both servers running on correct ports
- No port conflicts

### 5. Next.js 16 Specific Issues

**If using Next.js 16, ensure:**
- Server-side requests use full URL (not relative paths)
- Client-side requests use `NEXT_PUBLIC_` prefixed variables
- No mixed server/client API calls

## Step-by-Step Fix

### Step 1: Verify Backend is Running

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Should see:
# Server running on port 4000
# MongoDB connected
```

### Step 2: Test Backend Health Endpoint

```bash
# In browser or curl
curl http://localhost:4000/health

# Should return JSON response
```

### Step 3: Configure Frontend Environment

```bash
# Create/update .env.local in VibeQuorum-frontend/
cd VibeQuorum-frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
```

### Step 4: Configure Backend CORS

```bash
# In backend/.env
FRONTEND_URL=http://localhost:3000
```

### Step 5: Restart Both Servers

```bash
# Stop both servers (Ctrl+C)
# Then restart:

# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd VibeQuorum-frontend
npm run dev
```

### Step 6: Check Browser Console

Open browser DevTools (F12) → Console tab:
- Look for: `🔗 API URL: http://localhost:4000`
- Check for CORS errors
- Verify network requests in Network tab

## Debugging Checklist

- [ ] Backend server running on port 4000
- [ ] Frontend server running on port 3000
- [ ] `NEXT_PUBLIC_API_URL` set in `.env.local`
- [ ] `FRONTEND_URL` set in backend `.env`
- [ ] No firewall blocking ports
- [ ] MongoDB connected (check backend logs)
- [ ] Browser console shows correct API URL
- [ ] Network tab shows failed request details

## Quick Test

```bash
# Test backend directly
curl http://localhost:4000/health

# Test from frontend (in browser console)
fetch('http://localhost:4000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## Production Deployment

For production, update environment variables:

**Backend:**
```bash
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Express CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)
- [MDN Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
