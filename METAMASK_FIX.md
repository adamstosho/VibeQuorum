# MetaMask Not Showing in Wallet List - FIXED

## Problem
MetaMask was not appearing in the wallet connection modal, even though other wallets like Rabby were visible.

## Root Cause
The issue was caused by connector configuration conflicts. When using both `metaMask()` and `injected()` connectors, RainbowKit might detect MetaMask through the generic `injected` connector instead of showing it as a dedicated MetaMask option.

## Solution Applied

1. **Restored `metaMask` connector** - Explicitly imported and configured the `metaMask` connector from `@wagmi/connectors`
2. **Prioritized MetaMask** - Placed MetaMask connector first in the connectors array
3. **Kept generic `injected` connector** - This will still detect other wallets like Rabby, Trust Wallet, Brave, etc.

## Updated Configuration

```typescript
connectors: [
  // MetaMask connector - explicitly configured
  metaMask({
    dappMetadata: {
      name: 'VibeQuorum',
      url: 'https://vibequorum.com',
    },
  }),
  // WalletConnect - shows all wallets via QR code
  walletConnect({ ... }),
  // Coinbase Wallet
  coinbaseWallet({ ... }),
  // Generic injected for other wallets (Rabby, Trust, Brave, etc.)
  injected({ shimDisconnect: true }),
  // Safe wallet
  safe(),
]
```

## How It Works Now

1. **MetaMask** - Shows up as a dedicated option if installed
2. **WalletConnect** - Shows all wallets via QR code (including MetaMask if not installed)
3. **Other Injected Wallets** - Rabby, Trust Wallet, Brave, etc. will appear via the `injected` connector
4. **EIP-6963 Support** - RainbowKit v2 automatically detects wallets that support EIP-6963

## Testing

After this fix, when you click "Connect Wallet":
- ✅ MetaMask should appear as a dedicated option (if installed)
- ✅ Rabby and other wallets should still appear
- ✅ WalletConnect QR code should show all available wallets

## If MetaMask Still Doesn't Show

1. **Check if MetaMask is installed** - Make sure MetaMask extension is installed in your browser
2. **Refresh the page** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Check browser console** - Look for any errors related to wallet detection
4. **Try incognito mode** - Sometimes extensions conflict in normal mode
5. **Check MetaMask version** - Ensure you're using a recent version that supports EIP-6963

## Additional Notes

- RainbowKit v2 automatically detects wallets via EIP-6963 standard
- MetaMask should appear automatically if installed and EIP-6963 compatible
- The explicit `metaMask()` connector ensures it shows up even if auto-detection fails
- The `injected()` connector will catch any wallets not explicitly configured
