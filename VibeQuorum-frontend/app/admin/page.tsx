"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Clock, Zap, AlertCircle, Shield, Loader2, ExternalLink, Wallet } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useVibeToken, useRewardManager } from "@/hooks/use-contracts"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useQuestions } from "@/hooks/use-questions"
import { api } from "@/lib/api"
import { useApiAuth } from "@/hooks/use-api-auth"
import { useQueryClient } from "@tanstack/react-query"
import { getExplorerTxUrl, DEFAULT_CHAIN_ID } from "@/lib/web3/config"

export default function AdminPage() {
  const { address, isConnected, shortAddress, chainName } = useWallet()
  const { signRequest } = useApiAuth() // Add signRequest for API authentication
  const queryClient = useQueryClient() // Add query client for cache invalidation
  const { hasRole: hasTokenRole, isAdmin: isTokenAdmin } = useVibeToken()
  const { 
    hasRole: hasRewardRole, 
    isAdmin: isRewardAdmin,
    rewardAcceptedAnswer,
    rewardUpvoteThreshold,
    isPending,
    lastTxHash,
    dailyDistributed,
    dailyLimit,
  } = useRewardManager()
  
  const [selectedRewards, setSelectedRewards] = useState<string[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [txStatus, setTxStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')

  // Check if user has admin access
  // undefined = still checking, true = admin, false = not admin
  const isAdmin = isTokenAdmin || isRewardAdmin
  const isCheckingAdmin = isTokenAdmin === undefined && isRewardAdmin === undefined

  // Load data from API
  const { questions, loading: questionsLoading, refresh: refreshQuestions } = useQuestions()
  // For admin panel, we need all answers across all questions
  // Since useAnswers requires a questionId, we'll fetch them separately
  const [allAnswers, setAllAnswers] = useState<any[]>([])
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(true)

  useEffect(() => {
    const fetchAllAnswers = async () => {
      setIsLoadingAnswers(true)
      try {
        // Fetch answers for each question
        const answerPromises = questions.map(async (q) => {
          try {
            const result = await api.answers.list(q.id)
            return result?.answers || []
          } catch (error) {
            console.error(`Failed to fetch answers for question ${q.id}:`, error)
            return []
          }
        })
        const answersArrays = await Promise.all(answerPromises)
        const flatAnswers = answersArrays.flat()
        setAllAnswers(flatAnswers)
      } catch (error) {
        console.error('Failed to fetch answers:', error)
      } finally {
        setIsLoadingAnswers(false)
      }
    }

    if (questions.length > 0) {
      fetchAllAnswers()
    } else if (!questionsLoading) {
      setIsLoadingAnswers(false)
    }
  }, [questions, questionsLoading])

  const isLoading = questionsLoading || isLoadingAnswers

  // Calculate metrics
  const metrics = useMemo(() => {
    const acceptedAnswers = allAnswers.filter(a => a.isAccepted)
    const totalVibe = allAnswers.reduce((sum, a) => sum + (a.vibeReward || 0), 0)
    
    return {
      totalQuestions: questions.length,
      totalAnswers: allAnswers.length,
      totalVibeDistributed: totalVibe,
      averageReward: acceptedAnswers.length > 0 ? Math.round(totalVibe / acceptedAnswers.length) : 0,
    }
  }, [questions, allAnswers])

  // Get pending rewards (accepted answers without tx hash or with failed tx hash)
  const pendingRewards = useMemo(() => {
    return allAnswers
      .filter(a => {
        if (!a.isAccepted) return false
        // Check if answer has any successful transaction hashes
        const txHashes = a.txHashes && Array.isArray(a.txHashes) ? a.txHashes : []
        const txHash = a.txHash && typeof a.txHash === 'string' ? a.txHash : null
        const allHashes = [...txHashes, txHash].filter(Boolean)
        // Filter out 'failed' entries - we want to show these as pending so admin can retry
        const successfulHashes = allHashes.filter((h: string) => h && h !== 'failed' && h.length > 10)
        return successfulHashes.length === 0 // Only include if no successful tx hash
      })
      .map(a => {
        // Find question by matching questionId (handle both _id and id formats)
        const answerQuestionId = a.questionId?._id || a.questionId || a.questionId?.toString()
        const question = questions.find(q => {
          const qId = q._id?.toString() || q.id
          return qId === answerQuestionId || qId === a.questionId
        })
        return {
          id: a._id || a.id,
          questionTitle: question?.title || 'Unknown Question',
          answerer: a.author,
          displayName: a.displayName,
          amount: 50, // Standard accepted answer reward
          status: 'pending' as const,
          upvotes: a.upvotes || 0,
        }
      })
  }, [allAnswers, questions])

  // Get recent transactions (answers with tx hashes)
  const recentTransactions = useMemo(() => {
    // Filter answers that have transaction hashes (either txHashes array or txHash string)
    const answersWithTx = allAnswers.filter(a => {
      const hasTxHashes = a.txHashes && Array.isArray(a.txHashes) && a.txHashes.length > 0
      const hasTxHash = a.txHash && typeof a.txHash === 'string' && a.txHash.length > 0 && a.txHash !== 'failed'
      return hasTxHashes || hasTxHash
    })
    
    // Map to transaction format - handle both txHashes array and txHash string
    const transactions = answersWithTx.flatMap(a => {
      // Get all transaction hashes (from array or single string)
      let txHashes = []
      if (a.txHashes && Array.isArray(a.txHashes) && a.txHashes.length > 0) {
        txHashes = a.txHashes.filter((tx: string) => tx && tx !== 'failed')
      } else if (a.txHash && typeof a.txHash === 'string' && a.txHash !== 'failed') {
        txHashes = [a.txHash]
      }
      
      // Create one transaction entry per tx hash
      return txHashes.map((txHash: string, index: number) => ({
        id: `${a._id || a.id}-${index}`,
        answerId: a._id || a.id,
        action: a.isAccepted ? 'Answer Accepted' : 'Upvote Reward',
        amount: a.vibeReward || 0,
        wallet: a.author?.slice(0, 6) + '...' + a.author?.slice(-4) || 'Unknown',
        hash: txHash?.slice(0, 10) + '...' + txHash?.slice(-8) || '',
        fullHash: txHash,
        status: 'success' as const,
        timestamp: a.updatedAt || a.createdAt || new Date(),
      }))
    })
    
    // Sort by timestamp (newest first) and limit to 10
    return transactions
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
  }, [allAnswers])

  const toggleReward = (id: string) => {
    setSelectedRewards((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  const toggleAll = () => {
    if (selectedRewards.length === pendingRewards.length) {
      setSelectedRewards([])
    } else {
      setSelectedRewards(pendingRewards.map(r => r.id))
    }
  }

  const handleTriggerRewards = async () => {
    if (!address) return
    setShowConfirmation(false)
    setTxStatus('pending')
    
    try {
      const auth = await signRequest()
      console.log('🔐 Triggering rewards with auth:', { address, hasSignature: !!auth?.signature })
      
      // Process each selected reward
      const results = []
      for (const rewardId of selectedRewards) {
        const reward = pendingRewards.find(r => r.id === rewardId)
        if (reward) {
          try {
            console.log(`🎁 Triggering reward for answer: ${rewardId}`)
            // Use backend API to trigger reward (backend handles on-chain reward)
            const result = await api.rewards.triggerReward(
              rewardId,
              address,
              auth?.signature,
              auth?.timestamp
            )
            console.log(`✅ Reward triggered successfully:`, result)
            results.push({ rewardId, success: true, result })
            // Backend already updates the answer with txHash
          } catch (error: any) {
            console.error(`❌ Failed to trigger reward for ${rewardId}:`, error)
            results.push({ rewardId, success: false, error: error.message })
            // Continue with other rewards even if one fails
          }
        }
      }
      
      console.log('📊 Reward trigger results:', results)
      
      setTxStatus('success')
      setSelectedRewards([])
      
      // Invalidate all queries to force refresh
      await queryClient.invalidateQueries({ queryKey: ['questions'] })
      await queryClient.invalidateQueries({ queryKey: ['answers'] })
      
      // Refresh questions
      await refreshQuestions()
      
      // Wait a moment for backend to update
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Re-fetch all answers with fresh data
      const answerPromises = questions.map(async (q) => {
        try {
          const result = await api.answers.list(q.id)
          return result?.answers || []
        } catch (error) {
          console.error(`Failed to fetch answers for question ${q.id}:`, error)
          return []
        }
      })
      const answersArrays = await Promise.all(answerPromises)
      const freshAnswers = answersArrays.flat()
      setAllAnswers(freshAnswers)
      
      // Force another refresh after a delay to ensure blockchain data is indexed
      setTimeout(async () => {
        await refreshQuestions()
        const delayedAnswerPromises = questions.map(async (q) => {
          try {
            const result = await api.answers.list(q.id)
            return result?.answers || []
          } catch (error) {
            return []
          }
        })
        const delayedAnswersArrays = await Promise.all(delayedAnswerPromises)
        setAllAnswers(delayedAnswersArrays.flat())
      }, 3000)
      
      setTimeout(() => setTxStatus('idle'), 5000)
    } catch (error) {
      console.error('Failed to trigger rewards:', error)
      setTxStatus('error')
      setTimeout(() => setTxStatus('idle'), 3000)
    }
  }

  // Not connected state
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="card-base text-center space-y-6 animate-slide-in-up">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 flex items-center justify-center border-2 border-secondary/50 mx-auto">
              <Shield className="h-10 w-10 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Admin Panel</h1>
              <p className="text-muted-foreground">
                Connect your wallet to access admin features.
              </p>
            </div>
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="btn-primary gap-2 mx-auto"
                >
                  <Wallet className="h-5 w-5" />
                  Connect Wallet
                </button>
              )}
            </ConnectButton.Custom>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Checking admin status - show loading
  if (isCheckingAdmin) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="card-base text-center space-y-6 animate-slide-in-up">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
            <div>
              <h1 className="text-2xl font-bold mb-2">Checking Admin Access</h1>
              <p className="text-muted-foreground">
                Verifying your wallet permissions...
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  // Non-admin access denied
  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <div className="card-base text-center space-y-6 animate-slide-in-up">
            <div className="h-20 w-20 rounded-full bg-destructive/20 flex items-center justify-center border-2 border-destructive/50 mx-auto">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2 text-destructive">Access Denied</h1>
              <p className="text-muted-foreground mb-4">
                You don't have admin privileges to access this panel.
              </p>
              <p className="text-sm text-muted-foreground">
                Connected wallet: <span className="font-mono">{shortAddress}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Only wallets with ADMIN_ROLE or REWARDER_ROLE can access this panel.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8 animate-slide-in-down">
          <AlertCircle className="h-6 w-6 text-secondary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          {isAdmin && (
            <span className="bg-success/20 text-success text-xs px-2 py-1 rounded-full font-medium">
              Admin Access
            </span>
          )}
        </div>

        {/* Admin Status */}
        <div className="card-base mb-8 animate-slide-in-up">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Connected:</span>
              <span className="font-mono">{shortAddress}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Network:</span>
              <span className="font-medium">{chainName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Daily Distributed:</span>
              <span className="font-bold text-accent">{dailyDistributed} / {dailyLimit} VIBE</span>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Questions", value: metrics.totalQuestions, icon: "📝" },
            { label: "Total Answers", value: metrics.totalAnswers, icon: "💬" },
            { label: "VIBE Distributed", value: metrics.totalVibeDistributed, icon: "🎁" },
            { label: "Avg Reward", value: `${metrics.averageReward} VIBE`, icon: "⭐" },
          ].map((metric, i) => (
            <div
              key={i}
              className="card-base hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 animate-slide-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <p className="text-xs text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-primary">{metric.value}</p>
            </div>
          ))}
        </div>

        {/* Status Messages */}
        {txStatus === 'success' && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-8 flex items-center gap-3 animate-slide-in-down">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-success font-medium">Rewards triggered successfully!</span>
          </div>
        )}
        
        {txStatus === 'error' && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-8 flex items-center gap-3 animate-slide-in-down">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <span className="text-destructive font-medium">Failed to trigger rewards. Please try again.</span>
          </div>
        )}

        {/* Reward Queue */}
        <div className="card-base space-y-4 mb-8 animate-slide-in-up">
          <h2 className="font-semibold text-lg">Reward Queue</h2>

          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            </div>
          ) : pendingRewards.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="text-left py-2 px-3">
                        <input 
                          type="checkbox" 
                          className="rounded cursor-pointer"
                          checked={selectedRewards.length === pendingRewards.length}
                          onChange={toggleAll}
                        />
                      </th>
                      <th className="text-left py-2 px-3">Question</th>
                      <th className="text-left py-2 px-3">Answerer</th>
                      <th className="text-left py-2 px-3">Amount</th>
                      <th className="text-left py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRewards.map((reward, idx) => (
                      <tr
                        key={reward.id}
                        className="border-b border-border hover:bg-muted/30 transition-all duration-200 animate-slide-in-up"
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedRewards.includes(reward.id)}
                            onChange={() => toggleReward(reward.id)}
                            className="rounded cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono text-xs break-words max-w-[200px] min-w-[150px]">{reward.questionTitle}</td>
                        <td className="py-3 px-3 font-mono text-xs break-all">
                          {reward.displayName || (reward.answerer.slice(0, 6) + '...' + reward.answerer.slice(-4))}
                        </td>
                        <td className="py-3 px-3 font-bold text-accent">{reward.amount} VIBE</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-warning/20 text-warning">
                            <Clock className="h-3 w-3" />
                            pending
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border flex-wrap">
                <button
                  onClick={() => setShowConfirmation(true)}
                  className="btn-primary gap-2 disabled:opacity-50 transition-all duration-200 hover:shadow-lg"
                  disabled={!isAdmin || selectedRewards.length === 0 || txStatus === 'pending'}
                >
                  {txStatus === 'pending' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      Trigger {selectedRewards.length > 0 ? `(${selectedRewards.length})` : "Rewards"}
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setSelectedRewards([])}
                  className="btn-secondary transition-all duration-200 hover:shadow-lg"
                  disabled={selectedRewards.length === 0}
                >
                  Clear Selection
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
              <p>No pending rewards</p>
            </div>
          )}

          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-card border border-border rounded-lg p-6 max-w-sm animate-slide-in-up">
                <h3 className="font-semibold text-lg mb-2">Confirm Reward Trigger</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will trigger {selectedRewards.length} reward(s) and mint VIBE tokens on-chain. Are you sure?
                </p>
                <div className="bg-muted/30 rounded p-3 mb-4 text-sm">
                  <p className="text-muted-foreground">Total rewards:</p>
                  <p className="font-bold text-accent text-lg">{selectedRewards.length * 50} VIBE</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowConfirmation(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button 
                    onClick={handleTriggerRewards}
                    className="btn-primary flex-1 hover:shadow-lg transition-all duration-200"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Log */}
        <div className="card-base space-y-4 animate-slide-in-up">
          <h2 className="font-semibold text-lg">Recent Transactions</h2>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/20 rounded border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 animate-slide-in-up gap-3"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <p className="font-medium text-sm break-words">{tx.action}</p>
                    <p className="text-xs text-muted-foreground font-mono break-all">{tx.wallet}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 sm:gap-4">
                    <span className="font-bold text-accent whitespace-nowrap">{tx.amount} VIBE</span>

                    <a
                      href={getExplorerTxUrl(DEFAULT_CHAIN_ID, tx.fullHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-success text-xs whitespace-nowrap hover:underline flex-shrink-0"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-mono break-all">{tx.hash}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>

                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatTimeAgo(tx.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
  return date.toLocaleDateString()
}
