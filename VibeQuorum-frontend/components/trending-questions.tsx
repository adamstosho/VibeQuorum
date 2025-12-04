"use client"

import { ArrowUp, MessageCircle, Award, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

const TRENDING = [
  {
    id: 1,
    title: "Why does my ERC20 transfer revert on Goerli testnet?",
    author: "0x742d...89Ac",
    displayName: "alice.eth",
    tags: ["solidity", "erc20"],
    answers: 3,
    upvotes: 24,
    vibe: 50,
    trend: "up" as const,
  },
  {
    id: 2,
    title: "Best practices for secure contract upgrades",
    author: "0x8a14...3Ff2",
    displayName: "bob.dev",
    tags: ["security", "proxy", "contract"],
    answers: 5,
    upvotes: 42,
    vibe: 150,
    trend: "up" as const,
  },
  {
    id: 3,
    title: "How to integrate MetaMask in React app",
    author: "0x1234...5678",
    displayName: "charlie.web3",
    tags: ["web3", "react", "tooling"],
    answers: 7,
    upvotes: 31,
    vibe: 100,
    trend: "up" as const,
  },
  {
    id: 4,
    title: "Understanding Uniswap V4 hooks pattern",
    author: "0x5678...1234",
    displayName: "dev.sam",
    tags: ["defi", "uniswap", "advanced"],
    answers: 4,
    upvotes: 28,
    vibe: 75,
    trend: "up" as const,
  },
]

export default function TrendingQuestions() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll("[data-scroll-animate]").forEach((el) => {
              el.classList.add("animate-scale-in")
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-4 border-b border-border relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div
          className="absolute top-1/2 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float-alt"
          style={{ animationDelay: "0.5s" }}
        />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-float" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-12 md:mb-16">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-secondary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">Trending Now</h2>
            </div>
            <p className="text-muted-foreground">Most discussed Web3 topics this week</p>
          </div>
          <Link
            href="/questions"
            className="hidden md:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
          >
            View All
            <ArrowUp className="h-4 w-4 rotate-90" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {TRENDING.map((q, idx) => (
            <Link key={q.id} href={`/question/${q.id}`}>
              <div
                data-scroll-animate
                className="group h-full card-base space-y-4 cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500"
                style={{
                  animation: `slideInUp 0.6s ease-out ${0.1 + idx * 0.15}s both`,
                }}
              >
                {/* Trend indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-accent font-semibold bg-accent/10 px-2 py-1 rounded-full">
                    <Zap className="h-3 w-3" />
                    Trending
                  </div>
                  <div className="text-xs text-muted-foreground">{q.answers} answers</div>
                </div>

                {/* Question content */}
                <div className="space-y-2">
                  <h3 className="font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {q.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">by {q.displayName}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {q.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="badge text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>{q.answers}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors">
                      <ArrowUp className="h-3.5 w-3.5" />
                      <span>{q.upvotes}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-accent font-bold">
                    <Award className="h-3.5 w-3.5" />
                    {q.vibe}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/questions" className="md:hidden flex justify-center mt-8">
          <button className="btn-secondary gap-2">
            View All Questions
            <ArrowUp className="h-4 w-4 rotate-90" />
          </button>
        </Link>
      </div>
    </section>
  )
}
