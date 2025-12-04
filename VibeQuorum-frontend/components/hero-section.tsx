"use client"

import { ArrowRight, Sparkles, Code2, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import HeroAnimation from "./hero-animation"

export default function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background to-card/20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-float" />
        <div className="absolute top-32 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-30 animate-float-alt" />
        <div
          className="absolute bottom-0 left-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-20 animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 py-8 md:py-12 lg:py-16">
        {/* Split Layout: Text Left, Animation Right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 px-4 py-2 rounded-full border border-primary/20 backdrop-blur-sm"
              style={{ animation: "slideInDown 0.6s ease-out 0.1s both" }}
            >
              <div className="h-2 w-2 bg-primary rounded-full animate-pulse-glow" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AI-Powered Q&A Platform
              </span>
            </div>

            <div className="space-y-4" style={{ animation: "slideInUp 0.6s ease-out 0.2s both" }}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-bold leading-tight text-balance">
                <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Web3 Knowledge,
                </span>
                <br />
                <span className="text-foreground">
                  On-Chain{" "}
                  <span className="relative">
                    <span className="relative z-10">Rewards</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent blur-lg" />
                  </span>
                </span>
              </h1>
            </div>

            <p
              className="text-lg md:text-xl text-muted-foreground max-w-xl text-balance"
              style={{ animation: "slideInUp 0.6s ease-out 0.3s both" }}
            >
              Ask technical questions, get AI-assisted answers, and earn VibeTokens on-chain. The Web3 developer community
              powered by incentives.
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 pt-4"
              style={{ animation: "slideInUp 0.6s ease-out 0.4s both" }}
            >
              <button className="btn-primary gap-3 group text-base">
                <Zap className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                Connect Wallet
                <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <Link href="/questions" className="btn-secondary text-base">
                <Code2 className="h-5 w-5" />
                Explore Questions
              </Link>
            </div>

            <div
              className="grid grid-cols-3 gap-4 md:gap-6 pt-8 border-t border-border/50 max-w-lg"
              style={{ animation: "slideInUp 0.6s ease-out 0.5s both" }}
            >
              {[
                { label: "Active Questions", value: "2.4K+" },
                { label: "Expert Answers", value: "8.2K+" },
                { label: "VIBE Distributed", value: "125K" },
              ].map((stat, idx) => (
                <div key={idx} className="text-center space-y-1">
                  <p className="text-xl md:text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Animation */}
          <div 
            className="order-1 lg:order-2 relative"
            style={{ animation: "slideInRight 0.8s ease-out 0.3s both" }}
          >
            <div className="relative w-full aspect-square max-w-[500px] lg:max-w-none mx-auto lg:mx-0">
              <HeroAnimation />
            </div>
          </div>
        </div>
      </div>

      <div
        className="relative z-10 container mx-auto max-w-6xl px-4 pb-24"
        style={{ animation: "slideInUp 0.8s ease-out 0.6s both" }}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-b from-card/80 to-background/50 p-8 md:p-12 backdrop-blur-xl overflow-hidden">
            {/* Moving gradient elements inside card */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary rounded-full blur-3xl animate-float-alt" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-sm font-medium text-primary">Live Dashboard Preview</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { icon: Code2, label: "Solidity", count: "324" },
                  { icon: Zap, label: "DeFi", count: "189" },
                  { icon: Sparkles, label: "NFTs", count: "156" },
                ].map((item, idx) => {
                  const Icon = item.icon
                  return (
                    <div key={idx} className="p-4 rounded-lg bg-muted/10 border border-border/50 text-center">
                      <Icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                      <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                      <p className="text-lg font-bold text-foreground">{item.count}</p>
                    </div>
                  )
                })}
              </div>

              <p className="text-sm text-muted-foreground pt-4">
                ✓ Real-time question updates • ✓ AI-powered drafts • ✓ On-chain rewards
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
