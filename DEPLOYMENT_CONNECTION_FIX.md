# 🔧 Frontend-Backend Connection Fix Guide

This guide helps you fix the connection between your deployed frontend and backend.

## Problem

After deployment, the frontend cannot connect to the backend. This is usually due to:
1. **Missing or incorrect `NEXT_PUBLIC_API_URL`** in frontend environment variables
2. **CORS configuration** not allowing the frontend domain
3. **Backend URL not accessible** or incorrect

## Solution

### Step 1: Get Your Backend URL

If your backend is deployed on **Vercel**, your backend URL will be:
```
https://your-project-name.vercel.app
```

If your backend is deployed on **Render** or another service, use that URL.

### Step 2: Configure Frontend Environment Variables

#### For Vercel Frontend Deployment:

1. Go to your Vercel Dashboard → Your Frontend Project → Settings → Environment Variables
2. Add or update `NEXT_PUBLIC_API_URL`:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-project.vercel.app
   ```
   **Important:** Replace `your-backend-project` with your actual Vercel backend project name.

3. Make sure to set this for:
   - ✅ Production
   - ✅ Preview (optional)
   - ✅ Development (optional)

4. **Redeploy** your frontend after adding the environment variable.

#### For Local Development:

Create or update `.env.local` in `VibeQuorum-frontend/`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Step 3: Configure Backend CORS

The backend needs to allow requests from your frontend domain.

#### Option A: Using Environment Variables (Recommended)

1. Go to your Vercel Dashboard → Your Backend Project → Settings → Environment Variables
2. Add `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-frontend-project.vercel.app
   ```
   **Important:** Replace `your-frontend-project` with your actual Vercel frontend project name.

3. **Redeploy** your backend after adding the environment variable.

#### Option B: Update CORS in Code

If you need to hardcode the frontend URL, edit `backend/src/app.ts` and add your frontend URL to the `allowedOrigins` array:

```typescript
const allowedOrigins = [
  'https://vibequorum0.vercel.app',
  'https://vibequorum0.vercel.app/',
  'https://your-frontend-project.vercel.app',  // Add your frontend URL here
  'https://your-frontend-project.vercel.app/', // Also add with trailing slash
  'http://localhost:3000',
  'http://localhost:3001',
  // ... other origins
];
```

### Step 4: Verify the Connection

1. **Check Backend Health:**
   ```bash
   curl https://your-backend-project.vercel.app/health
   ```
   Should return: `{"success":true,"message":"VibeQuorum API is running",...}`

2. **Check Frontend API URL:**
   - Open browser console on your frontend
   - Look for: `🔗 API URL: https://your-backend-project.vercel.app`
   - If it shows `http://localhost:4000`, the environment variable is not set correctly

3. **Test API Request:**
   - Open browser DevTools → Network tab
   - Try to load questions or make any API call
   - Check if requests go to the correct backend URL
   - Check for CORS errors in console

### Step 5: Troubleshooting

#### Issue: "Cannot connect to backend server"

**Possible causes:**
- `NEXT_PUBLIC_API_URL` not set or incorrect
- Backend not deployed or URL is wrong
- Network/firewall blocking requests

**Fix:**
1. Verify `NEXT_PUBLIC_API_URL` in Vercel dashboard
2. Test backend URL directly: `curl https://your-backend.vercel.app/health`
3. Check browser console for exact error message

#### Issue: CORS Error

**Error message:** `CORS: Origin https://your-frontend.vercel.app is not allowed`

**Fix:**
1. Add `FRONTEND_URL` environment variable in backend Vercel settings
2. Or update `allowedOrigins` in `backend/src/app.ts`
3. Redeploy backend after changes

#### Issue: 404 Not Found

**Error message:** `404 Not Found` when calling API endpoints

**Fix:**
1. Verify backend routes are correct in `vercel.json`
2. Check that API endpoints start with `/api/`
3. Test backend directly: `curl https://your-backend.vercel.app/api/questions`

#### Issue: Environment Variable Not Working

**Symptoms:** Frontend still uses `http://localhost:4000`

**Fix:**
1. **Important:** Environment variables starting with `NEXT_PUBLIC_` must be set in Vercel dashboard
2. They are baked into the build at build time
3. **You must rebuild/redeploy** after adding environment variables
4. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Quick Checklist

- [ ] Backend deployed and accessible at `https://your-backend.vercel.app/health`
- [ ] `NEXT_PUBLIC_API_URL` set in frontend Vercel environment variables
- [ ] `FRONTEND_URL` set in backend Vercel environment variables (or CORS updated)
- [ ] Frontend redeployed after adding environment variables
- [ ] Backend redeployed after adding environment variables
- [ ] Browser console shows correct API URL
- [ ] No CORS errors in browser console
- [ ] API requests succeed in Network tab

### Example Configuration

**Backend Vercel Environment Variables:**
```
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=https://vibequorum-frontend.vercel.app
JWT_SECRET=your-secret
# ... other variables
```

**Frontend Vercel Environment Variables:**
```
NEXT_PUBLIC_API_URL=https://vibequorum-backend.vercel.app
NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_REWARD_MANAGER_ADDRESS=0x...
# ... other variables
```

---

## Need More Help?

1. Check Vercel deployment logs for errors
2. Check browser console for detailed error messages
3. Test backend endpoints directly with `curl` or Postman
4. Verify all environment variables are set correctly in Vercel dashboard
