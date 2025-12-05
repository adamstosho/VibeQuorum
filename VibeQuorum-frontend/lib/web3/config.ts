import { http, createConfig } from 'wagmi'
import { baseSepolia, sepolia, bscTestnet } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

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

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    }),
  ],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL!),
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL),
  },
})

// Default chain ID - Base Sepolia
export const DEFAULT_CHAIN_ID = baseSepolia.id
