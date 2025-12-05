'use client'

import { useAccount, useConnect, useDisconnect, useBalance, useChainId } from 'wagmi'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES, CHAIN_NAMES, getExplorerAddressUrl } from '@/lib/web3/config'
import { VIBE_TOKEN_ABI } from '@/lib/web3/abis/VibeToken'

export function useWallet() {
  const { address, isConnected, isConnecting, isReconnecting } = useAccount()
  const { connect, connectors, isPending: isConnectPending } = useConnect()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  
  // Native token balance (ETH/BNB)
  const { data: nativeBalance, refetch: refetchNativeBalance } = useBalance({
    address,
  })
  
  // VIBE token balance
  const { 
    data: vibeBalanceRaw, 
    refetch: refetchVibeBalance,
    isLoading: isVibeBalanceLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  // Format VIBE balance
  const vibeBalance = vibeBalanceRaw 
    ? parseFloat(formatEther(vibeBalanceRaw as bigint))
    : 0

  const vibeBalanceFormatted = vibeBalance.toFixed(2)

  // Shorten wallet address for display
  const shortenAddress = (addr: string, chars = 4) => {
    return `${addr.slice(0, chars + 2)}...${addr.slice(-chars)}`
  }

  // Refresh all balances
  const refreshBalances = async () => {
    await Promise.all([
      refetchNativeBalance(),
      refetchVibeBalance(),
    ])
  }

  return {
    // Connection state
    address,
    isConnected,
    isConnecting: isConnecting || isConnectPending || isReconnecting,
    shortAddress: address ? shortenAddress(address) : null,
    
    // Chain info
    chainId,
    chainName: chainId ? CHAIN_NAMES[chainId] || `Chain ${chainId}` : null,
    
    // Balances
    nativeBalance: nativeBalance?.formatted || '0',
    nativeSymbol: nativeBalance?.symbol || 'ETH',
    vibeBalance,
    vibeBalanceFormatted,
    isVibeBalanceLoading,
    
    // Actions
    connect,
    disconnect,
    connectors,
    refreshBalances,
    refetchVibeBalance,
    
    // Explorer URLs
    explorerUrl: address && chainId ? getExplorerAddressUrl(chainId, address) : null,
  }
}


