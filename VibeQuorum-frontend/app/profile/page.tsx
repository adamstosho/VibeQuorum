"use client"

import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Award, BookOpen, Zap, Copy, ExternalLink, Shield } from "lucide-react"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("questions")
  const [copied, setCopied] = useState(false)

  const profile = {
    address: "0x742d35Cc6634C0532925a3b844Bc9e7595f89Ac",
    displayName: "alice.eth",
    joinDate: "2024-11-15",
    reputation: 2850,
    tokenBalance: 425,
    totalEarned: 875,
    tier: "Silver",
  }

  const tabs = [
    { id: "questions", label: "Questions", icon: BookOpen, count: 12 },
    { id: "answers", label: "Answers", icon: Award, count: 28 },
    { id: "rewards", label: "Rewards", icon: Zap, count: 18 },
  ]

  const copyAddress = () => {
    navigator.clipboard.writeText(profile.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="card-base space-y-6 mb-8 animate-slide-in-up">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center border-2 border-primary/50">
                <span className="text-2xl font-bold text-primary">A</span>
              </div>
              <div className="flex items-center gap-2 bg-accent/20 px-3 py-1 rounded-full">
                <Shield className="h-4 w-4 text-accent" />
                <span className="text-xs font-semibold text-accent">{profile.tier}</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-muted-foreground font-mono">{profile.address}</p>
                <button
                  onClick={copyAddress}
                  className="p-1 rounded hover:bg-muted transition-colors duration-200"
                  title="Copy address"
                >
                  <Copy className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                </button>
                {copied && <span className="text-xs text-success">Copied!</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Joined {profile.joinDate}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-4 gap-4 pt-4 border-t border-border">
            {[
              { label: "Reputation", value: profile.reputation, color: "text-primary" },
              { label: "VIBE Balance", value: profile.tokenBalance, color: "text-accent" },
              { label: "Total Earned", value: profile.totalEarned, color: "text-secondary" },
              { label: "Tier", value: profile.tier, color: "text-primary" },
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
            {activeTab === "questions" && (
              <>
                {[
                  { title: "Why does my ERC20 transfer revert?", votes: 24, answers: 3, days: 2 },
                  { title: "Best practices for ERC20 implementations", votes: 18, answers: 5, days: 7 },
                ].map((q, idx) => (
                  <div
                    key={idx}
                    className="card-base hover:border-primary/50 transition-all duration-200 animate-slide-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors duration-200 cursor-pointer">
                      {q.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {q.votes} upvotes • {q.answers} answers • {q.days} days ago
                    </p>
                  </div>
                ))}
              </>
            )}

            {activeTab === "answers" && (
              <>
                {[
                  { title: "Re: Why does my ERC20 transfer revert?", votes: 18, status: "Accepted", vibe: 50 },
                  { title: "Re: How to integrate MetaMask in React?", votes: 12, status: "Useful", vibe: 0 },
                ].map((a, idx) => (
                  <div
                    key={idx}
                    className="card-base hover:border-primary/50 transition-all duration-200 animate-slide-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm hover:text-primary transition-colors duration-200 cursor-pointer">
                          {a.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          {a.votes} upvotes • {a.status}
                        </p>
                      </div>
                      {a.vibe > 0 && <span className="text-accent font-bold">+{a.vibe} VIBE</span>}
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeTab === "rewards" && (
              <>
                {[
                  { question: "ERC20 Transfer Issue - Accepted", amount: 50, tx: "0x1234...5678", days: 2 },
                  { question: "MetaMask Integration - Upvotes", amount: 25, tx: "0x5678...1234", days: 7 },
                ].map((r, idx) => (
                  <div
                    key={idx}
                    className="card-base hover:border-primary/50 transition-all duration-200 animate-slide-in-up"
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-semibold text-sm">{r.question}</span>
                        <p className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
                          {r.tx}
                          <ExternalLink className="h-3 w-3 cursor-pointer hover:text-foreground" />
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-accent block">+{r.amount} VIBE</span>
                        <span className="text-xs text-muted-foreground">{r.days}d ago</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
