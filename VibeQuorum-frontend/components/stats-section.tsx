"use client"

import { useEffect, useRef, useState } from "react"

interface AnimatedCounterProps {
  target: number
  suffix?: string
  duration?: number
}

function AnimatedCounter({ target, suffix = "", duration = 2000 }: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const counterRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true

          const start = 0
          const increment = target / (duration / 16)
          let current = start

          const timer = setInterval(() => {
            current += increment
            if (current >= target) {
              setCount(target)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, 16)

          return () => clearInterval(timer)
        }
      },
      { threshold: 0.5 },
    )

    if (counterRef.current) {
      observer.observe(counterRef.current)
    }

    return () => observer.disconnect()
  }, [target, duration])

  return (
    <div ref={counterRef}>
      {count}
      {suffix}
    </div>
  )
}

const STATS = [
  { label: "Active Users", target: 4200, suffix: "+" },
  { label: "Questions Asked", target: 12500, suffix: "+" },
  { label: "VIBE Distributed", target: 850000, suffix: " " },
  { label: "Expert Answers", target: 38000, suffix: "+" },
]

export default function StatsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-4 border-b border-border relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl animate-gradient-shift" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">VibeQuorum by the Numbers</h2>
          <p className="text-lg text-muted-foreground">A growing community of Web3 developers</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, idx) => (
            <div
              key={idx}
              className="text-center space-y-3"
              style={{
                animation: `slideInUp 0.6s ease-out ${0.1 + idx * 0.1}s both`,
              }}
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary">
                <AnimatedCounter target={stat.target} suffix={stat.suffix} />
              </div>
              <p className="text-sm md:text-base text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
