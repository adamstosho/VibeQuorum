"use client"

import { ArrowRight, MessageSquare, Brain, Users, DollarSign } from "lucide-react"
import { useEffect, useRef } from "react"

const STEPS = [
  {
    icon: MessageSquare,
    title: "Ask",
    description: "Post a technical question with detailed context",
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    icon: Brain,
    title: "AI Draft",
    description: "Get AI-generated answer suggestions instantly",
    color: "from-purple-500/20 to-purple-600/20",
  },
  {
    icon: Users,
    title: "Community",
    description: "Receive solutions from expert developers",
    color: "from-cyan-500/20 to-cyan-600/20",
  },
  {
    icon: DollarSign,
    title: "Earn VIBE",
    description: "Get rewarded with on-chain VibeTokens",
    color: "from-yellow-500/20 to-yellow-600/20",
  },
]

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
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
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float-alt" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="text-center mb-16 md:mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="text-sm font-medium text-primary">How It Works</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-balance">
            From Question to{" "}
            <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Reward
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A seamless workflow designed to help developers and reward expertise
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 md:gap-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="group relative"
                style={{
                  animation: `slideInUp 0.6s ease-out ${0.1 + idx * 0.1}s both`,
                }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />

                <div className="relative h-full flex flex-col items-center text-center space-y-4 p-8 rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm group-hover:border-primary/50 transition-all duration-300">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-7 w-7 text-primary" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  {/* Step number badge */}
                  <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {idx + 1}
                  </div>

                  {/* Arrow connector */}
                  {idx < STEPS.length - 1 && (
                    <div className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20">
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits section below steps */}
        <div className="mt-20 grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { title: "Fast Answers", desc: "AI acceleration meets expert wisdom" },
            { title: "Fair Rewards", desc: "On-chain transparency, no gatekeeping" },
            { title: "Community Driven", desc: "Built by developers, for developers" },
          ].map((benefit, idx) => (
            <div
              key={idx}
              className="group p-6 rounded-xl border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-300 text-center"
              style={{
                animation: `slideInUp 0.6s ease-out ${0.5 + idx * 0.1}s both`,
              }}
            >
              <p className="font-semibold text-foreground mb-2">{benefit.title}</p>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
