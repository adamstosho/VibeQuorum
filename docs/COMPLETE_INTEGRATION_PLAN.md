# VibeQuorum Complete Integration Plan

## Executive Summary

This document provides a **step-by-step integration plan** to transform VibeQuorum from a frontend with mock data to a **fully functional Web3 Q&A platform** with real wallet connections, smart contract interactions, and (optionally) backend API integration.

---

## Current State Analysis

### ✅ What's Complete

| Component | Status | Location |
|-----------|--------|----------|
| Frontend UI | ✅ Complete | `VibeQuorum-frontend/` |
| Smart Contracts | ✅ Complete | `contracts/` |
| Contract Tests | ✅ 81 passing | `contracts/test/` |
| Documentation | ✅ Complete | `docs/` |

### ❌ What Has Mock Data (Needs Integration)

| File | Mock Data | Integration Needed |
|------|-----------|-------------------|
| `header.tsx` | `walletAddress`, `isConnected`, `tokenBalance` | Real wallet connection |
| `questions/page.tsx` | `QUESTIONS` array | Backend API or contract events |
| `question/[id]/page.tsx` | `question`, `answers`, `aiDraft` | Backend API |
| `ask/page.tsx` | Form submission | Backend API |
| `profile/page.tsx` | `profile` object | Wallet + contract data |
| `admin/page.tsx` | `pendingRewards`, `recentTransactions` | Contract events + backend |

---

## Integration Architecture

### Option A: Full Stack (Recommended for Production)

```
Frontend (Next.js)
    ↓
Backend API (Node.js) ← MongoDB (Q&A data)
    ↓
Smart Contracts (VibeToken + RewardManager)
```

### Option B: Direct Integration (MVP/Demo)

```
Frontend (Next.js)
    ↓
Smart Contracts (Only for tokens/rewards)
    +
LocalStorage/IndexedDB (Q&A data - temporary)
```

**This plan covers Option B first (faster), then Option A.**

---

## Phase 1: Web3 Foundation

### 1.1 Install Dependencies

```bash
cd VibeQuorum-frontend
npm install ethers@6 @rainbow-me/rainbowkit wagmi viem @tanstack/react-query
```

### 1.2 Create Web3 Configuration

**File: `lib/web3/config.ts`**
```typescript
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, bscTestnet, polygon } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Contract addresses (UPDATE AFTER DEPLOYMENT)
export const CONTRACT_ADDRESSES = {
  vibeToken: process.env.NEXT_PUBLIC_VIBE_TOKEN_ADDRESS || '',
  rewardManager: process.env.NEXT_PUBLIC_REWARD_MANAGER_ADDRESS || '',
} as const

// Supported chains
export const SUPPORTED_CHAINS = [sepolia, bscTestnet] as const

// Wagmi config
export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  connectors: [
    injected(),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  transports: {
    [sepolia.id]: http(),
    [bscTestnet.id]: http(),
  },
})
```

### 1.3 Create Contract ABIs

**File: `lib/web3/abis/VibeToken.ts`**
```typescript
export const VIBE_TOKEN_ABI = [
  // Read functions
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
  
  // Write functions
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)',
  
  // Events
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'event TokensMinted(address indexed to, uint256 amount, address indexed minter, uint256 timestamp)',
] as const
```

**File: `lib/web3/abis/RewardManager.ts`**
```typescript
export const REWARD_MANAGER_ABI = [
  // Read functions
  'function vibeToken() view returns (address)',
  'function acceptedAnswerReward() view returns (uint256)',
  'function upvoteReward() view returns (uint256)',
  'function upvoteThreshold() view returns (uint256)',
  'function questionerBonus() view returns (uint256)',
  'function maxDailyRewardPerUser() view returns (uint256)',
  'function rewardCooldown() view returns (uint256)',
  'function totalRewardsDistributed() view returns (uint256)',
  'function totalAnswersRewarded() view returns (uint256)',
  'function isAnswerRewarded(bytes32 answerId) view returns (bool)',
  'function getUserDailyRewards(address user) view returns (uint256)',
  'function getRemainingDailyAllowance(address user) view returns (uint256)',
  'function canReceiveReward(address user) view returns (bool canReceive, uint256 cooldownEnds)',
  'function getRewardConfig() view returns (uint256, uint256, uint256, uint256, uint256, uint256)',
  'function getStats() view returns (uint256 totalDistributed, uint256 totalAnswersRewarded)',
  
  // Write functions (admin only)
  'function rewardAcceptedAnswer(address recipient, bytes32 answerId, uint256 questionId)',
  'function rewardUpvoteThreshold(address recipient, bytes32 answerId, uint256 questionId)',
  'function rewardQuestioner(address recipient, uint256 questionId)',
  'function batchReward((address recipient, uint256 amount, bytes32 answerId, uint8 rewardType, uint256 questionId)[] requests)',
  
  // Events
  'event AnswerRewarded(address indexed recipient, uint256 amount, bytes32 indexed answerId, uint8 rewardType, uint256 indexed questionId, uint256 timestamp)',
  'event RewardParametersUpdated(uint256 acceptedAnswerReward, uint256 upvoteReward, uint256 upvoteThreshold, uint256 questionerBonus, address indexed updatedBy)',
] as const
```

### 1.4 Create Web3 Provider

**File: `components/providers/web3-provider.tsx`**
```typescript
'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { wagmiConfig } from '@/lib/web3/config'
import '@rainbow-me/rainbowkit/styles.css'

const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#8B5CF6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
```

### 1.5 Update Root Layout

**File: `app/layout.tsx`** - Add Web3Provider
```typescript
import { Web3Provider } from '@/components/providers/web3-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Web3Provider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </Web3Provider>
      </body>
    </html>
  )
}
```

---

## Phase 2: Wallet Connection Hooks

### 2.1 Create useWallet Hook

**File: `hooks/use-wallet.ts`**
```typescript
'use client'

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { useReadContract } from 'wagmi'
import { formatEther } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { VIBE_TOKEN_ABI } from '@/lib/web3/abis/VibeToken'

export function useWallet() {
  const { address, isConnected, isConnecting } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  
  // Native token balance (ETH/BNB)
  const { data: nativeBalance } = useBalance({
    address,
  })
  
  // VIBE token balance
  const { data: vibeBalance, refetch: refetchVibeBalance } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!CONTRACT_ADDRESSES.vibeToken,
    },
  })

  const formattedVibeBalance = vibeBalance 
    ? parseFloat(formatEther(vibeBalance as bigint)).toFixed(2)
    : '0'

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  return {
    // Connection state
    address,
    isConnected,
    isConnecting,
    shortAddress: address ? shortenAddress(address) : null,
    
    // Balances
    nativeBalance: nativeBalance?.formatted || '0',
    vibeBalance: formattedVibeBalance,
    
    // Actions
    connect,
    disconnect,
    connectors,
    refetchVibeBalance,
  }
}
```

### 2.2 Create useVibeToken Hook

**File: `hooks/use-vibe-token.ts`**
```typescript
'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { VIBE_TOKEN_ABI } from '@/lib/web3/abis/VibeToken'

export function useVibeToken() {
  // Read total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
    abi: VIBE_TOKEN_ABI,
    functionName: 'totalSupply',
  })

  // Write contract
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  // Wait for transaction
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = async (to: string, amount: string) => {
    writeContract({
      address: CONTRACT_ADDRESSES.vibeToken as `0x${string}`,
      abi: VIBE_TOKEN_ABI,
      functionName: 'transfer',
      args: [to as `0x${string}`, parseEther(amount)],
    })
  }

  return {
    totalSupply: totalSupply ? formatEther(totalSupply as bigint) : '0',
    transfer,
    isPending,
    isConfirming,
    isSuccess,
    txHash: hash,
  }
}
```

### 2.3 Create useRewardManager Hook

**File: `hooks/use-reward-manager.ts`**
```typescript
'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, keccak256, toBytes } from 'viem'
import { CONTRACT_ADDRESSES } from '@/lib/web3/config'
import { REWARD_MANAGER_ABI } from '@/lib/web3/abis/RewardManager'

export function useRewardManager() {
  // Read reward config
  const { data: rewardConfig } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'getRewardConfig',
  })

  // Read stats
  const { data: stats } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'getStats',
  })

  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Generate answer ID from string
  const generateAnswerId = (answerId: string): `0x${string}` => {
    return keccak256(toBytes(answerId))
  }

  // Check if answer is rewarded
  const { data: isRewarded, refetch: checkIfRewarded } = useReadContract({
    address: CONTRACT_ADDRESSES.rewardManager as `0x${string}`,
    abi: REWARD_MANAGER_ABI,
    functionName: 'isAnswerRewarded',
    args: [generateAnswerId('placeholder')],
    query: { enabled: false },
  })

  // Trigger reward for accepted answer (admin only)
  const rewardAcceptedAnswer = async (
    recipient: string,
    answerId: string,
    questionId: number
  ) => {
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

  // Parse reward config
  const parsedConfig = rewardConfig ? {
    acceptedAnswerReward: formatEther((rewardConfig as bigint[])[0]),
    upvoteReward: formatEther((rewardConfig as bigint[])[1]),
    upvoteThreshold: Number((rewardConfig as bigint[])[2]),
    questionerBonus: formatEther((rewardConfig as bigint[])[3]),
    maxDailyReward: formatEther((rewardConfig as bigint[])[4]),
    cooldown: Number((rewardConfig as bigint[])[5]),
  } : null

  // Parse stats
  const parsedStats = stats ? {
    totalDistributed: formatEther((stats as bigint[])[0]),
    totalAnswersRewarded: Number((stats as bigint[])[1]),
  } : null

  return {
    config: parsedConfig,
    stats: parsedStats,
    rewardAcceptedAnswer,
    generateAnswerId,
    checkIfRewarded,
    isPending,
    isConfirming,
    isSuccess,
    txHash: hash,
  }
}
```

---

## Phase 3: Update Header Component

**File: `components/header.tsx`** - Replace mock data with real wallet

```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Wallet, ChevronDown, Zap } from "lucide-react"
import Logo from "./logo"
import { useWallet } from "@/hooks/use-wallet"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { address, isConnected, shortAddress, vibeBalance, disconnect } = useWallet()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-xl animate-slide-in-down">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="group transition-all duration-300 hover:opacity-90">
          <Logo size="md" showText={true} animated={true} className="hidden sm:flex" />
          <Logo size="sm" showText={false} animated={true} className="sm:hidden" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Questions", href: "/questions" },
            { label: "Ask", href: "/ask" },
            { label: "Profile", href: "/profile" },
            { label: "Admin", href: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Custom styled connect button */}
          {isConnected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-accent/20 px-3 py-1.5 rounded-full">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm font-bold text-accent">{vibeBalance} VIBE</span>
              </div>
              
              <button
                onClick={() => disconnect()}
                className="btn-primary gap-2 text-sm"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">{shortAddress}</span>
                <span className="sm:hidden">Connected</span>
              </button>
            </div>
          ) : (
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="btn-primary gap-2 text-sm"
                >
                  <Wallet className="h-4 w-4" />
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden btn-ghost p-2 transition-all duration-300"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card/50 backdrop-blur-xl p-4 space-y-2 animate-slide-in-down">
          {isConnected && (
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-lg mb-2">
              <Zap className="h-4 w-4 text-accent" />
              <span className="text-sm font-bold text-accent">{vibeBalance} VIBE</span>
            </div>
          )}
          {[
            { label: "Questions", href: "/questions" },
            { label: "Ask", href: "/ask" },
            { label: "Profile", href: "/profile" },
            { label: "Admin", href: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block text-sm font-medium text-muted-foreground hover:text-primary px-4 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
```

---

## Phase 4: Data Storage (MVP without Backend)

For MVP/demo without backend, use localStorage + contract events.

### 4.1 Create Question Store

**File: `lib/stores/questions.ts`**
```typescript
export interface Question {
  id: string
  title: string
  description: string
  tags: string[]
  author: string
  displayName?: string
  status: 'open' | 'answered' | 'closed'
  acceptedAnswerId?: string
  votesCount: number
  answersCount: number
  viewsCount: number
  createdAt: string
  updatedAt: string
}

export interface Answer {
  id: string
  questionId: string
  author: string
  displayName?: string
  content: string
  upvotes: number
  downvotes: number
  aiGenerated: boolean
  isAccepted: boolean
  txHashes: string[]
  createdAt: string
}

const STORAGE_KEY = 'vibequorum_questions'
const ANSWERS_KEY = 'vibequorum_answers'

export const questionStore = {
  getAll: (): Question[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  },

  getById: (id: string): Question | null => {
    const questions = questionStore.getAll()
    return questions.find(q => q.id === id) || null
  },

  create: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'votesCount' | 'answersCount' | 'viewsCount'>): Question => {
    const questions = questionStore.getAll()
    const newQuestion: Question = {
      ...question,
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      votesCount: 0,
      answersCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    questions.unshift(newQuestion)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    return newQuestion
  },

  update: (id: string, updates: Partial<Question>): Question | null => {
    const questions = questionStore.getAll()
    const index = questions.findIndex(q => q.id === id)
    if (index === -1) return null
    
    questions[index] = {
      ...questions[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
    return questions[index]
  },

  delete: (id: string): boolean => {
    const questions = questionStore.getAll()
    const filtered = questions.filter(q => q.id !== id)
    if (filtered.length === questions.length) return false
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
  },
}

export const answerStore = {
  getByQuestionId: (questionId: string): Answer[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(ANSWERS_KEY)
    const answers: Answer[] = data ? JSON.parse(data) : []
    return answers.filter(a => a.questionId === questionId)
  },

  create: (answer: Omit<Answer, 'id' | 'createdAt' | 'upvotes' | 'downvotes' | 'isAccepted' | 'txHashes'>): Answer => {
    const data = localStorage.getItem(ANSWERS_KEY)
    const answers: Answer[] = data ? JSON.parse(data) : []
    
    const newAnswer: Answer = {
      ...answer,
      id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      upvotes: 0,
      downvotes: 0,
      isAccepted: false,
      txHashes: [],
      createdAt: new Date().toISOString(),
    }
    
    answers.unshift(newAnswer)
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
    
    // Update question answer count
    const question = questionStore.getById(answer.questionId)
    if (question) {
      questionStore.update(answer.questionId, {
        answersCount: question.answersCount + 1,
        status: 'answered',
      })
    }
    
    return newAnswer
  },

  upvote: (id: string): Answer | null => {
    const data = localStorage.getItem(ANSWERS_KEY)
    const answers: Answer[] = data ? JSON.parse(data) : []
    const index = answers.findIndex(a => a.id === id)
    if (index === -1) return null
    
    answers[index].upvotes += 1
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
    return answers[index]
  },

  accept: (id: string, txHash?: string): Answer | null => {
    const data = localStorage.getItem(ANSWERS_KEY)
    const answers: Answer[] = data ? JSON.parse(data) : []
    const index = answers.findIndex(a => a.id === id)
    if (index === -1) return null
    
    // Unaccept other answers for same question
    answers.forEach((a, i) => {
      if (a.questionId === answers[index].questionId) {
        answers[i].isAccepted = false
      }
    })
    
    answers[index].isAccepted = true
    if (txHash) {
      answers[index].txHashes.push(txHash)
    }
    
    localStorage.setItem(ANSWERS_KEY, JSON.stringify(answers))
    
    // Update question
    questionStore.update(answers[index].questionId, {
      acceptedAnswerId: id,
      status: 'closed',
    })
    
    return answers[index]
  },
}
```

### 4.2 Create useQuestions Hook

**File: `hooks/use-questions.ts`**
```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { questionStore, answerStore, Question, Answer } from '@/lib/stores/questions'

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setQuestions(questionStore.getAll())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createQuestion = useCallback((data: {
    title: string
    description: string
    tags: string[]
    author: string
    displayName?: string
  }) => {
    const question = questionStore.create({
      ...data,
      status: 'open',
    })
    refresh()
    return question
  }, [refresh])

  return {
    questions,
    loading,
    refresh,
    createQuestion,
    getById: questionStore.getById,
    update: questionStore.update,
    delete: questionStore.delete,
  }
}

export function useAnswers(questionId: string) {
  const [answers, setAnswers] = useState<Answer[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    setAnswers(answerStore.getByQuestionId(questionId))
    setLoading(false)
  }, [questionId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createAnswer = useCallback((data: {
    content: string
    author: string
    displayName?: string
    aiGenerated: boolean
  }) => {
    const answer = answerStore.create({
      ...data,
      questionId,
    })
    refresh()
    return answer
  }, [questionId, refresh])

  const upvote = useCallback((id: string) => {
    answerStore.upvote(id)
    refresh()
  }, [refresh])

  const accept = useCallback((id: string, txHash?: string) => {
    answerStore.accept(id, txHash)
    refresh()
  }, [refresh])

  return {
    answers,
    loading,
    refresh,
    createAnswer,
    upvote,
    accept,
  }
}
```

---

## Phase 5: Environment Variables

**File: `VibeQuorum-frontend/.env.local`**
```env
# Contract Addresses (UPDATE AFTER DEPLOYMENT)
NEXT_PUBLIC_VIBE_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_REWARD_MANAGER_ADDRESS=0x...

# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# WalletConnect (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id

# API (if using backend)
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

---

## Phase 6: Implementation Checklist

### Step-by-Step Execution Order

#### Day 1: Web3 Foundation
- [ ] Install dependencies (ethers, wagmi, rainbowkit)
- [ ] Create `lib/web3/config.ts`
- [ ] Create `lib/web3/abis/VibeToken.ts`
- [ ] Create `lib/web3/abis/RewardManager.ts`
- [ ] Create `components/providers/web3-provider.tsx`
- [ ] Update `app/layout.tsx` with Web3Provider
- [ ] Test wallet connection works

#### Day 2: Hooks
- [ ] Create `hooks/use-wallet.ts`
- [ ] Create `hooks/use-vibe-token.ts`
- [ ] Create `hooks/use-reward-manager.ts`
- [ ] Test hooks in a simple component

#### Day 3: Header Integration
- [ ] Update `components/header.tsx` with real wallet
- [ ] Remove all mock data from header
- [ ] Test connect/disconnect flow
- [ ] Test VIBE balance display

#### Day 4: Data Storage
- [ ] Create `lib/stores/questions.ts`
- [ ] Create `hooks/use-questions.ts`
- [ ] Seed initial test data

#### Day 5: Questions Page
- [ ] Update `app/questions/page.tsx`
- [ ] Replace mock QUESTIONS with useQuestions hook
- [ ] Implement search/filter functionality
- [ ] Test pagination

#### Day 6: Ask Question Page
- [ ] Update `app/ask/page.tsx`
- [ ] Implement real form submission
- [ ] Redirect to new question after creation
- [ ] Test question creation flow

#### Day 7: Question Detail Page
- [ ] Update `app/question/[id]/page.tsx`
- [ ] Load real question data
- [ ] Load real answers
- [ ] Implement voting
- [ ] Implement accept answer

#### Day 8: Profile Page
- [ ] Update `app/profile/page.tsx`
- [ ] Show real wallet address
- [ ] Show real VIBE balance
- [ ] Show user's questions/answers

#### Day 9: Admin Page
- [ ] Update `app/admin/page.tsx`
- [ ] Connect reward trigger to smart contract
- [ ] Show real transaction history
- [ ] Test reward flow end-to-end

#### Day 10: Testing & Polish
- [ ] End-to-end testing
- [ ] Error handling
- [ ] Loading states
- [ ] Edge cases

---

## Files to Create/Modify Summary

### New Files to Create
```
lib/
├── web3/
│   ├── config.ts
│   └── abis/
│       ├── VibeToken.ts
│       └── RewardManager.ts
├── stores/
│   └── questions.ts

components/
└── providers/
    └── web3-provider.tsx

hooks/
├── use-wallet.ts
├── use-vibe-token.ts
├── use-reward-manager.ts
└── use-questions.ts
```

### Files to Modify
```
app/layout.tsx                 - Add Web3Provider
components/header.tsx          - Real wallet connection
app/questions/page.tsx         - Real questions data
app/question/[id]/page.tsx     - Real question detail
app/ask/page.tsx               - Real form submission
app/profile/page.tsx           - Real profile data
app/admin/page.tsx             - Real reward triggering
```

---

## Contract Deployment Checklist

Before integration, ensure contracts are deployed:

1. [ ] Deploy VibeToken to testnet
2. [ ] Deploy RewardManager to testnet
3. [ ] Grant MINTER_ROLE to RewardManager
4. [ ] Note contract addresses
5. [ ] Update `.env.local` with addresses
6. [ ] Verify contracts on block explorer

---

## Testing Checklist

- [ ] Wallet connects successfully
- [ ] Wallet disconnects successfully
- [ ] VIBE balance displays correctly
- [ ] Questions can be created
- [ ] Questions list loads
- [ ] Question detail loads
- [ ] Answers can be posted
- [ ] Upvoting works
- [ ] Accept answer works (triggers reward)
- [ ] Admin can trigger rewards
- [ ] Transaction confirms on-chain
- [ ] Balance updates after reward

---

## Next Steps After This Plan

1. **Execute Phase 1-3** - Web3 foundation and wallet
2. **Execute Phase 4-5** - Data storage and env setup
3. **Execute Phase 6** - Update all pages
4. **Deploy contracts** - If not already done
5. **Test end-to-end** - Full flow testing
6. **Add backend** - For production (follow BACKEND_IMPLEMENTATION.md)

---

*This integration plan ensures zero mock data and full Web3 functionality.*


