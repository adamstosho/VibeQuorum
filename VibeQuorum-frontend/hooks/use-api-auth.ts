'use client'

import { useAccount, useSignMessage } from 'wagmi'
import { useCallback, useRef } from 'react'

export function useApiAuth() {
  const { address, isConnected } = useAccount()
  const { signMessageAsync, isPending: isSigning } = useSignMessage()
  const mountedRef = useRef(true)

  const signRequest = useCallback(async (): Promise<{ signature: string; timestamp: string }> => {
    if (!mountedRef.current) {
      throw new Error('Component unmounted')
    }

    if (!isConnected || !address) {
      throw new Error('Wallet not connected. Please connect your wallet first.')
    }

    try {
      const timestamp = Date.now().toString()
      const message = `Authenticate request at ${timestamp}`
      
      console.log('Requesting signature from wallet...')
      const signature = await signMessageAsync({ message })

      if (!mountedRef.current) {
        throw new Error('Request cancelled. Please try again.')
      }

      if (!signature) {
        throw new Error('Invalid signature received. Please try again.')
      }

      console.log('Signature received successfully')
      return { signature, timestamp }
    } catch (error: any) {
      console.error('Failed to sign message:', error)
      
      // Handle user rejection
      if (
        error?.message?.includes('reject') || 
        error?.message?.includes('denied') || 
        error?.message?.includes('User rejected') ||
        error?.code === 4001 ||
        error?.name === 'UserRejectedRequestError'
      ) {
        throw new Error('Signature request was rejected. Please approve the signature to continue.')
      }
      
      // Handle other errors
      if (error.message && (error.message.includes('Wallet') || error.message.includes('not ready'))) {
        throw error
      }
      
      throw new Error('Failed to sign message. Please try again.')
    }
  }, [isConnected, address, signMessageAsync])

  return {
    address,
    signRequest,
    isSigning,
    isWalletReady: isConnected && !!address,
  }
}
