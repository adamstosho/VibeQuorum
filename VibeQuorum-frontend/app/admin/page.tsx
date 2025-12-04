"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { CheckCircle, Clock, Zap, AlertCircle } from "lucide-react"

export default function AdminPage() {
  const [selectedRewards, setSelectedRewards] = useState<number[]>([])
  const [showConfirmation, setShowConfirmation] = useState(false)

  const pendingRewards = [
    {
      id: 1,
      questionTitle: "Why does my ERC20 transfer revert?",
      answerer: "0x8a14...3Ff2",
      amount: 50,
      status: "pending" as const,
      upvotes: 18,
    },
    {
      id: 2,
      questionTitle: "Best practices for contract upgrades",
      answerer: "0x1234...5678",
      amount: 50,
      status: "pending" as const,
      upvotes: 25,
    },
    {
      id: 3,
      questionTitle: "MetaMask integration guide",
      answerer: "0x742d...89Ac",
      amount: 75,
      status: "scheduled" as const,
      upvotes: 31,
    },
  ]

  const recentTransactions = [
    {
      id: 1,
      action: "Answer Accepted - ERC20 Revert",
      amount: 50,
      wallet: "0x8a14...3Ff2",
      hash: "0x1234...5678",
      status: "success" as const,
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      action: "Answer Accepted - Contract Upgrades",
      amount: 50,
      wallet: "0x1234...5678",
      hash: "0x5678...abcd",
      status: "success" as const,
      timestamp: "1 day ago",
    },
    {
      id: 3,
      action: "Batch Reward Trigger",
      amount: 300,
      wallet: "Platform",
      hash: "0xabcd...ef12",
      status: "pending" as const,
      timestamp: "pending",
    },
  ]

  const metrics = {
    totalQuestions: 42,
    totalAnswers: 156,
    totalVibeDistributed: 4250,
    averageReward: 65,
  }

  const toggleReward = (id: number) => {
    setSelectedRewards((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]))
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center gap-3 mb-8 animate-slide-in-down">
          <AlertCircle className="h-6 w-6 text-secondary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

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

        {/* Reward Queue */}
        <div className="card-base space-y-4 mb-8 animate-slide-in-up">
          <h2 className="font-semibold text-lg">Reward Queue</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 px-3">
                    <input type="checkbox" className="rounded cursor-pointer" />
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
                    <td className="py-3 px-3 font-mono text-xs line-clamp-1">{reward.questionTitle}</td>
                    <td className="py-3 px-3 font-mono text-xs">{reward.answerer}</td>
                    <td className="py-3 px-3 font-bold text-accent">{reward.amount} VIBE</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                          reward.status === "pending" ? "bg-warning/20 text-warning" : "bg-primary/20 text-primary"
                        }`}
                      >
                        {reward.status === "pending" ? (
                          <Clock className="h-3 w-3" />
                        ) : (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {reward.status}
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
              disabled={selectedRewards.length === 0}
            >
              <Zap className="h-4 w-4" />
              Trigger {selectedRewards.length > 0 ? `(${selectedRewards.length})` : "Rewards"}
            </button>
            <button className="btn-secondary transition-all duration-200 hover:shadow-lg">Clear Selection</button>
          </div>

          {/* Confirmation Modal */}
          {showConfirmation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
              <div className="bg-card border border-border rounded-lg p-6 max-w-sm animate-slide-in-up">
                <h3 className="font-semibold text-lg mb-2">Confirm Reward Trigger</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This will trigger {selectedRewards.length} reward(s) and mint VIBE tokens on-chain. Are you sure?
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setShowConfirmation(false)} className="btn-secondary flex-1">
                    Cancel
                  </button>
                  <button className="btn-primary flex-1 hover:shadow-lg transition-all duration-200">Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Log */}
        <div className="card-base space-y-4 animate-slide-in-up">
          <h2 className="font-semibold text-lg">Recent Transactions</h2>

          <div className="space-y-3">
            {recentTransactions.map((tx, idx) => (
              <div
                key={tx.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/20 rounded border border-border/50 hover:border-primary/50 hover:bg-muted/30 transition-all duration-200 animate-slide-in-up gap-3"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="space-y-1 flex-1">
                  <p className="font-medium text-sm">{tx.action}</p>
                  <p className="text-xs text-muted-foreground font-mono">{tx.wallet}</p>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="font-bold text-accent">{tx.amount} VIBE</span>

                  {tx.status === "success" && (
                    <span className="flex items-center gap-1 text-success text-xs whitespace-nowrap">
                      <CheckCircle className="h-4 w-4" />
                      <a href="#" className="hover:underline font-mono">
                        {tx.hash}
                      </a>
                    </span>
                  )}

                  {tx.status === "pending" && (
                    <span className="flex items-center gap-1 text-warning text-xs whitespace-nowrap">
                      <Clock className="h-4 w-4 animate-pulse" />
                      pending
                    </span>
                  )}

                  <span className="text-xs text-muted-foreground whitespace-nowrap">{tx.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
