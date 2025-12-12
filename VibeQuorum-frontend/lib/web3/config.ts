import { http } from 'wagmi'
import { baseSepolia, sepolia, bscTestnet } from 'wagmi/chains'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

// Contract addresses - DEPLOYED on Base Sepolia Dec 5, 2025
export const CONTRACT_ADDRESSES = {
  vibeToken: process.env.NEXT_PUBLIC_VIBE_TOKEN_ADDRESS!,
  rewardManager: process.env.NEXT_PUBLIC_REWARD_MANAGER_ADDRESS!,
} as const

// Supported chains for VibeQuorum - Base Sepolia is primary
export const SUPPORTED_CHAINS = [baseSepolia, sepolia, bscTestnet] as const

// Chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  84532: 'Base Sepolia',
  11155111: 'Sepolia',
  97: 'BSC Testnet',
}

// Block explorer URLs
export const BLOCK_EXPLORERS: Record<number, string> = {
  84532: 'https://sepolia.basescan.org',
  11155111: 'https://sepolia.etherscan.io',
  97: 'https://testnet.bscscan.com',
}

// Get explorer URL for transaction
export const getExplorerTxUrl = (chainId: number, txHash: string): string => {
  const base = BLOCK_EXPLORERS[chainId] || BLOCK_EXPLORERS[84532]
  return `${base}/tx/${txHash}`
}

// Get explorer URL for address
export const getExplorerAddressUrl = (chainId: number, address: string): string => {
  const base = BLOCK_EXPLORERS[chainId] || BLOCK_EXPLORERS[84532]
  return `${base}/address/${address}`
}

// Wagmi configuration using RainbowKit v2's getDefaultConfig
// This is the recommended approach - getDefaultConfig automatically includes MetaMask
// and properly handles EIP-6963 wallet detection
export const wagmiConfig = getDefaultConfig({
  appName: 'VibeQuorum',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'a841e40e8e4a659aad0d5fb9f98bf593',
  chains: SUPPORTED_CHAINS,
  // Custom transports for each chain (preserves your RPC URLs)
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL),
  },
  ssr: true, // Enable SSR support
})

// Default chain ID - Base Sepolia
export const DEFAULT_CHAIN_ID = baseSepolia.id
