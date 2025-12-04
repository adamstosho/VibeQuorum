"use client"

import { Brain, Shield, Zap, Users, TrendingUp, Award } from "lucide-react"
import { useEffect, useRef } from "react"

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Drafts",
    description: "Get instant AI-generated answers to accelerate problem-solving",
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    icon: Shield,
    title: "On-Chain Transparency",
    description: "Every reward is verifiable on-chain with immutable records",
    color: "from-green-500/20 to-green-600/20",
  },
  {
    icon: Zap,
    title: "Instant Rewards",
    description: "Earn VibeTokens immediately when answers are accepted",
    color: "from-yellow-500/20 to-yellow-600/20",
  },
  {
    icon: Users,
    title: "Expert Community",
    description: "Learn from seasoned Web3 developers worldwide",
    color: "from-purple-500/20 to-purple-600/20",
  },
  {
    icon: TrendingUp,
    title: "Real-Time Trending",
    description: "See what's hot in Web3 development right now",
    color: "from-cyan-500/20 to-cyan-600/20",
  },
  {
    icon: Award,
    title: "Reputation System",
    description: "Build your developer reputation with earned VIBE tokens",
    color: "from-pink-500/20 to-pink-600/20",
  },
]

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100")
            entry.target.classList.remove("opacity-0")
          }
        })
      },
      { threshold: 0.1 },
    )

    const cards = sectionRef.current?.querySelectorAll("[data-feature-card]")
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-4 border-b border-border relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float-alt" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="text-center mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <span className="text-sm font-medium text-primary">Powerful Features</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold">
            Everything you need to{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              thrive
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with developers in mind, powered by Web3 incentives
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                data-feature-card
                className="group opacity-0 transition-all duration-700"
                style={{
                  animation: `slideInUp 0.6s ease-out ${0.1 + idx * 0.08}s both`,
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300 h-full">
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
