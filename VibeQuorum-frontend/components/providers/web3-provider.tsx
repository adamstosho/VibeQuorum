'use client'

import { useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig, DEFAULT_CHAIN_ID } from '@/lib/web3/config'
import '@rainbow-me/rainbowkit/styles.css'

interface Web3ProviderProps {
  children: React.ReactNode
}

// Create QueryClient outside component to ensure singleton
let queryClientInstance: QueryClient | null = null

function getQueryClient() {
  if (!queryClientInstance) {
    queryClientInstance = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 30 * 1000, // 30 seconds - data stays fresh for 30s
          gcTime: 5 * 60 * 1000, // 5 minutes - cache persists for 5min
          refetchOnWindowFocus: false, // Don't refetch on window focus
          refetchOnMount: 'always', // Always refetch on mount for fresh data
          refetchOnReconnect: true, // Refetch when reconnecting
          retry: (failureCount, error: any) => {
            // Don't retry on rate limit errors (429)
            if (error?.status === 429 || error?.message?.includes('Rate limit')) {
              return false
            }
            // Don't retry on network errors (they're usually temporary)
            if (error?.message?.includes('Failed to fetch') || error?.message?.includes('Network error')) {
              return failureCount < 2 // Retry up to 2 times for network errors
            }
            // Retry once for other errors
            return failureCount < 1
          },
          retryDelay: (attemptIndex) => {
            // Exponential backoff: 1s, 2s, 4s
            return Math.min(1000 * 2 ** attemptIndex, 4000)
          },
          structuralSharing: true, // Enable structural sharing for better performance
        },
        mutations: {
          retry: 0, // Don't retry mutations
        },
      },
    })
  }
  return queryClientInstance
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [queryClient] = useState(() => getQueryClient())

  // Always render providers - WagmiProvider handles SSR internally
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={DEFAULT_CHAIN_ID}
          theme={darkTheme({
            accentColor: '#8B5CF6', // Primary purple color
            accentColorForeground: 'white',
            borderRadius: 'medium',
            fontStack: 'system',
            overlayBlur: 'small',
          })}
          modalSize="compact"
          coolMode
          showRecentTransactions={true}
          appInfo={{
            appName: 'VibeQuorum',
            learnMoreUrl: 'https://vibequorum.com',
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}


