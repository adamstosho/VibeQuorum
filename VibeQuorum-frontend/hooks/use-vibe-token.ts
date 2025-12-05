'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { VIBE_TOKEN_ABI } from '@/lib/web3/abis/VibeToken'

// Role hashes
const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
const PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a'

export function useVibeToken() {
  const { address: userAddress } = useAccount()
  // Read token info
  const { data: name } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'name',
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  const { data: symbol } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'symbol',
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  const { data: totalSupplyRaw, refetch: refetchTotalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'totalSupply',
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  const { data: maxSupplyRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'MAX_SUPPLY',
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  const { data: totalMintedRaw } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'totalMinted',
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  const { data: isPaused } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'paused',
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  // Role checks
  const { data: hasAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'hasRole',
    args: userAddress ? [ADMIN_ROLE, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken && !!userAddress,
    },
  })

  const { data: hasMinterRole } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'hasRole',
    args: userAddress ? [MINTER_ROLE, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken && !!userAddress,
    },
  })

  const { data: hasPauserRole } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'hasRole',
    args: userAddress ? [PAUSER_ROLE, userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken && !!userAddress,
    },
  })

  // Write contract
  const { 
    writeContract, 
    data: hash, 
    isPending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract()
  
  // Wait for transaction
  const { 
    isLoading: isConfirming, 
    isSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Transfer tokens
  const transfer = async (to: string, amount: string) => {
    if (!CONTRACT_ADDRESSES.vibeToken) {
      throw new Error('VibeToken contract address not configured')
    }
    
    writeContract({
      address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
      abi: VIBE_TOKEN_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, parseEther(amount)],
    })
  }

  // Approve tokens
  const approve = async (spender: string, amount: string) => {
    if (!CONTRACT_ADDRESSES.vibeToken) {
      throw new Error('VibeToken contract address not configured')
    }
    
    writeContract({
      address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
      abi: VIBE_TOKEN_ABI,
      functionName: 'approve',
      args: [spender as `0x${string}`, parseEther(amount)],
    })
  }

  // Format values
  const totalSupply = totalSupplyRaw ? parseFloat(formatEther(totalSupplyRaw as bigint)) : 0
  const maxSupply = maxSupplyRaw ? parseFloat(formatEther(maxSupplyRaw as bigint)) : 0
  const totalMinted = totalMintedRaw ? parseFloat(formatEther(totalMintedRaw as bigint)) : 0

  return {
    // Token info
    name: name as string | undefined,
    symbol: symbol as string | undefined,
    totalSupply,
    totalSupplyFormatted: totalSupply.toLocaleString(),
    maxSupply,
    maxSupplyFormatted: maxSupply.toLocaleString(),
    totalMinted,
    totalMintedFormatted: totalMinted.toLocaleString(),
    isPaused: isPaused as boolean | undefined,
    
    // Contract address
    contractAddress: CONTRACT_ADDRESSES.vibeToken,
    
    // Role checks
    hasAdminRole: hasAdminRole as boolean | undefined,
    hasMinterRole: hasMinterRole as boolean | undefined,
    hasPauserRole: hasPauserRole as boolean | undefined,
    hasRole: (hasAdminRole || hasMinterRole || hasPauserRole) as boolean | undefined,
    isAdmin: hasAdminRole as boolean | undefined,
    
    // Write functions
    transfer,
    approve,
    
    // Transaction state
    isPending,
    isConfirming,
    isSuccess,
    txHash: hash,
    error: writeError || confirmError,
    resetWrite,
    
    // Refetch
    refetchTotalSupply,
  }
}


