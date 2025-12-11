# Quick Fix for "Failed to fetch" Error

## Immediate Steps

### 1. Check Backend is Running

```bash
# In backend directory
cd backend
npm run dev

# Should see:
# 🚀 Server running on port 4000
# 📚 API Docs: http://localhost:4000/api-docs
# ❤️  Health: http://localhost:4000/health
```

### 2. Test Backend Health

Open in browser or run:
```bash
curl http://localhost:4000/health
```

Should return: `{"success":true,"message":"VibeQuorum API is running",...}`

### 3. Set Frontend Environment Variable

Create/update `VibeQuorum-frontend/.env.local`:

```bash
cd VibeQuorum-frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
```

### 4. Restart Frontend

```bash
# Stop frontend (Ctrl+C)
# Then restart:
cd VibeQuorum-frontend
npm run dev
```

### 5. Check Browser Console

Open DevTools (F12) → Console:
- Should see: `🔗 API URL: http://localhost:4000`
- Check Network tab for failed requests
- Look for CORS errors

## Common Issues

### Issue: Backend not running
**Solution**: Start backend server (`npm run dev` in backend/)

### Issue: Wrong API URL
**Solution**: Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local`

### Issue: CORS error
**Solution**: Backend CORS is now configured to allow localhost. If still failing:
- Check `FRONTEND_URL` in backend `.env` matches frontend URL
- Restart backend after changing environment variables

### Issue: Port conflict
**Solution**: 
- Backend should be on port 4000
- Frontend should be on port 3000
- Check no other services using these ports

## Verify Fix

1. Backend health check works: `curl http://localhost:4000/health`
2. Frontend console shows correct API URL
3. Network requests succeed (check Network tab)
4. No CORS errors in console

## Still Not Working?

1. **Check both terminals are running**:
   - Terminal 1: Backend (`npm run dev` in backend/)
   - Terminal 2: Frontend (`npm run dev` in VibeQuorum-frontend/)

2. **Clear browser cache**:
   - Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

3. **Check MongoDB connection**:
   - Backend logs should show "MongoDB connected"

4. **Verify environment variables**:
   ```bash
   # Backend
   echo $FRONTEND_URL  # Should be http://localhost:3000 or unset
   
   # Frontend (in browser console)
   console.log(process.env.NEXT_PUBLIC_API_URL)  # Should be http://localhost:4000
   ```

## Debug Commands

```bash
# Test backend directly
curl http://localhost:4000/health

# Test from Node.js
node -e "fetch('http://localhost:4000/health').then(r=>r.json()).then(console.log)"

# Check ports in use
lsof -i :4000  # Backend port
lsof -i :3000  # Frontend port
```
