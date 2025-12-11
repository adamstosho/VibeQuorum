# API "Failed to Fetch" Error - Troubleshooting Guide

## Error Message
```
Failed to fetch
TypeError: Failed to fetch
```

## Common Causes & Solutions

### 1. Backend Server Not Running ⚠️ MOST COMMON

**Symptom:** All API requests fail with "Failed to fetch"

**Solution:**
```bash
# Navigate to backend directory
cd backend

# Start the backend server
npm run dev

# Or in production
npm start
```

**Verify:** Check if server is running on `http://localhost:4000`
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "success": true,
  "message": "VibeQuorum API is running",
  "timestamp": "..."
}
```

---

### 2. Wrong API URL Configuration

**Check your environment variables:**

Create/update `VibeQuorum-frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**Verify in browser console:**
- Open DevTools (F12)
- Check console for: `🔗 API URL: http://localhost:4000`

---

### 3. CORS (Cross-Origin Resource Sharing) Issues

**Backend CORS Configuration:**
The backend is configured to allow requests from `http://localhost:3000` (default Next.js port).

**If your frontend runs on a different port:**
1. Update `backend/.env`:
   ```env
   FRONTEND_URL=http://localhost:3000
   ```
2. Restart backend server

**Check backend CORS settings:**
- File: `backend/src/app.ts`
- Line 28: `origin: process.env.FRONTEND_URL || 'http://localhost:3000'`

---

### 4. Network/Firewall Issues

**Check:**
- Is port 4000 accessible?
- Any firewall blocking localhost connections?
- VPN/proxy interfering?

**Test backend directly:**
```bash
# In terminal
curl http://localhost:4000/api/questions

# Or in browser
http://localhost:4000/health
```

---

### 5. Backend Server Crashed

**Check backend logs:**
```bash
cd backend
npm run dev
```

Look for:
- Database connection errors
- Missing environment variables
- Port already in use errors

**Common fixes:**
- Check MongoDB connection: `backend/.env` → `MONGODB_URI`
- Check Redis connection: `backend/.env` → `REDIS_URL`
- Ensure port 4000 is not used by another process

---

## Quick Diagnostic Steps

1. **Check if backend is running:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Check frontend API URL:**
   - Open browser DevTools Console
   - Look for: `🔗 API URL: ...`

3. **Check browser Network tab:**
   - Open DevTools → Network tab
   - Try to load questions
   - Check if request to `localhost:4000` appears
   - Check request status (should be 200, not failed)

4. **Check backend logs:**
   - Look for incoming requests
   - Check for CORS errors
   - Check for 404/500 errors

---

## Error Handling Improvements

The codebase now includes:
- ✅ Better error messages with specific guidance
- ✅ Console logging for debugging
- ✅ Graceful error handling (empty arrays instead of crashes)
- ✅ Retry logic (1 retry after 1 second)

---

## Development Setup Checklist

- [ ] Backend server running (`npm run dev` in `backend/`)
- [ ] Frontend server running (`npm run dev` in `VibeQuorum-frontend/`)
- [ ] MongoDB running (if using local MongoDB)
- [ ] Redis running (if using local Redis)
- [ ] `.env.local` file exists in frontend with `NEXT_PUBLIC_API_URL`
- [ ] `.env` file exists in backend with all required variables

---

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Check backend terminal** for server errors
3. **Verify environment variables** are set correctly
4. **Try restarting both servers**
5. **Clear browser cache** and hard refresh (Ctrl+Shift+R)

---

## API Health Check Utility

Use the health check utility to verify backend availability:

```typescript
import { checkApiHealth } from '@/lib/api-health'

const health = await checkApiHealth()
console.log(health) // { healthy: true/false, message: '...' }
```
