import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, bscTestnet, polygon } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Contract addresses - UPDATE AFTER DEPLOYMENT
export const CONTRACT_ADDRESSES = {
  vibeToken: process.env.NEXT_PUBLIC_VIBE_TOKEN_ADDRESS || '',
  rewardManager: process.env.NEXT_PUBLIC_REWARD_MANAGER_ADDRESS || '',
} as const

// Supported chains for VibeQuorum
export const SUPPORTED_CHAINS = [sepolia, bscTestnet] as const

// Chain names for display
export const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum',
  11155111: 'Sepolia',
  97: 'BSC Testnet',
  137: 'Polygon',
}

// Block explorer URLs
export const BLOCK_EXPLORERS: Record<number, string> = {
  1: 'https://etherscan.io',
  11155111: 'https://sepolia.etherscan.io',
  97: 'https://testnet.bscscan.com',
  137: 'https://polygonscan.com',
}

// Get explorer URL for transaction
export const getExplorerTxUrl = (chainId: number, txHash: string): string => {
  const base = BLOCK_EXPLORERS[chainId] || BLOCK_EXPLORERS[11155111]
  return `${base}/tx/${txHash}`
}

// Get explorer URL for address
export const getExplorerAddressUrl = (chainId: number, address: string): string => {
  const base = BLOCK_EXPLORERS[chainId] || BLOCK_EXPLORERS[11155111]
  return `${base}/address/${address}`
}

// Wagmi configuration
export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
    }),
  ],
  transports: {
    [sepolia.id]: http(process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL),
    [bscTestnet.id]: http(process.env.NEXT_PUBLIC_BSC_TESTNET_RPC_URL),
  },
})

// Default chain ID
export const DEFAULT_CHAIN_ID = sepolia.id

