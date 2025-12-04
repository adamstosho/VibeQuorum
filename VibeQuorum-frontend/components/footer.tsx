"use client"

import Link from "next/link"
import { Github, Mail, ExternalLink, Twitter, Linkedin } from "lucide-react"
import { useEffect, useRef } from "react"
import Logo from "./logo"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-in-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    if (footerRef.current) {
      observer.observe(footerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <footer
      ref={footerRef}
      className="border-t border-border bg-gradient-to-b from-background to-card/50 py-16 px-4 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl animate-float" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float-alt" />
      </div>

      <div className="relative z-10 container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Logo size="lg" showText={true} animated={false} />
            <p className="text-sm text-muted-foreground leading-relaxed">Developer knowledge, incentivised on-chain.</p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 rounded-lg bg-muted/20 hover:bg-primary/20 transition-colors duration-200">
                <Github className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted/20 hover:bg-primary/20 transition-colors duration-200">
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted/20 hover:bg-primary/20 transition-colors duration-200">
                <Linkedin className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Product</h4>
            <div className="space-y-3">
              {[
                { label: "Questions", href: "/questions" },
                { label: "Ask Question", href: "/ask" },
                { label: "Profile", href: "/profile" },
                { label: "Rewards", href: "#" },
              ].map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Resources</h4>
            <div className="space-y-3">
              {[
                { label: "Documentation", href: "#" },
                { label: "Testnet Setup", href: "#" },
                { label: "API Reference", href: "#" },
                { label: "Smart Contracts", href: "#" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors duration-200 group"
                >
                  {link.label}
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Community</h4>
            <div className="space-y-3">
              {[
                { label: "GitHub", icon: Github, href: "#" },
                { label: "Discord", href: "#" },
                { label: "Twitter", href: "#" },
                { label: "Contact", icon: Mail, href: "#" },
              ].map((link) => {
                const Icon = link.icon
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {link.label}
                  </a>
                )
              })}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-sm text-muted-foreground">© {currentYear} VibeQuorum. All rights reserved.</p>
            <p className="text-xs text-muted-foreground">Built for developers, powered by Web3</p>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Governance
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
