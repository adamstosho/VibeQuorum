'use client'

import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { VIBE_TOKEN_ABI } from '@/lib/web3/abis/VibeToken'
import { REWARD_MANAGER_ABI } from '@/lib/web3/abis/RewardManager'

// Re-export individual hooks
export { useVibeToken } from './use-vibe-token'
export { useRewardManager, useIsAnswerRewarded, useUserRewardStatus } from './use-reward-manager'

// Keccak256 role hashes
const ADMIN_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000'
const MINTER_ROLE = '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6'
const PAUSER_ROLE = '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a'
const REWARDER_ROLE = '0x0000000000000000000000000000000000000000000000000000000000000000' // Will be computed

// Combined hooks for checking roles and admin status
export function useVibeTokenRole(address: string | undefined) {
  const { data: hasAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'hasRole',
    args: address ? [ADMIN_ROLE, address as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken && !!address,
    },
  })

  const { data: hasMinterRole } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'hasRole',
    args: address ? [MINTER_ROLE, address as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken && !!address,
    },
  })

  const { data: hasPauserRole } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'hasRole',
    args: address ? [PAUSER_ROLE, address as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.vibeToken && !!address,
    },
  })

  return {
    hasAdminRole: hasAdminRole as boolean | undefined,
    hasMinterRole: hasMinterRole as boolean | undefined,
    hasPauserRole: hasPauserRole as boolean | undefined,
    hasRole: (hasAdminRole || hasMinterRole || hasPauserRole) as boolean | undefined,
    isAdmin: hasAdminRole as boolean | undefined,
  }
}

export function useRewardManagerRole(address: string | undefined) {
  const { data: hasAdminRole } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'hasRole',
    args: address ? [ADMIN_ROLE, address as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager && !!address,
    },
  })

  const { data: dailyDistributed } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'getStats',
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager,
    },
  })

  return {
    hasAdminRole: hasAdminRole as boolean | undefined,
    hasRole: hasAdminRole as boolean | undefined,
    isAdmin: hasAdminRole as boolean | undefined,
    dailyDistributed: dailyDistributed ? parseFloat(formatEther((Array.from(dailyDistributed) as bigint[])[0])) : 0,
    dailyLimit: 10000, // Default daily limit
  }
}

// Combined hook that provides roles for both contracts
export function useContractRoles(address: string | undefined) {
  const vibeToken = useVibeTokenRole(address)
  const rewardManager = useRewardManagerRole(address)

  return {
    vibeToken,
    rewardManager,
    isAdmin: vibeToken.isAdmin || rewardManager.isAdmin,
    hasAnyRole: vibeToken.hasRole || rewardManager.hasRole,
  }
}

