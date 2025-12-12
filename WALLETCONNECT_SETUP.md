# WalletConnect Project ID Setup

## Error: "No projectId found"

This error occurs when WalletConnect Cloud projectId is not properly configured. RainbowKit v2 requires a WalletConnect Cloud projectId for WalletConnect v2 support.

## Quick Fix

### Option 1: Use Default ProjectId (Development Only)

The code includes a default projectId that works for development/testing:
```
a841e40e8e4a659aad0d5fb9f98bf593
```

This is already set as a fallback, so the app should work without additional configuration.

### Option 2: Get Your Own ProjectId (Recommended for Production)

1. **Go to WalletConnect Cloud**: https://cloud.walletconnect.com
2. **Sign up/Login** with your account
3. **Create a new project**
4. **Copy your projectId**

5. **Add to `.env.local`**:
   ```env
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here
   ```

6. **Restart your dev server**:
   ```bash
   npm run dev
   ```

## File Location

Create or update: `VibeQuorum-frontend/.env.local`

```env
# WalletConnect Cloud Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id-here

# Other environment variables...
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Verification

After setting the projectId:

1. **Restart dev server** (required for env vars to load)
2. **Check browser console** - should see no projectId errors
3. **Click "Connect Wallet"** - should work without errors

## Notes

- The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser
- Environment variables are loaded at build time, so restart is required
- The default projectId works for development but you should use your own for production
- WalletConnect Cloud is free to use

## Troubleshooting

If you still see the error:

1. **Check `.env.local` exists** in `VibeQuorum-frontend/` directory
2. **Verify variable name** is exactly `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
3. **No spaces** around the `=` sign
4. **Restart dev server** after changes
5. **Clear `.next` cache**: `rm -rf .next && npm run dev`
