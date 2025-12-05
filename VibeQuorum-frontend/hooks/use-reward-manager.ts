'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, keccak256, toBytes } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { REWARD_MANAGER_ABI } from '@/lib/web3/abis/RewardManager'

export interface RewardConfig {
  acceptedAnswerReward: number
  upvoteReward: number
  upvoteThreshold: number
  questionerBonus: number
  maxDailyReward: number
  cooldown: number
}

export interface RewardStats {
  totalDistributed: number
  totalAnswersRewarded: number
}

export function useRewardManager() {
  // Read reward config
  const { data: rewardConfigRaw, refetch: refetchConfig } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'getRewardConfig',
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager,
    },
  })

  // Read stats
  const { data: statsRaw, refetch: refetchStats } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'getStats',
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager,
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

  // Generate answer ID from string
  const generateAnswerId = (answerId: string): `0x${string}` => {
    return keccak256(toBytes(answerId))
  }

  // Trigger reward for accepted answer (admin only)
  const rewardAcceptedAnswer = async (
    recipient: string,
    answerId: string,
    questionId: number
  ) => {
    if (!CONTRACT_ADDRESSES.rewardManager) {
      throw new Error('RewardManager contract address not configured')
    }

    writeContract({
      address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
      abi: REWARD_MANAGER_ABI,
      functionName: 'rewardAcceptedAnswer',
      args: [
        recipient as `0x${string}`,
        generateAnswerId(answerId),
        BigInt(questionId),
      ],
    })
  }

  // Trigger reward for upvote threshold (admin only)
  const rewardUpvoteThreshold = async (
    recipient: string,
    answerId: string,
    questionId: number
  ) => {
    if (!CONTRACT_ADDRESSES.rewardManager) {
      throw new Error('RewardManager contract address not configured')
    }

    writeContract({
      address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
      abi: REWARD_MANAGER_ABI,
      functionName: 'rewardUpvoteThreshold',
      args: [
        recipient as `0x${string}`,
        generateAnswerId(answerId),
        BigInt(questionId),
      ],
    })
  }

  // Trigger reward for questioner (admin only)
  const rewardQuestioner = async (
    recipient: string,
    questionId: number
  ) => {
    if (!CONTRACT_ADDRESSES.rewardManager) {
      throw new Error('RewardManager contract address not configured')
    }

    writeContract({
      address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
      abi: REWARD_MANAGER_ABI,
      functionName: 'rewardQuestioner',
      args: [
        recipient as `0x${string}`,
        BigInt(questionId),
      ],
    })
  }

  // Parse reward config
  const config: RewardConfig | null = rewardConfigRaw ? {
    acceptedAnswerReward: parseFloat(formatEther((rewardConfigRaw as bigint[])[0])),
    upvoteReward: parseFloat(formatEther((rewardConfigRaw as bigint[])[1])),
    upvoteThreshold: Number((rewardConfigRaw as bigint[])[2]),
    questionerBonus: parseFloat(formatEther((rewardConfigRaw as bigint[])[3])),
    maxDailyReward: parseFloat(formatEther((rewardConfigRaw as bigint[])[4])),
    cooldown: Number((rewardConfigRaw as bigint[])[5]),
  } : null

  // Parse stats
  const stats: RewardStats | null = statsRaw ? {
    totalDistributed: parseFloat(formatEther((statsRaw as bigint[])[0])),
    totalAnswersRewarded: Number((statsRaw as bigint[])[1]),
  } : null

  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      refetchConfig(),
      refetchStats(),
    ])
  }

  return {
    // Contract address
    contractAddress: CONTRACT_ADDRESSES.rewardManager,
    
    // Read data
    config,
    stats,
    
    // Write functions
    rewardAcceptedAnswer,
    rewardUpvoteThreshold,
    rewardQuestioner,
    
    // Utility
    generateAnswerId,
    
    // Transaction state
    isPending,
    isConfirming,
    isSuccess,
    txHash: hash,
    error: writeError || confirmError,
    resetWrite,
    
    // Refetch
    refetchConfig,
    refetchStats,
    refetchAll,
  }
}

// Hook to check if an answer is rewarded
export function useIsAnswerRewarded(answerId: string) {
  const answerIdBytes = keccak256(toBytes(answerId))
  
  const { data: isRewarded, refetch } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'isAnswerRewarded',
    args: [answerIdBytes],
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager && !!answerId,
    },
  })

  return {
    isRewarded: isRewarded as boolean | undefined,
    refetch,
  }
}

// Hook to get user's reward status
export function useUserRewardStatus(userAddress: string | undefined) {
  const { data: dailyRewards } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'getUserDailyRewards',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager && !!userAddress,
    },
  })

  const { data: remainingAllowance } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'getRemainingDailyAllowance',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager && !!userAddress,
    },
  })

  const { data: canReceive } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'canReceiveReward',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESSES.rewardManager && !!userAddress,
    },
  })

  return {
    dailyRewards: dailyRewards ? parseFloat(formatEther(dailyRewards as bigint)) : 0,
    remainingAllowance: remainingAllowance ? parseFloat(formatEther(remainingAllowance as bigint)) : 0,
    canReceiveReward: canReceive ? (canReceive as [boolean, bigint])[0] : false,
    cooldownEnds: canReceive ? Number((canReceive as [boolean, bigint])[1]) : 0,
  }
}

