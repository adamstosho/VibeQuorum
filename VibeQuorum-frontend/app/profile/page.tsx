"use client"

import { useState, useEffect, useMemo } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Award, BookOpen, Zap, Copy, ExternalLink, Shield, Wallet, Loader2 } from "lucide-react"
import { useWallet } from "@/hooks/use-wallet"
import { useUserContent } from "@/hooks/use-questions"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Link from "next/link"

export default function ProfilePage() {
  const { address, isConnected, shortAddress, vibeBalanceFormatted, explorerUrl, chainName } = useWallet()
  const { 
    questions, 
    answers, 
    loading, 
    questionsCount, 
    answersCount, 
    acceptedAnswersCount,
    totalRewardsEarned,
    reputation 
  } = useUserContent(address)
  
  const [activeTab, setActiveTab] = useState("questions")
  const [copied, setCopied] = useState(false)

  // Calculate tier based on reputation
  const tier = useMemo(() => {
    if (reputation >= 5000) return { name: "Gold", color: "text-yellow-400" }
    if (reputation >= 1000) return { name: "Silver", color: "text-gray-300" }
    if (reputation >= 100) return { name: "Bronze", color: "text-orange-400" }
    return { name: "Newcomer", color: "text-muted-foreground" }
  }, [reputation])

  const tabs = [
    { id: "questions", label: "Questions", icon: BookOpen, count: questionsCount },
    { id: "answers", label: "Answers", icon: Award, count: answersCount },
    { id: "rewards", label: "Rewards", icon: Zap, count: acceptedAnswersCount },
  ]

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Not connected state
  if (!isConnected) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <div className="card-base text-center space-y-6 animate-slide-in-up">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border-2 border-primary/50 mx-auto">
              <Wallet className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Connect Your Wallet</h1>
              <p className="text-muted-foreground">
                Connect your wallet to view your profile, questions, answers, and rewards.
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

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="card-base space-y-6 mb-8 animate-slide-in-up">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border-2 border-primary/50">
                <span className="text-2xl font-bold text-primary">
                  {shortAddress?.slice(0, 1).toUpperCase() || "?"}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-accent/20 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4 text-accent" />
                <span className={`text-xs font-semibold ${tier.color}`}>{tier.name}</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{shortAddress}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <p className="text-sm text-muted-foreground font-mono">{address}</p>
                <button
                  onClick={copyAddress}
                  className="p-1 rounded hover:bg-muted transition-colors duration-200"
                  title="Copy address"
                >
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-muted transition-colors duration-200"
                    title="View on explorer"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </a>
                )}
                {copied && <span className="text-xs text-success">Copied!</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Connected to {chainName}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            {[
              { label: "Reputation", value: reputation, color: "text-primary" },
              { label: "VIBE Balance", value: vibeBalanceFormatted, color: "text-accent" },
              { label: "Total Earned", value: totalRewardsEarned, color: "text-secondary" },
              { label: "Tier", value: tier.name, color: tier.color },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="animate-slide-in-up transition-transform duration-300 hover:scale-105"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-primary text-primary shadow-lg shadow-primary/10"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className="ml-1 text-xs opacity-70">({tab.count})</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-3 animate-fade-in">
            {loading ? (
              <div className="card-base text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-muted-foreground mt-2">Loading...</p>
              </div>
            ) : (
              <>
                {activeTab === "questions" && (
                  <>
                    {questions.length > 0 ? (
                      questions.map((q, idx) => (
                        <Link
                          href={`/questions/${q.id}`}
                          key={q.id}
                          className="card-base hover:border-primary/50 transition-all duration-200 animate-slide-in-up block"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <h3 className="font-semibold mb-2 hover:text-primary transition-colors duration-200">
                            {q.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {q.votesCount} upvotes • {q.answersCount} answers • {formatTimeAgo(q.createdAt)}
                          </p>
                        </Link>
                      ))
                    ) : (
                      <div className="card-base text-center py-8">
                        <p className="text-muted-foreground">No questions yet</p>
                        <Link href="/ask" className="btn-primary mt-4 inline-flex">
                          Ask Your First Question
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "answers" && (
                  <>
                    {answers.length > 0 ? (
                      answers.map((a, idx) => (
                        <Link
                          href={`/questions/${a.questionId}`}
                          key={a.id}
                          className="card-base hover:border-primary/50 transition-all duration-200 animate-slide-in-up block"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm hover:text-primary transition-colors duration-200">
                                {a.content.slice(0, 80)}...
                              </h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {a.upvotes} upvotes • {a.isAccepted ? "✓ Accepted" : "Pending"} • {formatTimeAgo(a.createdAt)}
                              </p>
                            </div>
                            {a.vibeReward > 0 && <span className="text-accent font-bold">+{a.vibeReward} VIBE</span>}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="card-base text-center py-8">
                        <p className="text-muted-foreground">No answers yet</p>
                        <Link href="/questions" className="btn-primary mt-4 inline-flex">
                          Browse Questions
                        </Link>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "rewards" && (
                  <>
                    {answers.filter(a => a.vibeReward > 0).length > 0 ? (
                      answers.filter(a => a.vibeReward > 0).map((r, idx) => (
                        <div
                          key={r.id}
                          className="card-base hover:border-primary/50 transition-all duration-200 animate-slide-in-up"
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="font-semibold text-sm">
                                {r.isAccepted ? "Answer Accepted" : "Upvote Reward"}
                              </span>
                              {r.txHashes.length > 0 && (
                                <p className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
                                  {r.txHashes[0].slice(0, 10)}...{r.txHashes[0].slice(-8)}
                                  <ExternalLink className="h-3 w-3 cursor-pointer hover:text-foreground" />
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-accent block">+{r.vibeReward} VIBE</span>
                              <span className="text-xs text-muted-foreground">{formatTimeAgo(r.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="card-base text-center py-8">
                        <p className="text-muted-foreground">No rewards earned yet</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Answer questions and get accepted to earn VIBE tokens!
                        </p>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
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
