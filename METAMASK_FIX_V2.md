# MetaMask Fix - Using RainbowKit v2 getDefaultConfig

## Problem
MetaMask was not appearing in the wallet connection modal, only Rabby Wallet was showing up despite MetaMask being installed.

## Root Cause
When using `createConfig` manually with wagmi v2, RainbowKit v2 doesn't properly detect MetaMask through EIP-6963. The manual connector configuration was conflicting with RainbowKit's automatic wallet detection.

## Solution
Migrated to RainbowKit v2's recommended `getDefaultConfig` function, which:
- Automatically includes MetaMask in the wallet list
- Properly handles EIP-6963 wallet detection
- Includes all popular wallets by default (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- Eliminates connector conflicts

## Changes Made

### `/root/Web3Answer/VibeQuorum-frontend/lib/web3/config.ts`

**Before:**
```typescript
import { http, createConfig } from 'wagmi'
import { injected, metaMask, walletConnect, coinbaseWallet, safe } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    metaMask({ ... }),
    walletConnect({ ... }),
    coinbaseWallet({ ... }),
    injected({ ... }),
    safe(),
  ],
  transports: { ... },
  ssr: true,
})
```

**After:**
```typescript
import { http } from 'wagmi'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const wagmiConfig = getDefaultConfig({
  appName: 'VibeQuorum',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a841e40e8e4a659aad0d5fb9f98bf593',
  chains: SUPPORTED_CHAINS,
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL),
  },
  ssr: true,
})
```

## Key Benefits

1. **Automatic MetaMask Detection**: `getDefaultConfig` automatically includes MetaMask and ensures it appears in the wallet list
2. **EIP-6963 Support**: Properly handles the EIP-6963 standard for wallet discovery
3. **Simplified Configuration**: No need to manually configure individual connectors
4. **Better Compatibility**: Follows RainbowKit v2 best practices
5. **Preserved Custom Settings**: Your custom RPC URLs and chains are still used

## Testing Steps

1. **Clear Browser Cache**: Clear your browser cache and reload the app
2. **Check Wallet Modal**: Click "Connect Wallet" button
3. **Verify MetaMask**: MetaMask should now appear in the wallet list alongside Rabby and other wallets
4. **Test Connection**: Try connecting with MetaMask to ensure it works properly

## Expected Result

When clicking "Connect Wallet", you should see:
- ✅ MetaMask (if installed)
- ✅ Rabby Wallet (if installed)
- ✅ WalletConnect (QR code for mobile wallets)
- ✅ Coinbase Wallet
- ✅ Other EIP-6963 compatible wallets

## Notes

- The `getDefaultConfig` function automatically includes popular wallets
- Your custom RPC URLs are preserved through the `transports` option
- The provider setup (`Web3Provider`) remains unchanged and works with the new config
- This follows the official RainbowKit v2 migration guide recommendations

## References

- [RainbowKit v2 Migration Guide](https://rainbowkit.com/guides/rainbowkit-wagmi-v2)
- [RainbowKit Installation Guide](https://rainbowkit.com/en-US/docs/installation)
- [EIP-6963 Wallet Discovery](https://eips.ethereum.org/EIPS/eip-6963)
