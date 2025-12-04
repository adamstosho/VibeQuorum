"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Wallet, ChevronDown, Zap } from "lucide-react"
import Logo from "./logo"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [walletOpen, setWalletOpen] = useState(false)

  const walletAddress = "0x742d...89Ac"
  const isConnected = true
  const tokenBalance = 425

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-xl animate-slide-in-down">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo with animation */}
        <Link
          href="/"
          className="group transition-all duration-300 hover:opacity-90"
        >
          <Logo size="md" showText={true} animated={true} className="hidden sm:flex" />
          <Logo size="sm" showText={false} animated={true} className="sm:hidden" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: "Questions", href: "/questions" },
            { label: "Ask", href: "/ask" },
            { label: "Profile", href: "/profile" },
            { label: "Admin", href: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors duration-300 relative group"
            >
              {item.label}
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </nav>

        {/* Wallet + Mobile Menu */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative group">
            <button
              onClick={() => setWalletOpen(!walletOpen)}
              className="btn-primary gap-2 relative text-sm md:text-base transition-all duration-300"
            >
              <Wallet className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">{isConnected ? walletAddress : "Connect Wallet"}</span>
              <span className="sm:hidden">Wallet</span>

              {isConnected && (
                <span className="ml-1 inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-xs font-bold">
                  <Zap className="h-3 w-3" />
                  {tokenBalance}
                </span>
              )}

              <ChevronDown
                className="h-4 w-4 transition-transform duration-300"
                style={{
                  transform: walletOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>

            {/* Wallet Dropdown */}
            {walletOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl shadow-primary/20 animate-scale-in origin-top-right">
                <div className="p-4 space-y-3 text-sm">
                  {isConnected ? (
                    <>
                      <div className="px-3 py-3 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Connected Wallet</p>
                        <p className="font-mono text-xs font-bold text-foreground">{walletAddress}</p>
                      </div>
                      <div className="px-3 py-3 rounded-lg bg-accent/10 border border-accent/20">
                        <p className="text-xs text-muted-foreground font-medium mb-1">VIBE Balance</p>
                        <p className="font-bold text-accent text-lg">{tokenBalance}</p>
                      </div>
                      <button className="w-full btn-secondary text-xs py-2 transition-all duration-200">
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button className="w-full btn-primary text-xs py-2 transition-all duration-200">
                      Connect MetaMask
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden btn-ghost p-2 transition-all duration-300"
          >
            {menuOpen ? (
              <X className="h-5 w-5 transition-transform duration-300 rotate-90" />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card/50 backdrop-blur-xl p-4 space-y-2 animate-slide-in-down">
          {[
            { label: "Questions", href: "/questions" },
            { label: "Ask", href: "/ask" },
            { label: "Profile", href: "/profile" },
            { label: "Admin", href: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block text-sm font-medium text-muted-foreground hover:text-primary px-4 py-3 rounded-lg hover:bg-muted/50 transition-all duration-200"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
