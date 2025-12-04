"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef } from "react"

export default function CTASection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scale-100", "opacity-100")
          }
        })
      },
      { threshold: 0.3 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-24 md:py-32 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl">
        <div
          className="relative scale-95 opacity-0 transition-all duration-700"
          style={{
            animation: "slideInUp 0.8s ease-out 0.2s both",
          }}
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-secondary/50 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="relative group rounded-3xl border border-primary/30 bg-gradient-to-br from-card/80 to-background/50 p-12 md:p-16 backdrop-blur-xl text-center space-y-8">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary rounded-full blur-3xl animate-float" />
              <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-secondary rounded-full blur-3xl animate-float-alt" />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary/20 px-4 py-2 rounded-full border border-primary/40">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Ready to Get Started?</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold leading-tight text-balance">
                Start earning VIBE tokens <br />{" "}
                <span className="text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  today
                </span>
              </h2>

              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Join thousands of Web3 developers sharing knowledge and earning rewards on-chain
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <button className="btn-primary gap-2 text-base group">
                  <span>Connect Wallet</span>
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
                <Link href="/questions" className="btn-secondary text-base">
                  Browse Questions
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
