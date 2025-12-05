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
          staleTime: 60 * 1000, // 1 minute
          refetchOnWindowFocus: false,
          refetchOnMount: false,
          refetchOnReconnect: false,
          retry: 1,
          retryDelay: 1000,
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


